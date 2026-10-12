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
 * Illustrative emission factors per tonne of paddy straw that is NOT burned. Rounded values from the
 * published open-field-burning literature (CO2 ~1.46 t, CH4 ~2.7 kg, PM2.5 ~8.3 kg per tonne of straw);
 * they size a sample estimate only and are not a registry methodology. Never used outside sample mode.
 */
export const ILLUSTRATIVE_FACTORS = { co2eTonnesPerTonne: 1.54, pm25KgPerTonne: 8.3, methaneKgPerTonne: 2.7, strawTonnesPerAcre: 2.4 } as const;

const kmBetween = (a: LatLng, b: LatLng) =>
  Math.hypot((a.lat - b.lat) * 111.32, (a.lng - b.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180));

export function illustrativeImpact(acres: number) {
  const straw = Math.max(0, acres) * ILLUSTRATIVE_FACTORS.strawTonnesPerAcre;
  return {
    strawTonnes: Math.round(straw * 10) / 10,
    co2e: Math.round(straw * ILLUSTRATIVE_FACTORS.co2eTonnesPerTonne * 10) / 10,
    pm25: Math.round(straw * ILLUSTRATIVE_FACTORS.pm25KgPerTonne),
    methane: Math.round(straw * ILLUSTRATIVE_FACTORS.methaneKgPerTonne),
  };
}

/**
 * Executes ST_Contains spatial audit across registered customer fields against NASA FIRMS VIIRS fire points
 */
export function executeFirmsAudit(fields: Field[], fireEvents: BurnEvent[], options: { illustrative?: boolean } = {}) {
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
      firesWithin1km: fireEvents.filter((fire) => kmBetween(fire.firms_point, field.center) <= 1).length,
      firesWithin5km: fireEvents.filter((fire) => kmBetween(fire.firms_point, field.center) <= 5).length,
      neighboringFiresNearby: fireEvents.filter((fire) => kmBetween(fire.firms_point, field.center) <= 5).length,
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

  // Sample estimate: straw that has actually been cleared (cleared or verified fields) and not burned.
  const impact = options.illustrative
    ? illustrativeImpact(fields
        .filter((f) => f.status === 'CLEARED_PENDING_AUDIT' || f.status === 'VERIFIED_NON_BURN')
        .reduce((sum, f) => sum + Number(f.acreage || 0), 0))
    : null;

  return {
    auditResults,
    totalFieldsAudited: fields.length,
    cleanFieldsCount: auditResults.filter((r) => r.auditPassed).length,
    firesInRegisteredFields: auditResults.reduce((acc, r) => acc + r.firesInsideCount, 0),
    firesInSurroundingBuffer: fireEvents.length,
    complianceRate,
    co2eAvoided: impact?.co2e ?? 0,
    pm25Prevented: impact?.pm25 ?? 0,
    methanePrevented: impact?.methane ?? 0,
    strawClearedTonnes: impact?.strawTonnes ?? 0,
    // Carbon value is never estimated: registry, pricing and issuance are not connected.
    carbonCreditValueInr: 0,
    dataAvailability: hasRemoteSensingData ? 'OBSERVATIONS_PRESENT' : 'NO_OBSERVATIONS',
    limitation: 'Remote-sensing observations are supporting evidence, not absolute proof of field-level non-burning. Impact and registry claims require a versioned methodology and complete operational evidence.',
  };
}

/**
 * Generates an internal illustrative verification record; it is not a registry or Verra certificate
 */
export function generateNonBurnCertificate(field: Field, options: { illustrative?: boolean } = {}): NonBurnCertificate {
  const impact = options.illustrative ? illustrativeImpact(field.acreage) : null;
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
    co2e_avoided_tonnes: impact?.co2e ?? 0,
    pm25_prevented_kg: impact?.pm25 ?? 0,
    methane_prevented_kg: impact?.methane ?? 0,
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
