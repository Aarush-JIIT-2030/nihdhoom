import type {
  Buyer,
  BuyerDemandCoverage,
  Field,
  Machine,
  MachineCapacityRecommendation,
  ResidueException,
  ResidueLot,
  ResidueOperationPriority,
  ResidueOperationSummary,
  StorageYard,
} from '../types';

const MS_HOUR = 60 * 60 * 1000;

export function hoursUntil(value?: string | null, now = Date.now()): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  return (time - now) / MS_HOUR;
}

export function harvestPressure(field: Field, now = Date.now()): ResidueOperationPriority {
  const deadlineHours = hoursUntil(field.clearance_deadline, now);
  const harvestHours = hoursUntil(field.expected_harvest_date, now);
  if (deadlineHours !== null && deadlineHours <= 24 && deadlineHours >= -48) return 'CRITICAL';
  if (deadlineHours !== null && deadlineHours <= 48) return 'HIGH';
  if (harvestHours !== null && harvestHours <= 48) return 'HIGH';
  if (field.status === 'BALING_IN_PROGRESS' || field.status === 'ON_THE_WAY') return 'HIGH';
  if (field.status === 'REGISTERED') return 'WATCH';
  return 'NORMAL';
}

export function estimatedResidueTonnes(field: Field, lot?: ResidueLot | null): number {
  const direct = Number(lot?.verified_quantity_tonnes ?? lot?.quantity_tonnes ?? lot?.estimated_quantity_tonnes);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const acreage = Number(field.acreage) || 0;
  // Planning estimate only; never presented as a verified measurement.
  return Number((acreage * 2.1).toFixed(1));
}

