import React, { useState } from 'react';
import { Buyer, BuyerType } from '../../types';
import { INITIAL_BUYERS } from '../../data/mockData';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  Droplet, 
  Factory, 
  Flame, 
  CircleDollarSign,
  Layers,
  Scale
} from 'lucide-react';

export const MultiOfftakeAuction: React.FC = () => {
  const [buyers] = useState<Buyer[]>(INITIAL_BUYERS);
  const [testMoisture, setTestMoisture] = useState<number>(14.0);
  const [testSilica, setTestSilica] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [lotTonnage, setLotTonnage] = useState<number>(12); // e.g. 5 acres @ 2.4 t/ac

  // Auction router logic: finds the highest-paying eligible buyer based on moisture and silica constraints
  const eligibleBuyers = buyers.filter((buyer) => {
    if (testMoisture > buyer.moisture_ceiling) return false;
    if (testSilica === 'HIGH' && buyer.type === 'MUSHROOM') return false;
    return true;
  });

  const topBuyer = eligibleBuyers.sort((a, b) => b.price_per_tonne - a.price_per_tonne)[0] || buyers[buyers.length - 1];
  const cbgBaseline = buyers.find((b) => b.type === 'CBG')!;
  const premiumOverBiogas = topBuyer.price_per_tonne - cbgBaseline.price_per_tonne;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Top Framing Card */}
      <div className="glass-panel-emerald p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                  Wedge 5: Stop Assuming Biogas is the Best Buyer
                </h3>
                <span className="badge badge-emerald text-xs">
                  Multi-Offtake Value Auction
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Paddy straw is a poor biogas feedstock: high silica (9-14%) and high lignin erode margins. Instead of selling everything to CBG at ₹1,850/t, Nirdhoom operates a multi-offtake quality auction routing each lot by moisture and silica content.
              </p>
            </div>
          </div>
        </div>

        {/* Real Industry Circular Economy Facility Visual */}
        <div className="mt-4 rounded-xl overflow-hidden border border-emerald-500/30 relative max-h-52 bg-slate-950">
          <img 
            src="/images/offtake_facility.jpg" 
            alt="Punjab CBG Plant & Gourmet Mushroom Cultivation from Paddy Straw"
            className="w-full h-48 object-cover object-center"
           loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PUNJAB AGRO-PROCESSING CIRCULAR ECONOMY
              </span>
              <p className="text-xs font-bold text-white mt-1">
                Lehragaga CBG (Verbio) + Patiala Gourmet Mushroom Substrate Cluster
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-emerald-400 font-bold block">+₹1,350/T Premium</span>
              <span className="text-[10px] text-slate-400">Over Raw Biogas Floor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quality-Based Auction Simulator */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-base text-white">
              Interactive Lot Offtake Router
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Demo quality-matching simulator
          </span>
        </div>

        {/* Quality Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Straw Moisture Level: <strong className="text-cyan-300 font-mono">{testMoisture}%</strong>
            </label>
            <input
              type="range"
              min="11"
              max="24"
              step="0.5"
              value={testMoisture}
              onChange={(e) => setTestMoisture(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Dry (&lt;15%)</span>
              <span>Standard (18%)</span>
              <span>Damp (&gt;20%)</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Silica Fraction: <strong className="text-amber-300 font-mono">{testSilica} SILICA</strong>
            </label>
            <div className="flex gap-1.5 mt-1">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setTestSilica(tier)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    testSilica === tier
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Harvest Lot Size: <strong className="text-emerald-400 font-mono">{lotTonnage} Tonnes</strong>
            </label>
            <input
              type="range"
              min="4"
              max="50"
              step="2"
              value={lotTonnage}
              onChange={(e) => setLotTonnage(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 mt-0.5 text-right">
              Approx. {Math.round(lotTonnage / 2.3)} Acres equivalent
            </div>
          </div>
        </div>

        {/* Optimal Match Outcome Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="badge badge-emerald text-[10px] mb-1">
              Algorithm Recommendation
            </span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>Route To: {topBuyer.name}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {topBuyer.description}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Offtake Realisation</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                ₹{topBuyer.price_per_tonne.toLocaleString()} / t
              </div>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Lot Value</span>
              <div className="text-xl font-extrabold text-white font-mono">
                ₹{(topBuyer.price_per_tonne * lotTonnage).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Offtake Buyer Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {buyers.map((buyer) => {
          const isOptimal = buyer.id === topBuyer.id;
          const isEligible = eligibleBuyers.some((b) => b.id === buyer.id);
          const diffVsBiogas = buyer.price_per_tonne - 1850;

          return (
            <div
              key={buyer.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                isOptimal
                  ? 'bg-slate-900/95 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                  : isEligible
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xl">
                    {buyer.type === 'MUSHROOM' && '🍄'}
                    {buyer.type === 'PACKAGING' && '📦'}
                    {buyer.type === 'BIOCHAR' && '🌱'}
                    {buyer.type === 'FODDER' && '🐄'}
                    {buyer.type === 'CBG' && '⚡'}
                  </span>
                  <span
                    className={`badge text-[10px] ${
                      buyer.margin_tier === 'ULTRA_HIGH'
                        ? 'badge-emerald'
                        : buyer.margin_tier === 'HIGH'
                        ? 'badge-cyan'
                        : buyer.margin_tier === 'MEDIUM'
                        ? 'badge-amber'
                        : 'badge-crimson'
                    }`}
                  >
                    {buyer.margin_tier.replace('_', ' ')}
                  </span>
                </div>

                <h5 className="font-bold text-sm text-white">{buyer.name}</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">{buyer.location_name}</p>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {buyer.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Rate / Tonne</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    ₹{buyer.price_per_tonne.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Vs CBG Baseline</span>
                  <span
                    className={`font-mono font-bold ${
                      diffVsBiogas > 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {diffVsBiogas > 0 ? `+₹${diffVsBiogas.toLocaleString()}` : 'Baseline'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
