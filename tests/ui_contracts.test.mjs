import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('field UI keeps live-state messaging readable and truthful', () => {
  const app = read('src/App.tsx');
  const telemetry = read('src/components/LiveKPIDashboard.tsx');
  const css = read('src/styles/theme.css');
  assert.match(app, /Loading live operational records/);
  assert.match(app, /Live data unavailable/);
  assert.match(app, /Carbon market simulator/);
  assert.match(telemetry, /ops-telemetry-strip/);
  assert.match(css, /live-state-banner/);
  assert.match(css, /ops-telemetry-strip/);
});

test('high-risk demo surfaces avoid unsupported live-market language', () => {
  const agent = read('src/components/AgenticConsole/AgenticCommandCenter.tsx');
  const harvest = read('src/components/OfftakeAndForecast/HarvestForecast.tsx');
  const impact = read('src/components/Landing/ImpactStats.tsx');
  assert.match(agent, /Field readiness\. Bounded dispatch planning/);
  assert.doesNotMatch(agent, /Zero Burning\. Autonomous Dispatch\./);
  assert.match(agent, /DEMO SCENARIO|illustrative/i);
  assert.match(harvest, /illustrative planning/i);
  assert.doesNotMatch(impact, /1\.25 lakh CRM machines already deployed/);
  assert.doesNotMatch(impact, /Subsidised CRM baler fleet/);
});

test('3D and map evidence views distinguish observations from proof', () => {
  const earth = read('src/components/ThreeD/SatelliteEarth3D.tsx');
  const map = read('src/components/OpsConsole/OpsMap.tsx');
  const audit = read('src/components/VerificationLayer/SatelliteAudit.tsx');
  assert.match(earth, /thermal observations in current record/);
  assert.match(earth, /supporting evidence only/);
  assert.doesNotMatch(earth, /Nirdhoom Shield \(0 Fires\)/);
  assert.doesNotMatch(map, /Subsidised Balers/);
  assert.doesNotMatch(map, /External Fire Storm/);
  assert.match(audit, /FIRMS \/ VIIRS thermal observations/);
  assert.match(audit, /No registry issuance or retirement/);
});

test('farmer onboarding labels adapter-only identity and financial steps', () => {
  const onboarding = read('src/components/FarmerOnboarding/FarmerOnboarding.tsx');
  assert.match(onboarding, /Identity verification \(demo\)/);
  assert.match(onboarding, /Bank link \(demo\)/);
  assert.match(onboarding, /Land records \(demo\)/);
  assert.match(onboarding, /LIVE OTP/);
});

test('root document enables the field-first theme before React mounts', () => {
  const html = read('index.html');
  assert.match(html, /data-theme="kisan"/);
  assert.match(html, /DM+Sans/);
});
