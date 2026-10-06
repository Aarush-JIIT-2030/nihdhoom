import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Satellite, 
  Cpu, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Leaf, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface NodeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const NODES: NodeItem[] = [
  {
    id: 'farmer',
    title: 'Farmer Request',
    subtitle: 'Telegram / Punjabi IVR',
    icon: MessageSquare,
    badge: 'Beat 1',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/40',
  },
  {
    id: 'perception',
    title: 'Perception Agent',
    subtitle: 'Satellite inputs + field boundary',
    icon: Satellite,
    badge: 'Maturity',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-950/40',
  },
  {
    id: 'vrp',
    title: 'OR-Tools VRP',
    subtitle: '15-Day Constrained Dispatch',
    icon: Cpu,
    badge: 'Beat 2',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-950/40',
  },
  {
    id: 'baler',
    title: 'Available machine capacity',
    subtitle: 'Registered / available fleet',
    icon: Truck,
    badge: 'Asset-light',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    bgColor: 'bg-teal-950/40',
  },
  {
    id: 'nasa',
    title: 'FIRMS / VIIRS evidence',
    subtitle: 'Thermal observation layer',
    icon: ShieldCheck,
    badge: 'Beat 4',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/40',
  },
  {
    id: 'upi',
    title: 'Settlement ledger (simulated)',
    subtitle: 'Provider integration disabled',
    icon: Zap,
    badge: 'Beat 3',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/40',
  },
  {
    id: 'carbon',
    title: 'Carbon market simulator',
    subtitle: 'Illustrative workflow only',
    icon: Leaf,
    badge: 'Institutional',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-400/40',
    bgColor: 'bg-emerald-900/30',
  },
];

export const AnimatedBeam: React.FC<{
  onSelectNode?: (nodeId: string) => void;
}> = ({ onSelectNode }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % NODES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-[0_18px_50px_rgba(35,76,44,.08)] overflow-hidden">
      {/* Background glow and grid */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-amber-50 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6 pb-3 border-b border-emerald-900/10">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold">
              Autonomous Agentic Pipeline
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              Live Data Flow
            </span>
          </div>
          <h3 className="text-base font-bold text-emerald-950 font-['DM_Sans'] mt-1">
            End-to-End Autonomous Parali Dispatch & Institutional Verification
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-950/55">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Pulse: <span className="text-emerald-800 font-bold">{NODES[activeStep].title}</span></span>
        </div>
      </div>

      {/* Nodes Pipeline Container */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {NODES.map((node, index) => {
          const Icon = node.icon;
          const isActive = index === activeStep;
          const isPassed = index < activeStep;

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                isActive
                  ? `${node.borderColor} ${node.bgColor} shadow-lg shadow-emerald-500/20 scale-[1.04] ring-1 ring-emerald-400`
                  : isPassed
                  ? 'border-emerald-900/10 bg-emerald-50/50 opacity-85'
                  : 'border-emerald-900/10/80 bg-white hover:border-slate-700'
              }`}
            >
              {/* Animated connector line between cards for desktop */}
              {index < NODES.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-slate-600">
                  <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-700'}`} />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-950/55'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-emerald-50/60 text-emerald-950/55 border-slate-700'
                }`}>
                  {node.badge}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-emerald-950 font-['DM_Sans'] truncate">
                  {node.title}
                </h4>
                <p className="text-[10px] text-emerald-950/55 mt-0.5 truncate font-['Plus_Jakarta_Sans']">
                  {node.subtitle}
                </p>
              </div>

              {/* Progress Beam Indicator */}
              <div className="w-full bg-emerald-50 h-1 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-300 ${
                    isActive 
                      ? 'w-full bg-gradient-to-r from-emerald-500 to-amber-400 animate-pulse' 
                      : isPassed 
                      ? 'w-full bg-emerald-600' 
                      : 'w-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
