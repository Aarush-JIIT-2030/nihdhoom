import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Field, BurnEvent } from '../../types';
import { executeFirmsAudit, generateNonBurnRecord } from '../../utils/spatialVerification';
import { CarbonRecord } from './CarbonRecord';
import { 
  Satellite, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  Award, 
  FileText, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SatelliteAuditProps {
  fields: Field[];
  demoMode: boolean;
  fireEvents: BurnEvent[];
  onVerified?: (fieldId: string) => void;
}

export const SatelliteAudit: React.FC<SatelliteAuditProps> = ({
  fields,
  demoMode,
  fireEvents,
  onVerified,
}) => {
  const auditReport = executeFirmsAudit(fields, fireEvents);
  const [selectedFieldForCert, setSelectedFieldForCert] = useState<Field | null>(null);
  const [reviewingFieldId, setReviewingFieldId] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState('');

  const handleVerify = async (field: Field) => {
    setReviewingFieldId(field.id);
    setReviewMessage('');
    try {
      if (demoMode) {
        onVerified?.(field.id);
        setReviewMessage(`Demo review recorded for ${field.khasra_no}. No registry or payment claim was issued.`);
        return;
      }
      if (!supabase) throw new Error('Live Supabase is not configured.');
      const { error } = await supabase.rpc('record_verification_review', {
        p_field_id: field.dbId || field.id,
        p_result: 'VERIFIED_NON_BURN',
        p_confidence: 92,
        p_metadata: { source: 'nirdhoom-review-console', observation_mode: auditReport.dataAvailability },
      });
      if (error) throw new Error(error.message);
      onVerified?.(field.id);
      setReviewMessage(`Verification review recorded for ${field.khasra_no}.`);
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : 'Verification review failed.');
    } finally {
      setReviewingFieldId(null);
    }
  };

  const handleOpenRecord = (fieldId: string) => {
    const f = fields.find((item) => item.id === fieldId);
    if (f) {
      setSelectedFieldForCert(f);
    }
  };

  return (
    <div className="farmer-surface farmer-verification flex flex-col gap-6 max-w-6xl mx-auto p-2">
      {/* Top Banner: The Money Shot Pitch Framing */}
      <div className="glass-panel-emerald p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white font-['Outfit']">
                  Check field proof
                </h3>
                <span className="badge badge-emerald text-xs">
                  {demoMode ? 'Synthetic observation demo' : auditReport.dataAvailability === 'NO_OBSERVATIONS' ? 'Awaiting observations' : 'Observation review'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                We intersect registered field polygons with available remote-sensing observations and operational evidence. A missing detection is not absolute proof of no burning, and impact or registry claims remain gated by methodology and verification.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/40 px-4 py-3 rounded-xl flex items-center gap-3 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fields checked</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {auditReport.complianceRate}%
              </div>
            </div>
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        {/* Real NASA FIRMS Geospatial Thermal Sensor Visual */}
        <div className="mt-4 rounded-xl overflow-hidden border border-emerald-500/30 relative max-h-56 bg-slate-950">
          <img 
            src="/images/satellite_firms.jpg" 
            alt="Remote-sensing evidence illustration"
            className="w-full h-52 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                NASA FIRMS S-NPP / NOAA-20 VIIRS 375m NRT SENSOR
              </span>
              <p className="text-xs font-bold text-white mt-1">
                {auditReport.dataAvailability === 'NO_OBSERVATIONS' ? 'No remote-sensing observations are currently available for field screening' : `Matched ${auditReport.cleanFieldsCount} field(s) without a detected fire point in the supplied observations`}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-emerald-400 font-bold block">{demoMode ? 'Synthetic demo only' : auditReport.dataAvailability === 'NO_OBSERVATIONS' ? 'No observations available' : 'Supporting evidence only'}</span>
              <span className="text-[10px] text-slate-400">No registry issuance</span>
            </div>
          </div>
        </div>
      </div>

      <section className="evidence-language" aria-label="Evidence language">
        <div><b>Observed</b><span>What the system actually saw</span></div>
        <div><b>Verified</b><span>What an authorized review confirmed</span></div>
        <div><b>Calculated</b><span>Derived from recorded inputs</span></div>
        <div><b>Estimated</b><span>Planning value, not a measured outcome</span></div>
      </section>

      {/* 4 Quantitative Proof Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-panel p-4 border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fire points in this field</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {auditReport.firesInRegisteredFields}{' '}
            <span className="text-xs text-emerald-300 font-normal">fire points</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-1 font-semibold">
            No-fire observations do not equal absolute non-burn proof
          </p>
        </div>

        <div className="glass-panel p-4 border-red-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Nearby fire points</span>
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 font-mono">
            {auditReport.firesInSurroundingBuffer}{' '}
            <span className="text-xs text-slate-400 font-normal">fire points</span>
          </div>
          <p className="text-[11px] text-red-400/90 mt-1 font-semibold">
            {demoMode ? 'Synthetic demo observations' : 'Only provider-returned observations are shown'}
          </p>
        </div>

        <div className="glass-panel p-4 border-cyan-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Estimated emissions avoided</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {auditReport.co2eAvoided}{' '}
            <span className="text-xs text-slate-400 font-normal">t CO₂e</span>
          </div>
          <p className="text-[11px] text-cyan-400/90 mt-1 font-semibold">
            + {auditReport.pm25Prevented === 0 ? 'Not calculated' : `${auditReport.pm25Prevented} kg PM2.5 prevented`}
          </p>
        </div>

        <div className="glass-panel p-4 border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Carbon credit</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {auditReport.carbonCreditValueInr === 0 ? '—' : `₹${auditReport.carbonCreditValueInr.toLocaleString()}`}
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1 font-semibold">
            Not available in this version
          </p>
        </div>
      </div>

      {/* Spatial Audit Table */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-white">
              Field proof records
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            {demoMode ? 'Synthetic observation stream' : 'Provider observations only when configured'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Khasra #</th>
                <th className="py-2.5 px-3">Farmer & Village</th>
                <th className="py-2.5 px-3">Acreage</th>
                <th className="py-2.5 px-3">FIRMS Fires In Polygon</th>
                <th className="py-2.5 px-3">Field & satellite proof</th>
                <th className="py-2.5 px-3">What we found</th>
                <th className="py-2.5 px-3 text-right">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {fields.map((field) => {
                return (
                  <tr key={field.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-white font-mono">
                      {field.khasra_no}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{field.farmer_name}</div>
                      <div className="text-[11px] text-slate-400">{field.village}, {field.block}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {field.acreage} ac
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{auditReport.dataAvailability === 'NO_OBSERVATIONS' ? 'Not assessed' : `${auditReport.auditResults.find((result) => result.fieldId === field.id)?.firesInsideCount ?? 0} fire point(s)`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-cyan-300">{demoMode ? 'Illustrative' : 'Not available'}</span>
                      <span className="text-[10px] text-slate-500 block">{demoMode ? 'Synthetic demo value' : 'Awaiting evidence'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="badge badge-emerald text-[10px]">
                        {demoMode ? 'DEMO / ILLUSTRATIVE' : field.status === 'VERIFIED_NON_BURN' ? 'INTERNAL VERIFIED' : 'NOT VERIFIED'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(field.status === 'CLEARED_PENDING_AUDIT' || demoMode) && field.status !== 'VERIFIED_NON_BURN' && (
                          <button
                            onClick={() => void handleVerify(field)}
                            disabled={reviewingFieldId === field.id}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold border border-emerald-500 transition-all"
                          >
                            {reviewingFieldId === field.id ? 'Reviewing…' : 'Confirm field proof'}
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenRecord(field.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                        >
                          See record
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reviewMessage && <div role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">{reviewMessage}</div>}

      {/* The 4 Inputs Architecture Diagram for Judges */}
      <div className="glass-panel p-4 bg-slate-950/60 flex flex-col gap-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>How we check a field</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">1. Field boundary</div>
            <p className="text-slate-400 text-[11px]">
              We keep the field boundary source and its verification status. A hand-drawn boundary is not treated as official land-record proof.
            </p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">2. Satellite check</div>
            <p className="text-slate-400 text-[11px]">
              Satellite observations are supporting evidence. They do not by themselves prove that no burning happened.
            </p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">3. Pickup & weight proof</div>
            <p className="text-slate-400 text-[11px]">
              Photos, pickup records and weight records can be linked when they are available.
            </p>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">4. Payment status</div>
            <p className="text-slate-400 text-[11px]">
              Payment is not connected in this release, so we never show a payment as completed when it is not.
            </p>
          </div>
        </div>
      </div>

      {/* Record Modal */}
      {selectedFieldForCert && (
        <CarbonRecord
          certificate={generateNonBurnRecord(selectedFieldForCert)}
          onClose={() => setSelectedFieldForCert(null)}
        />
      )}
    </div>
  );
};
