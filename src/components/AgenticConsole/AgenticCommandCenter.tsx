import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  Zap, 
  Clock, 
  ChevronRight, 
  RefreshCw,
  Eye,
  Sliders,
  DollarSign
} from 'lucide-react';
import { AgenticNeuralCore3D } from '../ThreeD/AgenticNeuralCore3D';

interface AgentNode {
  id: string;
  name: string;
  role: string;
  status: 'IDLE' | 'ACTIVE' | 'RESOLVED';
  latency: string;
  tools: string[];
  confidence: number;
}

interface ExecutionStep {
  id: string;
  agent: string;
  action: string;
  toolCall?: string;
  reasoning: string;
  output: string;
  status: 'RUNNING' | 'DONE';
  timestamp: string;
}

const PRESET_PROMPTS = [
  {
    title: '⚡ Re-balance Sangrur Cluster',
    prompt: 'Evaluate 12 fields approaching 48-hr harvest window in Bhawanigarh block and execute OR-Tools VRP re-route for idle CHC balers.',
    agentSequence: ['vrp', 'sentinel', 'voice'],
  },
  {
    title: '🛰️ FIRMS / VIIRS Thermal Sweep',
    prompt: 'Query configured FIRMS / VIIRS observations and intersect them with registered field polygons. Treat matches as supporting thermal evidence, not proof of burn or non-burn.',
    agentSequence: ['sentinel', 'audit'],
  },
  {
    title: '🌾 Multi-Offtake Dynamic Auction',
    prompt: 'Run instant dynamic auction for 50 tonnes PR-126 straw (moisture 14%) between Craste Moulded Pulp (₹2,800/T) and Verbio CBG.',
    agentSequence: ['pricing', 'voice'],
  },
  {
    title: '💸 <90s UPI Settlement Batch',
    prompt: 'Verify weighment & geotagged bale photos for Field PB-SGR-01, trigger RazorpayX direct UPI payout to Gurpreet Singh, and dispatch Punjabi voice confirmation.',
    agentSequence: ['audit', 'voice'],
  },
];

