import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Globe,
  DollarSign,
  RefreshCcw,
  ShieldCheck,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  BarChart3,
  Building2,
} from 'lucide-react';

interface CarbonListing {
  id: string;
  projectName: string;
  registry: string;
  country: string;
  standard: string;
  vintage: string;
  priceUsd: number;
  available_credits: number;
  co2e_per_credit: number;
  change24h: number;
  status: 'LIVE' | 'SOLD_OUT' | 'PRE_VERIFIED';
  type: 'METHANE_AVOIDANCE' | 'BIOMASS_WASTE' | 'DIRECT_AIR' | 'FORESTRY';
}

const MARKET_LISTINGS: CarbonListing[] = [
  {
    id: 'NRD-2026-SGR-001',
    projectName: 'Nirdhoom Sangrur Non-Burn Cluster',
    registry: 'External registry (illustrative)',
    country: '🇮🇳 India · Punjab',
    standard: 'VM0042 (Improved Agricultural Land Management)',
    vintage: '2026',
    priceUsd: 18.4,
    available_credits: 72,
    co2e_per_credit: 1,
    change24h: +5.2,
    status: 'LIVE',
    type: 'BIOMASS_WASTE',
  },
  {
    id: 'GOLD-IN-BIO-2026',
    projectName: 'Punjab Paddy Straw Methane Avoidance Program',
    registry: 'Gold Standard',
    country: '🇮🇳 India · Haryana',
    standard: 'GS4GG (Biomass Thermal Energy)',
    vintage: '2026',
    priceUsd: 22.1,
    available_credits: 250,
    co2e_per_credit: 1,
    change24h: +1.8,
    status: 'LIVE',
    type: 'METHANE_AVOIDANCE',
  },
  {
    id: 'ART-TREES-GH-001',
    projectName: 'Ghana Coastal Mangrove Restoration',
    registry: 'ART TREES',
    country: '🇬🇭 Ghana · Greater Accra',
    standard: 'ART TREES 2.0',
    vintage: '2025',
    priceUsd: 31.5,
    available_credits: 1400,
    co2e_per_credit: 1,
    change24h: -2.1,
    status: 'LIVE',
    type: 'FORESTRY',
  },
  {
    id: 'VCS-BR-DAC-002',
    projectName: 'Brazil Cerrado Biochar Carbon Removal',
    registry: 'External registry (illustrative)',
    country: '🇧🇷 Brazil · Minas Gerais',
    standard: 'VM0044 (Biochar Soil Amendment)',
    vintage: '2026',
    priceUsd: 45.0,
    available_credits: 88,
    co2e_per_credit: 1,
    change24h: +8.4,
    status: 'LIVE',
    type: 'DIRECT_AIR',
  },
  {
    id: 'NRD-2027-SUNAM-PRE',
    projectName: 'Nirdhoom Sunam Expansion Block (Pre-Verified)',
    registry: 'External registry (illustrative)',
    country: '🇮🇳 India · Punjab',
    standard: 'VM0042 (Anticipated Season 2027)',
    vintage: '2027',
    priceUsd: 14.0,
    available_credits: 310,
    co2e_per_credit: 1,
    change24h: 0,
    status: 'PRE_VERIFIED',
    type: 'BIOMASS_WASTE',
  },
  {
    id: 'ICS-KE-COOK-003',
    projectName: 'Kenya Improved Cookstoves Program',
    registry: 'Gold Standard',
    country: '🇰🇪 Kenya · Rift Valley',
    standard: 'GS-TPDDTEC Cookstoves',
    vintage: '2025',
    priceUsd: 12.5,
    available_credits: 3200,
    co2e_per_credit: 1,
    change24h: -0.5,
    status: 'SOLD_OUT',
    type: 'BIOMASS_WASTE',
  },
];

const BUYERS_QUEUE = [
  { name: 'NTPC Green Energy Ltd', qty: 20, offer: 19.2 },
  { name: 'Mahindra Climate Corp.', qty: 15, offer: 18.8 },
  { name: 'YES Bank ESG Desk', qty: 10, offer: 17.5 },
  { name: 'Airbus Carbon Offset Fund', qty: 30, offer: 20.0 },
];

