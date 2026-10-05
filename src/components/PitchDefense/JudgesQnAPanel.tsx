import React, { useState } from 'react';
import { 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Scale, 
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface JudgeQnA {
  id: string;
  question: string;
  shortAnswer: string;
  detailedDefense: string;
  tag: 'ASSET_STRATEGY' | 'COMPETITION' | 'AGRONOMY' | 'BUSINESS_MODEL';
}

const JUDGE_QUESTIONS: JudgeQnA[] = [
  {
    id: 'q1',
    question: 'What is NIRDHOOM actually selling?',
    shortAnswer: 'A coordination and evidence layer for crop-residue clearance — not a baler fleet.',
    detailedDefense: 'The current product coordinates field records, farmer requests, machine work, evidence and residue pathways. We do not claim to own the machinery or operate a commercial fleet today. The startup thesis is asset-light: software can make existing machinery easier to discover, schedule and verify.',
    tag: 'COMPETITION',
  },
  {
    id: 'q2',
    question: 'Why not just use existing government CRM services?',
    shortAnswer: 'The gap we target is coordination: who is coming, when, what happened, and what happens to the residue next.',
    detailedDefense: 'Government machinery and subsidy programs are important infrastructure, not something we replace. NIRDHOOM is designed as a coordination layer around that infrastructure: field registration, consent, booking, dispatch, operator evidence, verification and residue handoff. A pilot would test whether this reduces missed slots and coordination overhead.',
    tag: 'AGRONOMY',
  },
  {
    id: 'q3',
    question: 'Does the platform depend on buying expensive machinery?',
    shortAnswer: 'No. The prototype is intentionally asset-light.',
    detailedDefense: 'The software model can work with registered CHC, FPO or individual machines. That keeps the product focused on utilization, routing and evidence rather than financing a new machine fleet. Actual commercial capacity and machine ownership would be validated during a field pilot.',
    tag: 'ASSET_STRATEGY',
  },
  {
    id: 'q4',
    question: 'Where can the business model come from?',
    shortAnswer: 'The first testable wedge is a service/coordination fee; downstream offtake is a separate pathway.',
    detailedDefense: 'The release does not claim live revenue, payments or buyer contracts. A future pilot can test a transparent service fee for successful coordination and, separately, commercial residue handling with real buyers. Carbon revenue and financial products are intentionally excluded until the required methodology, counterparties and controls exist.',
    tag: 'BUSINESS_MODEL',
  },
  {
    id: 'q5',
    question: 'If Punjab fire counts have fallen, why is this still worth solving?',
    shortAnswer: 'Lower reported fire-event counts are encouraging; they do not remove the seasonal coordination problem.',
    detailedDefense: 'Official reporting shows a large decline in reported Punjab fire events in recent seasons. NIRDHOOM does not claim that its prototype caused that decline. The remaining product question is operational: can farmers access non-burning residue-management options reliably during the narrow harvest-to-sowing window? That is what a pilot should measure.',
    tag: 'COMPETITION',
  },
  {
    id: 'q6',
    question: 'Are you using satellite data as proof that a field did not burn?',
    shortAnswer: 'No. Satellite observations are one evidence layer, not a no-burn certificate by themselves.',
    detailedDefense: 'The verification model keeps field geometry, operator evidence, GPS, satellite observations and human review distinct. A missing thermal observation cannot prove that a field was clear. This distinction is important for trustworthy environmental claims.',
    tag: 'COMPETITION',
  },
  {
    id: 'q7',
    question: 'How do you make the product usable for farmers?',
    shortAnswer: 'Start with the next action: choose field, book pickup, track machine, show proof.',
    detailedDefense: 'The farmer navigation uses plain language, larger mobile controls, a five-step journey, Telegram support and local-language surfaces. Advanced dispatch, 3D and research tools remain available for operators and judges without making the farmer complete those workflows.',
    tag: 'ASSET_STRATEGY',
  },
];

export const JudgesQnAPanel: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>('q1');
  const [unitAcreage, setUnitAcreage] = useState<number>(1000);

  // Unit Economics calculations comparing Incumbent Model vs Nirdhoom Model
  const incumbentCapex = Math.round((unitAcreage / 300) * 1800000); // Baler purchase capex
  const incumbentRevenue = unitAcreage * 2.2 * 1850; // Tonnes * CBG rate
  const incumbentCosts = unitAcreage * (1100 + 750); // Baling + transport
  const incumbentNetMargin = incumbentRevenue - incumbentCosts;

  // Nirdhoom Asset-Light Model
  const nirdhoomDispatchFee = unitAcreage * 350; // Take rate on machine routing
  const nirdhoomInputMargin = unitAcreage * 620; // Illustrative future agri-input margin
  const nirdhoomNetRevenue = nirdhoomDispatchFee + nirdhoomInputMargin;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Top Banner */}
      <div className="glass-panel-emerald p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                Section 11: Questions the Judges Will Ask & How We Win
              </h3>
              <span className="badge badge-emerald text-xs">
                Defensible Pitch Positioning
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Use this panel to answer the hard questions without turning prototype assumptions into production claims.
            </p>
          </div>
        </div>
      </div>

      {/* Evidence boundary for judging */} 
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-sm text-white">Evidence boundary: what we will and will not claim</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3">
            <strong className="text-emerald-300">Implemented foundations</strong>
            <p className="mt-1 text-slate-300 leading-relaxed">Supabase-backed auth/data boundaries, server-owned booking, Telegram linking/webhook logic, GPS/evidence primitives, dispatch integration and verification workflows.</p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3">
            <strong className="text-amber-300">Demo / illustrative</strong>
            <p className="mt-1 text-slate-300 leading-relaxed">Seeded scenarios, 3D views, indicative economics and the payment simulation. These are clearly labelled and are not presented as live outcomes.</p>
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-3">
            <strong className="text-cyan-300">Pilot dependencies</strong>
            <p className="mt-1 text-slate-300 leading-relaxed">Real machine availability, cadastral verification, production telemetry, external provider operations and field-level outcome measurement still need supervised validation.</p>
          </div>
        </div>
      </div>

      {/* Accordion of the 4 Tough Judge Questions */}
      <div className="flex flex-col gap-3">
        <h4 className="font-bold text-sm text-white uppercase tracking-wider text-slate-400">
          Critical pitch defences
        </h4>

        {JUDGE_QUESTIONS.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="glass-panel overflow-hidden border-slate-800 hover:border-slate-700 transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? '' : q.id)}
                className="p-4 flex items-center justify-between cursor-pointer bg-slate-900/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    ?
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">{q.question}</h5>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                      {q.shortAnswer}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-150">
                  <p className="mb-2">{q.detailedDefense}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Unit Economics Comparison: Asset-Heavy vs Nirdhoom Asset-Light Reframe */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-base text-white">
              Unit Economics Reality: Asset-Heavy vs Nirdhoom Asset-Light
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Simulation Scale:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{unitAcreage.toLocaleString()} Acres</span>
          </div>
        </div>

        <input
          type="range"
          min="500"
          max="10000"
          step="500"
          value={unitAcreage}
          onChange={(e) => setUnitAcreage(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Old Incumbent Model */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col justify-between">
            <div>
              <span className="badge badge-crimson text-[10px] mb-1">
                Asset-heavy reference model
              </span>
              <h5 className="font-bold text-sm text-white">Buy Balers, Sell Parali to CBG</h5>
              <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Machinery Capex (15L/baler):</span>
                  <strong className="text-red-400 font-mono">₹{(incumbentCapex / 100000).toFixed(1)} Lakhs Capex</strong>
                </div>
                <div className="flex justify-between">
                  <span>Gross Straw Revenue @ ₹1,850/t:</span>
                  <span className="font-mono">₹{(incumbentRevenue / 100000).toFixed(1)} L</span>
                </div>
                <div className="flex justify-between">
                  <span>Baling + Transport Costs:</span>
                  <span className="font-mono text-red-300">-₹{(incumbentCosts / 100000).toFixed(1)} L</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-red-500/20 text-xs">
              <span className="text-[10px] text-slate-400 block">Operating Cash Margin</span>
              <div className="text-lg font-black text-red-400 font-mono">
                Thin to Negative (-₹{(Math.abs(incumbentNetMargin) / 100000).toFixed(1)} L)
              </div>
              <span className="text-[10px] text-slate-500">
                Illustrative comparison only; not NIRDHOOM field economics.
              </span>
            </div>
          </div>

          {/* Nirdhoom Reframe Model */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col justify-between">
            <div>
              <span className="badge badge-emerald text-[10px] mb-1">
                Nirdhoom Reframe (Illustrative Asset-Light Model)
              </span>
              <h5 className="font-bold text-sm text-white">Route machinery + build verified farmer workflows</h5>
              <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Machinery Capex:</span>
                  <strong className="text-emerald-400 font-mono">₹0 (Route Subsidised CHC Fleet)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dispatch Commission (₹350/ac):</span>
                  <span className="font-mono text-emerald-300">₹{(nirdhoomDispatchFee / 100000).toFixed(1)} L</span>
                </div>
                <div className="flex justify-between">
                  <span>Illustrative future input/offtake margin:</span>
                  <span className="font-mono text-emerald-300">₹{(nirdhoomInputMargin / 100000).toFixed(1)} L</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-emerald-500/20 text-xs">
              <span className="text-[10px] text-slate-400 block">Illustrative network revenue model</span>
              <div className="text-xl font-black text-emerald-400 font-mono">
                ₹{(nirdhoomNetRevenue / 100000).toFixed(2)} Lakhs (illustrative)
              </div>
              <span className="text-[10px] text-emerald-300">
                Illustrative only • excludes payment and carbon revenue from this release
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
