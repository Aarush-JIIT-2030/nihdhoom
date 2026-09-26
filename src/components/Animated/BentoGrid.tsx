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
    description: "Punjab & Haryana already hold tens of thousands of CRM balers with 50–80% government subsidy sitting idle in Custom Hiring Centres (CHCs) and FPOs due to village politics and phone-call matching. We buy zero balers: we deploy an algorithmic dispatch layer over stranded public infrastructure.",
    highlight: '₹0 Startup Capex • 100% Asset-Light Take Rate',
    metrics: [
      { label: 'Baler Machine Capex', value: '₹0 (Zero)' },
      { label: 'Subsidised CRM Pool', value: '14,200+ Balers' },
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
    tagline: 'Sell certainty, not price. A guarantee with teeth.',
    category: 'PARAMETRIC RISK UNDERWRITING',
    description: 'Farmers burn because of time risk: 10–20 days between paddy harvest and wheat sowing. Miss it, and wheat yield drops. We sell a contracted clearance date backed by a legally enforceable penalty bond (₹2,500 to ₹15,000 by acreage) covering late-sowing yield loss.',
    highlight: 'Parametric Insurance Disguised as Logistics',
    metrics: [
      { label: 'Penalty Bond Backed', value: '₹2,500–₹15,000' },
      { label: 'Clearance SLA', value: '< 48 Hours' },
      { label: 'Farmer Downside', value: 'Fully Underwritten' },
    ],
    actionLabel: 'Test Farmer Guarantee',
    targetTab: 'FARMER_SURFACE',
    icon: ShieldCheck,
    accentColor: 'from-cyan-500 to-blue-500',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    colSpan: 'lg:col-span-5',
  },
  {
    id: 3,
    title: 'Wedge 3: Pricing Mechanism',
    tagline: 'Price by time, not by weight. Pay per acre.',
    category: 'ALGORITHMIC YIELD MANAGEMENT',
    description: 'Weight disputes at the farmgate cause friction. Per-acre pricing settles in seconds from verified field polygons. We apply airline yield management to flatten the 30-day spike: book 3 weeks early for top rate (₹1,500/ac); walk-in day of harvest gets floor rate.',
    highlight: 'Flattens the 30-day Supply Spike Before It Hits',
    metrics: [
      { label: 'Booking Horizon', value: '21 Days Ahead' },
      { label: 'Early Bird Subsidy', value: '+40% Top Rate' },
      { label: 'Farmgate Disputes', value: 'Zero (Polygon Based)' },
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
    description: 'Paddy variety determines harvest dates: PR-126 matures late Sept to early Oct; Pusa-44 matures late Oct. Fusing Sentinel-2 NDVI time series with district seed sales produces block-by-block daily acreage forecasts to pre-position idle balers before straw touches ground.',
    highlight: 'High-Margin Data Licensing to CBG & State',
    metrics: [
      { label: 'Satellite Frequency', value: '5-Day Sentinel-2' },
      { label: 'NDVI Accuracy', value: '94.2% Maturity' },
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
    description: 'Paddy straw is high-silica, high-lignin, low-digestibility feedstock that breaks CBG margins. We run an automated auction layer routing lots to highest-value off-takers: Craste moulded packaging (₹2,800/T), mushroom substrate (₹3,200/T), Takachar biochar pyrolysis, and silica extraction.',
    highlight: 'Dynamic Multi-Buyer Margin Arbitrage',
    metrics: [
      { label: 'Top Offtake Rate', value: '₹3,200 / Tonne' },
      { label: 'Versus CBG Floor', value: '+35% to +60%' },
      { label: 'Moisture Sorting', value: 'Dual-Channel <16%' },
    ],
    actionLabel: 'View Live Straw Auction',
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              The 5 Strategic Wedges (Team Brief)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight mt-1">
            Why The Obvious Model Dies, and The Version That Wins
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Originality does not come from selling commoditised straw. It comes from picking a new unit of value: unlocking stranded public balers, underwriting harvest downside, and verifying non-burning on satellite.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('JUDGE_DEFENSE')}
          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
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
              className={`${w.colSpan} relative rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10`}
            >
              {/* Subtle gradient hover spotlight */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${w.accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
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

                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] group-hover:text-emerald-300 transition-colors">
                  {w.title}
                </h3>
                <h4 className="text-xs font-semibold text-emerald-400 font-mono mt-0.5">
                  "{w.tagline}"
                </h4>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-['Plus_Jakarta_Sans']">
                  {w.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-mono text-cyan-300 font-semibold mb-3 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{w.highlight}</span>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {w.metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-mono truncate">{m.label}</div>
                      <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">{m.value}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateTab(w.targetTab)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 hover:border-emerald-500 shadow-sm"
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
