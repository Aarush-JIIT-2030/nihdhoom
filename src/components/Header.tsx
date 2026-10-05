import { useEffect, useRef, useState } from 'react';
import {
  Activity, BarChart3, Bot, ChevronDown, ClipboardList, HelpCircle, Leaf, Map, Menu,
  MessageSquare, Satellite, Search, ShieldCheck, Sparkles, Smartphone, TrendingUp,
  UserCheck, Wheat, X,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export type ActiveTab =
  | 'OVERVIEW' | 'RESIDUE_POOLS' | 'IMPACT_RESEARCH' | 'HARVEST_INTELLIGENCE'
  | 'FIELD_PROVENANCE' | 'FIELD_JOBS' | 'AGENTIC_CONSOLE' | 'DEMO_RUNNER'
  | 'DIGITAL_TWIN_3D' | 'MACHINERY_3D' | 'OPS_CONSOLE' | 'FARMER_SURFACE'
  | 'BALER_OPERATOR' | 'SATELLITE_AUDIT' | 'OFFTAKE_AUCTION' | 'CARBON_MARKET'
  | 'FARMER_ONBOARDING' | 'JUDGE_DEFENSE';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openPitchDrawer: () => void;
  demoMode: boolean;
}

type NavItem = {
  id: ActiveTab;
  label: string;
  icon: typeof Activity;
  description: string;
};

const primaryNav: NavItem[] = [
  { id: 'OVERVIEW', label: 'Command', icon: Activity, description: 'Operational overview and exceptions' },
  { id: 'FIELD_JOBS', label: 'Jobs', icon: ClipboardList, description: 'Field bookings and machine work' },
  { id: 'RESIDUE_POOLS', label: 'Pools', icon: Leaf, description: 'Residue supply and deal pools' },
  { id: 'FIELD_PROVENANCE', label: 'Trust', icon: ShieldCheck, description: 'Field evidence and provenance' },
  { id: 'IMPACT_RESEARCH', label: 'Impact', icon: BarChart3, description: 'Evidence-backed impact and research' },
];

const operationsNav: NavItem[] = [
  { id: 'OPS_CONSOLE', label: 'Ops map', icon: Map, description: 'GIS dispatch and live operations' },
  { id: 'HARVEST_INTELLIGENCE', label: 'Harvest intel', icon: Wheat, description: 'Harvest pressure and timing' },
  { id: 'SATELLITE_AUDIT', label: 'Verification', icon: Satellite, description: 'Remote-sensing evidence review' },
  { id: 'BALER_OPERATOR', label: 'Field PWA', icon: Smartphone, description: 'Operator field workflow' },
  { id: 'FARMER_SURFACE', label: 'Farmer', icon: MessageSquare, description: 'Farmer WhatsApp and IVR surface' },
];

const strategyNav: NavItem[] = [
  { id: 'OFFTAKE_AUCTION', label: 'Offtake', icon: TrendingUp, description: 'Buyer demand and procurement' },
  { id: 'CARBON_MARKET', label: 'Carbon', icon: Leaf, description: 'Carbon marketplace prototype' },
  { id: 'FARMER_ONBOARDING', label: 'Onboarding', icon: UserCheck, description: 'Farmer consent and onboarding' },
  { id: 'AGENTIC_CONSOLE', label: 'AI console', icon: Bot, description: 'Agentic operations workspace' },
  { id: 'DIGITAL_TWIN_3D', label: '3D twin', icon: Activity, description: 'Geospatial digital twin' },
  { id: 'MACHINERY_3D', label: '3D baler', icon: Activity, description: 'Machine digital twin' },
  { id: 'DEMO_RUNNER', label: 'Demo runner', icon: Sparkles, description: 'Pitch walkthrough' },
  { id: 'JUDGE_DEFENSE', label: 'Judge Q&A', icon: HelpCircle, description: 'Pitch defence workspace' },
];

const allSecondary = [...operationsNav, ...strategyNav];

export function Header({ activeTab, setActiveTab, openPitchDrawer, demoMode }: HeaderProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMoreOpen(false); setMobileOpen(false); }
    };
    const onPointer = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, []);

  const navigate = (id: ActiveTab) => {
    setActiveTab(id);
    setMoreOpen(false);
    setMobileOpen(false);
  };

  const activeSecondary = allSecondary.find((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05080f]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
        <div className="flex min-h-[68px] items-center gap-3">
          <button onClick={() => navigate('OVERVIEW')} className="group flex min-w-0 items-center gap-3 rounded-xl px-1.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Go to NIRDHOOM Command Center">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/[0.08] shadow-[0_0_30px_rgba(16,185,129,.08)]">
              <span className="text-base font-black text-emerald-300">नि</span>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#05080f] bg-emerald-400" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="flex items-center gap-2">
                <span className="font-['Outfit'] text-[15px] font-black tracking-[0.12em] text-white">NIRDHOOM</span>
                <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${demoMode ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'}`}>{demoMode ? 'Demo' : 'Live'}</span>
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-500">Field-first residue operations</span>
            </span>
          </button>

          <div className="hidden h-7 w-px bg-white/[0.08] lg:block" />

          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)} title={item.description}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${active ? 'bg-white/[0.09] text-white shadow-sm ring-1 ring-white/[0.08]' : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'}`}>
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-emerald-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="relative" ref={moreRef}>
              <button onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} aria-haspopup="menu"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${activeSecondary ? 'bg-emerald-400/[0.08] text-emerald-200 ring-1 ring-emerald-400/15' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}>
                <Menu className="h-3.5 w-3.5" /> More <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-[calc(100%+10px)] w-[340px] rounded-2xl border border-white/[0.10] bg-[#0a0f19]/98 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl" role="menu">
                  <div className="px-2.5 pb-2 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Operations & tools</div>
                    <div className="mt-1 text-[11px] text-slate-600">Keep the daily workflow focused; advanced surfaces live here.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {allSecondary.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button key={item.id} role="menuitem" onClick={() => navigate(item.id)}
                          className={`flex min-w-0 items-start gap-2 rounded-xl p-2.5 text-left transition ${activeTab === item.id ? 'bg-emerald-400/[0.10] text-white' : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'}`}>
                          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/80" />
                          <span className="min-w-0"><span className="block truncate text-[11px] font-bold">{item.label}</span><span className="mt-0.5 block text-[9px] leading-3 text-slate-500">{item.description}</span></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <div className="hidden xl:flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[10px]">
              <span className={`h-1.5 w-1.5 rounded-full ${demoMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="font-semibold text-slate-400">{demoMode ? 'Synthetic data' : 'Live records'}</span>
            </div>
            <button onClick={openPitchDrawer} className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-2 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              <Search className="h-3.5 w-3.5" /> Brief
            </button>
            <ThemeToggle />
            <button onClick={() => setMobileOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-t border-white/[0.05] py-1.5 lg:hidden scrollbar-none" aria-label="Primary navigation">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => navigate(item.id)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${activeTab === item.id ? 'bg-emerald-400/10 text-emerald-200' : 'text-slate-500'}`}><Icon className="h-3 w-3" />{item.label}</button>;
          })}
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.06] py-3 lg:hidden">
            <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">All surfaces</div>
            <div className="grid grid-cols-2 gap-1">
              {allSecondary.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => navigate(item.id)} className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-[11px] font-bold ${activeTab === item.id ? 'bg-emerald-400/10 text-white' : 'text-slate-400 hover:bg-white/[0.04]'}`}><Icon className="h-3.5 w-3.5 text-emerald-300/80" />{item.label}</button>;
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
