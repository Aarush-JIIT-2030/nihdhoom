import fs from 'node:fs';
import path from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const errors=[];
const required=[
  'index.html','package.json','vercel.json','src/main.jsx','src/styles.css','src/lib/data.js','src/lib/supabase.js','api/assistant.ts','api/quote.ts','api/dispatch.ts','api/firms.ts','api/payments/webhook.ts','api/payments/initiate.ts','api/notify/whatsapp.ts','api/notify/ivr.ts','playwright.config.js','e2e/home.spec.js',
  'supabase/migrations/202609270001_nirdhoom_core.sql','supabase/migrations/202609270002_nirdhoom_production.sql','supabase/migrations/202609270003_nirdhoom_v6.sql','supabase/migrations/202609270004_nirdhoom_v7.sql','supabase/seed.sql'
];
for(const file of required){if(!fs.existsSync(path.join(root,file)))errors.push(`missing file: ${file}`);else if(!read(file).trim())errors.push(`empty file: ${file}`)}
const main=read('src/main.jsx'),css=read('src/styles.css'),pkg=JSON.parse(read('package.json')),core=read('supabase/migrations/202609270001_nirdhoom_core.sql'),prod=read('supabase/migrations/202609270002_nirdhoom_production.sql'),v6=read('supabase/migrations/202609270003_nirdhoom_v6.sql'),v7=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
const checks=[
 ['root mount',main.includes("document.getElementById('root')")],
 ['no browser secret key',!main.includes('service_role')&&!main.includes('SUPABASE_SECRET_KEY')],
 ['node 24 pin',pkg.engines?.node?.includes('24')&&read('vercel.json').includes('nodejs24.x')],
 ['supabase RLS',core.includes('enable row level security')&&prod.includes('enable row level security')],
 ['role escalation guard',prod.includes('prevent_role_escalation')],
 ['phone OTP',main.includes('signInWithOtp({phone')&&main.includes('verifyOtp({phone')],
 ['consent flow',main.includes('consents')&&v6.includes('create table if not exists public.consents')],
 ['postgis polygon',v6.includes('extensions.geography(Polygon,4326)')&&v6.includes('fields_boundary_gix')],
 ['real boundary capture',main.includes('tileToLatLng')&&main.includes('boundary_geojson')],
 ['dynamic quote endpoint',main.includes("fetch('/api/quote'")&&fs.existsSync(path.join(root,'api/quote.ts'))],
 ['guarantee + penalty schema',v6.includes('guaranteed_by_date')&&v6.includes('penalty_amount')],
 ['jobs state machine',v6.includes('create table if not exists public.jobs')&&v7.includes('transition_job')&&main.includes('transition_job')],
 ['operator GPS',main.includes('watchPosition')&&prod.includes('machine_locations')],
 ['evidence storage',main.includes("storage.from('evidence')")&&v6.includes("insert into storage.buckets")],
 ['dispatch API',main.includes("fetch('/api/dispatch'")&&fs.existsSync(path.join(root,'api/dispatch.ts'))],
 ['OR-Tools service hook',read('api/dispatch.ts').includes('DISPATCH_SERVICE_URL')],
 ['FIRMS API + polygon match',main.includes('/api/firms')&&read('api/firms.ts').includes('VIIRS_NOAA21_NRT')&&read('api/firms.ts').includes('matched_count')],
 ['buyer contracts',v6.includes('create table if not exists public.buyer_contracts')&&v6.includes('create table if not exists public.dispatches')],
 ['credits wallet',v6.includes('create table if not exists public.credit_wallets')&&main.includes('credit_wallets')],
 ['harvest intelligence',v6.includes('create table if not exists public.harvest_forecasts')&&main.includes('Sentinel-2')],
 ['soil report model',v6.includes('create table if not exists public.soil_reports')],
 ['payment webhook reconciliation',fs.existsSync(path.join(root,'api/payments/webhook.ts'))&&read('api/payments/webhook.ts').includes('SUPABASE_SERVICE_ROLE_KEY')&&read('api/payments/webhook.ts').includes('webhook_received_at')],
 ['WhatsApp + IVR server hooks',fs.existsSync(path.join(root,'api/notify/whatsapp.ts'))&&read('api/notify/whatsapp.ts').includes('graph.facebook.com')&&fs.existsSync(path.join(root,'api/notify/ivr.ts'))&&read('api/notify/ivr.ts').includes('IVR_WEBHOOK_URL')],
 ['live-record Sathi',read('api/assistant.ts').includes('/rest/v1/fields')&&read('api/assistant.ts').includes('REQUIRE_AUTH_FOR_AI')],
 ['transactional booking RPC',v7.includes('reserve_clearance_booking')&&main.includes('reserve_clearance_booking')],
 ['buyer offer locking',v7.includes('accept_buyer_offer')&&main.includes('accept_buyer_offer')],
 ['evidence integrity metadata',v7.includes('sha256')&&main.includes('sha256File')],
 ['GPS proximity gate',main.includes('haversineKm')&&main.includes('arrival is blocked')],
 ['payment initiation adapter',fs.existsSync(path.join(root,'api/payments/initiate.ts'))&&main.includes('/api/payments/initiate')],
 ['E2E smoke test',fs.existsSync(path.join(root,'playwright.config.js'))&&fs.existsSync(path.join(root,'e2e/home.spec.js'))],
 ['PWA shell',fs.existsSync(path.join(root,'public/sw.js'))&&fs.existsSync(path.join(root,'public/manifest.webmanifest'))],
 ['responsive css',css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:560px)')],
];
for(const [name,ok] of checks)if(!ok)errors.push(`failed check: ${name}`);

// Detect imported Lucide names that are unused and capitalized JSX components that are undefined.
const lucideBlock=main.match(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/)?.[1]||'';
const imported=lucideBlock.split(',').map(x=>x.trim()).filter(Boolean);
for(const name of imported){const clean=name.split(/\s+as\s+/)[0].trim();const occurrences=(main.match(new RegExp(`\\b${clean.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\b`,'g'))||[]).length;if(occurrences<2)errors.push(`unused Lucide import: ${clean}`)}
const localComponents=new Set([...main.matchAll(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)].map(m=>m[1]));
const jsxTags=new Set([...main.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map(m=>m[1]));
const lucideSet=new Set(imported.map(x=>x.split(/\s+as\s+/)[0].trim()));
for(const tag of jsxTags)if(!localComponents.has(tag)&&!lucideSet.has(tag)&&tag!=='React')errors.push(`undefined JSX component: ${tag}`);

// Catch likely dead buttons and obvious placeholder/fake settlement language regressions.
for(const match of main.matchAll(/<button\b([^>]*)>/g)){if(!/onClick=|onKeyDown=/.test(match[1]))errors.push(`button without handler near: ${match[1].slice(0,80)}`)}
if(main.includes("field_id:'00000000-0000-0000-0000-000000000000'"))errors.push('evidence upload uses a fake UUID');
if(main.includes('transaction ID')&&!main.includes('No provider reference'))errors.push('payment UI may imply settlement without provider state');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`NIRDHOOM V7 audit passed: ${required.length} required files, ${checks.length} feature/security checks, JSX/import scan clean, button-handler scan clean.`);
