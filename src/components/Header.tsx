import { useEffect, useRef, useState } from 'react';
import {
  Activity, BarChart3, Bot, ChevronDown, ClipboardList, HelpCircle, Leaf, Map,
  Menu, MessageSquare, Satellite, Search, ShieldCheck, Sparkles, Smartphone,
  TrendingUp, UserCheck, Wheat, X, Tractor, CircleDollarSign
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export type ActiveTab =
  | 'OVERVIEW' | 'RESIDUE_POOLS' | 'IMPACT_RESEARCH' | 'HARVEST_INTELLIGENCE'
  | 'FIELD_PROVENANCE' | 'FIELD_JOBS' | 'AGENTIC_CONSOLE' | 'DEMO_RUNNER'
  | 'DIGITAL_TWIN_3D' | 'MACHINERY_3D' | 'OPS_CONSOLE' | 'FARMER_SURFACE'
  | 'BALER_OPERATOR' | 'SATELLITE_AUDIT' | 'OFFTAKE_AUCTION' | 'CARBON_MARKET'
  | 'FARMER_ONBOARDING' | 'FARMER_KYC' | 'JUDGE_DEFENSE';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openPitchDrawer: () => void;
  demoMode: boolean;
}

type NavItem = {
  id: ActiveTab;
  label: string;
  short?: string;
  icon: typeof Activity;
  description: string;
};

const primaryNav: NavItem[] = [
  { id: 'OVERVIEW', label: 'Home', short: 'Home', icon: Activity, description: 'Farmer-first overview and today\'s activity' },
  { id: 'FIELD_JOBS', label: 'My Fields', short: 'Fields', icon: ClipboardList, description: 'Fields, bookings and clearance jobs' },
  { id: 'FARMER_ONBOARDING', label: 'Book Clearance', short: 'Book', icon: Tractor, description: 'Consent and clearance onboarding' },
  { id: 'OPS_CONSOLE', label: 'Track Clearance', short: 'Track', icon: Map, description: 'Map, machines and active routes' },
  { id: 'RESIDUE_POOLS', label: 'Residue Market', short: 'Residue', icon: Leaf, description: 'Residue supply, pools and buyer demand' },
  { id: 'SATELLITE_AUDIT', label: 'Verify', short: 'Verify', icon: ShieldCheck, description: 'Evidence and verification' },
  { id: 'IMPACT_RESEARCH', label: 'Impact & Research', short: 'Impact', icon: BarChart3, description: 'Verified impact and research workspace' },
];

