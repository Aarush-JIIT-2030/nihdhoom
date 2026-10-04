import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Rotate3d, 
  Sparkles, 
  Layers, 
  Droplet, 
  QrCode, 
  Cpu, 
  ShieldCheck, 
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';

export const BalerModel3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [explodedView, setExplodedView] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string>('sensor');

  const controlsState = useRef({
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    rotation: { x: 0.25, y: 0.8 },
    zoom: 8.5,
  });

  const animatedPartsRef = useRef<{
    reel?: THREE.Object3D;
    ram?: THREE.Object3D;
    bale?: THREE.Object3D;
    explodedParts?: { obj: THREE.Object3D; originalPos: THREE.Vector3; offset: THREE.Vector3 }[];
  }>({});

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(6, 4, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x10b981, 3.5);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    rimLight.position.set(-10, 10, -10);
    scene.add(rimLight);

    // Base Grid Floor
    const grid = new THREE.GridHelper(16, 24, 0x10b981, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

    // Machinery Model Hierarchy
    const balerGroup = new THREE.Group();
    scene.add(balerGroup);

    const explodedParts: { obj: THREE.Object3D; originalPos: THREE.Vector3; offset: THREE.Vector3 }[] = [];

    // 1. Heavy Steel Chassis (Emerald / Forest Green Metallic)
    const chassisGeo = new THREE.BoxGeometry(3.6, 1.8, 2.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Claas / Agritech green
      metalness: 0.6,
      roughness: 0.3,
      wireframe: false,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0, 0.3, 0);
    balerGroup.add(chassis);

    // 2. Large Industrial Wheels (Rubber tires + Yellow hubs)
    const tireGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.6, 24);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
    });
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Agri-yellow hub
      metalness: 0.7,
      roughness: 0.3,
    });

    const leftWheel = new THREE.Mesh(tireGeo, tireMat);
    leftWheel.rotation.x = Math.PI / 2;
    leftWheel.position.set(0, -0.3, 1.35);
    balerGroup.add(leftWheel);

    const leftHub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.62, 16), hubMat);
    leftHub.rotation.x = Math.PI / 2;
    leftHub.position.set(0, -0.3, 1.35);
    balerGroup.add(leftHub);

    const rightWheel = new THREE.Mesh(tireGeo, tireMat);
    rightWheel.rotation.x = Math.PI / 2;
    rightWheel.position.set(0, -0.3, -1.35);
    balerGroup.add(rightWheel);

    const rightHub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.62, 16), hubMat);
    rightHub.rotation.x = Math.PI / 2;
    rightHub.position.set(0, -0.3, -1.35);
    balerGroup.add(rightHub);

    // 3. Front Hitch Drawbar to Tractor PTO
    const hitchGeo = new THREE.BoxGeometry(2.4, 0.2, 0.25);
    const hitchMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const hitch = new THREE.Mesh(hitchGeo, hitchMat);
    hitch.position.set(2.8, -0.3, 0);
    balerGroup.add(hitch);

    // 4. Rotating Straw Pickup Reel (Front low tine drum)
    const reelGroup = new THREE.Group();
    reelGroup.position.set(1.9, -0.5, 0);
    balerGroup.add(reelGroup);
    animatedPartsRef.current.reel = reelGroup;

    const drumGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.9, 16);
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const drum = new THREE.Mesh(drumGeo, drumMat);
    drum.rotation.x = Math.PI / 2;
    reelGroup.add(drum);

    // Floating Pickup Tines (curved metal fingers)
    for (let i = 0; i < 6; i++) {
      const tineAngle = (i / 6) * Math.PI * 2;
      const tineBarGeo = new THREE.BoxGeometry(0.04, 0.45, 1.8);
      const tineBarMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const tineBar = new THREE.Mesh(tineBarGeo, tineBarMat);
      tineBar.position.set(Math.cos(tineAngle) * 0.4, Math.sin(tineAngle) * 0.4, 0);
      reelGroup.add(tineBar);
    }

    // 5. Compression Chamber & Hydraulic Ram
    const ramGroup = new THREE.Group();
    ramGroup.position.set(-0.2, 0.4, 0);
    balerGroup.add(ramGroup);
    animatedPartsRef.current.ram = ramGroup;

    const ramCylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 16);
    const ramCylinderMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });
    const ramCylinder = new THREE.Mesh(ramCylinderGeo, ramCylinderMat);
    ramCylinder.rotation.z = Math.PI / 2;
    ramGroup.add(ramCylinder);

    explodedParts.push({
      obj: ramGroup,
      originalPos: ramGroup.position.clone(),
      offset: new THREE.Vector3(0, 1.5, 0),
    });

    // 6. IoT Telematics & Dual Moisture Sensor Node (Glowing cyan cube on top)
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0.6, 1.35, 0.5);
    balerGroup.add(sensorGroup);

    const sensorHousingGeo = new THREE.BoxGeometry(0.4, 0.3, 0.3);
    const sensorHousingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
    });
    const sensorHousing = new THREE.Mesh(sensorHousingGeo, sensorHousingMat);
    sensorGroup.add(sensorHousing);

    // Glowing Probe Light
    const probeLight = new THREE.PointLight(0x06b6d4, 1.5, 3);
    probeLight.position.set(0, 0.2, 0);
    sensorGroup.add(probeLight);

    // 7. Rear Bale Discharge Chute & Golden Straw Bale
    const chuteGeo = new THREE.BoxGeometry(1.4, 0.15, 1.7);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.set(-2.4, -0.1, 0);
    chute.rotation.z = -0.25;
    balerGroup.add(chute);

    // High Density Straw Bale (Golden straw texture cylinder/box)
    const baleGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 20);
    const baleMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber golden straw
      roughness: 0.9,
    });
    const bale = new THREE.Mesh(baleGeo, baleMat);
    bale.rotation.x = Math.PI / 2;
    bale.position.set(-2.5, 0.1, 0);
    balerGroup.add(bale);
    animatedPartsRef.current.bale = bale;

    // QR Lot Code Tag attached to Bale
    const tagGeo = new THREE.PlaneGeometry(0.35, 0.35);
    const tagMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const qrTag = new THREE.Mesh(tagGeo, tagMat);
    qrTag.position.set(-2.5, 0.85, 0);
    qrTag.rotation.x = -Math.PI / 2;
    balerGroup.add(qrTag);

    animatedPartsRef.current.explodedParts = explodedParts;

    // Animation Loop
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAnimating) {
        t += 0.04;

        // Rotate pickup reel
        if (animatedPartsRef.current.reel) {
          animatedPartsRef.current.reel.rotation.z -= 0.06;
        }

        // Hydraulic ram compression cycle
        if (animatedPartsRef.current.ram) {
          animatedPartsRef.current.ram.position.x = -0.2 + Math.sin(t) * 0.35;
        }

        // Bale vibration & slow roll
        if (animatedPartsRef.current.bale) {
          animatedPartsRef.current.bale.position.y = 0.1 + Math.sin(t * 2) * 0.02;
        }
      }

      // Exploded View Interpolation
      explodedParts.forEach(({ obj, originalPos, offset }) => {
        const target = explodedView
          ? originalPos.clone().add(offset)
          : originalPos.clone();
        obj.position.lerp(target, 0.1);
      });

      // Camera Orbit from Mouse controls
      const s = controlsState.current;
      const r = s.zoom;
      camera.position.x = r * Math.sin(s.rotation.y) * Math.cos(s.rotation.x);
      camera.position.y = r * Math.sin(s.rotation.x);
      camera.position.z = r * Math.cos(s.rotation.y) * Math.cos(s.rotation.x);
      camera.lookAt(0, 0.2, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Listeners
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
        0.05,
        Math.min(Math.PI / 2.1, controlsState.current.rotation.x + dy * 0.008)
      );
    };

    const handleMouseUp = () => {
      controlsState.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsState.current.zoom = Math.max(
        4.5,
        Math.min(16, controlsState.current.zoom + e.deltaY * 0.01)
      );
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

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
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isAnimating, explodedView]);

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-[#060913]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Telemetry */}
      <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 px-3.5 py-2 rounded-xl pointer-events-auto flex items-center gap-3 shadow-lg">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-wider font-['Outfit']">
                3D Subsidised Machinery Twin
              </span>
              <span className="badge badge-emerald text-[9px]">50-80% CRM ASSET</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Claas / New Holland Baler Unit #14 • CHC Ubhawal • Reg: PB-2023-891
            </div>
          </div>
        </div>

        {/* Hotspot Quick Selectors */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 p-1 rounded-xl pointer-events-auto flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedHotspot('sensor')}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
              selectedHotspot === 'sensor' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Moisture Sensor
          </button>
          <button
            onClick={() => setSelectedHotspot('reel')}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
              selectedHotspot === 'reel' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pickup Reel
          </button>
          <button
            onClick={() => setSelectedHotspot('ram')}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
              selectedHotspot === 'ram' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Density Ram
          </button>
          <button
            onClick={() => setSelectedHotspot('qr')}
            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
              selectedHotspot === 'qr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            QR Lot Tagger
          </button>
        </div>
      </div>

      {/* Floating 3D Interaction Control Toolbar Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl flex items-center gap-1.5 text-xs shadow-xl">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
            isAnimating
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Baling Mechanism Animation"
        >
          {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isAnimating ? 'Compaction: ON' : 'Compaction: PAUSED'}</span>
        </button>

        <button
          onClick={() => setExplodedView(!explodedView)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
            explodedView
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle Exploded CAD View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Exploded View</span>
        </button>
      </div>

      {/* Selected Hotspot Explanation Card Bottom-Right */}
      <div className="absolute bottom-3 right-3 z-10 max-w-sm w-full bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 p-3.5 rounded-xl shadow-2xl">
        {selectedHotspot === 'sensor' && (
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
              <Droplet className="w-4 h-4" />
              <span>Dual Moisture Probe Node</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Measures conductivity at the farmgate before baling. Straw must be &lt;20% moisture to prevent mold and spontaneous combustion in storage yards. Real-time telemetry: <strong className="text-emerald-400">14.2% Optimal Dry</strong>.
            </p>
          </div>
        )}

        {selectedHotspot === 'reel' && (
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <Rotate3d className="w-4 h-4" />
              <span>Floating Tine Pickup Reel</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              540 RPM PTO-driven spring steel tines lift windrowed paddy straw off the soil surface cleanly without pulling dirt or stones into the compaction chamber.
            </p>
          </div>
        )}

        {selectedHotspot === 'ram' && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Cpu className="w-4 h-4" />
              <span>High-Density Hydraulic Ram</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compacts low-density loose straw into 180 kg/m³ high-density bales. Solves the transport penalty (Rs 400-800/t) by maximizing truck payloads to 16 tonnes.
            </p>
          </div>
        )}

        {selectedHotspot === 'qr' && (
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
              <QrCode className="w-4 h-4" />
              <span>Digital QR Lot Tagging & Settlement Workflow (Simulated)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each discharged bale lot receives a weatherproof tamper-evident QR code linked to the farmer's Khasra polygon, creating an auditable settlement record; provider settlement is not connected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
