import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  TreePine,
  TrendingDown,
  Users,
  Truck,
  Factory,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Quote,
  ChevronRight,
  Wheat,
  Wind,
  Heart,
  Zap,
  BarChart3,
  Globe,
} from 'lucide-react';

/* ── Animated Number Counter ── */
const AnimCounter: React.FC<{
  target: number; suffix?: string; prefix?: string; decimals?: number;
  className?: string; duration?: number;
}> = ({ target, suffix = '', prefix = '', decimals = 0, className = '', duration = 2400 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    ref.current = null;
    const tick = (t: number) => {
      if (!ref.current) ref.current = t;
      const p = Math.min((t - ref.current) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(eased * target);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return (
    <span className={className}>
      {prefix}{decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString('en-IN')}{suffix}
    </span>
  );
};

/* ── Public context statistics; never presented as NIRDHOOM outcomes ── */
const PUNJAB_FIRE_STATS = [
  { year: '2020', fires: 76929, color: '#ef4444' },
  { year: '2021', fires: 71304, color: '#f97316' },
  { year: '2022', fires: 49922, color: '#f59e0b' },
  { year: '2023', fires: 36663, color: '#eab308' },
  { year: '2024', fires: 10909, color: '#84cc16' },
  { year: '2025', fires: 5114, color: '#10b981' },
];

const DISTRICT_HOTSPOTS = [
  { name: 'Sangrur', fires2024: 1842, fires2025: 612, acres: '3.2L', machines: 4200 },
  { name: 'Patiala', fires2024: 1456, fires2025: 489, acres: '2.8L', machines: 3800 },
  { name: 'Mansa', fires2024: 1234, fires2025: 398, acres: '1.9L', machines: 2100 },
  { name: 'Barnala', fires2024: 987, fires2025: 310, acres: '1.4L', machines: 1650 },
  { name: 'Bathinda', fires2024: 1102, fires2025: 356, acres: '2.1L', machines: 2890 },
  { name: 'Ludhiana', fires2024: 1065, fires2025: 342, acres: '2.5L', machines: 3200 },
];

const FARMER_TESTIMONIALS = [
  {
    name: 'Gurpreet Singh Brar',
    village: 'Ubhawal, Sangrur',
    quote: 'ਮੈਂ 18 ਦਿਨ ਪਹਿਲਾਂ ਬੁਕ ਕੀਤਾ, ਬੇਲਰ ਆਇਆ ਡੈੱਡਲਾਈਨ ਤੋਂ 2 ਦਿਨ ਪਹਿਲਾਂ। ਕਣਕ ਦੀ ਬਿਜਾਈ ਸਮੇਂ ਸਿਰ ਹੋ ਗਈ।',
    quoteEn: 'I booked 18 days early, baler came 2 days before deadline. Wheat sowing happened on time.',
    acres: 8.5,
    crop: 'PR-126',
    avatar: '/images/farmer_gurpreet.jpg',
    savings: '₹4,500 penalty guarantee gave me peace of mind',
  },
  {
    name: 'Manpreet Kaur Sandhu',
    village: 'Bhalwan, Dhuri',
    quote: 'ਪਹਿਲਾਂ ਫ਼ੋਨ ਤੇ ਫ਼ੋਨ ਕਰਨੇ ਪੈਂਦੇ ਸੀ। ਹੁਣ Telegram ਤੇ ਬੁੱਕ ਕਰ ਲੈਂਦੇ ਹਾਂ, UPI ਤੇ ਪੈਸੇ 90 ਸਕਿੰਟ ਵਿਚ ਆ ਜਾਂਦੇ ਹਨ।',
    quoteEn: 'Earlier I had to make endless calls. Now I book on Telegram, money comes in 90 seconds via UPI.',
    acres: 6.2,
    crop: 'Basmati-1509',
    avatar: '/images/farmer_manpreet.jpg',
    savings: '₹3,625 settled via UPI within 46 seconds',
  },
  {
    name: 'Harinder Singh Dhillon',
    village: 'Kheri Chandwan, Sunam',
    quote: 'ਮੇਰੇ ਗੁਆਂਢੀ ਅੱਗ ਲਾਉਂਦੇ ਰਹੇ, ਪਰ ਮੈਂ ₹6,750 ਕਮਾ ਲਏ ਅਤੇ ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ ਦਾ ਸਰਟੀਫ਼ਿਕੇਟ ਵੀ ਮਿਲਿਆ।',
    quoteEn: 'My neighbors kept burning, but I earned ₹6,750 and also got a carbon credit certificate.',
    acres: 12.0,
    crop: 'Pusa-44',
    avatar: '/images/punjab_farmer_hero.jpg',
    savings: 'Synthetic example • carbon methodology not configured',
  },
];

const maxFires = Math.max(...PUNJAB_FIRE_STATS.map(s => s.fires));

interface ImpactStatsProps {
  onNavigateTab?: (tab: string) => void;
}

export const ImpactStats: React.FC<ImpactStatsProps> = ({ onNavigateTab }) => {
  const [activeDistrict, setActiveDistrict] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      {/* ═══ SECTION: THE PROBLEM — Why Parali Burns ═══ */}
      <section className="rounded-3xl overflow-hidden border border-red-500/20 bg-gradient-to-b from-red-950/15 via-slate-950/90 to-slate-950">
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white font-['Outfit']">
                  The Crisis: Punjab's 18.81 Million Tonnes of Paddy Straw
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-mono font-bold border border-red-500/30 animate-live-pulse">
                  REAL DATA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Source: public research references • provider observations only when configured
              </p>
            </div>
          </div>

          {/* Before-After Image Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* The Problem */}
            <div className="rounded-2xl overflow-hidden border border-red-500/25 relative group bg-slate-950">
              <img
                src="/images/parali_burning.jpg"
                alt="Stubble burning fields in Punjab creating severe air pollution"
                className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/25 text-red-400 border border-red-500/40 mb-2 inline-block">
                  ❌ THE PROBLEM
                </span>
                <h4 className="text-sm font-bold text-white">
                  76,929 fires in 2020 — farmers burn because the 15-day wheat sowing window is non-negotiable
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Peak-day contribution to Delhi PM2.5: ~46%. But the worst health burden falls on Punjab & Haryana residents standing next to the field.
                </p>
              </div>
            </div>

            {/* The Solution */}
            <div className="rounded-2xl overflow-hidden border border-emerald-500/25 relative group bg-slate-950">
              <img
                src="/images/baling_fleet.jpg"
                alt="Subsidised CRM baler fleet clearing paddy straw from Punjab fields"
                className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 mb-2 inline-block">
                  ✅ THE NIRDHOOM REFRAME
                </span>
                <h4 className="text-sm font-bold text-white">
                  1.25 lakh CRM machines already deployed — we dispatch idle ones with zero capex
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  50-80% subsidised baler fleet sitting in CHCs &amp; FPOs. Capacity-aware dispatch + layered evidence review + simulated settlement workflow.
                </p>
              </div>
            </div>
          </div>

          {/* Key Problem Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="impact-stat">
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold uppercase mb-2">
                <Flame className="w-3 h-3" />
                Straw Generated
              </div>
              <div className="text-2xl font-black font-mono text-red-400">
                <AnimCounter target={18.81} decimals={2} suffix="M" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Tonnes per season (Punjab only)</div>
            </div>

            <div className="impact-stat">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase mb-2">
                <Wind className="w-3 h-3" />
                Harvest Window
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                <AnimCounter target={15} suffix=" Days" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Between paddy harvest & wheat sowing</div>
            </div>

            <div className="impact-stat">
              <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-bold uppercase mb-2">
                <Truck className="w-3 h-3" />
                CRM Machines
              </div>
              <div className="text-2xl font-black font-mono text-teal-400">
                <AnimCounter target={125000} prefix="" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Operational subsidised machines in Punjab</div>
            </div>

            <div className="impact-stat">
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold uppercase mb-2">
                <Factory className="w-3 h-3" />
                CRM Subsidy
              </div>
              <div className="text-2xl font-black font-mono text-cyan-400">
                ₹<AnimCounter target={576} suffix=" Cr" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Allocated for 2026-27 season by CAQM</div>
            </div>
          </div>

          {/* Punjab Fire Incident Trend Chart */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white font-['Outfit']">
                  Punjab Farm Fire Incidents: 93% Decline (2020 → 2025)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Source: CAQM / NASA FIRMS</span>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="flex flex-col gap-2.5">
              {PUNJAB_FIRE_STATS.map((stat) => (
                <div key={stat.year} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-10 text-right shrink-0">
                    {stat.year}
                  </span>
                  <div className="flex-1 h-7 rounded-lg bg-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-3"
                      style={{
                        width: `${Math.max((stat.fires / maxFires) * 100, 8)}%`,
                        backgroundColor: stat.color,
                        opacity: 0.85,
                      }}
                    >
                      <span className="text-[11px] font-bold text-white font-mono whitespace-nowrap">
                        {stat.fires.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  {stat.year === '2025' && (
                    <span className="text-[10px] font-bold text-emerald-400 font-mono shrink-0 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      -93% vs 2020
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              <AlertTriangle className="w-3 h-3 text-amber-400 inline mr-1" />
              <strong className="text-amber-300">Important caveat:</strong> While fire "counts" have dropped 93%, experts note that burnt area has declined more gradually. Farmers shift burns to late afternoon/evening, evading standard VIIRS overpass times (10:30 AM–1:30 PM). Nirdhoom combines active thermal points with Sentinel-2 NDVI burn-scar analysis for audit-grade proof.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION: DISTRICT-LEVEL HOTSPOT DATA ═══ */}
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Punjab Malwa Belt: District-Level Hotspot Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sangrur cluster is candidate research area; no live pilot is claimed — highest fire density, maximum idle CHC infrastructure
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="comparison-table">
            <thead>
              <tr className="bg-slate-900/50">
                <th>District</th>
                <th>Fires 2024</th>
                <th>Fires 2025</th>
                <th>Δ Change</th>
                <th>Paddy Acres</th>
                <th>CRM Machines</th>
                <th>Nirdhoom Status</th>
              </tr>
            </thead>
            <tbody>
              {DISTRICT_HOTSPOTS.map((d, idx) => {
                const change = Math.round(((d.fires2025 - d.fires2024) / d.fires2024) * 100);
                return (
                  <tr
                    key={d.name}
                    className={`cursor-pointer transition-all ${
                      activeDistrict === idx
                        ? 'bg-emerald-950/30 border-l-2 border-emerald-500'
                        : 'hover:bg-slate-900/50'
                    }`}
                    onClick={() => setActiveDistrict(idx)}
                  >
                    <td className="font-bold text-white flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {d.name}
                      {idx === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                          LAUNCH
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-red-400">{d.fires2024.toLocaleString()}</td>
                    <td className="font-mono text-amber-400">{d.fires2025.toLocaleString()}</td>
                    <td className="font-mono text-emerald-400 font-bold">{change}%</td>
                    <td className="font-mono text-slate-300">{d.acres}</td>
                    <td className="font-mono text-cyan-300">{d.machines.toLocaleString()}</td>
                    <td>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        idx === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {idx === 0 ? '● PROTOTYPE / RESEARCH' : 'RESEARCH CONTEXT'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Enforcement escalation (2026 rules):</strong> Environmental compensation of ₹5,000 (&lt;2 ac), ₹10,000 (2-5 ac), ₹30,000 (&gt;5 ac) + &quot;Red Entry&quot; in land records barring agricultural loans for 15-30 months.
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('SATELLITE_AUDIT')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              View Satellite Audit
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* ═══ SECTION: FARMER TESTIMONIALS ═══ */}
      <section className="rounded-3xl border border-amber-500/15 bg-gradient-to-b from-amber-950/10 via-slate-950/95 to-slate-950 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-['Outfit']">
                Voices From the Field: Real Farmer Experiences
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold border border-amber-500/30">
                SANGRUR CLUSTER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthetic UX examples for the prototype — no live pilot testimonial is claimed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FARMER_TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="testimonial-card flex flex-col">
              {/* Farmer Header */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-amber-400 font-mono">{t.village}</p>
                </div>
              </div>

              {/* Punjabi Quote */}
              <p className="text-sm text-amber-200/90 font-medium leading-relaxed mb-2 pl-3 border-l-2 border-amber-500/30" style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}>
                {t.quote}
              </p>

              {/* English Translation */}
              <p className="text-xs text-slate-300 italic leading-relaxed mb-4 pl-3">
                "{t.quoteEn}"
              </p>

              {/* Stats Footer */}
              <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wheat className="w-3 h-3 text-amber-400" />
                    {t.acres} ac · {t.crop}
                  </span>
                </div>
                <span className="text-slate-400 font-semibold font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  No field-level claim
                </span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-300 font-mono flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {t.savings}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION: CIRCULAR ECONOMY PATHWAYS ═══ */}
      <section className="rounded-3xl border border-teal-500/20 bg-slate-950/80 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <TreePine className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Waste to Wealth: Circular Economy Pathways
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paddy straw is not waste — it's feedstock for a ₹15,000 Cr+ bioeconomy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: 'CBG / Biogas',
              price: 'Indicative',
              margin: 'LOW',
              icon: Factory,
              color: 'text-slate-400',
              borderColor: 'border-slate-700',
              desc: 'Asia\'s largest CBG plant (Verbio) at Lehragaga absorbs 1L+ tonnes. Baseline buyer with thin margins & 60-day credit.',
              buyers: 'Verbio, A2P Energy, PRESPL',
              image: '/images/offtake_facility.jpg',
            },
            {
              title: 'Mushroom Substrate',
              price: 'Indicative',
              margin: 'ULTRA HIGH',
              icon: TreePine,
              color: 'text-emerald-400',
              borderColor: 'border-emerald-500/30',
              desc: 'Illustrative premium-offtake pathway; live buyer price, quality and settlement terms are not configured.',
              buyers: 'Punjab Agro-Fungi Ltd',
              image: '/images/offtake_facility.jpg',
            },
            {
              title: 'Biochar',
              price: 'Indicative',
              margin: 'HIGH',
              icon: Globe,
              color: 'text-teal-400',
              borderColor: 'border-teal-500/30',
              desc: 'Illustrative biochar pathway; carbon eligibility depends on a configured methodology and verification.',
              buyers: 'Takachar, AirTerra',
              image: '/images/baling_fleet.jpg',
            },
            {
              title: 'Cattle Fodder',
              price: 'Indicative',
              margin: 'MEDIUM',
              icon: Heart,
              color: 'text-amber-400',
              borderColor: 'border-amber-500/30',
              desc: 'Illustrative fodder pathway; actual quality, safety and buyer requirements must be verified by the offtaker.',
              buyers: 'Malwa Dairy Co-op',
              image: '/images/punjab_farm_hero.jpg',
            },
          ].map((pathway, idx) => {
            const Icon = pathway.icon;
            return (
              <div
                key={idx}
                className={`rounded-xl border ${pathway.borderColor} bg-slate-900/60 overflow-hidden group hover:border-emerald-500/40 transition-all cursor-default`}
              >
                <img
                  src={pathway.image}
                  alt={pathway.title}
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${pathway.color}`} />
                      <h4 className="text-sm font-bold text-white">{pathway.title}</h4>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                      pathway.margin === 'ULTRA HIGH' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      pathway.margin === 'HIGH' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                      pathway.margin === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {pathway.margin}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono text-white mb-2">{pathway.price}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{pathway.desc}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Buyers: {pathway.buyers}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
          <strong className="text-emerald-300">Nirdhoom's Quality-Based Auction:</strong> The multi-offtake model can route lots by moisture, quality and buyer requirements. Prices and margins shown above are illustrative until live buyer contracts are connected.
        </div>
      </section>
    </div>
  );
};
