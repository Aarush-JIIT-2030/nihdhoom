import React from 'react';
import { Field } from '../../types';
import { 
  X, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Zap, 
  Droplet,
  ExternalLink
} from 'lucide-react';

interface FieldDetailDrawerProps {
  demoMode: boolean;
  field: Field | null;
  onClose: () => void;
  onTriggerUpiPayout: (field: Field) => void;
  onViewCertificate: (field: Field) => void;
}

export const FieldDetailDrawer: React.FC<FieldDetailDrawerProps> = ({
  demoMode,
  field,
  onClose,
  onTriggerUpiPayout,
  onViewCertificate,
}) => {
  if (!field) return null;

  const isCleared = field.status === 'CLEARED_PENDING_AUDIT' || field.status === 'VERIFIED_NON_BURN';

  return (
    <div className="tone-adapt glass-panel p-4 border-emerald-500/40 shadow-2xl relative animate-in fade-in slide-in-from-bottom duration-200">
      {/* Header with Close */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-white">{field.khasra_no}</h4>
              <span className="badge badge-emerald text-[10px]">
                {field.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {field.village}, Block {field.block}, District {field.district}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
          <img 
            src="/images/farmer_gurpreet.jpg" 
            alt={field.farmer_name} 
            className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover shrink-0"
           loading="lazy" decoding="async" />
          <div className="min-w-0">
            <span className="text-slate-400 text-[10px] block">Farmer / Owner</span>
            <strong className="text-white text-xs block truncate">{field.farmer_name}</strong>
            <span className="text-emerald-400 font-mono text-[10px]">{field.farmer_phone}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Acreage & Variety</span>
          <strong className="text-white text-sm block mt-0.5">
            {field.acreage} Acres
          </strong>
          <span className="text-amber-400 font-semibold text-[11px]">{field.paddy_variety}</span>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Clearance Window</span>
          <strong className="text-emerald-400 text-xs block mt-0.5">
            {field.clearance_deadline}
          </strong>
          <span className="text-slate-400 text-[10px]">{demoMode ? 'Demo scheduling window' : 'Server-authorized booking window'}</span>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[11px] block">Late Sowing Penalty</span>
          <strong className="text-amber-300 text-sm block mt-0.5">
            {demoMode ? `₹${Math.max(2500, Math.round(field.acreage * 1250)).toLocaleString()}` : '—'}
          </strong>
          <span className="text-emerald-400 text-[10px] font-semibold">{demoMode ? 'Simulation only' : 'Server-enforced booking terms'}</span>
        </div>
      </div>

      {/* Satellite Audit & QR Lot Status */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Remote-sensing audit:</span>
              <span className="text-emerald-400">{demoMode ? '0 synthetic fires' : 'Awaiting provider observations'}</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              {demoMode ? 'Illustrative FIRMS / NDVI values shown for the prototype' : 'No remote-sensing conclusion is shown until verified observations are attached'}
            </div>
          </div>
        </div>

        {field.qr_lot_code && (
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded border border-slate-800 shrink-0">
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-cyan-300 font-semibold">{field.qr_lot_code}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          onClick={() => onViewCertificate(field)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{demoMode ? 'View demo verification record' : 'View verification record'}</span>
        </button>

        {!isCleared && demoMode ? (
          <button
            onClick={() => onTriggerUpiPayout(field)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate field completion</span>
          </button>
        ) : isCleared && demoMode ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demo completion recorded locally • no payment made</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/70 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Live status changes require the authorized job-transition workflow.</span>
          </div>
        )}
      </div>
    </div>
  );
};
