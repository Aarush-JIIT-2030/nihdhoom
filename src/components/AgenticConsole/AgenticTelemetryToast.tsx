import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Satellite, 
  CheckCircle2, 
  Zap, 
  X, 
  TrendingUp, 
  Radio, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

interface TelemetryEvent {
  id: string;
  icon: 'satellite' | 'vrp' | 'upi' | 'auction';
  title: string;
  detail: string;
  badge: string;
  time: string;
  targetTab?: string;
}

const STREAM_EVENTS: TelemetryEvent[] = [
  {
    id: 'evt-1',
    icon: 'satellite',
    title: 'NASA FIRMS Night Sweep Verified',
    detail: 'Zero thermal points inside registered customer polygons in Sangrur Malwa cluster.',
    badge: '0-BURN AUDIT',
    time: 'Just now',
    targetTab: 'SATELLITE_AUDIT',
  },
  {
    id: 'evt-2',
    icon: 'vrp',
    title: 'OR-Tools VRP Re-routing Complete',
    detail: 'Baler PB-11-CH-4902 auto-assigned to Sukhbir Singh parcel (48h deadline locked).',
    badge: 'VRP DISPATCH',
    time: '2m ago',
    targetTab: 'OPS_CONSOLE',
  },
  {
    id: 'evt-3',
    icon: 'upi',
    title: 'Instant UPI Settlement <90s SLA',
    detail: '₹7,800 disbursed to Harpreet Singh via RazorpayX. UTR: #UPI-9923812 settled in 44s.',
    badge: 'UPI PAYOUT',
    time: '4m ago',
    targetTab: 'BALER_OPERATOR',
  },
  {
    id: 'evt-4',
    icon: 'auction',
    title: 'High-Offtake Bid Placed (₹2,800/T)',
    detail: 'Craste Moulded Fibre placed top bid on PR-126 lot (14% moisture, 42 tonnes).',
    badge: 'AUCTION',
    time: '6m ago',
    targetTab: 'OFFTAKE_AUCTION',
  },
];

export const AgenticTelemetryToast: React.FC<{
  onNavigateTab?: (tab: string) => void;
  demoMode: boolean;
}> = ({ onNavigateTab, demoMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Cycle telemetry events periodically to show active streaming
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % STREAM_EVENTS.length);
    }, 11000);
    return () => clearInterval(timer);
  }, []);

  const currentEvent = demoMode ? STREAM_EVENTS[currentIndex] : {
    id: 'live-status', icon: 'vrp' as const, title: 'Live telemetry surface',
    detail: 'Live operational events are shown only from connected records. No synthetic payout, fire or buyer events are injected into live mode.',
    badge: 'LIVE RECORDS', time: 'current', targetTab: 'OPS_CONSOLE',
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Real-time Telemetry Stream" className="fixed bottom-5 right-5 z-40 max-w-sm w-full px-3 sm:px-0">
      <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 shadow-2xl backdrop-blur-xl bg-slate-950/85">
        <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="badge--dot" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Telemetry Stream
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {demoMode ? `(${currentIndex + 1}/${STREAM_EVENTS.length})` : '(live)'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition-all cursor-pointer"
              title={isMinimized ? 'Expand' : 'Collapse'}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition-all cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                {currentEvent.icon === 'satellite' && <Satellite className="w-4 h-4 text-emerald-400" />}
                {currentEvent.icon === 'vrp' && <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />}
                {currentEvent.icon === 'upi' && <Zap className="w-4 h-4 text-amber-400" />}
                {currentEvent.icon === 'auction' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-white truncate">
                    {currentEvent.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                    {currentEvent.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                  {currentEvent.detail}
                </p>
              </div>
            </div>

            {currentEvent.targetTab && (
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="badge badge-cyan text-[9px] py-0 px-1.5">
                  {currentEvent.badge}
                </span>
                <button
                  onClick={() => onNavigateTab?.(currentEvent.targetTab!)}
                  className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>Inspect Layer &rarr;</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
