import { Activity, MapPinned, Truck, Users, Factory, ShieldCheck, Leaf, ArrowRight, CalendarDays, IndianRupee, CheckCircle2, Map, Wheat } from 'lucide-react';
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
  const acreage = fields.reduce((sum, f) => sum + (Number(f.acreage) || 0), 0);
  const estimatedResidue = acreage * 1.8;
  const cleared = fields.filter(f => ['CLEARED_PENDING_AUDIT','VERIFIED_NON_BURN'].includes(f.status)).length;

  const steps = [
    { label: 'Register field', icon: MapPinned, done: fields.length > 0, tab: 'fields' },
    { label: 'Book clearance', icon: CalendarDays, done: activeJobs > 0, tab: 'book' },
    { label: 'Track machine', icon: Truck, done: machines.length > 0, tab: 'track' },
    { label: 'Verify evidence', icon: CheckCircle2, done: verified > 0, tab: 'verify' },
  ];

  return (
    <div className="field-page space-y-5 pb-8">
      <section className="field-hero overflow-hidden rounded-[28px] border bg-white">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative p-5 sm:p-7 lg:p-9">
            <div className="field-kicker"><Wheat className="h-4 w-4" /> NIRDHOOM • Field-first crop residue management</div>
            <h1 className="mt-3 max-w-3xl font-['Outfit'] text-3xl font-black leading-tight text-emerald-950 sm:text-4xl lg:text-5xl">
              Clear the field.<br /><span className="text-emerald-600">Keep the value.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-950/65 sm:text-base">
              Book residue clearance, track the machine, capture evidence and move verified residue to the right buyer — all from one simple field workflow.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button onClick={() => onOpenResidue()} className="field-button field-button-primary"><Leaf className="h-4 w-4" /> Open residue market <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => onOpenImpact()} className="field-button field-button-secondary"><ShieldCheck className="h-4 w-4" /> View verified impact</button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return <div key={step.label} className={`field-step ${step.done ? 'is-done' : ''}`}><Icon className="h-4 w-4" /><div><div className="text-[11px] font-bold">{step.label}</div><div className="text-[9px] opacity-65">{step.done ? 'Ready' : 'Next step'}</div></div></div>;
              })}
            </div>
          </div>
          <div className="field-hero-side p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div><div className="text-xs font-bold uppercase tracking-wider text-emerald-900/45">Today at a glance</div><div className="mt-1 text-lg font-black text-emerald-950">Field network</div></div>
              <div className="rounded-2xl bg-emerald-700 p-3 text-white shadow-lg"><Leaf className="h-5 w-5" /></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {[
                ['Fields', fields.length, MapPinned],
                ['Active jobs', activeJobs, Truck],
                ['Machines', machineActive, Factory],
                ['Verified', verified, ShieldCheck],
                ['Area', `${acreage.toFixed(1)} ac`, Map],
                ['Residue', `${estimatedResidue.toFixed(1)} t`, Leaf],
              ].map(([label, value, Icon]: any) => <div key={String(label)} className="field-stat"><Icon className="h-4 w-4 text-emerald-700" /><div className="mt-1 text-xl font-black text-emerald-950">{value}</div><div className="text-[10px] font-medium text-emerald-900/50">{label}</div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="field-card overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-emerald-900/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="flex items-center gap-2 text-sm font-black text-emerald-950"><Map className="h-4 w-4 text-emerald-600" /> Field & machine map</div><p className="mt-0.5 text-xs text-emerald-900/55">See fields, machines and operational context together.</p></div>
            <span className="field-chip"><Activity className="h-3 w-3" /> Live operational layer</span>
          </div>
          <div className="p-2 sm:p-3">
            <OpsMap fields={fields} machines={machines} fireEvents={fireEvents} storageYards={storageYards} buyers={buyers} selectedField={null} onSelectField={onSelectField} activeRoutePolyline={[]} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="field-card p-4 sm:p-5">
            <div className="flex items-center gap-2"><Factory className="h-4 w-4 text-emerald-700" /><h2 className="font-black text-emerald-950">CHC & machines</h2></div>
            <p className="mt-1 text-xs text-emerald-900/55">Community machines available for field clearance.</p>
            <div className="mt-4 space-y-2">
              {machines.length === 0 ? <div className="field-empty">No live machine assigned yet.</div> : machines.slice(0, 5).map(m => <div key={m.id} className="field-list-row"><div><div className="text-xs font-bold text-emerald-950">{m.name}</div><div className="text-[10px] text-emerald-900/50">{m.home_chc}</div></div><span className="field-status">{m.status}</span></div>)}
            </div>
          </div>

          <div className="field-card p-4 sm:p-5">
            <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-amber-700" /><h2 className="font-black text-emerald-950">Residue pathway</h2></div>
            <p className="mt-1 text-xs leading-5 text-emerald-900/60">Field → baling → evidence → verified residue → buyer pool. Planned residue is never counted as verified impact.</p>
            <button onClick={onOpenResidue} className="field-button field-button-wheat mt-4 w-full"><Leaf className="h-4 w-4" /> Open residue pools <ArrowRight className="h-4 w-4" /></button>
          </div>

          <div className="field-card p-4 sm:p-5">
            <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-sky-700" /><h2 className="font-black text-emerald-950">Farmer value</h2></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="field-mini"><div className="text-[10px] text-emerald-900/50">Cleared fields</div><div className="text-lg font-black text-emerald-950">{cleared}</div></div>
              <div className="field-mini"><div className="text-[10px] text-emerald-900/50">Verified fields</div><div className="text-lg font-black text-emerald-950">{verified}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="field-card p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-base font-black text-emerald-950">Built around the field, not the dashboard</h2><p className="mt-1 text-xs text-emerald-900/55">Every layer has a clear job: register → book → operate → prove → pool → sell → measure.</p></div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="field-chip">Field</span><span className="field-chip field-chip-wheat">Residue</span><span className="field-chip field-chip-sky">Operations</span><span className="field-chip field-chip-green">Evidence</span><span className="field-chip field-chip-amber">Offtake</span>
          </div>
        </div>
      </section>
    </div>
  );
}
