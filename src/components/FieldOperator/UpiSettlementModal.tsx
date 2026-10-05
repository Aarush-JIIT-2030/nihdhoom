import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  X, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Volume2, 
  QrCode, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Field } from '../../types';
import { audioSynth } from '../../utils/audioSynth';

interface UpiSettlementModalProps {
  field: Field;
  onClose: () => void;
  onSettlementComplete: (fieldId: string, amount: number) => void;
}

export const UpiSettlementModal: React.FC<UpiSettlementModalProps> = ({
  field,
  onClose,
  onSettlementComplete,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(14); // Demo-only countdown; no settlement guarantee or provider call is made
  const [settled, setSettled] = useState(false);
  const [apiStep, setApiStep] = useState(0);

  const amount = field.payout_amount || Math.round(field.acreage * 1450);
  const upiId = `${field.farmer_name.toLowerCase().replace(/ /g, '.')}@oksbi`;

  // Countdown & Webhook simulation
  useEffect(() => {
    if (settled) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSettlementSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 450);

    const stepTimer1 = setTimeout(() => setApiStep(1), 1200);
    const stepTimer2 = setTimeout(() => setApiStep(2), 2600);
    const stepTimer3 = setTimeout(() => setApiStep(3), 4200);

    return () => {
      clearInterval(timer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
    };
  }, [settled]);

  const triggerSettlementSuccess = () => {
    setSettled(true);
    setApiStep(4);

    // Audio chime & Soundbox voice announcement
    audioSynth.speakSoundboxPayout(amount, field.farmer_name);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#06b6d4'],
      });
    } catch (e) {
      console.warn(e);
    }

    onSettlementComplete(field.id, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Payment Simulation — no money movement
              </h3>
              <p className="text-xs text-slate-400">
                Demo only • provider integration is intentionally disabled
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Countdown / Success Card */}
        <div
          className={`p-5 rounded-xl border text-center transition-all ${
            settled
              ? 'bg-emerald-950/70 border-emerald-500/60 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          {!settled ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Simulated payout workflow...</span>
              </div>
              <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
                00:{secondsRemaining.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-slate-400">
                No real payment request is sent. This is a UI simulation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-['Outfit']">
                SIMULATED: ₹{amount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo soundbox event — no receipt was sent</span>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 text-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Recipient Farmer:</span>
            <div className="flex items-center gap-2">
              <img 
                src="/images/farmer_gurpreet.jpg" 
                alt={field.farmer_name} 
                className="w-5 h-5 rounded-full border border-emerald-400 object-cover" 
              / loading="lazy" decoding="async">
              <strong className="text-white font-medium">{field.farmer_name}</strong>
            </div>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>UPI ID (simulated VPA):</span>
            <span className="font-mono text-cyan-300">{upiId}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Field & Land Record:</span>
            <strong className="text-slate-200">{field.khasra_no} ({field.acreage} Acres)</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Locked Rate / Acre:</span>
            <span className="font-mono text-emerald-400">₹{Math.round(amount / field.acreage)} / acre (demo)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Bale Lot Tag ID:</span>
            <span className="font-mono text-slate-300">{field.qr_lot_code || 'PB-SGR-26-LOT-0101'}</span>
          </div>
        </div>

        {/* Simulated API Trace */}
        <div className="bg-black/60 rounded-lg p-2.5 font-mono text-[10px] text-slate-400 flex flex-col gap-1 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>DEMO TRACE — no provider call:</span>
          </div>
          <div className={apiStep >= 1 ? 'text-slate-300' : 'text-slate-600'}>
            [demo] payout request → simulated
          </div>
          <div className={apiStep >= 2 ? 'text-slate-300' : 'text-slate-600'}>
            [10:44:15] ST_Contains polygon GPS geofence verified (Khasra 412/1)
          </div>
          <div className={apiStep >= 3 ? 'text-slate-300' : 'text-slate-600'}>
            [demo] banking route → simulated (no RRN)
          </div>
          <div className={apiStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
            [demo] receipt + soundbox → simulated
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          Close Payout Inspector
        </button>
      </div>
    </div>
  );
};
