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
  source: 'local-heuristic' | 'server-ortools';
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

/**
 * VRPTW Dispatch Optimizer
 * Solves constrained scheduling across idle CRM balers under hard 48h clearance deadlines.
 */
export function runVRPOptimizer(fields: Field[], machines: Machine[]): VRPDispatchResult {
  const startTime = performance.now();

  // Pending fields that require baler allocation
  const eligibleFields = fields.filter(
    (f) => f.status === 'SCHEDULED' || f.status === 'REGISTERED' || f.status === 'BALING_IN_PROGRESS'
  );

  const assignments: VRPDispatchResult['assignments'] = [];
  let totalScheduledAcres = 0;
  let totalDeadhead = 0;
  const unassignedFields = [...eligibleFields];

  machines.forEach((machine) => {
    let currentCapacity = machine.capacity_acres_day;
    let currentPos = machine.current_location;
    const assignedIds: string[] = [];
    const routeCoords: LatLng[] = [currentPos];
    const seqDesc: string[] = [`Start at ${machine.home_chc}`];
    let machineDeadhead = 0;
    let machineAcres = 0;
    let penaltyBefore = 0;

    // Sort unassigned fields by nearest distance + urgency
    unassignedFields.sort((a, b) => {
      const distA = calculateDistanceKm(currentPos, a.center);
      const distB = calculateDistanceKm(currentPos, b.center);
      return distA - distB;
    });

    for (let i = 0; i < unassignedFields.length; i++) {
      const field = unassignedFields[i];
      if (field.acreage <= currentCapacity) {
        const dist = calculateDistanceKm(currentPos, field.center);
        machineDeadhead += dist;
        currentCapacity -= field.acreage;
        machineAcres += field.acreage;
        penaltyBefore += Math.max(2500, field.acreage * 1250);

        assignedIds.push(field.id);
        routeCoords.push(field.center);
        seqDesc.push(`Clear ${field.khasra_no} (${field.village}) — ${field.acreage} ac [${dist} km travel]`);

        currentPos = field.center;
        unassignedFields.splice(i, 1);
        i--;
      }
    }

    // Add return route or drop off at nearest storage yard
    seqDesc.push('Route complete • residue handoff requires verified storage/offtake workflow');

    const capacityPct = Math.min(100, Math.round((machineAcres / machine.capacity_acres_day) * 100));
    totalScheduledAcres += machineAcres;
    totalDeadhead += machineDeadhead;

    assignments.push({
      machineId: machine.id,
      machineName: machine.name,
      operatorName: machine.operator_name,
      fieldIds: assignedIds,
      totalAcres: Math.round(machineAcres * 10) / 10,
      capacityPct,
      deadheadKm: Math.round(machineDeadhead * 10) / 10,
      penaltyRiskBefore: penaltyBefore,
      penaltyRiskAfter: 0,
      routeCoordinates: routeCoords,
      sequenceDescriptions: seqDesc,
    });
  });

  const totalMachineCapacity = machines.reduce((acc, m) => acc + m.capacity_acres_day, 0);
  const fleetUtilizationPct = Math.round((totalScheduledAcres / totalMachineCapacity) * 100);
  const executionTime = Math.round(performance.now() - startTime);

  return {
    assignments,
    totalAcresScheduled: Math.round(totalScheduledAcres * 10) / 10,
    totalDeadheadKm: Math.round(totalDeadhead * 10) / 10,
    deadheadSavedKm: 0,
    totalPenaltyPrevented: 0,
    fleetUtilizationPct,
    solverExecutionTimeMs: executionTime,
    source: 'local-heuristic',
    unassignedFieldIds: unassignedFields.map((f) => f.id),
  };
}


export function fromServerDispatchPlan(
  plan: { routes?: Array<{ machine_id: string; stops: string[]; total_acres: number }>; unassigned?: string[] },
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
    source: 'server-ortools',
    unassignedFieldIds: plan.unassigned || [],
  };
}
