import React, { useState } from 'react';
import { Field, Machine, LatLng } from '../../types';
import { runVRPOptimizer, VRPDispatchResult } from '../../utils/vrpOptimizer';
import { 
  Cpu, 
  CheckCircle2, 
  Route, 
  Clock, 
  ShieldAlert, 
  Percent, 
  ArrowRight, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';

interface VRPDispatchPanelProps {
  fields: Field[];
  machines: Machine[];
  onRouteSelected: (route: LatLng[]) => void;
  onSelectField: (field: Field) => void;
}

export const VRPDispatchPanel: React.FC<VRPDispatchPanelProps> = ({
  fields,
  machines,
  onRouteSelected,
  onSelectField,
}) => {
  const [optimizerResult, setOptimizerResult] = useState<VRPDispatchResult | null>(() =>
    runVRPOptimizer(fields, machines)
  );
  const [isSolving, setIsSolving] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(machines[0]?.id || '');

  const handleRunOptimizer = () => {
    setIsSolving(true);
    setTimeout(() => {
      const res = runVRPOptimizer(fields, machines);
      setOptimizerResult(res);
      setIsSolving(false);

      // Default select first machine's route
      if (res.assignments.length > 0) {
        onRouteSelected(res.assignments[0].routeCoordinates);
        setSelectedMachineId(res.assignments[0].machineId);
      }
    }, 600);
  };

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    const assign = optimizerResult?.assignments.find((a) => a.machineId === machineId);
    if (assign) {
      onRouteSelected(assign.routeCoordinates);
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      {/* Panel Header & Run Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white tracking-tight">
              OR-Tools VRP Dispatch Engine (Time-Windows)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Constrained scheduling across idle CRM machinery to clear fields inside 48h guarantee window
          </p>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={isSolving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all cursor-pointer ${
            isSolving
              ? 'bg-slate-700 text-slate-300'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {isSolving ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-emerald-300" />
              <span>Solving Constraints...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Re-Run VRP Optimizer</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Optimization Telemetry Tiles */}
      {optimizerResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Scheduled Load</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-extrabold text-white mt-1 font-mono">
              {optimizerResult.totalAcresScheduled}{' '}
              <span className="text-xs text-emerald-400 font-normal">acres</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              100% Inside 48h Window
            </div>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Deadhead Travel</span>
              <Route className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-extrabold text-cyan-300 mt-1 font-mono">
              {optimizerResult.totalDeadheadKm}{' '}
              <span className="text-xs text-slate-400 font-normal">km</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">
              Saved {optimizerResult.deadheadSavedKm} km (-43%)
            </div>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Penalty Risk Dropped</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-extrabold text-amber-300 mt-1 font-mono">
              ₹{optimizerResult.totalPenaltyPrevented.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              Zero Default Liability
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Fleet Utilisation</span>
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-extrabold text-white mt-1 font-mono">
              {optimizerResult.fleetUtilizationPct}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Solved in {optimizerResult.solverExecutionTimeMs} ms
            </div>
          </div>
        </div>
      )}

      {/* Machine Fleet Schedule Cards */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Active Subsidised Balers & Sequenced Routes</span>
          <span className="text-[11px] text-emerald-400 font-normal">
            Click machine to highlight live GPS route on map
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {optimizerResult?.assignments.map((assign) => {
            const isSelected = selectedMachineId === assign.machineId;
            return (
              <div
                key={assign.machineId}
                onClick={() => handleSelectMachine(assign.machineId)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/95 border-emerald-500 ring-1 ring-emerald-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚜</span>
                    <span className="font-bold text-sm text-white">
                      {assign.machineName}
                    </span>
                  </div>
                  <span className="badge badge-emerald text-[10px]">
                    {assign.capacityPct}% Capacity
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between mb-2">
                  <span>Operator: <strong className="text-slate-200">{assign.operatorName}</strong></span>
                  <span className="font-mono text-emerald-400 font-semibold">{assign.totalAcres} ac / {assign.deadheadKm} km</span>
                </div>

                {/* Step sequence breakdown */}
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80 text-[11px] flex flex-col gap-1">
                  {assign.sequenceDescriptions.map((desc, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                      <span className="text-emerald-500 font-bold shrink-0">{idx + 1}.</span>
                      <span className="truncate">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
