import React, { useEffect, useRef } from 'react';

const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 0.25;

function countFor(width: number): number {
  if (width < 640) return 18;
  if (width < 1024) return 30;
  return 48;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  sway: number;
  colorType: 'cyan' | 'emerald' | 'blue';
}

export const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let particles: Particle[] = [];
    let W = 0;
    let H = 0;
    let raf = 0;

    const colors = {
      cyan: '34, 211, 238',
      emerald: '16, 185, 129',
      blue: '59, 130, 246',
    };

    const makeParticle = (): Particle => {
      const types: ('cyan' | 'emerald' | 'blue')[] = ['cyan', 'emerald', 'blue'];
      const colorType = types[Math.floor(Math.random() * types.length)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.8 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(0.06 + Math.random() * 0.18),
        phase: Math.random() * Math.PI * 2,
        sway: 0.1 + Math.random() * 0.22,
        colorType,
      };
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: countFor(W) }, makeParticle);
      if (reduced) draw(0);
    };

    const draw = (tick = 0) => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const swayX = Math.sin(tick * 0.008 + p.phase) * p.sway;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(tick * 0.02 + p.phase));
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < REPEL_RADIUS && dist > 0.001) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        p.x += p.vx + swayX * 0.25;
        p.y += p.vy;

        if (p.y < -6) {
          p.y = H + 6;
          p.x = Math.random() * W;
        }
        if (p.x < -6) p.x = W + 6;
        if (p.x > W + 6) p.x = -6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const rgb = colors[p.colorType];
        ctx.fillStyle = `rgba(${rgb}, ${0.45 * tw})`;
        ctx.fill();
      }
    };

    let tick = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      draw((tick += 1));
    };

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduced) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    if (!reduced) loop();
    else draw(0);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-35"
    />
  );
};
