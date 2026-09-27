import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cpu, Sparkles, Orbit, Radio, Zap } from 'lucide-react';

interface AgenticNeuralCore3DProps {
  activeAgentId?: string;
  onSelectAgent?: (agentId: string) => void;
}

export const AgenticNeuralCore3D: React.FC<AgenticNeuralCore3DProps> = ({
  activeAgentId,
  onSelectAgent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState(true);
  const [coreMode, setCoreMode] = useState<'DISPATCH' | 'VRP' | 'SATELLITE'>('DISPATCH');

  const agents = [
    { id: 'sentinel', name: 'Perception Agent', role: 'NDVI & Khasra', color: '#22d3ee' },
    { id: 'vrp', name: 'VRP Solver Agent', role: 'Google OR-Tools', color: '#10b981' },
    { id: 'pricing', name: 'Dynamic Yield Agent', role: 'Parametric Insurance', color: '#3b82f6' },
    { id: 'voice', name: 'Voice NLP Agent', role: 'Punjabi WhatsApp/IVR', color: '#fbbf24' },
    { id: 'audit', name: 'FIRMS Verification Agent', role: 'NASA VIIRS 375m', color: '#34d399' },
  ];

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.05);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 7.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x22d3ee, 80, 20);
    cyanPoint.position.set(-4, 3, 4);
    scene.add(cyanPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 70, 20);
    emeraldPoint.position.set(4, -3, 3);
    scene.add(emeraldPoint);

    const blueDir = new THREE.DirectionalLight(0x3b82f6, 2.0);
    blueDir.position.set(0, 5, 2);
    scene.add(blueDir);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Outer Icosahedron Wireframe Shell
    const shellGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    rootGroup.add(shellMesh);

    // 2. Secondary Geodesic Ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    rootGroup.add(ringMesh);

    // 3. Central Torus Knot (Agentic Quantum Processing Core)
    const knotGeo = new THREE.TorusKnotGeometry(1.1, 0.28, 180, 32);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x059669,
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: wireframeMode,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    rootGroup.add(knotMesh);

    // 4. Central Glowing Orb (Nexus)
    const nexusGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const nexusMat = new THREE.MeshStandardMaterial({
      color: 0xecfeff,
      emissive: 0x22d3ee,
      emissiveIntensity: 2.4,
      metalness: 0.2,
      roughness: 0.1,
    });
    const nexusMesh = new THREE.Mesh(nexusGeo, nexusMat);
    rootGroup.add(nexusMesh);

    // 5. Starfield / Floating Knowledge Nodes
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 16;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Orbiting Agent Node Satellites
    const agentNodes: THREE.Mesh[] = [];
    const agentColors = [0x22d3ee, 0x10b981, 0x3b82f6, 0xfbbf24, 0x34d399];
    for (let i = 0; i < 5; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: agentColors[i],
        emissive: agentColors[i],
        emissiveIntensity: 1.8,
        metalness: 0.4,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      rootGroup.add(nodeMesh);
      agentNodes.push(nodeMesh);
    }

    // Interactive Mouse Tracking with Damped Smoothing
    const pointer = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    let isHovered = false;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      isHovered = true;
    };

    const onMouseLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      isHovered = false;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Continuous auto-rotation plus mouse bias
      const speed = isHovered ? 0.35 : 0.22;
      knotMesh.rotation.y += delta * speed;
      knotMesh.rotation.x = Math.sin(time * 0.3) * 0.25;

      shellMesh.rotation.y -= delta * 0.12;
      shellMesh.rotation.z += delta * 0.06;

      ringMesh.rotation.z += delta * 0.08;

      // Pulse central nexus scale
      const pulse = 1 + Math.sin(time * 3.5) * 0.09;
      nexusMesh.scale.set(pulse, pulse, pulse);

      // Orbiting agent nodes
      agentNodes.forEach((node, idx) => {
        const angle = time * 0.55 + (idx * Math.PI * 2) / 5;
        const radius = 2.1 + Math.sin(time * 0.8 + idx) * 0.15;
        const heightOff = Math.sin(angle * 2) * 0.6;
        node.position.set(Math.cos(angle) * radius, heightOff, Math.sin(angle) * radius);
      });

      // Smooth pointer damping
      targetRot.x += (pointer.y * 0.45 - targetRot.x) * 0.06;
      targetRot.y += (pointer.x * 0.65 - targetRot.y) * 0.06;

      rootGroup.rotation.x = targetRot.x;
      rootGroup.rotation.y = time * 0.08 + targetRot.y;

      starPoints.rotation.y = time * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      renderer.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      nexusGeo.dispose();
      nexusMat.dispose();
    };
  }, [wireframeMode]);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#020409] via-[#050c18] to-[#020409] border border-cyan-500/20 shadow-2xl flex flex-col">
      {/* Background Cybernetic Grid */}
      <div className="grid-bg" />

      {/* Top HUD Controls */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Agentic Neural Core
              </span>
              <span className="badge badge--dot text-[10px] py-0 px-2 bg-cyan-950/40 text-cyan-300 border-cyan-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous multi-agent dispatch mesh running 420ms VRP cycle
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all cursor-pointer ${
              wireframeMode
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {wireframeMode ? 'Wireframe: ON' : 'Wireframe: OFF'}
          </button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div ref={mountRef} className="relative flex-1 w-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Floating Agent Chips */}
      <div className="relative z-10 p-2 sm:p-3 bg-gradient-to-t from-slate-950/90 to-transparent border-t border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {agents.map((ag) => (
            <button
              key={ag.id}
              onClick={() => onSelectAgent?.(ag.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                activeAgentId === ag.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: ag.color, boxShadow: `0 0 6px ${ag.color}` }}
              />
              <span className="font-semibold">{ag.name}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({ag.role})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
