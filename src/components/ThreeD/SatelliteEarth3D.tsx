import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Field, BurnEvent } from '../../types';
import { 
  Orbit, 
  Satellite, 
  Flame, 
  ShieldCheck, 
  Maximize2, 
  RotateCcw, 
  Eye, 
  Radio, 
  Crosshair, 
  Sparkles,
  Layers
} from 'lucide-react';

interface SatelliteEarth3DProps {
  fields: Field[];
  fireEvents: BurnEvent[];
  onSelectField?: (field: Field) => void;
}

export const SatelliteEarth3D: React.FC<SatelliteEarth3DProps> = ({
  fields,
  fireEvents,
  onSelectField,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [scanBeamActive, setScanBeamActive] = useState(true);
  const [selectedBeacon, setSelectedBeacon] = useState<{
    type: 'FIRE' | 'FIELD';
    title: string;
    desc: string;
    tempOrAcreage: string;
    coords: string;
  } | null>(null);

  const [activeCameraView, setActiveCameraView] = useState<'REGIONAL' | 'SATELLITE' | 'HOTSPOT'>('REGIONAL');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsState = useRef({
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    rotation: { x: 0.35, y: -0.6 },
    zoom: 16,
    targetZoom: 16,
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    scene.fog = new THREE.FogExp2(0x040711, 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(20, 30, 20);
    scene.add(sunLight);

    const greenFill = new THREE.PointLight(0x10b981, 3, 25);
    greenFill.position.set(-8, 5, -5);
    scene.add(greenFill);

    const redFill = new THREE.PointLight(0xef4444, 3.5, 30);
    redFill.position.set(6, 4, 4);
    scene.add(redFill);

    // 3. Stars / Atmospheric Background Particles
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 60 + 10;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Central Earth / Regional Topography Base
    const baseGroup = new THREE.Group();
    scene.add(baseGroup);

    // Holographic Base Grid Platform (Punjab Malwa Hotspot)
    const gridHelper = new THREE.GridHelper(24, 32, 0x10b981, 0x1e293b);
    gridHelper.position.y = -0.05;
    baseGroup.add(gridHelper);

    // Glowing Circular Platform Rim
    const rimGeo = new THREE.RingGeometry(11.8, 12.2, 64);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    baseGroup.add(rim);

    // Regional Terrain Elevation Mesh (Simulating Sangrur, Patiala, Malwa farmland belt)
    const terrainGeo = new THREE.PlaneGeometry(18, 18, 48, 48);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      // Gentle undulating farmland elevation
      const z = Math.sin(vx * 0.4) * Math.cos(vy * 0.4) * 0.25 + Math.sin(vx * 1.2) * 0.08;
      pos.setZ(i, z);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x091422,
      roughness: 0.7,
      metalness: 0.2,
      wireframe: false,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.rotation.x = -Math.PI / 2;
    baseGroup.add(terrainMesh);

    // Wireframe overlay for high-tech satellite GIS look
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x064e3b,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(terrainGeo, wireMat);
    wireMesh.rotation.x = -Math.PI / 2;
    wireMesh.position.y = 0.02;
    baseGroup.add(wireMesh);

    // 5. Registered Nirdhoom Fields (3D Holographic Emerald Domes)
    const fieldObjects: THREE.Object3D[] = [];
    fields.forEach((field, idx) => {
      // Map lat/long to localized 3D X/Z coordinates centered around Sangrur [30.2458, 75.8421]
      const scaleFactor = 35;
      const x = (field.center.lng - 75.8421) * scaleFactor;
      const z = -(field.center.lat - 30.2458) * scaleFactor;

      const fieldGroup = new THREE.Group();
      fieldGroup.position.set(x, 0.1, z);

      // Emerald Hexagon Base
      const hexRadius = Math.max(0.6, Math.min(1.4, field.acreage * 0.22));
      const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.15, 6);
      const hexMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x064e3b,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.75,
      });
      const hexMesh = new THREE.Mesh(hexGeo, hexMat);
      fieldGroup.add(hexMesh);

      // 3D Protective Dome (Zero Burn Shield)
      const domeGeo = new THREE.SphereGeometry(hexRadius * 1.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const domeMesh = new THREE.Mesh(domeGeo, domeMat);
      domeMesh.position.y = 0.08;
      fieldGroup.add(domeMesh);

      // Vertical Hologram Pillar
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.6,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = 1.1;
      fieldGroup.add(pillar);

      // Top floating beacon diamond
      const beaconGeo = new THREE.OctahedronGeometry(0.2, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x34d399,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.3;
      fieldGroup.add(beacon);

      fieldGroup.userData = {
        type: 'FIELD',
        fieldData: field,
      };

      baseGroup.add(fieldGroup);
      fieldObjects.push(fieldGroup);
    });

    // 6. NASA FIRMS Active Fire Anomalies (3D Red Pulsing Volcano Plumes)
    const fireObjects: THREE.Object3D[] = [];
    fireEvents.forEach((fire) => {
      const scaleFactor = 35;
      const x = (fire.firms_point.lng - 75.8421) * scaleFactor;
      const z = -(fire.firms_point.lat - 30.2458) * scaleFactor;

      const fireGroup = new THREE.Group();
      fireGroup.position.set(x, 0.1, z);

      // Fiery Red Base Cone
      const coneGeo = new THREE.ConeGeometry(0.45, 1.6, 8);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 0.8;
      fireGroup.add(cone);

      // Pulsing outer heat aura
      const auraGeo = new THREE.SphereGeometry(0.7, 12, 12);
      const auraMat = new THREE.MeshBasicMaterial({
        color: 0xff3b30,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.position.y = 1.0;
      fireGroup.add(aura);

      // Vertical Smoke / Thermal Anomaly Spire
      const spireGeo = new THREE.CylinderGeometry(0.02, 0.1, 3.5, 6);
      const spireMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.5,
      });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.y = 2.2;
      fireGroup.add(spire);

      fireGroup.userData = {
        type: 'FIRE',
        fireData: fire,
      };

      baseGroup.add(fireGroup);
      fireObjects.push(fireGroup);
    });

    // 7. NASA NOAA-20 / Sentinel-2 Satellite Model in 3D Orbit
    const satelliteGroup = new THREE.Group();
    scene.add(satelliteGroup);

    // Satellite Main Chassis (Gold foil cube)
    const chassisGeo = new THREE.BoxGeometry(0.8, 0.5, 0.5);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    satelliteGroup.add(chassis);

    // Solar Array Panels (Blue photovoltaic wings)
    const wingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.7);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.x = -1.3;
    satelliteGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.x = 1.3;
    satelliteGroup.add(rightWing);

    // VIIRS Sensor Instrument Lens (facing down)
    const sensorGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.3, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const sensor = new THREE.Mesh(sensorGeo, sensorMat);
    sensor.position.y = -0.35;
    satelliteGroup.add(sensor);

    // Active Radar Scan Conical Beam (transparent cyan cone to ground)
    const beamGeo = new THREE.ConeGeometry(3.5, 9.5, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = -4.8;
    satelliteGroup.add(beamMesh);

    // Orbital Path Trajectory Ring
    const orbitRadius = 14;
    const orbitCurve = new THREE.EllipseCurve(
      0, 0,
      orbitRadius, orbitRadius * 0.75,
      0, 2 * Math.PI,
      false,
      0
    );
    const orbitPoints = orbitCurve.getPoints(100);
    const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
    });
    const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
    orbitLine.rotation.x = Math.PI / 4;
    orbitLine.position.y = 8;
    scene.add(orbitLine);

    // 8. Animation & Interaction Loop
    let angle = 0;
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      // Satellite orbit trajectory
      angle += 0.008;
      const satX = Math.cos(angle) * orbitRadius;
      const satZ = Math.sin(angle) * (orbitRadius * 0.75);
      const satY = 7.5 + Math.sin(angle * 1.5) * 1.2;
      satelliteGroup.position.set(satX, satY, satZ);
      satelliteGroup.lookAt(0, 0, 0);

      // Rotate beacon diamonds
      fieldObjects.forEach((fGroup) => {
        const beacon = fGroup.children[3];
        if (beacon) beacon.rotation.y += 0.03;
      });

      // Pulse fire auras
      fireObjects.forEach((fGroup, i) => {
        const aura = fGroup.children[1];
        if (aura) {
          const s = 1 + Math.sin(angle * 4 + i) * 0.2;
          aura.scale.set(s, s, s);
        }
      });

      // Scan beam pulse
      if (beamMesh) {
        beamMesh.visible = scanBeamActive;
        beamMesh.rotation.y += 0.01;
      }

      // Smooth camera position from controls
      const s = controlsState.current;
      if (autoRotate && !s.isDragging) {
        s.rotation.y += 0.002;
      }

      // Smooth zoom lerp
      s.zoom += (s.targetZoom - s.zoom) * 0.1;

      // Position camera spherically around center
      const r = s.zoom;
      camera.position.x = r * Math.sin(s.rotation.y) * Math.cos(s.rotation.x);
      camera.position.y = r * Math.sin(s.rotation.x);
      camera.position.z = r * Math.cos(s.rotation.y) * Math.cos(s.rotation.x);
      camera.lookAt(0, 0.5, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Mouse / Touch Controls
    const handleMouseDown = (e: MouseEvent) => {
      controlsState.current.isDragging = true;
      controlsState.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!controlsState.current.isDragging) return;
      const dx = e.clientX - controlsState.current.prevMouse.x;
      const dy = e.clientY - controlsState.current.prevMouse.y;
      controlsState.current.prevMouse = { x: e.clientX, y: e.clientY };

      controlsState.current.rotation.y -= dx * 0.008;
      controlsState.current.rotation.x = Math.max(
        0.1,
        Math.min(Math.PI / 2.2, controlsState.current.rotation.x + dy * 0.008)
      );
    };

    const handleMouseUp = () => {
      controlsState.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsState.current.targetZoom = Math.max(
        6,
        Math.min(28, controlsState.current.targetZoom + e.deltaY * 0.015)
      );
    };

    // Raycasting for Beacon Clicking
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const allPickables = [...fieldObjects, ...fireObjects];
      const intersects = raycaster.intersectObjects(allPickables, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        while (parent && !parent.userData?.type && parent !== scene) {
          parent = parent.parent;
        }

        if (parent && parent.userData?.type === 'FIELD') {
          const f: Field = parent.userData.fieldData;
          setSelectedBeacon({
            type: 'FIELD',
            title: `${f.khasra_no} (${f.farmer_name})`,
            desc: `Zero FIRMS fire points • Sentinel-2 verified • 48h SLA`,
            tempOrAcreage: `${f.acreage} Acres (${f.paddy_variety})`,
            coords: `${f.center.lat.toFixed(4)}°N, ${f.center.lng.toFixed(4)}°E`,
          });
          if (onSelectField) onSelectField(f);
        } else if (parent && parent.userData?.type === 'FIRE') {
          const fire: BurnEvent = parent.userData.fireData;
          setSelectedBeacon({
            type: 'FIRE',
            title: `NASA FIRMS VIIRS Active Fire`,
            desc: `Unregistered field (${fire.nearest_village}) • No Nirdhoom contract`,
            tempOrAcreage: `Brightness Temp: ${fire.brightness_temp_kelvin} K (Confidence: ${fire.confidence}%)`,
            coords: `${fire.firms_point.lat.toFixed(4)}°N, ${fire.firms_point.lng.toFixed(4)}°E`,
          });
        }
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [fields, fireEvents, scanBeamActive, onSelectField]);

  const resetCamera = () => {
    controlsState.current.targetZoom = 16;
    controlsState.current.rotation = { x: 0.35, y: -0.6 };
  };

  const focusSangrur = () => {
    controlsState.current.targetZoom = 9;
    controlsState.current.rotation = { x: 0.5, y: 0 };
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[640px] rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-[#040711]">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Sci-Fi Telemetry HUD Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 px-3.5 py-2 rounded-xl pointer-events-auto flex items-center gap-3 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Satellite className="w-4 h-4 animate-spin text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-wider font-['Outfit']">
                3D Agricultural Digital Twin
              </span>
              <span className="badge badge-emerald text-[9px]">FIRMS / VIIRS layer</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              VIIRS 375m reference • orbital visualization • event records shown below
            </div>
          </div>
        </div>

        {/* Real-time stats chip */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-xl pointer-events-auto flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Evidence review (Nirdhoom)</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-red-400">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>8 Active Fires (Unregistered)</span>
          </div>
        </div>
      </div>

      {/* Floating 3D Interaction Control Toolbar Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl flex items-center gap-1.5 text-xs shadow-xl">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
            autoRotate
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Earth Auto-Rotation"
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>{autoRotate ? 'Orbit: ON' : 'Orbit: OFF'}</span>
        </button>

        <button
          onClick={() => setScanBeamActive(!scanBeamActive)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
            scanBeamActive
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Satellite Radar Beam"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar Beam</span>
        </button>

        <button
          onClick={focusSangrur}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
        >
          Focus Hotspot
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          title="Reset 3D View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clicked 3D Beacon Inspector Popup */}
      {selectedBeacon && (
        <div className="absolute bottom-3 right-3 z-20 max-w-sm w-full bg-slate-950/95 backdrop-blur-md border border-emerald-500/50 p-3.5 rounded-xl shadow-2xl animate-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {selectedBeacon.type === 'FIELD' ? '🛡️' : '🔥'}
              </span>
              <div>
                <h5 className="font-bold text-xs text-white">{selectedBeacon.title}</h5>
                <span className="text-[10px] text-slate-400 font-mono">{selectedBeacon.coords}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBeacon(null)}
              className="text-slate-500 hover:text-white text-xs cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            {selectedBeacon.desc}
          </p>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400">Metric Telemetry:</span>
            <strong
              className={`font-mono font-bold ${
                selectedBeacon.type === 'FIELD' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {selectedBeacon.tempOrAcreage}
            </strong>
          </div>
        </div>
      )}

      {/* 3D Legend Bottom-Center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow shadow-emerald-400"></span>
          <span>Nirdhoom Shield (0 Fires)</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block shadow shadow-red-500"></span>
          <span className="text-red-400">VIIRS Active Fire Flare</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className="text-slate-400">Drag to Orbit • Scroll to Zoom</span>
      </div>
    </div>
  );
};
