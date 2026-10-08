import { CircleHelp, MapPinned, UserCheck } from 'lucide-react';
import { Field, FieldProvenance, ProvenanceSource } from '../../types';

interface Props { fields: Field[]; demoMode: boolean; }

const labels: Record<ProvenanceSource, string> = {
  FARMER_DECLARATION: 'Farmer declaration',
  CADASTRAL_REFERENCE: 'Cadastral reference',
  GPS_OPERATOR: 'Operator GPS',
  SYSTEM_DERIVED: 'System-derived',
  UNKNOWN: 'Unknown',
};

const sourceClass = (source: ProvenanceSource) =>
  source === 'UNKNOWN'
    ? 'border-slate-700 bg-slate-900/60 text-slate-400'
    : source === 'SYSTEM_DERIVED'
      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

function resolveProvenance(field: Field): FieldProvenance {
  return field.provenance ?? {
    acreage: 'UNKNOWN',
    geometry: field.geometry?.length ? 'FARMER_DECLARATION' : 'UNKNOWN',
    khasra: field.khasra_no ? 'FARMER_DECLARATION' : 'UNKNOWN',
    crop: field.crop ? 'FARMER_DECLARATION' : 'UNKNOWN',
    harvest_date: field.expected_harvest_date ? 'FARMER_DECLARATION' : 'UNKNOWN',
    status: 'DECLARED',
  };
}

export function FieldProvenancePanel({ fields, demoMode }: Props) {
  const mapped = fields.filter(f => resolveProvenance(f).status !== 'DECLARED').length;
  const verified = fields.filter(f => resolveProvenance(f).status === 'FIELD_VERIFIED').length;
  const unknown = fields.filter(f => Object.values(resolveProvenance(f)).includes('UNKNOWN')).length;

  return (
    <section className="tone-adapt glass-panel p-4 sm:p-5 border-indigo-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-indigo-300" />
            <h2 className="text-lg font-extrabold text-white">Field provenance & verification</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Every operational field value should have a source before it is treated as authoritative.</p>
        </div>
        <span className="text-[11px] rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-semibold">{demoMode ? 'Synthetic records' : 'Live records'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Metric label="Mapped+" value={mapped} />
        <Metric label="Field verified" value={verified} />
        <Metric label="Needs source" value={unknown} />
      </div>
      <div className="mt-4 space-y-2">
        {fields.slice(0, 8).map(field => {
          const p = resolveProvenance(field);
          return (
            <div key={field.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-white">{field.khasra_no || 'Field'} <span className="text-slate-500 font-normal">• {field.village}</span></div>
                  <div className="text-[11px] text-slate-500 mt-0.5">State: {p.status.replaceAll('_', ' ')}</div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">{p.verification_method || 'Source review pending'}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                {([
                  ['Acreage', p.acreage], ['Geometry', p.geometry], ['Khasra', p.khasra],
                  ['Crop', p.crop], ['Harvest date', p.harvest_date],
                ] as const).map(([name, source]) => (
                  <div key={name} className={`rounded-lg border p-2 ${sourceClass(source)}`}>
                    <div className="text-[10px] uppercase tracking-wide opacity-70">{name}</div>
                    <div className="text-[11px] font-semibold mt-0.5">{labels[source]}</div>
                  </div>
                ))}
              </div>
              {p.verified_by && (
                <div className="mt-2 text-[11px] text-emerald-300 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Verified by {p.verified_by}{p.verified_at ? ` • ${new Date(p.verified_at).toLocaleString()}` : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
        <CircleHelp className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
        Unknown provenance is intentionally visible. It is not converted into a fake “verified” state.
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="text-xl font-black text-white mt-0.5">{value}</div></div>;
}
