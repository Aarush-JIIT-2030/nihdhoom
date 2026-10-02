import React from 'react';
import { FlaskConical, ShieldCheck } from 'lucide-react';

interface SimulationGateProps {
  demoMode: boolean;
  title: string;
  children: React.ReactNode;
}

export const SimulationGate: React.FC<SimulationGateProps> = ({ demoMode, title, children }) => {
  if (demoMode) return <>{children}</>;

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-slate-950/80 p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white">{title}</h2>
            <span className="badge badge-amber text-[10px]">SIMULATION ONLY</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            This surface contains synthetic scenarios and is intentionally locked while NIRDHOOM is connected to live records.
            Enable the explicit demo environment flag to run the walkthrough without mixing simulated events into operations.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Live field, evidence, dispatch and verification records are never replaced by demo data.
          </div>
        </div>
      </div>
    </div>
  );
};