export const CarbonMarketplace: React.FC = () => {
  const [inrRate, setInrRate] = useState(84.2);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [selectedListing, setSelectedListing] = useState<CarbonListing | null>(MARKET_LISTINGS[0]);
  const [purchaseQty, setPurchaseQty] = useState(5);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);

  const fx = (usd: number) => currency === 'INR' ? `₹${(usd * inrRate).toFixed(0)}` : `$${usd.toFixed(2)}`;
  
  const typeColors: Record<string, string> = {
    METHANE_AVOIDANCE: 'text-amber-400 border-amber-400/40 bg-amber-500/10',
    BIOMASS_WASTE: 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10',
    DIRECT_AIR: 'text-cyan-400 border-cyan-400/40 bg-cyan-500/10',
    FORESTRY: 'text-teal-400 border-teal-400/40 bg-teal-500/10',
  };
  
  const typeEmoji: Record<string, string> = {
    METHANE_AVOIDANCE: '♻️',
    BIOMASS_WASTE: '🌾',
    DIRECT_AIR: '💨',
    FORESTRY: '🌳',
  };

  const totalMarketValue = MARKET_LISTINGS
    .filter((l) => l.status !== 'SOLD_OUT')
    .reduce((sum, l) => sum + l.priceUsd * l.available_credits, 0);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Banner */}
      <div className="glass-panel-emerald p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                  Carbon Credit Marketplace
                </h3>
                <span className="badge badge-emerald text-xs">Verra · Gold Standard · ART</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Illustrative carbon-market interface using demo listings. Registry status, pricing, issuance and retirement are not connected to a live registry.
              </p>
            </div>
          </div>

          {/* FX Toggle */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-xl p-1">
              {(['USD', 'INR'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === c
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'USD' ? '$ USD' : '₹ INR'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>₹/$ Rate:</span>
              <input
                type="number"
                min={75}
                max={95}
                step={0.1}
                value={inrRate}
                onChange={(e) => setInrRate(Number(e.target.value))}
                className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Market Cap',
            value: currency === 'INR'
              ? `₹${(totalMarketValue * inrRate / 1000).toFixed(0)}K`
              : `$${(totalMarketValue / 1000).toFixed(0)}K`,
            icon: BarChart3,
            color: 'text-cyan-400',
            border: 'border-cyan-500/30',
            sub: `${MARKET_LISTINGS.filter(l => l.status !== 'SOLD_OUT').reduce((s, l) => s + l.available_credits, 0)} credits available`,
          },
          {
            label: 'Nirdhoom Credits',
            value: '72 tCO₂e',
            icon: ShieldCheck,
            color: 'text-emerald-400',
            border: 'border-emerald-500/30',
            sub: 'Sangrur 2026 vintage',
          },
          {
            label: 'Best Price Live',
            value: currency === 'INR' ? `₹${(45.0 * inrRate).toFixed(0)}` : '$45.00',
            icon: TrendingUp,
            color: 'text-amber-400',
            border: 'border-amber-500/30',
            sub: 'Brazil Biochar (DAC)',
          },
          {
            label: 'Avg 24h Change',
            value: '+3.2%',
            icon: Globe,
            color: 'text-emerald-400',
            border: 'border-emerald-500/30',
            sub: 'Voluntary market bullish',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`glass-panel p-3.5 border ${card.border}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`text-lg font-extrabold font-mono ${card.color}`}>{card.value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Listings Grid + Order Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Listings */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Illustrative Registry Listings
          </h4>
          {MARKET_LISTINGS.map((listing) => {
            const isSelected = selectedListing?.id === listing.id;
            return (
              <div
                key={listing.id}
                onClick={() => listing.status !== 'SOLD_OUT' && setSelectedListing(listing)}
                className={`p-4 rounded-xl border transition-all ${
                  listing.status === 'SOLD_OUT'
                    ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-950/40'
                    : isSelected
                    ? 'bg-slate-900/95 border-emerald-500 ring-1 ring-emerald-500/50 cursor-pointer shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{typeEmoji[listing.type]}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{listing.projectName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {listing.country} · {listing.registry} · Vintage {listing.vintage}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-white font-mono">
                      {fx(listing.priceUsd)}
                      <span className="text-xs text-slate-400 font-normal"> / t</span>
                    </div>
                    <div className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                      listing.change24h > 0 ? 'text-emerald-400' : listing.change24h < 0 ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {listing.change24h > 0 ? <ArrowUpRight className="w-3 h-3" /> : listing.change24h < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                      {listing.change24h !== 0 ? `${listing.change24h > 0 ? '+' : ''}${listing.change24h}% 24h` : 'Stable'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[listing.type]}`}>
                      {listing.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      listing.status === 'LIVE' ? 'badge badge-emerald' :
                      listing.status === 'PRE_VERIFIED' ? 'badge badge-amber' : 'badge badge-crimson'
                    }`}>
                      {listing.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{listing.available_credits} tCO₂e available</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Panel + Buyers Queue */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Purchase Simulator */}
          {selectedListing && (
            <div className="glass-panel p-4 flex flex-col gap-3 border-emerald-500/30">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Credit Purchase Simulator</h4>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Project:</span>
                  <strong className="text-emerald-300 text-right ml-2 truncate max-w-[60%]">{selectedListing.projectName}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Registry:</span>
                  <span className="font-mono">{selectedListing.registry}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Standard:</span>
                  <span className="font-mono text-right ml-2 truncate max-w-[60%]">{selectedListing.standard}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Price / tCO₂e:</span>
                  <span className="font-mono text-emerald-400 font-bold">{fx(selectedListing.priceUsd)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Purchase Quantity: <strong className="text-white font-mono">{purchaseQty} tCO₂e</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.min(selectedListing.available_credits, 50)}
                  value={purchaseQty}
                  onChange={(e) => { setPurchaseQty(Number(e.target.value)); setPurchaseConfirmed(false); }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>1 credit</span>
                  <span>{selectedListing.available_credits} max</span>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Simulated Cost:</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-base">
                    {fx(selectedListing.priceUsd * purchaseQty)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Illustrative CO₂e:</span>
                  <span className="font-bold text-white">{purchaseQty} tCO₂e retired</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-400">ESG Credits:</span>
                  <span className="font-bold text-cyan-300">~{(purchaseQty * 7.4).toFixed(0)} ESG points</span>
                </div>
              </div>

              {!purchaseConfirmed ? (
                <button
                  onClick={() => setPurchaseConfirmed(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Simulate Credit Retirement →
                </button>
              ) : (
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-xs text-center">
                  <div className="text-lg font-black text-emerald-400 font-['Outfit']">✓ Simulation Complete</div>
                  <p className="text-emerald-300 mt-1">
                    {purchaseQty} Demo retirement only. No registry transaction or certificate was issued.
                  </p>
                  <button
                    onClick={() => setPurchaseConfirmed(false)}
                    className="mt-2 flex items-center gap-1 mx-auto text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <RefreshCcw className="w-3 h-3" /> Reset simulation
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Corporate Buyers Queue */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-sm text-white">Corporate Buyers Queue</h4>
              <span className="badge badge-amber text-[9px] ml-auto">DEMO BIDS</span>
            </div>
            <div className="flex flex-col gap-2">
              {BUYERS_QUEUE.map((b, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{b.name}</div>
                    <div className="text-slate-400 text-[10px]">Bid: {b.qty} tCO₂e</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">
                      {currency === 'INR' ? `₹${(b.offer * inrRate).toFixed(0)}` : `$${b.offer}`} / t
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Total: {currency === 'INR' ? `₹${(b.offer * inrRate * b.qty).toLocaleString()}` : `$${(b.offer * b.qty).toFixed(0)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
