import { BarChart3, BookOpen, CheckCircle2, Database, Leaf, ShieldCheck, MapPin, FlaskConical, Clock } from 'lucide-react';
import { Field } from '../../types';

interface Props { fields: Field[]; demoMode: boolean; }

export function ImpactResearch({ fields, demoMode }: Props) {
  const verified = fields.filter(f => f.status === 'VERIFIED_NON_BURN' || f.is_verified_non_burn);
  const acres = verified.reduce((s, f) => s + Number(f.acreage || 0), 0);
  const planningResidue = verified.reduce((s, f) => s + Number(f.acreage || 0) * 1.8, 0);
  const withGeometry = fields.filter(f => f.geometry?.length >= 3).length;
  const withHarvestDate = fields.filter(f => Boolean(f.expected_harvest_date)).length;
  const withMoisture = fields.filter(f => Number.isFinite(Number(f.moisture_pct))).length;
  const evidenceCoverage = fields.length ? Math.round((withGeometry / fields.length) * 100) : 0;

  const metrics = [
    ['Verified field area', (acres * 0.404686).toFixed(1), 'ha'],
    ['Planning residue estimate', planningResidue.toFixed(1), 't'],
    ['Geometry coverage', evidenceCoverage, '%'],
    ['Verified fields', verified.length, 'fields'],
  ];

  return <div className="space-y-4">
    <section className="rounded-2xl border border-emerald-500/20 bg-slate-950/70 p-5">
      <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest"><BarChart3 className="h-4 w-4" /> Impact + Research</div>
      <h1 className="mt-1 text-2xl font-black text-white">Evidence-derived impact, not invented impact</h1>
      <p className="mt-1 max-w-3xl text-sm text-slate-400">This workspace traces research-ready metrics back to field records. Planning coefficients remain separate from measured residue, verified outcomes and carbon claims.</p>
    </section>

    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map(([label, value, unit]) => <div key={String(label)} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><div className="text-[11px] text-slate-500">{label}</div><div className="mt-1 text-2xl font-black text-white">{value}<span className="ml-1 text-xs text-slate-500">{unit}</span></div></div>)}
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-300" /><h2 className="font-bold text-white">Field-to-impact ledger</h2></div><p className="mt-1 text-xs text-slate-500">Operational stage and research readiness for each field record.</p></div>
          <span className="text-[10px] text-slate-500">{fields.length} record(s)</span>
        </div>
        <div className="mt-4 space-y-2">
          {fields.length === 0 ? <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">No field records are available for traceability.</div> : fields.slice(0, 12).map(field => {
            const stageOrder: Field['status'][] = ['REGISTERED','SCHEDULED','BALING_IN_PROGRESS','CLEARED_PENDING_AUDIT','VERIFIED_NON_BURN'];
            const idx = stageOrder.indexOf(field.status);
            const verifiedField = field.status === 'VERIFIED_NON_BURN' || field.is_verified_non_burn;
            const residue = Number(field.acreage || 0) * 1.8;
            return <div key={field.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div><div className="text-xs font-bold text-white">{field.farmer_name || ('Field ' + field.id.slice(0, 8))}</div><div className="text-[10px] text-slate-500">{field.village} · {field.khasra_no || 'Khasra not recorded'} · {Number(field.acreage || 0).toFixed(1)} ac</div></div>
                <span className={verifiedField ? 'text-[10px] font-bold text-emerald-300' : 'text-[10px] font-bold text-slate-400'}>{field.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1">
                {stageOrder.map((stage, i) => <div key={stage} className={i <= idx ? 'h-1.5 rounded-full bg-emerald-500' : 'h-1.5 rounded-full bg-slate-800'} />)}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                <span className="text-slate-500">Residue planning: <b className="text-slate-300">{residue.toFixed(1)} t</b></span>
                <span className={field.geometry?.length >= 3 ? 'text-emerald-300' : 'text-amber-300'}>{field.geometry?.length >= 3 ? 'Geometry linked' : 'Geometry missing'}</span>
                <span className={field.expected_harvest_date ? 'text-emerald-300' : 'text-amber-300'}>{field.expected_harvest_date ? 'Harvest date linked' : 'Harvest date missing'}</span>
                {verifiedField && <span className="text-emerald-300">Verification state reached</span>}
              </div>
            </div>;
          })}
        </div>
      </div>

      <div className="lg:col-span-4 rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-4">
        <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-cyan-300" /><h2 className="font-bold text-white">Research readiness</h2></div>
        <div className="mt-4 space-y-2 text-xs">
          {[
            ['Geometry linked', withGeometry, fields.length],
            ['Harvest dates linked', withHarvestDate, fields.length],
            ['Moisture recorded', withMoisture, fields.length],
            ['Verified non-burn', verified.length, fields.length],
          ].map(([label, value, total]) => <div key={String(label)} className="flex items-center justify-between rounded-lg border border-slate-800 p-3"><span className="text-slate-300">{label}</span><span className="font-mono font-bold text-cyan-200">{value}/{total}</span></div>)}
        </div>
        <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200">A record can be operationally complete without being research-ready. Missing geometry, evidence, methodology or provenance blocks publication-grade impact claims.</div>
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-400" /><h2 className="font-bold text-white">Impact chain</h2></div>
        <div className="mt-4 space-y-2 text-xs">
          {['Field registered','Residue planning estimate','Machine job completed','Evidence captured','Verification review','Residue offtaken','Impact calculated'].map((x, i) => {
            const available = [fields.length > 0, fields.length > 0, fields.some(f => ['BALING_IN_PROGRESS','CLEARED_PENDING_AUDIT','VERIFIED_NON_BURN'].includes(f.status)), false, verified.length > 0, false, false][i];
            return <div key={x} className="flex items-center gap-3 rounded-lg border border-slate-800 p-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-slate-300">{i + 1}</span><span className="text-slate-300">{x}</span>{available ? <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" /> : <span className="ml-auto text-[10px] text-slate-500">not established</span>}</div>;
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-4">
        <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-cyan-300" /><h2 className="font-bold text-white">Methodology registry</h2></div>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-slate-800 p-3"><div className="text-xs font-bold text-white">Residue planning coefficient</div><p className="mt-1 text-[11px] text-slate-500">Current UI planning factor: <span className="text-slate-300">1.8 t/acre</span>. This is a prototype assumption, not a measured recovery factor or carbon accounting methodology.</p></div>
          <div className="rounded-lg border border-slate-800 p-3"><div className="text-xs font-bold text-white">Publication gate</div><p className="mt-1 text-[11px] text-slate-500">Require source citation, version, effective date and calculation provenance before turning any coefficient into an institutional impact claim.</p></div>
          <div className="rounded-lg border border-slate-800 p-3"><div className="text-xs font-bold text-white">Data provenance</div><p className="mt-1 text-[11px] text-slate-500">Trace metrics to field geometry, evidence assets, verification events, residue lots and buyer/offtake records.</p></div>
        </div>
      </div>
    </section>

    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200 flex gap-2"><Database className="h-4 w-4 shrink-0" /> {demoMode ? 'Demo mode: metrics are illustrative and are not production measurements.' : 'Live mode: metrics are limited to records currently available in Supabase.'} <Clock className="h-4 w-4 shrink-0 ml-auto" /><ShieldCheck className="h-4 w-4 shrink-0" /></div>
  </div>;
}
