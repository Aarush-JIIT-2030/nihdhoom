import fs from 'node:fs';
import path from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const errors = [];

const required = [
  'index.html',
  'package.json',
  'package-lock.json',
  'vercel.json',
  'src/main.jsx',
  'src/App.tsx',
  'src/index.css',
  'api/assistant.ts',
  'api/quote.ts',
  'api/dispatch.ts',
  'api/firms.ts',
  'api/payments/webhook.ts',
  'api/payments/initiate.ts',
  'api/notify/whatsapp.ts',
  'api/notify/ivr.ts',
  'supabase/migrations/202609270001_nirdhoom_core.sql',
  'supabase/migrations/202609270002_nirdhoom_production.sql',
  'supabase/migrations/202609270003_nirdhoom_v6.sql',
  'supabase/migrations/202609270004_nirdhoom_v7.sql',
  'supabase/migrations/202610010005_nirdhoom_booking_integrity.sql',
  'supabase/migrations/202610010006_nirdhoom_verification_and_settlement_integrity.sql',
  'supabase/migrations/202610010007_nirdhoom_operational_integrity.sql',
  'supabase/migrations/202610020008_nirdhoom_client_write_integrity.sql',
  'supabase/migrations/202610020009_nirdhoom_security_advisor_cleanup.sql',
  '.github/workflows/ci.yml',
];

for (const file of required) {
  if (!exists(file)) errors.push(`missing required file: ${file}`);
  else if (!read(file).trim()) errors.push(`empty required file: ${file}`);
}

const pkg = JSON.parse(read('package.json'));
const lock = read('package-lock.json');
const entry = read('src/main.jsx');
const app = read('src/App.tsx');
const ci = read('.github/workflows/ci.yml');
const v7 = read('supabase/migrations/202609270004_nirdhoom_v7.sql');
const v71 = read('supabase/migrations/202610010005_nirdhoom_booking_integrity.sql');
const v72 = read('supabase/migrations/202610010006_nirdhoom_verification_and_settlement_integrity.sql');
const v73 = read('supabase/migrations/202610010007_nirdhoom_operational_integrity.sql');
const v75 = read('supabase/migrations/202610020008_nirdhoom_client_write_integrity.sql');
const v76 = read('supabase/migrations/202610020009_nirdhoom_security_advisor_cleanup.sql');
const controller = read('src/state/useAppController.ts');
const envExample = read('.env.example');

const checks = [
  ['modular React entrypoint', entry.includes("import { App } from './App.tsx'") && entry.includes("import './index.css'")],
  ['no duplicate entrypoint', !exists('src/main.tsx')],
  ['no committed monolithic bundle', !exists('nirdhoom-app.html')],
  ['no committed build archive', !exists('nirdhoom-final.zip')],
  ['Node 24 runtime', pkg.engines?.node?.includes('24') && !read('vercel.json').includes('functions')],
  ['lockfile present', lock.includes('"lockfileVersion": 3')],
  ['Supabase RLS', /enable row level security/i.test(read('supabase/migrations/202609270002_nirdhoom_production.sql'))],
  ['server-owned booking RPC', v71.includes('reserve_clearance_booking_v2') && v71.includes('server_authoritative')],
  ['legacy booking RPC revoked', v72.includes('revoke execute on function public.reserve_clearance_booking')],
  ['verification evidence gate', v72.includes('Verification requires completed job, evidence asset and residue lot')],
  ['buyer ownership gate', v72.includes('b.profile_id=auth.uid()')],
  ['atomic residue claim', v72.includes('get diagnostics claimed = row_count')],
  ['payment webhook idempotency', v72.includes('payments_provider_reference_idx')],
  ['self-role escalation guard', v73.includes('prevent_self_privileged_profile') && v73.includes("<> 'farmer'")],
  ['GPS bounds', v73.includes('machine_locations_latitude_check') && v73.includes('machine_locations_speed_check')],
  ['evidence ownership trigger', v73.includes('validate_evidence_asset') && v73.includes('Evidence storage path must belong to its creator')],
  ['FIRMS client insert revoked', v73.includes('revoke insert on public.firms_observations from authenticated')],
  ['operator evidence policy', v73.includes('operator inserts linked evidence') && v73.includes('created_by=auth.uid()')],
  ['direct booking writes revoked', v75.includes('revoke insert, update, delete on public.bookings from authenticated') && v75.includes('reserve_clearance_booking_v2')],
  ['farmer field tampering guard', v75.includes('prevent_farmer_field_tampering') && v75.includes('Protected field attributes must be changed through an authorized workflow') && v75.includes('New farmer fields must begin in REGISTERED state with unverified boundaries')],
  ['security advisor cleanup', v76.includes('revoke all on function public.prevent_farmer_field_tampering()') && v76.includes('drop index if exists public.buyers_profile_unique_idx') && v76.includes('(select auth.uid())')],
  ['demo payment disclosure', read('src/components/FieldOperator/UpiSettlementModal.tsx').includes('no money movement')],
  ['demo onboarding disclosure', read('src/components/FarmerOnboarding/FarmerOnboarding.tsx').includes('Demo only')],
  ['demo carbon disclosure', read('src/components/CarbonMarketplace/CarbonMarketplace.tsx').includes('Illustrative carbon-market interface')],
  ['API auth boundary', /verifyDispatcher\(req\)/.test(read('api/notify/whatsapp.ts')) && /verifyDispatcher\(req\)/.test(read('api/notify/ivr.ts'))],
  ['dispatch solver secret', read('api/dispatch.ts').includes('DISPATCH_SERVICE_TOKEN')],
  ['payment remains non-money-moving', read('api/payments/initiate.ts').includes('status(501)') && read('api/payments/initiate.ts').includes('No money movement was attempted')],
  ['CI tests actual build', ci.includes('npm run syntaxcheck') && ci.includes('npm run audit') && ci.includes('npm test') && ci.includes('npm run build')],
  ['demo data is opt-in', controller.includes("VITE_NIRDHOOM_DEMO_MODE === 'true'") && controller.includes('DEMO_MODE ? INITIAL_FIELDS : []') && envExample.includes('VITE_NIRDHOOM_DEMO_MODE=false')],
  ['live data loader exists', controller.includes("client.from('fields')") && controller.includes("client.from('machines')") && controller.includes('setLoadingLiveData(false)')],
];

for (const [name, ok] of checks) if (!ok) errors.push(`failed check: ${name}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`NIRDHOOM V7.5 audit passed: ${required.length} required files, ${checks.length} architecture/security checks.`);
