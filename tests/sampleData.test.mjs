import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'rolldown';

const root = new URL('..', import.meta.url).pathname;
let m;

// Bundle the TypeScript data and logic modules once so the real functions are tested, not their source text.
before(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nirdhoom-sample-'));
  const entry = path.join(dir, 'entry.ts');
  fs.writeFileSync(entry, `
    export * from '${root}src/data/mockData';
    export * from '${root}src/data/sampleNetwork';
    export { runVRPOptimizer } from '${root}src/utils/vrpOptimizer';
    export { executeFirmsAudit, generateNonBurnCertificate, isPointInPolygon } from '${root}src/utils/spatialVerification';
    export { harvestPressure, buildResidueSummary } from '${root}src/lib/residueOperations';
    export { polygonAreaM2, m2ToAcres } from '${root}src/lib/fieldGeometry';
  `);
  await build({ input: entry, output: { file: path.join(dir, 'out.mjs'), format: 'esm' }, platform: 'node', logLevel: 'silent' });
  m = await import(path.join(dir, 'out.mjs'));
});

const kmBetween = (a, b) => Math.hypot((a.lat - b.lat) * 111.32, (a.lng - b.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180));

test('sample network fills every map layer with a realistic amount of fictional records', () => {
  assert.equal(m.INITIAL_FIELDS.length, 30);
  assert.ok(m.INITIAL_MACHINES.length >= 14);
  assert.ok(m.MOCK_FIRMS_FIRE_EVENTS.length >= 50);
  assert.ok(m.INITIAL_STORAGE_YARDS.length >= 8);
  assert.ok(m.INITIAL_BUYERS.length >= 8);
  assert.ok(m.INITIAL_RESIDUE_LOTS.length >= 6);
  assert.ok(m.SAMPLE_CLUSTERS.length >= 6);
  // every machine status the map has a symbol for is represented
  assert.deepEqual([...new Set(m.INITIAL_MACHINES.map((x) => x.status))].sort(), ['BALING', 'EN_ROUTE', 'IDLE', 'MAINTENANCE']);
  // fields cover every stage of the journey
  assert.ok(new Set(m.INITIAL_FIELDS.map((f) => f.status)).size >= 7);
});

test('sample records are labelled as sample and never look like real identifiers', () => {
  m.MOCK_FIRMS_FIRE_EVENTS.forEach((fire) => {
    assert.match(String(fire.id), /^SAMPLE-FIRE-/);
    assert.equal(fire.source_version, 'sample');
  });
  m.INITIAL_MACHINES.forEach((machine) => assert.match(String(machine.operator_name), /Demo|Sample/i));
  m.INITIAL_FIELDS.forEach((field) => assert.ok(field.provenance, `${field.id} has provenance`));
});

test('sample dates are relative to today, so the map never looks stale', () => {
  const now = Date.now();
  m.INITIAL_FIELDS.forEach((field) => {
    const days = (Date.parse(field.expected_harvest_date) - now) / 86_400_000;
    assert.ok(days > -20 && days < 20, `${field.id} harvest ${days.toFixed(1)} days away`);
  });
  const newest = Math.max(...m.MOCK_FIRMS_FIRE_EVENTS.map((f) => Date.parse(String(f.detected_at).replace(' UTC', 'Z').replace(' ', 'T'))));
  assert.ok(now - newest < 36 * 3_600_000, 'newest detection is recent');
});

test('sample geometry is consistent: declared acres match the drawn field, fires respect field state', () => {
  let mismatched = 0;
  m.INITIAL_FIELDS.forEach((field) => {
    const mapped = m.m2ToAcres(m.polygonAreaM2(field.geometry));
    if (Math.abs(mapped - field.acreage) / field.acreage > 0.10) mismatched += 1;
    if (field.status === 'CLEARED_PENDING_AUDIT' || field.status === 'VERIFIED_NON_BURN') {
      const inside = m.MOCK_FIRMS_FIRE_EVENTS.filter((fire) => m.isPointInPolygon(fire.firms_point, field.geometry));
      assert.equal(inside.length, 0, `${field.id} is cleared and must have no fire inside`);
    }
  });
  assert.ok(mismatched <= 1, 'at most one deliberate area mismatch, so the review check has something to catch');
  m.MOCK_FIRMS_FIRE_EVENTS.forEach((fire) => {
    assert.ok(fire.brightness_temp_kelvin >= 300 && fire.brightness_temp_kelvin <= 400);
    assert.ok(fire.confidence >= 0 && fire.confidence <= 100);
  });
});

