import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Globe, 
  Box, 
  Map, 
  MessageSquare, 
  Smartphone, 
  Satellite, 
  TrendingUp, 
  Leaf, 
  UserCheck, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Truck, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Award,
  Play
} from 'lucide-react';
import { Spotlight } from '../Animated/Spotlight';
import { Marquee } from '../Animated/Marquee';
import { AnimatedBeam } from '../Animated/AnimatedBeam';
import { BentoGrid } from '../Animated/BentoGrid';
import { LiveKPIDashboard } from '../LiveKPIDashboard';
import { ImpactStats } from './ImpactStats';
import { ActiveTab } from '../Header';

interface AgenticLandingProps {
  onNavigateTab: (tab: ActiveTab) => void;
  openPitchDrawer: () => void;
  acresScheduled?: number;
  co2Avoided?: number;
  firmsZeroBurnCount?: number;
  activeMachines?: number;
  fireEventsOutsideCount?: number;
}

const ROTATING_WORDS = [
  'Book a clearance',
  'Track the machine',
  'Capture field proof',
  'Verify the residue pathway',
];

const PUNJAB_DISTRICT_TICKERS = [
  { district: 'Sangrur (Bhawanigarh)', status: 'ACTIVE DISPATCH', balers: '4 CHC Balers', acres: '88.4 ac', firms: 'Thermal observations reviewed', time: 'Live' },
  { district: 'Patiala (Nabaha)', status: 'VRP RE-ROUTING', balers: '6 CHC Balers', acres: '142.0 ac', firms: 'Thermal observations reviewed', time: '1m ago' },
  { district: 'Barnala (Mehal Kalan)', status: 'HARVEST SPIKE', balers: '3 CHC Balers', acres: '64.8 ac', firms: 'Thermal observations reviewed', time: '2m ago' },
  { district: 'Mansa (Budhlada)', status: 'NDVI 96% MATURE', balers: '5 CHC Balers', acres: '110.5 ac', firms: 'Thermal observations reviewed', time: '3m ago' },
  { district: 'Ludhiana (Jagraon)', status: 'AUCTION CLOSED', balers: '4 CHC Balers', acres: '92.0 ac', firms: 'Thermal observations reviewed', time: '5m ago' },
  { district: 'Bathinda (Rampura)', status: 'SLOT CONTRACTED', balers: '3 CHC Balers', acres: '78.2 ac', firms: 'Thermal observations reviewed', time: '7m ago' },
];

