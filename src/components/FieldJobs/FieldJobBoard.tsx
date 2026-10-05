import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  MapPin,
  PackageCheck,
  Route,
  ShieldCheck,
  Tractor,
  UserRound,
} from 'lucide-react';
import { Field, Machine } from '../../types';
import { supabase } from '../../lib/supabase';

type JobRecord = {
  id: string;
  booking_id: string;
  machine_id: string | null;
  operator_id: string | null;
  status: string;
  slot_start: string | null;
  slot_end: string | null;
  actual_arrived_at: string | null;
  actual_completed_at: string | null;
  failure_reason: string | null;
  last_transition_at: string | null;
  booking?: { field_id: string } | { field_id: string }[] | null;
};

type ProofRecord = {
  id: string;
  field_id: string;
  booking_id: string | null;
  kind: string;
  captured_at: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type LotRecord = {
  id: string;
  field_id: string;
  quantity_tonnes: number | null;
  status: string;
  baled_at: string | null;
  assigned_buyer_id: string | null;
  quality_grade: string | null;
};

interface Props {
  fields: Field[];
  machines: Machine[];
  demoMode: boolean;
  onSelectField: (field: Field) => void;
  onOpenFind machine: () => void;
  onOpenParali: () => void;
  onOpenWhy it matters: () => void;
}

const stageFor = (field: Field, job?: JobRecord, lot?: LotRecord) => {
  if (field.status === 'VERIFIED_NON_BURN' || lot?.status === 'VERIFIED' || lot?.status === 'VERIFIED_NON_BURN') return 'VERIFIED';
  if (lot || field.residue_lot_id) return 'RESIDUE';
  if (job?.status === 'COMPLETED' || field.status === 'CLEARED_PENDING_AUDIT') return 'EVIDENCE';
  if (job?.status === 'BALING' || field.status === 'BALING_IN_PROGRESS') return 'BALING';
  if (job?.status === 'ARRIVED' || job?.status === 'ASSIGNED' || job?.status === 'DISPATCHED') return 'DISPATCH';
  if (field.status === 'BOOKED' || field.status === 'SCHEDULED') return 'SCHEDULED';
  return 'REGISTERED';
};

const journeyStages = ['REGISTERED', 'SCHEDULED', 'DISPATCH', 'BALING', 'EVIDENCE', 'VERIFIED', 'RESIDUE'] as const;

const stageClasses: Record<string, string> = {
  REGISTERED: 'border-slate-700 bg-slate-900/70 text-slate-300',
  SCHEDULED: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  DISPATCH: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200',
  BALING: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  EVIDENCE: 'border-violet-500/30 bg-violet-500/10 text-violet-200',
  RESIDUE: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  VERIFIED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

export function FieldJobBoard({
  fields,
  machines,
  demoMode,
  onSelectField,
  onOpenFind machine,
  onOpenParali,
  onOpenWhy it matters,
}: Props) {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [evidence, setProof] = useState<ProofRecord[]>([]);
  const [lots, setLots] = useState<LotRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTION' | 'READY'>('ALL');

  useEffect(() => {
    if (demoMode || !supabase) {
      setJobs([]);
      setProof([]);
      setLots([]);
      setError(null);
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const db = supabase;
      if (!db) return;

      const [jobsResult, evidenceResult, lotsResult] = await Promise.all([
        db.from('jobs').select('id,booking_id,machine_id,operator_id,status,slot_start,slot_end,actual_arrived_at,actual_completed_at,failure_reason,last_transition_at,booking:bookings(field_id)').order('updated_at', { ascending: false }).limit(250),
        db.from('evidence_assets').select('id,field_id,booking_id,kind,captured_at,latitude,longitude,created_at').order('created_at', { ascending: false }).limit(500),
        db.from('residue_lots').select('id,field_id,quantity_tonnes,status,baled_at,assigned_buyer_id,quality_grade').order('created_at', { ascending: false }).limit(250),
      ]);

      if (!active) return;
      const firstError = jobsResult.error || evidenceResult.error || lotsResult.error;
      if (firstError) {
        setError(firstError.message);
      } else {
        setJobs((jobsResult.data || []) as unknown as JobRecord[]);
        setProof((evidenceResult.data || []) as ProofRecord[]);
        setLots((lotsResult.data || []) as LotRecord[]);
      }
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [demoMode]);

  const machineById = useMemo(() => new Map(machines.map((m) => [m.id, m])), [machines]);
  const jobByField = useMemo(() => {
    const map = new Map<string, JobRecord>();
    for (const job of jobs) {
      const booking = Array.isArray(job.booking) ? job.booking[0] : job.booking;
      const fieldId = booking?.field_id || fields.find((f) => f.job_id === job.id)?.id;
      if (fieldId && !map.has(fieldId)) map.set(fieldId, job);
    }
    return map;
  }, [fields, jobs]);

  const evidenceByField = useMemo(() => {
    const map = new Map<string, ProofRecord[]>();
    for (const item of evidence) {
      const current = map.get(item.field_id) || [];
      current.push(item);
      map.set(item.field_id, current);
    }
    return map;
  }, [evidence]);

  const lotByField = useMemo(() => {
    const map = new Map<string, LotRecord>();
    for (const lot of lots) {
      if (!map.has(lot.field_id)) map.set(lot.field_id, lot);
    }
    return map;
  }, [lots]);

  const rows = useMemo(() => fields.map((field) => {
    const liveFieldId = field.dbId || field.id;
    const job = jobByField.get(liveFieldId);
    const fieldProof = evidenceByField.get(liveFieldId) || [];
    const lot = lotByField.get(liveFieldId);
    const stage = stageFor(field, job, lot);
    const hasLocationProof = fieldProof.some((e) => e.latitude !== null && e.longitude !== null);
    const hasCompletionProof = fieldProof.some((e) => e.kind === 'field_photo' || e.kind === 'bale_photo' || e.kind === 'weighment');
    const action =
      stage === 'REGISTERED' ||
      (stage === 'SCHEDULED' && !job) ||
      (job?.status === 'FAILED' || job?.status === 'CANCELLED') ||
      (stage === 'EVIDENCE' && !hasCompletionProof) ||
      (stage === 'RESIDUE' && !lot?.assigned_buyer_id);

    const ready = stage === 'VERIFIED' && Boolean(lot?.assigned_buyer_id || field.residue_lot_id);

    return {
      field,
      job,
      fieldProof,
      lot,
      stage,
      hasLocationProof,
      hasCompletionProof,
      action,
      ready,
      machine: job?.machine_id ? machineById.get(job.machine_id) : (field.assigned_machine_id ? machineById.get(field.assigned_machine_id) : undefined),
    };
  }), [fields, jobByField, evidenceByField, lotByField, machineById]);

  const visibleRows = rows.filter((row) => filter === 'ALL' || (filter === 'ACTION' ? row.action : row.ready));
  const actionCount = rows.filter((r) => r.action).length;
  const readyCount = rows.filter((r) => r.ready).length;
  const evidenceCount = rows.reduce((sum, r) => sum + r.fieldProof.length, 0);
  const lotCount = rows.filter((r) => r.lot).length;

  return (
    <div className="farmer-surface farmer-fields space-y-4">
      <section className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 shadow-xl shadow-emerald-950/10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-[11px] font-black uppercase tracking-[0.18em]">
              <Activity className="h-4 w-4" /> My fields & pickup status
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white">Your fields, pickup and parali status</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">
              See what is happening to each field, what has been done, and what needs to happen next.
              This view surfaces the next operational action instead of only reporting totals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onOpenFind machine} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500">
              <Route className="h-3.5 w-3.5" /> Find machine
            </button>
            <button onClick={onOpenParali} className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/20">
              <PackageCheck className="h-3.5 w-3.5" /> Parali
            </button>
            <button onClick={onOpenWhy it matters} className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Why it matters
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        {[
          ['My fields', rows.length, 'text-white'],
          ['Needs your attention', actionCount, 'text-amber-300'],
          ['Proof', evidenceCount, 'text-violet-300'],
          ['Parali lots', lotCount, 'text-orange-300'],
          ['Ready for buyer', readyCount, 'text-emerald-300'],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-950/65 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
            <div className={`mt-1 text-xl font-black font-mono ${tone}`}>{value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            {(['ALL', 'ACTION', 'READY'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition ${filter === value ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {value === 'ALL' ? 'All fields' : value === 'ACTION' ? 'Needs your attention' : 'Ready for buyer'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {loading && <Clock3 className="h-3.5 w-3.5 animate-spin" />}
            {demoMode ? 'Example data' : 'Live records'}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Live operational records could not be loaded: {error}
          </div>
        )}

        {visibleRows.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            {demoMode ? 'No synthetic fields match this filter.' : 'No authorized live field jobs match this filter.'}
          </div>
        ) : (
          <div className="mt-3 grid gap-3">
            {visibleRows.map((row) => {
              const machine = row.machine;
              const latestProof = row.fieldProof[0];
              const deadline = row.field.clearance_deadline ? new Date(row.field.clearance_deadline).getTime() : 0;
              const deadlineRisk = deadline > 0 && deadline < Date.now() && row.stage !== 'VERIFIED';
              const stageTone = stageClasses[row.stage] || stageClasses.REGISTERED;

              return (
                <article key={row.field.id} className="rounded-xl border border-slate-800 bg-slate-900/55 p-4 hover:border-slate-700 transition">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => onSelectField(row.field)} className="text-left text-sm font-black text-white hover:text-emerald-300">
                          {row.field.khasra_no || row.field.id}
                        </button>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${stageTone}`}>{row.stage}</span>
                        {deadlineRisk && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-300">
                            <AlertTriangle className="h-3 w-3" /> Deadline risk
                          </span>
                        )}
                      </div>
                      <div className="field-journey" aria-label={`Field journey currently at ${row.stage}`}>
                        {journeyStages.map((step, index) => {
                          const currentIndex = journeyStages.indexOf(row.stage as typeof journeyStages[number]);
                          const complete = index <= currentIndex;
                          return <span key={step} className={complete ? 'is-complete' : ''}>
                            <i />
                            <b>{step === 'SCHEDULED' ? 'BOOKED' : step}</b>
                          </span>;
                        })}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span>{row.field.village || 'Village unknown'}</span>
                        <span>{Number(row.field.acreage || 0).toFixed(2)} acres</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {row.field.center.lat.toFixed(4)}, {row.field.center.lng.toFixed(4)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] min-w-0 xl:min-w-[500px]">
                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
                        <div className="text-slate-500">Machine</div>
                        <div className="mt-1 flex items-center gap-1 text-slate-200 font-bold truncate">
                          <Tractor className="h-3.5 w-3.5 text-emerald-300 shrink-0" /> {machine?.name || 'Unassigned'}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
                        <div className="text-slate-500">Operator</div>
                        <div className="mt-1 flex items-center gap-1 text-slate-200 font-bold truncate">
                          <UserRound className="h-3.5 w-3.5 text-cyan-300 shrink-0" /> {machine?.operator_name || row.job?.operator_id || 'Unassigned'}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
                        <div className="text-slate-500">Proof</div>
                        <div className="mt-1 flex items-center gap-1 text-slate-200 font-bold">
                          {row.hasCompletionProof ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <FileCheck2 className="h-3.5 w-3.5 text-slate-500" />}
                          {row.fieldProof.length} assets {row.hasLocationProof ? '· GPS' : ''}
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
                        <div className="text-slate-500">Parali</div>
                        <div className="mt-1 text-slate-200 font-bold">
                          {row.lot ? `${Number(row.lot.quantity_tonnes || 0).toFixed(1)} t · ${row.lot.status}` : 'No lot'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-slate-800 pt-3">
                    <div className="text-[10px] text-slate-500">
                      {row.job?.last_transition_at ? `Last transition ${new Date(row.job.last_transition_at).toLocaleString()}` : latestProof?.created_at ? `Proof received ${new Date(latestProof.created_at).toLocaleString()}` : 'No live transition/evidence timestamp available'}
                      {row.job?.failure_reason && <span className="ml-2 text-red-300">Failure: {row.job.failure_reason}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {row.action && <span className="text-[10px] font-bold text-amber-300">Next step</span>}
                      {row.ready && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Ready for buyer</span>}
                      <button onClick={() => onSelectField(row.field)} className="rounded-md border border-slate-700 px-2.5 py-1.5 text-[10px] font-bold text-slate-200 hover:bg-slate-800">
                        See field
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Payment is not shown here because payments are not connected. Ready for buyer means operational records are sufficiently linked; settlement remains intentionally disabled.
      </div>
    </div>
  );
}
