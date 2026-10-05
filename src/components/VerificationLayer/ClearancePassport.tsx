import React, { useMemo } from 'react';
import { CheckCircle2, Clock3, FileCheck2, MapPin, PackageCheck, ShieldCheck, Tractor } from 'lucide-react';
import { Field, Machine } from '../../types';

interface ClearancePassportProps {
  field: Field | null;
  machine?: Machine;
  demoMode: boolean;
}

const checkpoints = [
  ['Field identity', 'Registered field and visible boundary'],
  ['Booking', 'Farmer request and clearance window'],
  ['Machine work', 'Operator/job state and GPS evidence'],
  ['Field proof', 'Photos and verification review'],
  ['Residue handoff', 'Lot/pooling pathway after clearance'],
] as const;

export function ClearancePassport({ field, machine, demoMode }: ClearancePassportProps) {
  const state = useMemo(() => {
    if (!field) return { label: 'No field selected', tone: 'muted' };
    if (field.status === 'VERIFIED_NON_BURN' || field.is_verified_non_burn) return { label: 'Internally verified', tone: 'good' };
    if (field.status === 'CLEARED_PENDING_AUDIT') return { label: 'Awaiting verification', tone: 'warn' };
    if (field.status === 'BALING_IN_PROGRESS') return { label: 'Work in progress', tone: 'warn' };
    return { label: 'Workflow record', tone: 'muted' };
  }, [field]);

  if (!field) return null;

  return (
    <section className="clearance-passport" aria-labelledby="clearance-passport-title">
      <div className="clearance-passport-head">
        <div>
          <div className="clearance-passport-kicker"><ShieldCheck className="h-4 w-4" /> TRUST ARTIFACT</div>
          <h3 id="clearance-passport-title">Field Clearance Passport</h3>
          <p>One readable record connecting the field, machine work, evidence and residue pathway.</p>
        </div>
        <span className={'clearance-passport-state is-' + state.tone}>{state.label}</span>
      </div>

      <div className="clearance-passport-grid">
        <div className="clearance-passport-summary">
          <div><span>Field</span><strong>{field.id}</strong></div>
          <div><span>Khasra</span><strong>{field.khasra_no}</strong></div>
          <div><span>Area</span><strong>{field.acreage} acres</strong></div>
          <div><span>Village</span><strong>{field.village}</strong></div>
        </div>

        <div className="clearance-passport-chain">
          {checkpoints.map(([title, detail], index) => {
            const complete = index === 0
              ? true
              : index === 1
                ? ['BOOKED', 'MACHINE_ASSIGNED', 'ON_THE_WAY', 'SCHEDULED', 'BALING_IN_PROGRESS', 'CLEARED_PENDING_AUDIT', 'VERIFIED_NON_BURN'].includes(field.status)
                : index === 2
                  ? Boolean(machine || field.assigned_machine_id)
                  : index === 3
                    ? Boolean(field.status === 'CLEARED_PENDING_AUDIT' || field.status === 'VERIFIED_NON_BURN' || field.is_verified_non_burn)
                    : Boolean(field.residue_lot_id);

            return (
              <div className={'clearance-passport-step ' + (complete ? 'is-complete' : '')} key={title}>
                <span className="clearance-passport-step-icon">
                  {complete ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                </span>
                <div>
                  <strong>{index + 1}. {title}</strong>
                  <span>{detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="clearance-passport-footer">
        <span><MapPin className="h-3.5 w-3.5" /> GPS/evidence remains tied to the operator workflow</span>
        <span><Tractor className="h-3.5 w-3.5" /> {machine?.name || field.assigned_machine_id || 'Machine assignment pending'}</span>
        <span><PackageCheck className="h-3.5 w-3.5" /> {field.residue_lot_id ? 'Residue lot linked' : 'Residue handoff pending'}</span>
      </div>

      <div className="clearance-passport-note">
        <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
        <span>{demoMode ? 'Illustrative demo artifact — not a legal certificate, carbon credit or payment receipt.' : 'Operational record only — verification claims require the evidence available for this field.'}</span>
      </div>
    </section>
  );
}