export const AgenticLanding: React.FC<AgenticLandingProps> = ({
  onNavigateTab,
  openPitchDrawer,
  acresScheduled = 88.4,
  co2Avoided = 72.6,
  firmsZeroBurnCount = 5,
  activeMachines = 4,
  fireEventsOutsideCount = 8,
}) => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {/* HERO SECTION WITH SPOTLIGHT & AGENTIC STYLING */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#020409] via-[#050c18] to-[#0a1424] border border-emerald-500/25 p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Aceternity Conic Spotlight */}
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#10b981" />
        <Spotlight className="top-10 -right-20" fill="#22d3ee" />

        {/* Cyber grid & glowing radial orbs */}
        <div className="grid-bg" />
        <div className="orb w-96 h-96 bg-emerald-500/10 top-0 left-1/4 -translate-y-1/2" />
        <div className="orb w-96 h-96 bg-cyan-500/10 bottom-0 right-1/4 translate-y-1/2" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Top Pill / Badge with animated radar dot */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-6 shadow-lg shadow-emerald-500/10 backdrop-blur-md">
            <span className="badge--dot" />
            <span className="font-bold tracking-wider uppercase">
              FIELD-FIRST CROP-RESIDUE NETWORK
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-semibold">NIRDHOOM</span>
          </div>

          {/* Main Kinetic Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Outfit'] leading-[1.12] mb-6">
            From Field to Verified Parali —{' '}
            <span className="hero-word block sm:inline mt-2 sm:mt-0">
              <span className="text-gradient">
                {ROTATING_WORDS[wordIndex]}
              </span>
              <svg
                className="hero-underline"
                viewBox="0 0 220 14"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M4 10c32-6 60-2 92-4s66-3 120-6"
                  stroke="url(#hero-grad-underline)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="hero-grad-underline" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981" />
                    <stop offset="0.5" stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Hard-hitting subtitle based on the 1-liner brief */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8 font-['Plus_Jakarta_Sans'] font-normal">
            NIRDHOOM connects the practical chain behind non-burning crop-residue management: <strong className="text-emerald-300 font-semibold">field → booking → machine → proof → parali</strong>. The prototype combines farmer-first workflows, operational dispatch, GPS/evidence capture and layered verification. Demo records are labelled; live capacity, commercial contracts and payment movement are not claimed.
          </p>

          {/* Interactive CTAs Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={() => onNavigateTab('DEMO_RUNNER')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center gap-2.5 cursor-pointer shadow-xl shadow-emerald-500/30 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start the 2-Minute Competition Demo</span>
            </button>

            <button
              onClick={() => onNavigateTab('OPS_CONSOLE')}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 hover:scale-[1.02] transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Operations & Dispatch</span>
            </button>

            <button
              onClick={() => onNavigateTab('SATELLITE_AUDIT')}
              className="px-5 py-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-semibold text-sm flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-all"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Field Proof View</span>
            </button>

            <button
              onClick={() => onNavigateTab('COMPETITION_CENTER')}
              className="px-5 py-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Competition Pitch Center</span>
            </button>
          </div>

          {/* Quick Metrics Bar in Hero with subtle borders */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover:border-emerald-500/40 transition-colors">
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">5 steps</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">Field → proof journey</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover:border-cyan-500/40 transition-colors">
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300">GPS + proof</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">Operator evidence layer</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover:border-amber-500/40 transition-colors">
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">₹0</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">Payment movement in release</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center hover:border-teal-500/40 transition-colors">
              <div className="text-xl sm:text-2xl font-black font-mono text-teal-300">Asset-light</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">Coordinate existing machines</div>
            </div>
          </div>
        </div>

        {/* Real Ground Reality Visual Showcase: Farmer Hero & Verification */}
        <div className="relative z-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-6xl mx-auto">
          {/* Main Visual: Punjab Farmer & Real Field Baler */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-emerald-500/30 relative group bg-slate-950">
            <img 
              src="/images/punjab_farmer_hero.jpg" 
              alt="Punjabi Farmer in Sangrur Field using Nirdhoom Dispatch"
              className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                  DEMO FIELD SCENARIO
                </span>
                <span className="text-xs text-slate-400 font-mono">18 Days Pre-Harvest</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                "Reliability beats rate. Every single time."
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Illustrative booking scenario. The displayed farmer, timing, penalty and dispatch details are synthetic demo values, not live service commitments.
              </p>
            </div>
          </div>

          {/* Secondary Visual: NASA FIRMS 375m Satellite Confirmation */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border border-cyan-500/30 relative group bg-slate-950 flex-1">
              <img 
                src="/images/satellite_firms.jpg" 
                alt="NASA FIRMS Satellite Thermal Observation of Punjab Indo-Gangetic Plains"
                className="w-full h-40 sm:h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 mb-1">
                  <span>FIRMS / VIIRS EVIDENCE LAYER</span>
                  <span className="text-emerald-400 font-bold">NOT A NO-BURN CERTIFICATE</span>
                </div>
                <div className="text-xs font-bold text-white">
                  Supporting thermal observations; coverage is not proof of absence
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-amber-500/30 relative group bg-slate-950 flex-1">
              <img 
                src="/images/baling_fleet.jpg" 
                alt="Subsidised CRM Baler Fleet Active in Sangrur Fields"
                className="w-full h-32 sm:h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 mb-0.5">
                  <span>STRANDED PUBLIC CRM INFRASTRUCTURE</span>
                  <span className="text-teal-300 font-bold">Existing CRM network</span>
                </div>
                <div className="text-xs font-bold text-white">
                  Dispatching Idle CHC &amp; FPO Fleet with Zero Startup Capex
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Interactive 3D Geospatial Digital Twin Banner */}
        <div 
          onClick={() => onNavigateTab('DIGITAL_TWIN_3D')}
          className="relative z-10 mt-4 rounded-2xl overflow-hidden border border-emerald-500/40 group bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-teal-950/70 p-4 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/20"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <div className="w-full h-full bg-[#03060f] rounded-[10px] flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-['Outfit']">
                  Interactive 3D Geospatial Digital Twin
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                  Three.js WebGL
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Illustrative geospatial visualization of field and remote-sensing concepts; live observations appear only when a provider-backed data source is configured.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30">
              <span>Launch 3D Twin</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* INFINITE MARQUEE TELEMETRY TICKER */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950/90 border border-slate-800 py-2.5 shadow-xl">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#03060f] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#03060f] to-transparent z-10 pointer-events-none" />

        <Marquee speed={28} pauseOnHover={true}>
          {PUNJAB_DISTRICT_TICKERS.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono shrink-0 hover:border-emerald-500/40 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold text-white">{t.district}</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold">{t.status}</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300">{t.balers}</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-300">{t.acres}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{t.firms}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* SECTION 2: LIVE TELEMETRY DASHBOARD */}
      <section>
        <LiveKPIDashboard
          acresScheduled={acresScheduled}
          co2Avoided={co2Avoided}
          firmsZeroBurnCount={firmsZeroBurnCount}
          activeMachines={activeMachines}
          fireEventsOutsideCount={fireEventsOutsideCount}
        />
      </section>

      {/* SECTION 2.5: IMPACT STATISTICS, FARMER TESTIMONIALS & CIRCULAR ECONOMY */}
      <section>
        <ImpactStats onNavigateTab={(tab) => onNavigateTab(tab as ActiveTab)} />
      </section>

      {/* SECTION 3: AUTONOMOUS AGENTIC PIPELINE (ANIMATED BEAM) */}
      <section>
        <AnimatedBeam onSelectNode={(id) => {
          if (id === 'farmer') onNavigateTab('FARMER_SURFACE');
          else if (id === 'vrp') onNavigateTab('OPS_CONSOLE');
          else if (id === 'baler') onNavigateTab('BALER_OPERATOR');
          else if (id === 'nasa') onNavigateTab('SATELLITE_AUDIT');
          else if (id === 'carbon') onNavigateTab('CARBON_MARKET');
          else onNavigateTab('AGENTIC_CONSOLE');
        }} />
      </section>


      {/* SECTION 4: THE 5 STRATEGIC WEDGES (BENTO GRID) */}
      <section>
        <BentoGrid onNavigateTab={(tab) => onNavigateTab(tab as ActiveTab)} />
      </section>

      {/* SECTION 4.5: REAL GROUND DATA, FARMER VOICES & CAQM SATELLITE AUDITS */}
      <ImpactStats />

      {/* SECTION 5: 1-CLICK OPERATIONAL SURFACES CATALOGUE */}
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Complete System Architecture
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-['Outfit'] mt-1">
              Explore All 10 Operational Surfaces
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Section 06 of Brief: "Six personas. We must not build six apps." Ops console is our real product; field surfaces are streamlined thin PWAs and Telegram IVR bots.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('DEMO_RUNNER')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow"
            >
              <span>4-Beat Runner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              tab: 'AGENTIC_CONSOLE' as ActiveTab,
              title: '🤖 Agentic Swarm Console',
              desc: 'Autonomous 5-agent coordination with 3D Holographic Neural Core, OR-Tools VRP and prompt execution.',
              tag: 'Agentic AI',
              badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
            },
            {
              tab: 'DEMO_RUNNER' as ActiveTab,
              title: '🎬 4-Beat Live Pitch Runner',
              desc: 'Step-by-step hackathon pitch sequence: Farmer Telegram → OR-Tools Map → Evidence → Satellite audit.',
              tag: 'Hackathon Flow',
              badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30',
            },
            {
              tab: 'DIGITAL_TWIN_3D' as ActiveTab,
              title: '🌐 3D Geospatial Digital Twin',
              desc: 'Three.js interactive Punjab Malwa hotspot with orbiting NOAA-20 satellite, radar scan cone, and fire plumes.',
              tag: 'Three.js 3D',
              badgeColor: 'text-teal-300 bg-teal-950/60 border-teal-500/30',
            },
            {
              tab: 'MACHINERY_3D' as ActiveTab,
              title: '🚜 3D Subsidised Baler Twin',
              desc: 'Interactive CAD-style mechanical twin with rotating pickup reel, hydraulic flywheel, and moisture sensor probe.',
              tag: 'CRM Fleet',
              badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
            },
            {
              tab: 'OPS_CONSOLE' as ActiveTab,
              title: '🗺️ Ops Console & OR-Tools VRP',
              desc: 'Live GIS mapping of Sangrur cluster with Google OR-Tools time-windowed vehicle routing and penalty bounds.',
              tag: 'Core Product',
              badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30',
            },
            {
              tab: 'FARMER_SURFACE' as ActiveTab,
              title: '💬 Farmer Telegram & IVR Bot',
              desc: 'Bilingual Punjabi Telegram bot with missed-call-to-IVR flow, instant slot contract, and voice notes.',
              tag: 'Primary Surface',
              badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-500/30',
            },
            {
              tab: 'BALER_OPERATOR' as ActiveTab,
              title: '📱 Field Operator Offline PWA',
              desc: 'Low-connectivity field app with IndexedDB evidence queue and residue-lot workflow; payment is disabled.',
              tag: 'Offline-First',
              badgeColor: 'text-blue-300 bg-blue-950/60 border-blue-500/30',
            },
            {
              tab: 'SATELLITE_AUDIT' as ActiveTab,
              title: '🛰️ NASA FIRMS 375m Audit',
              desc: 'Zero fire points inside registered customer polygons against neighboring firestorms. The Money Shot.',
              tag: 'The Defense',
              badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30',
            },
            {
              tab: 'OFFTAKE_AUCTION' as ActiveTab,
              title: '🌾 Multi-Offtake Dynamic Auction',
              desc: 'Routing straw to mushroom substrate (₹3,200/T), Craste moulded fibre, biochar, and cattle feed.',
              tag: 'Wedge 5',
              badgeColor: 'text-teal-300 bg-teal-950/60 border-teal-500/30',
            },
            {
              tab: 'CARBON_MARKET' as ActiveTab,
              title: '🌿 Carbon Credit Marketplace',
              desc: 'Institutional carbon credit issuance from satellite-verified non-burning records for CBG & registries.',
              tag: 'Outcome Credits',
              badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30',
            },
            {
              tab: 'FARMER_ONBOARDING' as ActiveTab,
              title: '📍 Polygon Drawing & KYC',
              desc: 'Interactive field polygon drawing on satellite tiles with khasra number verification and variety selection.',
              tag: 'KYC & Demand',
              badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30',
            },
            {
              tab: 'JUDGE_DEFENSE' as ActiveTab,
              title: '🛡️ Judge Defense & Unit Economics',
              desc: 'Direct cross-examination answers for Verbio comparison, in-situ alternatives, 10-month baler downtime, and margins.',
              tag: 'Q&A Prep',
              badgeColor: 'text-purple-300 bg-purple-950/60 border-purple-500/30',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateTab(item.tab)}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-emerald-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${item.badgeColor}`}>
                    {item.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-['Plus_Jakarta_Sans'] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold">
                <span>Open Surface</span>
                <span>&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
