import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  Truck, 
  Layers, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface BlockForecast {
  name: string;
  pr126Acres: number;
  pusa44Acres: number;
  basmatiAcres: number;
  totalAcres: number;
  peakWindow: string;
  recommendedBalerCount: number;
}

const BLOCK_DATA: BlockForecast[] = [
  {
    name: 'Sangrur Central',
    pr126Acres: 14200,
    pusa44Acres: 28500,
    basmatiAcres: 9400,
    totalAcres: 52100,
    peakWindow: 'Oct 22 - Nov 02',
    recommendedBalerCount: 42,
  },
  {
    name: 'Sunam',
    pr126Acres: 9800,
    pusa44Acres: 34100,
    basmatiAcres: 6200,
    totalAcres: 50100,
    peakWindow: 'Oct 26 - Nov 06',
    recommendedBalerCount: 48,
  },
  {
    name: 'Dhuri',
    pr126Acres: 18400,
    pusa44Acres: 16200,
    basmatiAcres: 12500,
    totalAcres: 47100,
    peakWindow: 'Oct 10 - Oct 24',
    recommendedBalerCount: 36,
  },
  {
    name: 'Bhawanigarh',
    pr126Acres: 12100,
    pusa44Acres: 21300,
    basmatiAcres: 7800,
    totalAcres: 41200,
    peakWindow: 'Oct 18 - Oct 30',
    recommendedBalerCount: 32,
  },
  {
    name: 'Dirba / Lehragaga',
    pr126Acres: 8500,
    pusa44Acres: 36800,
    basmatiAcres: 5400,
    totalAcres: 50700,
    peakWindow: 'Oct 28 - Nov 08',
    recommendedBalerCount: 52,
  },
];

export const HarvestForecast: React.FC = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(14); // Mid-October
  const [selectedBlock, setSelectedBlock] = useState<string>('Sangrur Central');

  const currentBlock = BLOCK_DATA.find((b) => b.name === selectedBlock) || BLOCK_DATA[0];

  // Simulated day of month (October 5 to November 15)
  const currentDate = new Date(2026, 9, 5 + selectedDayIndex);
  const formattedDate = currentDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Top Banner */}
      <div className="glass-panel-emerald p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                Wedge 4: Forecast the Harvest Before It Happens
              </h3>
              <span className="badge badge-emerald text-xs">
                Sentinel-2 NDVI Maturity Moat
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              PR-126 comes off late September to early October; Pusa-44 hits in late October. By tracking Sentinel-2 NDVI time series, Nirdhoom predicts block-by-block daily straw acreage to pre-position machinery before the burn panic strikes.
            </p>
          </div>
        </div>
      </div>

      {/* Date Timeline Slider & Pre-positioning Engine */}
      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs text-slate-400 block">Harvest Horizon Slider:</span>
            <div className="text-xl font-black text-white font-mono">{formattedDate}</div>
          </div>

          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Paddy Maturity Curve: </span>
            <span className="font-bold text-emerald-400">
              {selectedDayIndex < 12 ? 'PR-126 Early Wave' : selectedDayIndex < 24 ? 'Peak Pusa-44 Influx' : 'Late Harvest Tail'}
            </span>
          </div>
        </div>

        <div>
          <input
            type="range"
            min="0"
            max="35"
            value={selectedDayIndex}
            onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>Oct 05 (PR-126 Start)</span>
            <span>Oct 20 (Early Transition)</span>
            <span>Oct 28 (Pusa-44 Peak Spike)</span>
            <span>Nov 10 (Wheat Sowing Deadline)</span>
          </div>
        </div>

        {/* PAU Ludhiana Agronomic Advisory with Real Farm Photograph */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-1">
          <div className="md:col-span-8 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-start gap-3 text-xs">
            <Truck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">
                Automated Fleet Pre-Positioning Advisory ({formattedDate})
              </div>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                NDVI curves indicate <strong>{currentBlock.name}</strong> will see an influx of{' '}
                <strong className="text-cyan-300">
                  {Math.round(currentBlock.totalAcres * (selectedDayIndex < 15 ? 0.04 : 0.08))} acres/day
                </strong>{' '}
                over the next 72 hours. Recommended to pre-position{' '}
                <strong className="text-emerald-400">{currentBlock.recommendedBalerCount} Balers</strong> from nearby CHCs to avoid delay penalties.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 rounded-xl overflow-hidden border border-amber-500/30 relative bg-slate-950 min-h-[90px]">
            <img 
              src="/images/punjab_farm_hero.jpg" 
              alt="PAU PR-126 Golden Harvest" 
              className="w-full h-full object-cover object-center max-h-24"
            / loading="lazy" decoding="async">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-300 font-bold">PAU LUDHIANA ADVISORY</span>
              <span className="text-emerald-400 font-semibold">PR-126 ~93 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Block Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {BLOCK_DATA.map((block) => {
          const isSelected = block.name === selectedBlock;
          return (
            <div
              key={block.name}
              onClick={() => setSelectedBlock(block.name)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/95 border-emerald-500 ring-1 ring-emerald-500 shadow-lg'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-white">{block.name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Peak: {block.peakWindow}</div>

              <div className="mt-3 flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>PR-126:</span>
                  <span className="font-mono text-emerald-400">{block.pr126Acres.toLocaleString()} ac</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pusa-44:</span>
                  <span className="font-mono text-amber-400">{block.pusa44Acres.toLocaleString()} ac</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Basmati:</span>
                  <span className="font-mono text-cyan-300">{block.basmatiAcres.toLocaleString()} ac</span>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Crop:</span>
                <span className="font-mono font-bold text-white">{block.totalAcres.toLocaleString()} ac</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