function distanceKm(a?: { lat: number; lng: number }, b?: { lat: number; lng: number }): number | null {
  if (!a || !b) return null;
  const r = Math.PI / 180, p1 = a.lat * r, p2 = b.lat * r;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dLng/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

export function machineRecommendations(fields: Field[], machines: Machine[], now = Date.now()): MachineCapacityRecommendation[] {
  const out: MachineCapacityRecommendation[] = [];
  for (const field of fields) {
    const pressure = harvestPressure(field, now);
    if (pressure === 'NORMAL') continue;
    const candidates = machines.filter((machine) => machine.status !== 'MAINTENANCE').map((machine) => {
      const assigned = machine.assigned_field_ids?.length ?? 0;
      const loadPenalty = assigned * 10;
      const distance = distanceKm(machine.current_location, field.center);
      const distancePenalty = distance === null ? 12 : Math.min(35, distance * 1.2);
      const residueFit = !machine.residue_types?.length || machine.residue_types.includes('PADDY_STRAW') ? 0 : 35;
      const hpPenalty = machine.tractor_hp_required && machine.tractor_hp_required > 0 ? 0 : 8;
      const capacityBonus = Math.min(30, Math.max(0, Number(machine.capacity_acres_day || 0) - 12));
      const statusBonus = machine.status === 'IDLE' ? 32 : machine.status === 'EN_ROUTE' ? 12 : 0;
      const score = Math.max(0, 100 + statusBonus + capacityBonus - loadPenalty - distancePenalty - residueFit - hpPenalty);
      const distanceNote = distance === null ? 'distance unavailable' : distance.toFixed(1) + ' km from field';
      return {
        machine_id: machine.id, field_id: field.id, score,
        reason: residueFit > 0 ? 'Capability does not explicitly list paddy straw; verify attachment before assignment.' : (machine.status === 'IDLE' ? 'Idle compatible capacity; ' + distanceNote + '.' : 'Available compatible machine; ' + distanceNote + '.'),
        capacity_acres_day: machine.capacity_acres_day, available: machine.status !== 'MAINTENANCE',
      };
    }).sort((x, y) => y.score - x.score);
    if (candidates[0]) out.push(candidates[0]);
  }
  return out;
}

export function buildResidueExceptions(
  fields: Field[],
  machines: Machine[],
  yards: StorageYard[],
  lots: ResidueLot[] = [],
  now = Date.now(),
): ResidueException[] {
  const exceptions: ResidueException[] = [];
  fields.forEach((field) => {
    const pressure = harvestPressure(field, now);
    const deadline = hoursUntil(field.clearance_deadline, now);
    const assigned = Boolean(field.assigned_machine_id);
    if (deadline !== null && deadline < 0 && !['CLEARED_PENDING_AUDIT', 'VERIFIED_NON_BURN'].includes(field.status)) {
      exceptions.push({
        id: `overdue-${field.id}`, severity: 'CRITICAL', kind: 'PICKUP_OVERDUE',
        title: 'Pickup deadline passed', detail: `${field.id} is ${Math.abs(Math.round(deadline))}h beyond its clearance deadline.`,
        field_id: field.id, action: 'Assign the nearest available machine and contact the farmer.',
      });
    } else if ((pressure === 'CRITICAL' || pressure === 'HIGH') && !assigned) {
      exceptions.push({
        id: `machine-${field.id}`, severity: pressure === 'CRITICAL' ? 'CRITICAL' : 'HIGH', kind: 'MACHINE_SHORTFALL',
        title: 'Field has no machine assignment', detail: `${field.id} is under ${pressure.toLowerCase()} harvest pressure without a machine.`,
        field_id: field.id, action: 'Open machine capacity and assign a compatible baler.',
      });
    }
  });

  machines.forEach((machine) => {
    if (machine.status !== 'MAINTENANCE' && machine.assigned_field_ids?.length && machine.current_location && machine.current_location.lat === 0 && machine.current_location.lng === 0) {
      exceptions.push({
        id: `gps-${machine.id}`, severity: 'WATCH', kind: 'STALE_GPS',
        title: 'Machine location unavailable', detail: `${machine.name} has no usable current position.`,
        machine_id: machine.id, action: 'Refresh operator GPS before dispatching.',
      });
    }
  });

  const unweighed = lots.filter((lot) => !Number(lot.verified_quantity_tonnes ?? 0) && ['AVAILABLE', 'VERIFIED'].includes(lot.status));
  if (unweighed.length) {
    exceptions.push({
      id: 'unweighed-lots', severity: 'HIGH', kind: 'UNWEIGHED_LOT',
      title: 'Residue lots awaiting weighment', detail: `${unweighed.length} lot(s) have no verified weight.`,
      action: 'Complete operator weighment before buyer commitment.',
    });
  }

  yards.forEach((yard) => {
    const incoming = Number(yard.incoming_tonnes || 0);
    const projected = Number(yard.current_load || 0) + incoming;
    const capacity = Number(yard.capacity_tonnes || 0);
    if (capacity > 0 && projected / capacity >= 0.8) {
      exceptions.push({
        id: `yard-${yard.id}`, severity: projected >= capacity ? 'CRITICAL' : 'WATCH', kind: 'YARD_CAPACITY',
        title: projected >= capacity ? 'Yard capacity exceeded' : 'Yard nearing capacity',
        detail: `${yard.name} projects to ${Math.round((projected / capacity) * 100)}% occupancy.`,
        action: 'Route new residue to an alternate yard or direct offtake.',
      });
    }
  });
  return exceptions;
}

export function buildDemandCoverage(buyers: Buyer[], lots: ResidueLot[] = []): BuyerDemandCoverage[] {
  return buyers.map((buyer) => {
    const required = Number(buyer.demand_tonnes || 0);
    const verified = lots.filter((lot) => lot.assigned_buyer_id === buyer.id).reduce((sum, lot) => sum + Number(lot.verified_quantity_tonnes || 0), 0);
    const committed = Math.min(required, verified);
    const coverage = required > 0 ? Math.round((verified / required) * 100) : 0;
    return { buyer_id: buyer.id, buyer_name: buyer.name, required_tonnes: required, committed_tonnes: committed, verified_tonnes: verified, delivered_tonnes: 0, coverage_pct: coverage, status: coverage >= 90 ? 'COVERED' : coverage >= 60 ? 'WATCH' : 'OPEN' };
  });
}

export function buildResidueSummary(fields: Field[], machines: Machine[], buyers: Buyer[], yards: StorageYard[], lots: ResidueLot[] = [], now = Date.now()): ResidueOperationSummary {
  const ready = lots.length
    ? lots.reduce((sum, lot) => { const field = fields.find((f) => f.residue_lot_id === lot.id); return sum + (field ? estimatedResidueTonnes(field, lot) : Number(lot.verified_quantity_tonnes ?? lot.quantity_tonnes ?? lot.estimated_quantity_tonnes ?? 0)); }, 0)
    : fields.filter((f) => ['SCHEDULED', 'MACHINE_ASSIGNED', 'ON_THE_WAY', 'BALING_IN_PROGRESS'].includes(f.status)).reduce((sum, f) => sum + estimatedResidueTonnes(f), 0);
  const verified = lots.reduce((sum, lot) => sum + Number(lot.verified_quantity_tonnes || 0), 0);
  const demand = buyers.reduce((sum, buyer) => sum + Number(buyer.demand_tonnes || 0), 0);
  const exceptions = buildResidueExceptions(fields, machines, yards, lots, now);
  const coverage = demand > 0 ? Math.min(100, Math.round((verified / demand) * 100)) : 0;
  return {
    ready_tonnes: Number(ready.toFixed(1)),
    verified_tonnes: Number(verified.toFixed(1)),
    demand_tonnes: Number(demand.toFixed(1)),
    demand_coverage_pct: coverage,
    machine_capacity_acres_day: machines.filter((m) => m.status !== 'MAINTENANCE').reduce((sum, m) => sum + Number(m.capacity_acres_day || 0), 0),
    fields_at_risk: fields.filter((f) => ['CRITICAL', 'HIGH'].includes(harvestPressure(f, now))).length,
    exceptions,
  };
}
