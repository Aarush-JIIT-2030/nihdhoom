import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Map, 
  Smartphone, 
  Satellite, 
  Zap, 
  Play, 
  RotateCcw,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Field, Machine, BurnEvent, LatLng } from '../types';
import { WhatsAppSimulator } from './FarmerSurface/WhatsAppSimulator';
import { OpsMap } from './OpsConsole/OpsMap';
import { VRPDispatchPanel } from './OpsConsole/VRPDispatchPanel';
import { BalerPWA } from './FieldOperator/BalerPWA';
import { SatelliteAudit } from './VerificationLayer/SatelliteAudit';
import { INITIAL_STORAGE_YARDS, INITIAL_BUYERS } from '../data/mockData';

interface DemoWalkthroughProps {
  fields: Field[];
  machines: Machine[];
  fireEvents: BurnEvent[];
  onUpdateFieldStatus: (fieldId: string, newStatus: Field['status'], payoutAmt?: number) => void;
  onViewCertificateModal: (field: Field) => void;
}

export const DemoWalkthrough: React.FC<DemoWalkthroughProps> = ({
  fields,
  machines,
  fireEvents,
  onUpdateFieldStatus,
  onViewCertificateModal,
}) => {
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [activeRoute, setActiveRoute] = useState<LatLng[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(fields[0]);

  const beats = [
    {
      step: 1,
      title: 'Beat 1: Farmer WhatsApp & Parametric Slot Guarantee',
      oneLiner: 'Book via Punjabi WhatsApp; get confirmed clearance slot + late penalty guarantee in seconds.',
      badge: 'Demand Capture & Pricing',
      icon: MessageSquare,
      color: 'text-emerald-400',
    },
    {
      step: 2,
      title: 'Beat 2: Ops Console & OR-Tools VRP Dispatch',
      oneLiner: 'Map runs OR-Tools to assign idle subsidised balers, drawing routes under 48h deadline constraints.',
      badge: 'The Core Product',
      icon: Map,
      color: 'text-cyan-400',
    },
    {
      step: 3,
      title: 'Beat 3: Field Baler & <90s Instant UPI Settle',
      oneLiner: 'Field operator scans QR lot, verifies acreage, fires guaranteed UPI settlement in <90s.',
      badge: 'Zero-Dispute Trust',
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      step: 4,
      title: 'Beat 4: NASA FIRMS Satellite Verification (The Money Shot)',
      oneLiner: 'Zero fire points inside registered polygons vs neighbor fire storms, creating verified carbon credits.',
      badge: 'The Institutional Asset',
      icon: Satellite,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto p-2">
      {/* Top Hackathon Presentation Flow Navigator */}
      <div className="glass-panel p-4 bg-slate-950/80 border-emerald-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-black text-white font-['Outfit'] tracking-tight">
                Section 10: The 4-Beat Hackathon Pitch Runner
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Follow the exact 4-step sequence from the team brief to demonstrate the winning reframe to judges
            </p>
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentBeat((prev) => Math.max(1, prev - 1))}
              disabled={currentBeat === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev Beat</span>
            </button>

            <span className="text-xs font-mono font-bold text-emerald-400 px-2">
              Beat {currentBeat} of 4
            </span>

            <button
              onClick={() => setCurrentBeat((prev) => Math.min(4, prev + 1))}
              disabled={currentBeat === 4}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow shadow-emerald-600/30 cursor-pointer transition-all"
            >
              <span>Next Beat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Interactive Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          {beats.map((b) => {
            const isActive = currentBeat === b.step;
            const isCompleted = currentBeat > b.step;
            const Icon = b.icon;

            return (
              <div
                key={b.step}
                onClick={() => setCurrentBeat(b.step)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${b.color}`} />
                    <span className="text-xs font-bold text-white">Beat {b.step}</span>
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="badge badge-emerald text-[9px]">{b.badge}</span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {b.title.split(': ')[1]}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {b.oneLiner}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Display for Current Beat */}
      <div className="transition-all duration-300">
        {currentBeat === 1 && (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-slate-200 flex items-center justify-between">
              <div>
                <strong>Beat 1 in Action:</strong> Farmer Gurpreet Singh books 3.5 acres via Punjabi WhatsApp. Notice the dynamic rate (₹1,450/ac) and the contractual late penalty of ₹4,500. Click <em>"Lock Slot"</em> or <em>"Listen to Punjabi Voice Note"</em>!
              </div>
              <button
                onClick={() => setCurrentBeat(2)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap shrink-0 ml-4 cursor-pointer"
              >
                Proceed to Beat 2 →
              </button>
            </div>
            <WhatsAppSimulator
              onSlotConfirmed={(fId) => onUpdateFieldStatus(fId, 'SCHEDULED')}
            />
          </div>
        )}

        {currentBeat === 2 && (
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-slate-200 flex items-center justify-between">
              <div>
                <strong>Beat 2 in Action:</strong> The Central Dispatch Engine takes all registered fields and runs an OR-Tools solver over idle subsidised balers, generating deadhead-minimized routes that eliminate late-sowing penalty exposure.
              </div>
              <button
                onClick={() => setCurrentBeat(3)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs whitespace-nowrap shrink-0 ml-4 cursor-pointer"
              >
                Proceed to Beat 3 →
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8">
                <OpsMap
                  fields={fields}
                  machines={machines}
                  fireEvents={fireEvents}
                  storageYards={INITIAL_STORAGE_YARDS}
                  buyers={INITIAL_BUYERS}
                  selectedField={selectedField}
                  onSelectField={(f) => setSelectedField(f)}
                  activeRoutePolyline={activeRoute}
                />
              </div>
              <div className="lg:col-span-4">
                <VRPDispatchPanel
                  fields={fields}
                  machines={machines}
                  onRouteSelected={(route) => setActiveRoute(route)}
                  onSelectField={(f) => setSelectedField(f)}
                />
              </div>
            </div>
          </div>
        )}

        {currentBeat === 3 && (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-slate-200 flex items-center justify-between">
              <div>
                <strong>Beat 3 in Action:</strong> Baler Operator completes job in the field, checks moisture sensor (14.2%), generates QR Lot code, and triggers an instant <strong>&lt;90s UPI settlement</strong> with realistic Soundbox voice chime!
              </div>
              <button
                onClick={() => setCurrentBeat(4)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs whitespace-nowrap shrink-0 ml-4 cursor-pointer"
              >
                Proceed to Beat 4 (The Money Shot) →
              </button>
            </div>

            <BalerPWA
              fields={fields}
              activeMachine={machines[0]}
              onJobCompleted={(fId, amt) => onUpdateFieldStatus(fId, 'CLEARED_PENDING_AUDIT', amt)}
            />
          </div>
        )}

        {currentBeat === 4 && (
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-slate-200 flex items-center justify-between">
              <div>
                <strong>Beat 4: The Money Shot!</strong> NASA FIRMS VIIRS satellite thermal overlay proves 0 fires in our customer polygons vs 8 fiery red anomalies in neighboring unregistered farms. Click <em>"View Certificate"</em> to inspect the institutional carbon claim!
              </div>
              <button
                onClick={() => setCurrentBeat(1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs whitespace-nowrap shrink-0 ml-4 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart 4-Beat Demo</span>
              </button>
            </div>

            <SatelliteAudit
              fields={fields}
              fireEvents={fireEvents}
            />
          </div>
        )}
      </div>
    </div>
  );
};
