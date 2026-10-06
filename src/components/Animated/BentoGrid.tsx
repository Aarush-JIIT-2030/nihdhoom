import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Database, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Truck,
  IndianRupee,
  Cpu,
  BarChart3
} from 'lucide-react';

interface WedgeItem {
  id: number;
  title: string;
  tagline: string;
  category: string;
  description: string;
  highlight: string;
  metrics: { label: string; value: string }[];
  actionLabel: string;
  targetTab: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  colSpan: string;
}

const WEDGES: WedgeItem[] = [
  {
    id: 1,
    title: 'Wedge 1: Asset Strategy',
    tagline: "Don't buy balers. Route the idle ones.",
    category: 'CAPEX ELIMINATION',
    description: "Punjab & Haryana have distributed crop-residue machinery networks. NIRDHOOM's thesis is to coordinate available capacity without owning the fleet; machine availability must be verified in a pilot.",
    highlight: '₹0 Startup Capex • 100% Asset-Light Take Rate',
    metrics: [
      { label: 'Baler Machine Capex', value: '₹0 (Zero)' },
      { label: 'Registered CRM Capacity', value: 'Demo capacity pool' },
      { label: 'Take Rate Margin', value: 'Asset-Light Take Rate' },
    ],
    actionLabel: 'Inspect Idle Fleet Dispatch',
    targetTab: 'OPS_CONSOLE',
    icon: Truck,
    accentColor: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    colSpan: 'lg:col-span-7',
  },
  {
    id: 2,
    title: 'Wedge 2: The Core Product',
    tagline: 'Sell reliability, not a vague promise.',
    category: 'CAPACITY-AWARE OPERATIONS',
    description: 'Farmers face a tight 10–20 day window between paddy harvest and wheat sowing. NIRDHOOM turns that time pressure into a capacity-aware booking workflow; a confirmed service commitment only exists after real capacity and operating terms are reserved.',
    highlight: 'Capacity-aware logistics, not a guarantee',
    metrics: [
      { label: 'Penalty policy', value: 'Not enabled' },
      { label: 'Clearance window', value: 'Capacity dependent' },
      { label: 'Farmer status', value: 'Visible in workflow' },
    ],
    actionLabel: 'Open farmer workflow',
    targetTab: 'FARMER_SURFACE',
    icon: ShieldCheck,
    accentColor: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-emerald-800',
    colSpan: 'lg:col-span-5',
  },
  {
    id: 3,
    title: 'Wedge 3: Pricing Mechanism',
    tagline: 'Price by time, not by weight. Pay per acre.',
    category: 'ALGORITHMIC YIELD MANAGEMENT',
    description: 'Weight disputes can create farmgate friction. The prototype uses bounded per-acre estimates to support planning; authoritative booking values are calculated by the server when the live booking workflow succeeds.',
    highlight: 'Flattens the 30-day Supply Spike Before It Hits',
    metrics: [
      { label: 'Booking Horizon', value: '21 Days Ahead' },
      { label: 'Early-booking incentive (demo)', value: 'Illustrative only' },
      { label: 'Farmgate Disputes', value: 'Evidence-linked (demo)' },
    ],
    actionLabel: 'Simulate Dynamic Quote',
    targetTab: 'AGENTIC_CONSOLE',
    icon: Clock,
    accentColor: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    colSpan: 'lg:col-span-4',
  },
  {
    id: 4,
    title: 'Wedge 4: Data Moat',
    tagline: 'Forecast the harvest before it happens.',
    category: 'SENTINEL-2 NDVI FORECASTING',
    description: 'Paddy variety and crop maturity can inform harvest planning. The product keeps satellite/forecast inputs separate from verified field records and does not invent a maturity accuracy number.',
    highlight: 'Future analytics pathway',
    metrics: [
      { label: 'Satellite Frequency', value: '5-Day Sentinel-2' },
      { label: 'Forecast confidence', value: 'Methodology dependent' },
      { label: 'Forecast Horizon', value: '14-Day Advance' },
    ],
    actionLabel: 'Explore Harvest Forecast',
    targetTab: 'OFFTAKE_AUCTION',
    icon: Database,
    accentColor: 'from-blue-500 to-indigo-500',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    colSpan: 'lg:col-span-4',
  },
  {
    id: 5,
    title: 'Wedge 5: Offtake Optimization',
    tagline: 'Stop assuming biogas is the best buyer.',
    category: 'DYNAMIC MULTI-OFFTAKE AUCTION',
    description: 'Verified residue can be routed toward eligible offtake pathways based on quality, quantity, logistics and buyer terms. Demo buyer values are illustrative until real offers and contracts are connected.',
    highlight: 'Conditional buyer matching',
    metrics: [
      { label: 'Buyer price', value: 'Demo / conditional' },
      { label: 'Offer status', value: 'Not a contract' },
      { label: 'Moisture Sorting', value: 'Dual-Channel <16%' },
    ],
    actionLabel: 'View buyer pathways',
    targetTab: 'OFFTAKE_AUCTION',
    icon: TrendingUp,
    accentColor: 'from-teal-500 to-emerald-500',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-300',
    colSpan: 'lg:col-span-4',
  },
];

export const BentoGrid: React.FC<{
  onNavigateTab: (tab: string) => void;
}> = ({ onNavigateTab }) => {
  const [hoveredWedge, setHoveredWedge] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-emerald-900/10">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-800" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold">
              The 5 Strategic Wedges (Team Brief)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-['DM_Sans'] tracking-tight mt-1">
            Why The Obvious Model Dies, and The Version That Wins
          </h2>
          <p className="text-xs text-emerald-950/55 mt-1 max-w-3xl">
            Originality does not come from selling commoditised straw. It comes from picking a new unit of value: unlocking stranded public balers, underwriting harvest downside, and verifying non-burning on satellite.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('JUDGE_DEFENSE')}
          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-900/10 text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Judge Q&A Deck</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {WEDGES.map((w) => {
          const Icon = w.icon;
          const isHovered = hoveredWedge === w.id;

          return (
            <div
              key={w.id}
              onMouseEnter={() => setHoveredWedge(w.id)}
              onMouseLeave={() => setHoveredWedge(null)}
              className={`${w.colSpan} relative rounded-2xl border border-emerald-900/10/90 bg-white p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10`}
            >
              {/* Subtle gradient hover spotlight */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${w.accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-emerald-900/10/60 flex items-center justify-center text-emerald-800 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border border-white/5 ${w.badgeBg} ${w.badgeText}`}>
                      {w.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    0{w.id}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-['DM_Sans'] group-hover:text-emerald-300 transition-colors">
                  {w.title}
                </h3>
                <h4 className="text-xs font-semibold text-emerald-800 font-mono mt-0.5">
                  "{w.tagline}"
                </h4>

                <p className="text-xs text-emerald-950/65 mt-2.5 leading-relaxed font-['Plus_Jakarta_Sans']">
                  {w.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-emerald-900/10/80">
                <div className="text-[11px] font-mono text-emerald-800 font-semibold mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{w.highlight}</span>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {w.metrics.map((m, idx) => (
                    <div key={idx} className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-900/10 text-center">
                      <div className="text-[10px] text-emerald-950/55 font-mono truncate">{m.label}</div>
                      <div className="text-xs font-bold text-emerald-950 font-semibold mt-0.5 truncate">{m.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateTab(w.targetTab)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 hover:text-white text-white text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-900/10 hover:border-emerald-500 shadow-sm"
                >
                  <span>{w.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
