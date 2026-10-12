import { Field, Machine, LatLng } from '../types';

export interface VRPDispatchResult {
  assignments: {
    machineId: string;
    machineName: string;
    operatorName: string;
    fieldIds: string[];
    totalAcres: number;
    capacityPct: number;
    deadheadKm: number;
    penaltyRiskBefore: number;
    penaltyRiskAfter: number;
    routeCoordinates: LatLng[];
    sequenceDescriptions: string[];
  }[];
  totalAcresScheduled: number;
  totalDeadheadKm: number;
  deadheadSavedKm: number;
  totalPenaltyPrevented: number;
  fleetUtilizationPct: number;
  solverExecutionTimeMs: number;
  source: 'local-heuristic' | 'server-ortools' | 'server-fallback';
  unassignedFieldIds: string[];
}

// Calculate Haversine distance in km between two geo-coordinates
export function calculateDistanceKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLng = Math.sin(dLng / 2);
  const cosLat1 = Math.cos((a.lat * Math.PI) / 180);
  const cosLat2 = Math.cos((b.lat * Math.PI) / 180);

  const aVal =
    sinHalfLat * sinHalfLat +
    cosLat1 * cosLat2 * sinHalfLng * sinHalfLng;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return Math.round(R * c * 10) / 10;
}

/** A machine further than this from a field is not offered the work (one operating day's travel). */
const MAX_DEADHEAD_KM = 120;

/**
 * Local dispatch heuristic (planning estimate only; the server solver is used when connected).
 * Fields are taken in order of clearance deadline and given to the nearest machine that still has
 * capacity for them. Each machine then visits its fields nearest-first. Machines that are baling,
 * in maintenance, or have no spare capacity are not offered new work.
 */
export function runVRPOptimizer(fields: Field[], machines: Machine[]): VRPDispatchResult {
  const startTime = performance.now();

  // Pending fields that still need a machine
  const eligibleFields = fields
    .filter((f) => f.status === 'SCHEDULED' || f.status === 'REGISTERED' || f.status === 'BOOKED')
    .sort((a, b) => String(a.clearance_deadline).localeCompare(String(b.clearance_deadline)) || b.acreage - a.acreage);

  const fieldById = new Map(fields.map((f) => [f.id, f]));
  const dispatchable = machines.filter((m) => m.status === 'IDLE' || m.status === 'EN_ROUTE');

  type Plan = { machine: Machine; remaining: number; stops: Field[]; end: LatLng };
  const plans: Plan[] = dispatchable.map((machine) => {
    // A machine already heading to a field has that field's acres committed first.
    const committed = (machine.assigned_field_ids || []).reduce((sum, id) => {
      const f = fieldById.get(id);
      return f && f.status !== 'SCHEDULED' ? sum + f.acreage : sum;
    }, 0);
    return { machine, remaining: Math.max(0, machine.capacity_acres_day - committed), stops: [], end: machine.current_location };
  });

  const unassigned: Field[] = [];
  eligibleFields.forEach((field) => {
    let best: Plan | null = null;
    let bestDist = Infinity;
    plans.forEach((plan) => {
      if (plan.remaining < field.acreage) return;
      const dist = calculateDistanceKm(plan.end, field.center);
      if (dist <= MAX_DEADHEAD_KM && dist < bestDist) { best = plan; bestDist = dist; }
    });
    if (best) {
      const chosen = best as Plan;
      chosen.stops.push(field);
      chosen.remaining -= field.acreage;
      chosen.end = field.center;
    } else {
      unassigned.push(field);
    }
  });

  const assignments: VRPDispatchResult['assignments'] = [];
  let totalScheduledAcres = 0;
  let totalDeadhead = 0;
  let totalBaseline = 0;
  let totalPenaltyPrevented = 0;

  plans.filter((plan) => plan.stops.length > 0).forEach(({ machine, stops }) => {
    // Visit the nearest field first, then keep going to the nearest remaining one.
    const ordered: Field[] = [];
    const pool = [...stops];
    let pos = machine.current_location;
    while (pool.length) {
      pool.sort((a, b) => calculateDistanceKm(pos, a.center) - calculateDistanceKm(pos, b.center));
      const next = pool.shift() as Field;
      ordered.push(next);
      pos = next.center;
    }

    const routeCoords: LatLng[] = [machine.current_location];
    const seqDesc: string[] = [`Start at ${machine.home_chc}`];
    let cursor = machine.current_location;
    let machineDeadhead = 0;
    let machineAcres = 0;
    let penaltyBefore = 0;
    ordered.forEach((field) => {
      const dist = calculateDistanceKm(cursor, field.center);
      machineDeadhead += dist;
      machineAcres += field.acreage;
      penaltyBefore += Math.max(2500, field.acreage * 1250);
      totalBaseline += calculateDistanceKm(machine.current_location, field.center);
      routeCoords.push(field.center);
      seqDesc.push(`Clear ${field.khasra_no} (${field.village}) — ${field.acreage} ac [${dist} km travel]`);
      cursor = field.center;
    });
    seqDesc.push('Route complete • residue handoff requires verified storage/offtake workflow');

    totalScheduledAcres += machineAcres;
    totalDeadhead += machineDeadhead;
    totalPenaltyPrevented += penaltyBefore;

    assignments.push({
      machineId: machine.id,
      machineName: machine.name,
      operatorName: machine.operator_name,
      fieldIds: ordered.map((f) => f.id),
      totalAcres: Math.round(machineAcres * 10) / 10,
      capacityPct: machine.capacity_acres_day > 0 ? Math.min(100, Math.round((machineAcres / machine.capacity_acres_day) * 100)) : 0,
      deadheadKm: Math.round(machineDeadhead * 10) / 10,
      penaltyRiskBefore: penaltyBefore,
      penaltyRiskAfter: 0,
      routeCoordinates: routeCoords,
      sequenceDescriptions: seqDesc,
    });
  });

  const totalMachineCapacity = dispatchable.reduce((acc, m) => acc + m.capacity_acres_day, 0);
  const fleetUtilizationPct = totalMachineCapacity > 0 ? Math.round((totalScheduledAcres / totalMachineCapacity) * 100) : 0;
  const executionTime = Math.max(1, Math.round(performance.now() - startTime));

  return {
    assignments,
    totalAcresScheduled: Math.round(totalScheduledAcres * 10) / 10,
    totalDeadheadKm: Math.round(totalDeadhead * 10) / 10,
    // Compared with sending a machine out to each field separately from where it starts.
    deadheadSavedKm: Math.round(Math.max(0, totalBaseline - totalDeadhead) * 10) / 10,
    totalPenaltyPrevented,
    fleetUtilizationPct,
    solverExecutionTimeMs: executionTime,
    source: 'local-heuristic',
    unassignedFieldIds: unassigned.map((f) => f.id),
  };
}


