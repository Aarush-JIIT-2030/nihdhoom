import React, { useEffect, useState, useRef } from 'react';
import {
  Zap,
  Satellite,
  ShieldCheck,
  Leaf,
  Truck,
  Flame,
  IndianRupee,
} from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 2200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [current, setCurrent] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const tick = (time: number) => {
      if (!startRef.current) startRef.current = time;
      const elapsed = time - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(eased * target);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return (
    <span className={className}>
      {prefix}{decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString()}{suffix}
    </span>
  );
};

interface LiveKPIDashboardProps {
  acresScheduled?: number;
  co2Avoided?: number;
  firmsZeroBurnCount?: number;
  activeMachines?: number;
  fireEventsOutsideCount?: number;
  demoMode?: boolean;
}

export const LiveKPIDashboard: React.FC<LiveKPIDashboardProps> = ({
  acresScheduled = 0,
  co2Avoided = 0,
  firmsZeroBurnCount = 0,
  activeMachines = 0,
  fireEventsOutsideCount = 0,
  demoMode = false,
}) => {
  const kpiCards = [
    {
      label: 'Acres Scheduled',
      value: acresScheduled,
      suffix: ' ac',
      decimals: 1,
      icon: Truck,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/5',
      sub: demoMode ? 'Illustrative demo metric' : 'From connected field records',
      subColor: 'text-emerald-400',
    },
    {
      label: 'Payments',
      value: 0,
      prefix: '',
      suffix: '',
      decimals: 0,
      icon: IndianRupee,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/5',
      sub: 'Disabled in this release',
      subColor: 'text-amber-400',
    },
    {
      label: demoMode ? 'CO₂e planning estimate' : 'CO₂e recorded',
      value: co2Avoided,
      suffix: ' t',
      decimals: 1,
      icon: Leaf,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      bgColor: 'bg-teal-500/5',
      sub: demoMode ? 'Methodology not configured' : 'Methodology-dependent',
      subColor: 'text-teal-400',
    },
    {
      label: demoMode ? 'Thermal evidence examples' : 'Thermal evidence',
      value: firmsZeroBurnCount,
      suffix: demoMode ? ' examples' : '',
      decimals: 0,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/30',
      sub: demoMode ? 'Not a non-burn certificate' : 'Supporting observations',
      subColor: 'text-emerald-300',
    },
    {
      label: 'Active Machines',
      value: activeMachines,
      suffix: ' units',
      decimals: 0,
      icon: Satellite,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgColor: 'bg-cyan-500/5',
      sub: 'Registered machine capacity',
      subColor: 'text-cyan-400',
    },
    {
      label: 'Neighbor Fires',
      value: fireEventsOutsideCount,
      suffix: ' pts',
      decimals: 0,
      icon: Flame,
      color: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5',
      sub: 'Outside our polygons',
      subColor: 'text-red-400',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3 mb-1">
      {/* Hero Telemetry Strip */}
      <div className="ops-telemetry-strip relative overflow-hidden rounded-2xl border p-4 sm:p-5">
        {/* Animated background glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl animate-pulse" />
          <div className="absolute -bottom-16 -right-10 w-64 h-64 rounded-full bg-cyan-500/4 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-amber-500/3 blur-2xl animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          {/* Live Satellite Feed Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
              <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping-slow" />
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                <Satellite className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black tracking-tight">
                  NIRDHOOM Ops Telemetry
                </span>
                <span className="telemetry-badge flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  FIRMS / VIIRS layer
                </span>
              </div>
              <p className="text-[11px] telemetry-muted mt-0.5">
                Punjab Malwa · connected operational records
              </p>
            </div>
          </div>

          {/* Payment status */}
          <div
            className="telemetry-payment flex items-center gap-2 px-3.5 py-2 rounded-xl min-w-[220px]"
          >
            <Zap className="w-4 h-4 shrink-0 text-slate-500" />
            <div className="text-xs overflow-hidden">
              <div className="font-bold truncate text-slate-400">
                Payments disabled in this release
              </div>
              <div className="text-slate-500 text-[10px]">
                Payment provider is not connected
              </div>
            </div>
          </div>
        </div>

        {/* 6 KPI Cards Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`${card.bgColor} border ${card.borderColor} rounded-xl p-3 flex flex-col gap-1.5 hover:scale-[1.03] transition-transform duration-200 cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-tight">
                    {card.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
                </div>
                <div className={`text-lg font-extrabold font-mono ${card.color} leading-none`}>
                  {card.prefix || ''}
                  <AnimatedCounter
                    target={card.value}
                    prefix=""
                    suffix=""
                    decimals={card.decimals}
                    duration={2000}
                  />
                  {card.suffix}
                </div>
                <div className={`text-[10px] ${card.subColor} font-semibold leading-tight`}>
                  {card.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