test('residue lots, jobs and evidence agree with the sample fields', () => {
  const ids = new Set(m.INITIAL_FIELDS.map((f) => f.id));
  m.INITIAL_RESIDUE_LOTS.forEach((lot) => {
    assert.ok(ids.has(lot.field_id));
    const field = m.INITIAL_FIELDS.find((f) => f.id === lot.field_id);
    const perAcre = lot.estimated_quantity_tonnes / field.acreage;
    assert.ok(perAcre >= 2.2 && perAcre <= 2.9, `${lot.id} ${perAcre.toFixed(2)} t/acre`);
  });
  const jobs = m.buildSampleJobs(m.INITIAL_FIELDS);
  assert.ok(jobs.length >= 12);
  jobs.forEach((job) => assert.ok(ids.has(job.booking.field_id)));
  const evidence = m.buildSampleEvidence(m.INITIAL_FIELDS);
  assert.ok(evidence.some((e) => e.kind === 'weighment') && evidence.some((e) => e.kind === 'bale_photo'));
});

test('dispatch plan respects capacity and only uses machines that can take work', () => {
  const plan = m.runVRPOptimizer(m.INITIAL_FIELDS, m.INITIAL_MACHINES);
  assert.ok(plan.assignments.length >= 5, 'work is spread across the fleet');
  assert.ok(plan.totalAcresScheduled > 30);
  assert.ok(plan.deadheadSavedKm > 0);
  plan.assignments.forEach((a) => {
    const machine = m.INITIAL_MACHINES.find((x) => x.id === a.machineId);
    assert.ok(['IDLE', 'EN_ROUTE'].includes(machine.status), `${machine.id} is ${machine.status}`);
    assert.ok(a.totalAcres <= machine.capacity_acres_day + 1e-9);
    assert.ok(a.capacityPct > 0);
  });
});

test('audit and certificate numbers are illustrative only, and carbon value is never invented', () => {
  const sample = m.executeFirmsAudit(m.INITIAL_FIELDS, m.MOCK_FIRMS_FIRE_EVENTS, { illustrative: true });
  assert.ok(sample.co2eAvoided > 0 && sample.pm25Prevented > 0);
  assert.equal(sample.carbonCreditValueInr, 0);
  const live = m.executeFirmsAudit(m.INITIAL_FIELDS, m.MOCK_FIRMS_FIRE_EVENTS);
  assert.equal(live.co2eAvoided, 0, 'no estimate outside sample mode');
  const field = m.INITIAL_FIELDS[0];
  const cert = m.generateNonBurnCertificate(field, { illustrative: true });
  assert.ok(cert.co2e_avoided_tonnes > 0);
  assert.equal(cert.carbon_credit_value_inr, 0);
  assert.equal(cert.certificate_status, 'ILLUSTRATIVE_DEMO');
  assert.equal(cert.sha256_hash, 'NOT_A_CRYPTOGRAPHIC_CERTIFICATE');
  assert.equal(m.generateNonBurnCertificate(field).co2e_avoided_tonnes, 0);
});

test('cleared fields are not counted as at risk', () => {
  const cleared = m.INITIAL_FIELDS.find((f) => f.status === 'CLEARED_PENDING_AUDIT');
  assert.equal(m.harvestPressure({ ...cleared, clearance_deadline: new Date(Date.now() + 3_600_000).toISOString() }), 'NORMAL');
  const summary = m.buildResidueSummary(m.INITIAL_FIELDS, m.INITIAL_MACHINES, m.INITIAL_BUYERS, m.INITIAL_STORAGE_YARDS, m.INITIAL_RESIDUE_LOTS);
  assert.ok(summary.demand_coverage_pct > 0, 'coverage shows progress instead of rounding to 0');
  assert.ok(summary.fields_at_risk < m.INITIAL_FIELDS.length / 2);
});
