import React from 'react';
import { NonBurnCertificate } from '../../types';
import { Printer, X, ShieldCheck, Satellite, Fingerprint, AlertTriangle } from 'lucide-react';

interface CarbonCertificateProps {
  certificate: NonBurnCertificate;
  onClose: () => void;
}

export const CarbonCertificate: React.FC<CarbonCertificateProps> = ({ certificate, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 printable-cert">
        <div className="flex items-center justify-between no-print border-b border-slate-800 pb-3 mb-5">
          <div>
            <span className="badge badge-amber text-xs">ILLUSTRATIVE / DEMO RECORD</span>
            <p className="text-xs text-slate-500 mt-1">Not a government, Verra, Article 6 or registry certificate.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="border border-amber-500/30 rounded-xl p-6 bg-slate-950 relative overflow-hidden">
          <div className="flex flex-col items-center text-center gap-2 border-b border-slate-800 pb-5">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/50 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-xs uppercase tracking-widest text-amber-300 font-bold">NIRDHOOM verification workspace</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Illustrative Verification Record</h1>
            <p className="text-xs text-slate-400 max-w-xl">
              This document demonstrates the shape of an evidence record. It does not establish that the field did not burn,
              does not issue carbon credits, and does not represent a completed registry verification.
            </p>
            <div className="font-mono text-xs text-amber-200 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/20">
              Record ID: {certificate.certificate_id}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Field</span>
              <strong className="text-white block mt-0.5">{certificate.khasra_no}</strong>
              <span className="text-slate-400">{certificate.village}, {certificate.district}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Area</span>
              <strong className="text-white block mt-0.5">{certificate.acreage} acres</strong>
              <span className="text-slate-400">{certificate.paddy_variety}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Record state</span>
              <strong className="text-amber-300 block mt-0.5">{certificate.certificate_status}</strong>
              <span className="text-slate-400">No external issuance</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Created</span>
              <strong className="text-slate-200 block mt-0.5">{certificate.issued_at}</strong>
              <span className="text-slate-400">Prototype record</span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Evidence status
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold"><Satellite className="w-4 h-4 text-cyan-300" /> Remote sensing</div>
                <p className="mt-1 text-slate-400">No registry-grade remote-sensing proof is asserted by this record.</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold"><ShieldCheck className="w-4 h-4 text-emerald-300" /> Operational evidence</div>
                <p className="mt-1 text-slate-400">Production verification requires completed job, evidence asset, residue custody and verifier review.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-center">
            {[
              ['CO₂e', certificate.co2e_avoided_tonnes, 't'],
              ['PM2.5', certificate.pm25_prevented_kg, 'kg'],
              ['CH₄', certificate.methane_prevented_kg, 'kg'],
              ['Carbon value', '—', 'not calculated'],
            ].map(([label, value, unit]) => (
              <div key={String(label)} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">{label}</span>
                <span className="text-lg font-extrabold text-slate-200 font-mono">{value}</span>
                <span className="ml-1 text-[10px] text-slate-500">{unit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 mt-5 border-t border-slate-800 text-xs">
            <div className="flex items-start gap-2">
              <Fingerprint className="w-7 h-7 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block">Hash status</span>
                <span className="font-mono text-[10px] text-slate-400 break-all select-all">{certificate.sha256_hash}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-300">No external signer attached</div>
              <div className="text-[10px] text-slate-500">A future verifier/registry integration must sign issued records.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