export const AgenticCommandCenter: React.FC<{
  onTriggerDemoBeat?: (beatNumber: number) => void;
  onNavigateTab?: (tab: string) => void;
}> = ({ onTriggerDemoBeat, onNavigateTab }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(PRESET_PROMPTS[0].prompt);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string>('vrp');
  const [boundedAutonomy, setBoundedAutonomy] = useState(true);
  const [humanApprovalState, setHumanApprovalState] = useState<'PENDING' | 'APPROVED' | 'NONE'>('NONE');

  const [activeStepIndex, setActiveStepIndex] = useState(3);

  const [steps, setSteps] = useState<ExecutionStep[]>([
    {
      id: 'step-1',
      agent: 'Perception Agent',
      action: 'query_sentinel_ndvi_and_khasra()',
      toolCall: 'sentinel_hub.get_polygon_metrics(khasra="342/12", district="Sangrur")',
      reasoning: 'Farmer Gurpreet Singh submitted khasra 342/12. Sentinel-2 NDVI index computed at 0.78, indicating 96% grain maturity. Recommended clearance window is Oct 26-28.',
      output: 'Maturity index: 0.78 • Moisture estimated: 14.2% • Acreage verified: 5.2 acres',
      status: 'DONE',
      timestamp: '18:42:10.104',
    },
    {
      id: 'step-2',
      agent: 'VRP Solver Agent',
      action: 'or_tools_vrp_time_window_solve()',
      toolCall: 'vrp_solver.optimize(balers=4, fields=14, max_travel_radius_km=18)',
      reasoning: 'Evaluated 4 subsidised CHC balers currently idle within 7.8km. Baler PB-11-CH-4902 finishes block clearance in 1.4h with 2.1km deadhead travel.',
      output: 'Optimal route locked: Baler #1 arriving at 14:00 • Penalty exposure risk: 0.00%',
      status: 'DONE',
      timestamp: '18:42:10.428',
    },
    {
      id: 'step-3',
      agent: 'Dynamic Yield Agent',
      action: 'calculate_parametric_slot_quote()',
      toolCall: 'yield_pricing.quote(days_to_harvest=14, block_capacity=84%, acreage=5.2)',
      reasoning: 'Early booking at 14 days pre-harvest qualifies for maximum forward-visibility subsidy. Base rate: ₹1,500/acre. Net quote: ₹7,800 with 100% money-back slot guarantee.',
      output: 'Guaranteed rate: ₹1,500/acre • Late-sowing compensation backed: ₹7,500 penalty bond',
      status: 'DONE',
      timestamp: '18:42:10.612',
    },
    {
      id: 'step-4',
      agent: 'Voice NLP Agent',
      action: 'dispatch_punjabi_whatsapp_and_audio()',
      toolCall: 'whatsapp_cloud_api.send_template(phone="+919876543210", lang="pa_IN")',
      reasoning: 'Generated bilingual Punjabi confirmation with slot time, driver contact, and locked UPI payout estimate. Synthesized 12-second voice note for offline listening.',
      output: 'WhatsApp message & audio dispatched • Message ID: wamid.HBgLM... • Status: Read',
      status: 'DONE',
      timestamp: '18:42:11.085',
    },
  ]);

  const handleRunAgentPrompt = (promptText: string) => {
    setSelectedPrompt(promptText);
    setIsExecuting(true);
    setActiveStepIndex(0);

    // Simulate agent steps sequence
    setTimeout(() => {
      setActiveStepIndex(1);
    }, 600);

    setTimeout(() => {
      setActiveStepIndex(2);
    }, 1200);

    setTimeout(() => {
      setActiveStepIndex(3);
      setIsExecuting(false);
      if (boundedAutonomy) {
        setHumanApprovalState('PENDING');
      }
    }, 1900);
  };

  const handleApproveBatch = () => {
    setHumanApprovalState('APPROVED');
    setTimeout(() => {
      setHumanApprovalState('NONE');
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero Pitch Headline & Holographic Core */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#020409] via-[#050c18] to-[#0a1424] border border-cyan-500/30 p-5 sm:p-8 shadow-2xl">
        <div className="grid-bg" />
        <div className="orb w-96 h-96 bg-cyan-500/10 top-0 left-1/4 -translate-y-1/2" />
        <div className="orb w-96 h-96 bg-emerald-500/10 bottom-0 right-1/4 translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Agentic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-4 shadow-lg shadow-cyan-500/10">
            <span className="badge--dot" />
            <span>AGENTIC DISPATCH NETWORK • STATE OF PUNJAB</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">5 COOPERATING AGENTS</span>
          </div>

          {/* Heading with Vector Underline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit'] leading-tight mb-4">
            Zero Burning. Autonomous Dispatch.{' '}
            <span className="hero-word">
              <span className="text-gradient">Guaranteed Slots.</span>
              <svg
                className="hero-underline"
                viewBox="0 0 220 14"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M4 10c32-6 60-2 92-4s66-3 120-6"
                  stroke="url(#underline-grad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="underline-grad" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" />
                    <stop offset="0.5" stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6 font-['Plus_Jakarta_Sans']">
            We don't buy balers and we don't own straw. Nirdhoom orchestrates Punjab's tens of thousands of idle, 50-80% subsidised CRM machines with constrained OR-Tools VRP, backed by a penalty bond, &lt;90s UPI settlement, and NASA FIRMS satellite audit.
          </p>

          {/* 3D Agentic Neural Core Canvas */}
          <div className="w-full my-4">
            <AgenticNeuralCore3D
              activeAgentId={activeAgentId}
              onSelectAgent={(id) => setActiveAgentId(id)}
            />
          </div>

          {/* Interactive Agent Prompt / Command Palette */}
          <div className="w-full max-w-3xl mx-auto mt-2">
            <div className="relative flex items-center bg-slate-900/90 rounded-2xl border border-cyan-500/40 p-2 shadow-2xl focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <div className="pl-3 pr-2 text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                placeholder="Ask the dispatch agent (e.g. 'Optimize Sangrur block for 48-hr harvest spike')..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none py-2 px-1 font-mono"
              />
              <button
                onClick={() => handleRunAgentPrompt(selectedPrompt)}
                disabled={isExecuting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/30 disabled:opacity-50 transition-all"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <span>Execute</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mt-3 pt-1">
              <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                Preset Actions:
              </span>
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunAgentPrompt(p.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-slate-800 hover:border-cyan-500/30 whitespace-nowrap cursor-pointer transition-all"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Human In The Loop Approval Banner */}
      {humanApprovalState === 'PENDING' && (
        <div className="glass-panel-amber p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up border border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 text-sm">
                  Human-in-the-Loop Gate: Bounded Autonomy Check
                </span>
                <span className="badge badge-amber text-[10px]">AWAITING SIGN-OFF</span>
              </div>
              <p className="text-xs text-slate-300">
                Agent proposed 4 machine dispatches & ₹12,500 instant UPI payout. Verify before execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleApproveBatch}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize Batch</span>
            </button>
            <button
              onClick={() => setHumanApprovalState('NONE')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {humanApprovalState === 'APPROVED' && (
        <div className="glass-panel-emerald p-4 rounded-xl flex items-center justify-between gap-3 animate-slide-up border border-emerald-500/40">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="font-bold text-emerald-300 text-sm">
                Tranche Authorized & Signed
              </span>
              <p className="text-xs text-slate-300">
                Dispatches routed to field balers; UPI ref #UPI9982401 queued on NPCI switch.
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">200 OK</span>
        </div>
      )}

      {/* Main Grid: Multi-Agent Execution Graph & Chain of Thought Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: 5 Cooperating Agent Architecture */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="glass-panel p-4 border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white font-['Outfit']">
                  Cooperating Agent Swarm
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                Mesh State: SYNCHRONIZED
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  id: 'sentinel',
                  name: 'Perception Agent',
                  tech: 'Sentinel-2 NDVI + Khasra GIS',
                  desc: 'Maturity forecasting, moisture estimation, field boundaries.',
                  state: 'Active',
                  color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
                  badge: 'badge-cyan',
                },
                {
                  id: 'vrp',
                  name: 'VRP Solver Agent',
                  tech: 'Google OR-Tools with Time Windows',
                  desc: 'Constrained routing, travel matrices, idle CHC utilization.',
                  state: 'Active',
                  color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
                  badge: 'badge-emerald',
                },
                {
                  id: 'pricing',
                  name: 'Dynamic Yield Agent',
                  tech: 'Parametric Insurance Algorithmic Curve',
                  desc: 'Acreage-based pricing, early-booking subsidies, penalty bond underwriting.',
                  state: 'Active',
                  color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
                  badge: 'badge-cyan',
                },
                {
                  id: 'voice',
                  name: 'Voice NLP Agent',
                  tech: 'WhatsApp Cloud API + Punjabi IVR',
                  desc: 'Missed-call callback, native Punjabi speech, locked slot confirmation.',
                  state: 'Standby',
                  color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
                  badge: 'badge-amber',
                },
                {
                  id: 'audit',
                  name: 'Verification & Registry Agent',
                  tech: 'NASA FIRMS VIIRS 375m + ST_Contains',
                  desc: 'Nightly thermal audit, zero-burn proof, Gold Standard VM0042 issuance.',
                  state: 'Active',
                  color: 'text-teal-400 border-teal-500/30 bg-teal-950/20',
                  badge: 'badge-emerald',
                },
              ].map((ag) => (
                <div
                  key={ag.id}
                  onClick={() => setActiveAgentId(ag.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activeAgentId === ag.id
                      ? `${ag.color} ring-1 ring-white/20 shadow-lg`
                      : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span className="font-bold text-xs text-white">{ag.name}</span>
                    </div>
                    <span className={`badge ${ag.badge} text-[10px] py-0 px-2`}>
                      {ag.state}
                    </span>
                  </div>
                  <p className="text-[11px] text-cyan-300 font-mono mb-1">{ag.tech}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">{ag.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-panel p-3 rounded-xl border-emerald-500/20">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Avg VRP Solve</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">380 ms</div>
              <span className="text-[10px] text-slate-500">14 constraints solved</span>
            </div>
            <div className="glass-panel p-3 rounded-xl border-cyan-500/20">
              <span className="text-[10px] font-mono text-slate-400 uppercase">UPI Disbursal SLA</span>
              <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">42 sec</div>
              <span className="text-[10px] text-slate-500">&lt;90s contractual SLA</span>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Trace & Reasoning (The "Why" Layer) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="glass-panel p-5 border-white/10 rounded-2xl h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white font-['Outfit']">
                  Agent Reasoning &amp; Decision Trace (The "Why" Layer)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>STREAM: LIVE</span>
              </div>
            </div>

            {/* Trace Steps Timeline */}
            <div className="flex flex-col gap-4 flex-1">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx <= activeStepIndex
                      ? 'bg-slate-900/80 border-slate-700/80'
                      : 'bg-slate-950/40 border-slate-900 opacity-40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-white">{step.agent}</span>
                      <span className="text-slate-600">•</span>
                      <code className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {step.action}
                      </code>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                  </div>

                  {/* Tool Call Box */}
                  {step.toolCall && (
                    <div className="mb-2 p-2 rounded-lg bg-black/40 border border-slate-800 text-[11px] font-mono text-emerald-300 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{step.toolCall}</span>
                    </div>
                  )}

                  {/* Reasoning CoT */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-2 font-['Plus_Jakarta_Sans']">
                    <span className="text-slate-500 font-semibold">Thought: </span>
                    {step.reasoning}
                  </p>

                  {/* Observation Output */}
                  <div className="p-2 rounded bg-slate-950/60 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{step.output}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions to test core platform */}
            <div className="pt-4 border-t border-white/5 mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Explore dedicated subsystems:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab?.('OPS_CONSOLE')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Ops Map Console
                </button>
                <button
                  onClick={() => onNavigateTab?.('SATELLITE_AUDIT')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shadow"
                >
                  NASA FIRMS Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
