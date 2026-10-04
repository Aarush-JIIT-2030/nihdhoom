import { Activity, MapPinned, Truck, Users, Factory, ShieldCheck, Leaf, Search, AlertTriangle, Clock } from 'lucide-react';
import { Field, Machine, BurnEvent, StorageYard, Buyer } from '../../types';
import { OpsMap } from '../OpsConsole/OpsMap';

interface Props {
  fields: Field[];
  machines: Machine[];
  fireEvents: BurnEvent[];
  storageYards: StorageYard[];
  buyers: Buyer[];
  onSelectField: (field: Field) => void;
  onOpenResidue: () => void;
  onOpenImpact: () => void;
}

export function CommandCenter({ fields, machines, fireEvents, storageYards, buyers, onSelectField, onOpenResidue, onOpenImpact }: Props) {
  const activeJobs = fields.filter(f => ['SCHEDULED','BALING_IN_PROGRESS'].includes(f.status)).length;
  const verified = fields.filter(f => f.status === 'VERIFIED_NON_BURN' || f.is_verified_non_burn).length;
  const machineActive = machines.filter(m => m.status !== 'MAINTENANCE').length;
  const estimatedResidue = fields.reduce((sum, f) => sum + ((Number(f.acreage) || 0) * 1.8), 0);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-emerald-500/20 bg-slate-950/70 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Activity className="h-4 w-4" /> NIRDHOOM Command Center
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-black text-white">Field → Residue → Operations → Offtake</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">One operational surface for CHCs, mapping, residue supply, verification and buyer demand. Impact is calculated downstream from verified evidence.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpenResidue} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">Open Residue & Pools</button>
            <button onClick={onOpenImpact} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800">Impact & Research</button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          ['Fields', fields.length, MapPinned],
          ['Active jobs', activeJobs, Truck],
          ['CHC machines', machineActive, Factory],
          ['Verified fields', verified, ShieldCheck],
          ['Est. residue', `${estimatedResidue.toFixed(1)} t`, Leaf],
          ['Fire context', fireEvents.length, Search],
        ].map(([label, value, Icon]: any) => (
          <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <Icon className="h-4 w-4 text-emerald-400" />
            <div className="mt-2 text-xl font-black text-white">{value}</div>
            <div className="text-[11px] text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              <h2 className="font-bold text-white">Evidence → Impact readiness</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Impact is downstream of verified operational evidence. This panel never treats planned residue as verified impact.</p>
          </div>
          <button onClick={onOpenImpact} className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/15">Open research workspace</button>
        </div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            ['Registered', fields.length, 'field records'],
            ['Scheduled / active', activeJobs, 'operations'],
            ['Cleared for audit', fields.filter(f => f.status === 'CLEARED_PENDING_AUDIT').length, 'awaiting verification'],
            ['Verified', verified, 'non-burn fields'],
            ['Impact-ready', verified, 'verified records'],
          ].map(([label, value, note]) => (
            <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-lg font-black text-white">{value}</div>
              <div className="text-[11px] font-semibold text-slate-300">{label}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">{note}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200">
          Residue estimate is a planning coefficient only ({'1.8 t/acre'} in the current prototype). It must not be presented as measured recovery or a carbon claim without a versioned methodology and evidence.
        </div>
      </section>

      <section className="rounded-2xl border border-rose-500/20 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-rose-300">
              <AlertTriangle className="h-4 w-4" />
              <h2 className="font-bold text-white">Exceptions & action queue</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Operational exceptions are more actionable than vanity counters. Resolve these before expanding capacity.</p>
          </div>
          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-300">
            {fields.filter(f => f.status === 'REGISTERED').length + machines.filter(m => m.status === 'MAINTENANCE').length} open signals
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            ...fields.filter(f => f.status === 'REGISTERED').slice(0, 3).map(f => ({
              key: `field-${f.id}`,
              title: 'Needs dispatch',
              detail: `${f.khasra_no} • ${f.acreage} ac • ${f.village}`,
              icon: Truck,
            })),
            ...machines.filter(m => m.status === 'MAINTENANCE').slice(0, 3).map(m => ({
              key: `machine-${m.id}`,
              title: 'Machine unavailable',
              detail: `${m.name} • ${m.home_chc}`,
              icon: Factory,
            })),
            ...fields.filter(f => new Date(f.clearance_deadline).getTime() < Date.now() && !['VERIFIED_NON_BURN'].includes(f.status)).slice(0, 3).map(f => ({
              key: `deadline-${f.id}`,
              title: 'Deadline risk',
              detail: `${f.khasra_no} • deadline ${new Date(f.clearance_deadline).toLocaleDateString()}`,
              icon: Clock,
            })),
          ].slice(0, 6).map(item => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-rose-300" />
                  <span className="text-xs font-bold text-white">{item.title}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{item.detail}</div>
              </div>
            );
          })}
          {fields.filter(f => f.status === 'REGISTERED').length === 0 && machines.filter(m => m.status === 'MAINTENANCE').length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-200">
              No current registration or maintenance exceptions. Deadline risk is still evaluated from the latest field records.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white">Live Operational Map</h2>
              <p className="text-xs text-slate-500">Fields, machines, routes and supply-demand context.</p>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">MAP = SOURCE OF TRUTH</span>
          </div>
          <OpsMap fields={fields} machines={machines} fireEvents={fireEvents} storageYards={storageYards} buyers={buyers} selectedField={null} onSelectField={onSelectField} activeRoutePolyline={[]} />
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-cyan-300"><Factory className="h-4 w-4" /><h2 className="font-bold">CHC Operations</h2></div>
            <div className="mt-4 space-y-2">
              {machines.length === 0 ? <p className="text-sm text-slate-500">No live machine records assigned yet.</p> : machines.slice(0, 6).map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                  <div><div className="text-xs font-bold text-white">{m.name}</div><div className="text-[10px] text-slate-500">{m.home_chc}</div></div>
                  <span className="text-[10px] font-bold text-cyan-300">{m.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-amber-300"><Users className="h-4 w-4" /><h2 className="font-bold">Supply → Demand</h2></div>
            <p className="mt-2 text-sm text-slate-400">Residue is pooled only after field-level evidence and quantity are established. Buyer demand can then trigger a procurement pool.</p>
            <button onClick={onOpenResidue} className="mt-3 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200">Manage Deal Pools</button>
          </div>
        </div>
      </section>
    </div>
  );
}