const secondaryNav: NavItem[] = [
  { id: 'HARVEST_INTELLIGENCE', label: 'Harvest Intelligence', icon: Wheat, description: 'Harvest pressure and timing' },
  { id: 'FIELD_PROVENANCE', label: 'Field Trust', icon: ShieldCheck, description: 'Field provenance and audit trail' },
  { id: 'BALER_OPERATOR', label: 'Operator PWA', icon: Smartphone, description: 'Machine operator workflow' },
  { id: 'FARMER_SURFACE', label: 'Farmer Telegram', icon: MessageSquare, description: 'Telegram farmer communication surface' },
  { id: 'FARMER_KYC', label: 'Farmer Onboarding', icon: UserCheck, description: 'Phone OTP, consent and profile setup' },
  { id: 'OFFTAKE_AUCTION', label: 'Buyer Offtake', icon: TrendingUp, description: 'Buyer demand and procurement' },
  { id: 'CARBON_MARKET', label: 'Carbon', icon: CircleDollarSign, description: 'Carbon marketplace prototype' },
  { id: 'AGENTIC_CONSOLE', label: 'AI Assistant', icon: Bot, description: 'AI operations workspace' },
  { id: 'DIGITAL_TWIN_3D', label: '3D Field Twin', icon: Activity, description: 'Geospatial digital twin' },
  { id: 'MACHINERY_3D', label: '3D Baler', icon: Activity, description: 'Machine digital twin' },
  { id: 'DEMO_RUNNER', label: 'Demo Walkthrough', icon: Sparkles, description: 'End-to-end product walkthrough' },
  { id: 'JUDGE_DEFENSE', label: 'Judge Q&A', icon: HelpCircle, description: 'Pitch defence workspace' },
];

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeSecondary = secondaryNav.some((item) => item.id === activeTab);

  return (
    <header className="nirdhoom-field-header sticky top-0 z-50 border-b px-3 sm:px-5">
      <div className="mx-auto max-w-[1480px]">
        <div className="flex min-h-[72px] items-center gap-3">
          <button
            onClick={() => navigate('OVERVIEW')}
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Go to NIRDHOOM Home"
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-emerald-50 shadow-sm">
              <span className="text-lg font-black text-emerald-700">नि</span>
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="flex items-center gap-2">
                <span className="font-['Outfit'] text-[16px] font-black tracking-[0.08em] text-emerald-950">NIRDHOOM</span>
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                  {demoMode ? 'Demo' : 'Live'}
                </span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium text-emerald-800/60">Field-first crop-residue network</span>
            </span>
          </button>

          <div className="hidden h-9 w-px bg-emerald-900/10 xl:block" />

          <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Primary navigation">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)} title={item.description}
                  className={`field-nav-item ${active ? 'is-active' : ''}`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="relative ml-auto" ref={moreRef}>
              <button onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} aria-haspopup="menu"
                className={`field-more-button ${activeSecondary ? 'is-active' : ''}`}>
                <Menu className="h-4 w-4" /> More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="field-more-menu" role="menu">
                  <div className="px-3 pb-2 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-900/45">Explore NIRDHOOM</div>
                    <div className="mt-1 text-[11px] text-emerald-900/55">Operations, evidence, buyers and advanced tools.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {secondaryNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button key={item.id} role="menuitem" onClick={() => navigate(item.id)}
                          className={`field-more-item ${activeTab === item.id ? 'is-active' : ''}`}>
                          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="min-w-0"><span className="block truncate text-[11px] font-bold">{item.label}</span><span className="mt-0.5 block text-[9px] leading-3 opacity-65">{item.description}</span></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1.5 text-[10px]">
              <span className={`h-2 w-2 rounded-full ${demoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="font-semibold text-emerald-900/65">{demoMode ? 'Demo records' : 'Live records'}</span>
            </div>
            <button onClick={openPitchDrawer} className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-700/15 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <Search className="h-3.5 w-3.5" /> Brief
            </button>
            <ThemeToggle />
            <button onClick={() => setMobileOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-900/10 bg-white text-emerald-900 lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>



        {mobileOpen && (
          <div className="field-mobile-panel lg:hidden">
            <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-900/45">All NIRDHOOM surfaces</div>
            <div className="grid grid-cols-2 gap-1.5">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => navigate(item.id)} className={`field-mobile-item ${activeTab === item.id ? 'is-active' : ''}`}><Icon className="h-4 w-4" />{item.label}</button>;
              })}
            </div>
          </div>
        )}
      </div>
    </header>

    <nav className="field-mobile-bottom-nav lg:hidden" aria-label="Farmer quick navigation">
      {[
        ['OVERVIEW', 'Home', Activity],
        ['FIELD_JOBS', 'Fields', ClipboardList],
        ['FARMER_ONBOARDING', 'Book', Tractor],
        ['OPS_CONSOLE', 'Track', Map],
        ['RESIDUE_POOLS', 'Market', Leaf],
      ].map(([id, label, Icon]) => {
        const NavIcon = Icon as typeof Activity;
        return (
          <button
            key={String(id)}
            type="button"
            onClick={() => navigate(id as ActiveTab)}
            className={activeTab === id ? 'is-active' : ''}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <NavIcon className="h-4 w-4" />
            <span>{String(label)}</span>
          </button>
        );
      })}
    </nav>
  );
}
