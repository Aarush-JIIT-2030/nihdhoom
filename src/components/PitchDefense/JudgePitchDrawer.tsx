import React from 'react';
import { X, Sparkles, ShieldCheck, CheckCircle2, DollarSign, Award } from 'lucide-react';

interface JudgePitchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgePitchDrawer: React.FC<JudgePitchDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Hackathon Pitch Brief: Parali The Reframe
              </h3>
              <p className="text-xs text-slate-400">
                Why the obvious version loses, and the version that wins
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

        {/* The One-Liner Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500/50">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
            The One-Liner We Are Pitching
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed font-['Outfit']">
            "We don’t buy straw and we don’t buy balers. We run a dispatch network over Punjab’s idle, already-subsidised crop residue machinery. We sell farmers a <span className="text-emerald-400 underline">guaranteed clearance date backed by a penalty</span>, price it dynamically by how early they book, settle <span className="text-emerald-400 underline">through a future provider integration; payment is currently simulated</span>, and prove non-burning against satellite fire data so the record can be sold to carbon registries, CBG plants and the state."
          </p>
        </div>

        {/* The 5 Wedges */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
            The 5 Wedges That Make Us Original
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Wedge 1: Asset Strategy</strong>
              <p className="text-slate-300 text-[11px]">
                Don’t buy balers. Route the idle ones. Tens of thousands of CRM subsidised balers sit in Punjab CHCs. We unlock stranded public infrastructure.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Wedge 2: Product Guarantee</strong>
              <p className="text-slate-300 text-[11px]">
                Sell certainty, not price. A pilot service-level commitment can carry a penalty once a real operator contract is executed; the current UI only models that policy.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Wedge 3: Pricing Mechanism</strong>
              <p className="text-slate-300 text-[11px]">
                Price by time, not weight. Use server-calculated pricing by booking urgency; payment remains simulated until a provider is integrated and reconciled.
              </p>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Wedge 4: Data Moat</strong>
              <p className="text-slate-300 text-[11px]">
                Forecast the harvest before it happens using PR-126 vs Pusa-44 Sentinel-2 NDVI maturity curves. Pre-position balers before the spike.
              </p>
            </div>

            <div className="sm:col-span-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Wedge 5: Offtake Layer</strong>
              <p className="text-slate-300 text-[11px]">
                Route verified residue lots to the best eligible offtake pathway after buyer identity, quality, quantity, price and delivery terms are confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* The Reframe Worth Saying Out Loud */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs">
          <strong className="text-amber-300 font-bold block mb-1 text-sm font-['Outfit']">
            The Reframe Worth Saying Out Loud:
          </strong>
          <p className="text-slate-200 leading-relaxed">
            "Parali collection is not the business, it is the <strong>customer acquisition channel</strong>. We are building a verified, geo-tagged, financially-connected farmer network in Punjab, and straw is the hook that gets us the relationship for free. Inputs, advisory and credit are the business. Pitched that way, we sound like founders, not a hackathon team."
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow"
        >
          Return to Application
        </button>
      </div>
    </div>
  );
};