export function fromServerDispatchPlan(
  plan: { routes?: Array<{ machine_id: string; stops: string[]; total_acres: number }>; unassigned?: string[]; unassigned_field_ids?: string[] },
  fields: Field[],
  machines: Machine[],
  executionTimeMs: number,
): VRPDispatchResult {
  const assignments = (plan.routes || []).map((route) => {
    const machine = machines.find((m) => m.id === route.machine_id);
    if (!machine) return null;
    const routeFields = (route.stops || []).map((id) => fields.find((f) => f.id === id)).filter(Boolean) as Field[];
    const routeCoordinates = [machine.current_location, ...routeFields.map((f) => f.center)];
    const deadheadKm = routeCoordinates.slice(1).reduce(
      (sum, point, index) => sum + calculateDistanceKm(routeCoordinates[index], point),
      0,
    );
    return {
      machineId: machine.id,
      machineName: machine.name,
      operatorName: machine.operator_name,
      fieldIds: routeFields.map((f) => f.id),
      totalAcres: Math.round(Number(route.total_acres || 0) * 10) / 10,
      capacityPct: machine.capacity_acres_day > 0
        ? Math.min(100, Math.round((Number(route.total_acres || 0) / machine.capacity_acres_day) * 100))
        : 0,
      deadheadKm: Math.round(deadheadKm * 10) / 10,
      penaltyRiskBefore: 0,
      penaltyRiskAfter: 0,
      routeCoordinates,
      sequenceDescriptions: routeFields.map((f, index) =>
        `${index + 1}. Clear ${f.khasra_no || f.id} (${f.village}) — ${f.acreage} ac`,
      ),
    };
  }).filter(Boolean) as VRPDispatchResult['assignments'];

  const totalAcresScheduled = assignments.reduce((sum, a) => sum + a.totalAcres, 0);
  const totalDeadheadKm = assignments.reduce((sum, a) => sum + a.deadheadKm, 0);
  const totalCapacity = machines.reduce((sum, m) => sum + Math.max(0, m.capacity_acres_day), 0);

  return {
    assignments,
    totalAcresScheduled: Math.round(totalAcresScheduled * 10) / 10,
    totalDeadheadKm: Math.round(totalDeadheadKm * 10) / 10,
    deadheadSavedKm: 0,
    totalPenaltyPrevented: 0,
    fleetUtilizationPct: totalCapacity > 0 ? Math.round((totalAcresScheduled / totalCapacity) * 100) : 0,
    solverExecutionTimeMs: executionTimeMs,
    source: plan.unassigned ? 'server-ortools' : 'server-fallback',
    unassignedFieldIds: plan.unassigned ?? plan.unassigned_field_ids ?? [],
  };
}
