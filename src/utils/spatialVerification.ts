import { Field, BurnEvent, NonBurnCertificate, LatLng } from '../types';

/**
 * Standard Ray-casting algorithm to test whether a LatLng point is inside a polygon
 */
export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Executes ST_Contains spatial audit across registered customer fields against NASA FIRMS VIIRS fire points
 */
export function executeFirmsAudit(fields: Field[], fireEvents: BurnEvent[]) {
  const hasRemoteSensingData = fireEvents.length > 0;

  const auditResults = fields.map((field) => {
    const intersectingFires = fireEvents.filter((fire) =>
      Array.isArray(field.geometry) && field.geometry.length >= 3 &&
      isPointInPolygon(fire.firms_point, field.geometry)
    );

    const auditPassed = hasRemoteSensingData && intersectingFires.length === 0;
    return {
      fieldId: field.id,
      khasraNo: field.khasra_no,
      village: field.village,
      acreage: field.acreage,
      status: !hasRemoteSensingData
        ? 'NOT_ASSESSED'
        : auditPassed
          ? 'NO_FIRE_DETECTED_IN_PROVIDED_OBSERVATIONS'
          : 'FIRE_DETECTED_ANOMALY',
      firesInsideCount: intersectingFires.length,
      neighboringFiresNearby: fireEvents.length,
      auditPassed,
    };
  });

  const totalRegisteredAcres = fields.reduce((acc, f) => acc + Number(f.acreage || 0), 0);
  const cleanAcres = auditResults
    .filter((r) => r.auditPassed)
    .reduce((acc, r) => acc + Number(r.acreage || 0), 0);
  const complianceRate = hasRemoteSensingData && totalRegisteredAcres > 0
    ? Math.round((cleanAcres / totalRegisteredAcres) * 100)
    : 0;

  return {
    auditResults,
    totalFieldsAudited: fields.length,
    cleanFieldsCount: auditResults.filter((r) => r.auditPassed).length,
    firesInRegisteredFields: auditResults.reduce((acc, r) => acc + r.firesInsideCount, 0),
    firesInSurroundingBuffer: fireEvents.length,
    complianceRate,
    co2eAvoided: 0,
    pm25Prevented: 0,
    methanePrevented: 0,
    carbonCreditValueInr: 0,
    dataAvailability: hasRemoteSensingData ? 'OBSERVATIONS_PRESENT' : 'NO_OBSERVATIONS',
    limitation: 'Remote-sensing observations are supporting evidence, not absolute proof of field-level non-burning. Impact and registry claims require a versioned methodology and complete operational evidence.',
  };
}

/**
 * Generates an internal illustrative verification record; it is not a registry or Verra certificate
 */
export function generateNonBurnCertificate(field: Field): NonBurnCertificate {
  return {
    certificate_id: `DEMO-VERIFY-${field.id}`,
    field_id: field.id,
    farmer_name: field.farmer_name,
    khasra_no: field.khasra_no,
    village: field.village,
    block: field.block,
    district: field.district,
    acreage: field.acreage,
    paddy_variety: field.paddy_variety,
    clearance_timestamp: new Date().toISOString(),
    firms_audit_pass: false,
    firms_fires_detected_in_polygon: 0,
    firms_buffer_meters: 0,
    ndvi_pre_harvest: 0,
    ndvi_post_clearance: 0,
    co2e_avoided_tonnes: 0,
    pm25_prevented_kg: 0,
    methane_prevented_kg: 0,
    carbon_credit_value_inr: 0,
    sha256_hash: 'NOT_A_CRYPTOGRAPHIC_CERTIFICATE',
    issued_at: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    verra_vm0042_eligible: false,
    certificate_status: 'ILLUSTRATIVE_DEMO',
  };
}
