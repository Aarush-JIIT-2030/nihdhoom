import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Factory, Gauge, MapPinned, ShieldCheck, Sparkles, Truck, Wheat } from 'lucide-react';
import { Field, Machine } from '../../types';
import { supabase } from '../../lib/supabase';

interface Props {
  fields: Field[];
  machines: Machine[];
  demoMode: boolean;
}

function toDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function HarvestIntelligence({ fields, machines, demoMode }: Props) {
  const harvestDates = useMemo(
    () => fields.map(f => toDate(f.expected_harvest_date)).filter((d): d is Date => Boolean(d)),
    [fields],
  );

  const start = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return harvestDates.length ? new Date(Math.min(today.getTime(), ...harvestDates.map(d => d.getTime()))) : today;
  }, [harvestDates]);

  const [offset, setOffset] = useState(7);
  const [weather, setWeather] = useState<{ precipitationProbability: number; precipitationMm: number; windGustKmh: number; fetchedAt: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const selectedDate = new Date(start);
  selectedDate.setDate(selectedDate.getDate() + offset);

  const selectedWeatherField = fields[0];

  useEffect(() => {
    if (demoMode || !selectedWeatherField) {
      setWeather(null);
      setWeatherError(null);
      return;
    }

    let active = true;
    const loadWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      const db = supabase;
      if (!db) {
        if (active) setWeatherError('Live weather is not configured.');
        setWeatherLoading(false);
        return;
      }
      const { data } = await db.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (active) setWeatherError('Sign in to load field weather.');
        setWeatherLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/weather?field_id=${encodeURIComponent(selectedWeatherField.id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error || 'Weather provider unavailable');
        const hourly = payload?.forecast?.hourly || {};
        const probabilities = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability.slice(0, 24) : [];
        const precipitation = Array.isArray(hourly.precipitation) ? hourly.precipitation.slice(0, 24) : [];
        const gusts = Array.isArray(hourly.wind_gusts_10m) ? hourly.wind_gusts_10m.slice(0, 24) : [];
        if (!active) return;
        setWeather({
          precipitationProbability: probabilities.length ? Math.max(...probabilities.map(Number).filter(Number.isFinite)) : 0,
          precipitationMm: precipitation.length ? precipitation.reduce((sum: number, value: number) => sum + (Number(value) || 0), 0) : 0,
          windGustKmh: gusts.length ? Math.max(...gusts.map(Number).filter(Number.isFinite)) : 0,
          fetchedAt: String(payload?.fetched_at || new Date().toISOString()),
        });
      } catch (error) {
        if (active) setWeatherError(error instanceof Error ? error.message : 'Weather provider unavailable');
      } finally {
        if (active) setWeatherLoading(false);
      }
    };

    void loadWeather();
    return () => { active = false; };
  }, [demoMode, selectedWeatherField?.id]);

  const horizon = useMemo(() => {
    const end = new Date(start);
    end.setDate(end.getDate() + 35);
    return end;
  }, [start]);

  const upcoming = useMemo(() => {
    const selected = selectedDate.getTime();
    const windowEnd = selected + 72 * 60 * 60 * 1000;
    return fields.filter(f => {
      const d = toDate(f.expected_harvest_date);
      return d && d.getTime() >= selected - 24 * 60 * 60 * 1000 && d.getTime() <= windowEnd;
    });
  }, [fields, selectedDate]);

  const acres = upcoming.reduce((s, f) => s + (Number(f.acreage) || 0), 0);
  const activeMachines = machines.filter(m => m.status !== 'MAINTENANCE');
  const dailyCapacity = activeMachines.reduce((s, m) => s + (Number(m.capacity_acres_day) || 0), 0);
  const utilization = dailyCapacity ? Math.min(100, Math.round((acres / dailyCapacity) * 100)) : 0;
  const recommended = dailyCapacity
    ? Math.max(0, Math.ceil(acres / Math.max(1, dailyCapacity / Math.max(1, activeMachines.length))))
    : 0;

  const blocks = useMemo(() => {
    const grouped = new Map<string, { acres: number; fields: number; varieties: Set<string> }>();
    upcoming.forEach(f => {
      const key = f.block || f.village || 'Unassigned area';
      const current = grouped.get(key) || { acres: 0, fields: 0, varieties: new Set<string>() };
      current.acres += Number(f.acreage) || 0;
      current.fields += 1;
      if (f.paddy_variety) current.varieties.add(f.paddy_variety);
      grouped.set(key, current);
    });
    return [...grouped.entries()].sort((a, b) => b[1].acres - a[1].acres);
  }, [upcoming]);

  const dateLabel = selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const horizonLabel = horizon.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-emerald-500/25 bg-slate-950/75 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Wheat className="h-4 w-4" /> Harvest intelligence
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-black text-white">Predict the pressure. Position the fleet.</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              Inspired by the reference harvest-forecast workflow, this version derives demand from NIRDHOOM field records instead of hard-coded district claims.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
            {demoMode ? 'Planning model • synthetic fields' : 'Planning model • live field records'}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-cyan-300" />
            <div>
              <div className="text-[11px] text-slate-500">Planning horizon</div>
              <div className="text-lg font-black text-white">{dateLabel}</div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            72-hour harvest pressure window · through <span className="text-cyan-300 font-semibold">{horizonLabel}</span>
          </div>
        </div>

        <input
          aria-label="Harvest planning date"
          type="range"
          min="0"
          max="35"
          value={offset}
          onChange={e => setOffset(Number(e.target.value))}
          className="mt-4 w-full accent-emerald-500 cursor-pointer"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>{start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span>+18 days</span>
          <span>+35 days</span>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-500/20 bg-slate-950/65 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Weather-aware operations
            </div>
            <h2 className="mt-1 text-lg font-black text-white">Should the fleet move this window?</h2>
            <p className="mt-1 text-xs text-slate-500">
              Live mode reads Open-Meteo through the authenticated weather adapter for the selected field. It informs planning; it does not guarantee machine access or harvest conditions.
            </p>
          </div>
          <div className="text-[10px] text-slate-500">
            {demoMode ? 'No synthetic weather score' : weatherLoading ? 'Fetching live forecast…' : weather ? `Fetched ${new Date(weather.fetchedAt).toLocaleString('en-IN')}` : 'No forecast'}
          </div>
        </div>
        {weatherError ? (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">{weatherError}</div>
        ) : weather ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-[10px] text-slate-500">Max rain probability</div>
              <div className="mt-1 text-xl font-black text-cyan-200">{weather.precipitationProbability}%</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-[10px] text-slate-500">24h precipitation</div>
              <div className="mt-1 text-xl font-black text-cyan-200">{weather.precipitationMm.toFixed(1)} mm</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-[10px] text-slate-500">Max wind gust</div>
              <div className="mt-1 text-xl font-black text-cyan-200">{weather.windGustKmh.toFixed(0)} km/h</div>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-700 p-4 text-xs text-slate-500">
            {demoMode ? 'Weather is intentionally not fabricated in demo mode.' : 'Select a field with valid coordinates to load the live forecast.'}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ['Harvest-window fields', upcoming.length, MapPinned],
          ['Acres in 72h', acres.toFixed(1), Wheat],
          ['Available balers', activeMachines.length, Factory],
          ['Daily capacity', dailyCapacity.toFixed(1) + ' ac', Gauge],
          ['Capacity pressure', utilization + '%', Truck],
        ].map(([label, value, Icon]: any) => (
          <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <Icon className="h-4 w-4 text-emerald-400" />
            <div className="mt-2 text-xl font-black text-white">{value}</div>
            <div className="text-[11px] text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-2xl border border-cyan-500/20 bg-slate-950/65 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">Block-level harvest pressure</h2>
              <p className="text-xs text-slate-500 mt-0.5">Grouped from fields entering the selected 72-hour window.</p>
            </div>
            <Sparkles className="h-4 w-4 text-cyan-300" />
          </div>

          <div className="mt-4 space-y-2">
            {blocks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                No field harvest records fall inside this window.
              </div>
            ) : blocks.map(([name, data]) => {
              const share = acres ? Math.round((data.acres / acres) * 100) : 0;
              return (
                <div key={name} className="rounded-xl border border-slate-800 bg-slate-900/55 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">{name}</div>
                      <div className="text-[10px] text-slate-500">{data.fields} field(s) · {[...data.varieties].join(', ') || 'Variety not recorded'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-emerald-300">{data.acres.toFixed(1)} ac</div>
                      <div className="text-[10px] text-slate-500">{share}% of window</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: Math.min(100, share) + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-2xl border border-amber-500/20 bg-slate-950/65 p-4">
          <div className="flex items-center gap-2 text-amber-300">
            <Truck className="h-4 w-4" />
            <h2 className="font-bold text-white">Fleet pre-positioning</h2>
          </div>
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-[11px] text-slate-500">Recommended active machines</div>
            <div className="mt-1 text-3xl font-black text-white">{recommended || '—'}</div>
            <div className="text-xs text-slate-400 mt-1">
              {utilization > 100 ? 'Capacity shortfall detected — escalate to dispatch.' : utilization > 80 ? 'High pressure — pre-position before the window opens.' : 'Capacity currently appears sufficient.'}
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 p-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300">Use verified fields as the dispatch priority signal.</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 p-3">
              <Gauge className="h-4 w-4 text-cyan-300" />
              <span className="text-slate-300">Recalculate after machine status or harvest dates change.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
