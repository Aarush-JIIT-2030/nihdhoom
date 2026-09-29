import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = p => fs.readFileSync(`${root}/${p}`,'utf8');

test('PDF P0/P1 surfaces exist',()=>{
  const main=read('src/main.jsx');
  const v6=read('supabase/migrations/202609270003_nirdhoom_v6.sql');
  const v7=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
  for(const token of ['signInWithOtp({phone','boundary_geojson','/api/quote','/api/dispatch','watchPosition',"storage.from('evidence')",'/api/firms','credit_wallets','Sentinel-2']) assert.match(main,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(v6,/buyer_contracts/);
  assert.match(v7,/reserve_clearance_booking/);
  assert.match(v7,/transition_job/);
  assert.match(v7,/accept_buyer_offer/);
});

test('frontend has no server secret names',()=>{
  const main=read('src/main.jsx');
  assert.doesNotMatch(main,/SERVICE_ROLE|SECRET_KEY|OPENAI_API_KEY/);
});

test('production migrations contain RLS and PostGIS',()=>{
  const sql=read('supabase/migrations/202609270003_nirdhoom_v6.sql');
  const v7=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
  assert.match(sql,/enable row level security/);
  assert.match(sql,/geography\(Polygon,4326\)/);
  assert.match(sql,/storage\.objects/);
  assert.match(v7,/sha256/);
});

test('research desk exposes sourced five-season Punjab fire-count series',()=>{
  const main=read('src/main.jsx');
  for(const token of ["year:'2021',count:71304","year:'2022',count:49922","year:'2023',count:36663","year:'2024',count:10909","year:'2025',count:5114","FIVE-SEASON CONTEXT","15 Sep–30 Nov"]) assert.ok(main.includes(token),`missing research data token: ${token}`);
  assert.match(main,/research-chart/);
});


test('outbound farmer messaging endpoints require dispatcher authentication and bound requests',()=>{
  for (const path of ['api/notify/whatsapp.ts','api/notify/ivr.ts']) {
    const source=read(path);
    assert.match(source,/verifyDispatcher\(req\)/,path+' must authenticate dispatchers');
    assert.match(source,/validPhone\(to\)/,path+' must validate destination');
    assert.match(source,/AbortSignal\.timeout\(10000\)/,path+' must bound provider requests');
  }
  const whatsapp=read('api/notify/whatsapp.ts');
  const ivr=read('api/notify/ivr.ts');
  assert.match(whatsapp,/text\.length > 4096/);
  assert.match(ivr,/message\.length > 2000/);
});


test('V7 migration has one valid buyer acceptance function with atomic lot claim',()=>{
  const sql=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
  const definitions=[...sql.matchAll(/create or replace function public\.accept_buyer_offer/g)];
  assert.equal(definitions.length,1,'must have one authoritative definition');
  const start=definitions[0].index;
  const end=sql.indexOf('$$;',start)+3;
  const fn=sql.slice(start,end);
  assert.match(fn,/security definer/i);
  assert.match(fn,/b\.profile_id=auth\.uid\(\)/);
  assert.match(fn,/returning id into updated_lot_id/);
  assert.match(fn,/if updated_lot_id is null then raise exception/);
  assert.ok(fn.indexOf('if updated_lot_id is null') < fn.indexOf("set status='ACCEPTED'"));
  assert.doesNotMatch(sql,/as \$\s*declare[\s\S]{0,120}accept_buyer_offer/);
});

test('demo UPI handoff is visibly non-settling and does not mutate payment state',()=>{
  const main=read('src/main.jsx');
  const payment=main.slice(main.indexOf('function Payments('),main.indexOf('function Research'));
  assert.match(payment,/DEMO ONLY · UPI INTENT TEST/);
  assert.match(payment,/upi:\/\/pay\?/);
  assert.match(payment,/Finish UI test/);
  assert.match(payment,/No payment confirmation was received/);
  assert.match(payment,/No payment status was changed/);
  assert.doesNotMatch(payment,/\.from\(['"]payments['"]\)\.update/);
});


test('self-created profiles are restricted to farmer role',()=>{
  const sql=read('supabase/migrations/202609270001_nirdhoom_core.sql');
  assert.match(sql,/profile owner insert[^;]*role = 'farmer'/s);
});


test('dispatch solver output is validated before being returned',()=>{
  const source=read('api/dispatch.ts');
  assert.match(source,/function validSolverPlan/);
  assert.match(source,/validSolverPlan\(plan, fields, machines\)/);
  assert.match(source,/seenFields\.has\(id\)/);
  assert.match(source,/seenMachines\.has\(route\.machine_id\)/);
  assert.match(source,/acres > machine\.capacity_acres_day/);
});

test('assistant bounds user input and upstream requests',()=>{
  const source=read('api/assistant.ts');
  assert.match(source,/question\.length>2000/);
  assert.match(source,/AbortSignal\.timeout\(8000\)/);
  assert.match(source,/AbortSignal\.timeout\(12000\)/);
});


test('assistant requires auth for provider-backed AI and does not trust failed private lookups',()=>{
  const source=read('api/assistant.ts');
  assert.match(source,/Boolean\(process\.env\.OPENAI_API_KEY\)/);
  assert.match(source,/Boolean\(field\?\.dbId\)/);
  assert.match(source,/field\?\.dbId\?\{\}:\(field\|\|\{\}\)/);
  assert.match(source,/openai-demo-context/);
});


test('job completion requires stored field evidence and V7 RPCs are not public',()=>{
  const sql=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
  const transition=sql.slice(sql.indexOf('create or replace function public.transition_job'),sql.indexOf('create or replace function public.record_verification_review'));
  assert.match(transition,/p_next_status='COMPLETED' and not exists/);
  assert.match(transition,/e\.storage_path is not null/);
  assert.match(sql,/revoke all on function public\.transition_job\(uuid,text,jsonb\) from public, anon/);
  assert.match(sql,/grant execute on function public\.transition_job\(uuid,text,jsonb\) to authenticated/);
});

test('booking RPC checks quoted amount against registered acreage',()=>{
  const sql=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
  assert.match(sql,/round\(p_rate_per_acre \* f\.acreage, 2\)/);
  assert.match(sql,/Field acreage must be verified before booking/);
});

test('Vercel config includes the IVR function runtime',()=>{
  const config=JSON.parse(read('vercel.json'));
  assert.equal(config.functions['api/notify/ivr.ts'].runtime,'nodejs24.x');
});

test('payment initiation fails closed and validates request before provider setup',()=>{
  const source=read('api/payments/initiate.ts');
  assert.match(source,/AbortSignal\.timeout\(8000\)/);
  assert.match(source,/UUID\.test\(bookingId\)/);
  assert.match(source,/amount > 100000000/);
  assert.match(source,/res\.status\(501\)/);
  assert.match(source,/No money movement was attempted/);
  assert.doesNotMatch(source,/status:\s*'PAID'/);
});

test('service worker never caches API or authenticated responses',()=>{
  const sw=read('public/sw.js');
  assert.match(sw,/url\.pathname\.startsWith\('\/api\/'\)/);
  assert.match(sw,/request\.headers\.has\('authorization'\)/);
  assert.match(sw,/response\.ok && response\.type === 'basic'/);
  assert.match(sw,/nirdhoom-shell-v5/);
});

test('OR-Tools dispatch endpoint requires configured shared-secret authentication',()=>{
  const service=read('services/dispatch-ortools/main.py');
  const api=read('api/dispatch.ts');
  assert.match(service,/DISPATCH_SERVICE_TOKEN/);
  assert.match(service,/hmac\.compare_digest/);
  assert.match(service,/status_code=401/);
  assert.match(api,/DISPATCH_SERVICE_TOKEN/);
});

test('README language switcher, translations, and hero asset stay available',()=>{
  const rootReadme=read('README.md');
  const hindi=read('README.hi.md');
  const punjabi=read('README.pa.md');
  assert.match(rootReadme,/README\.hi\.md/);
  assert.match(rootReadme,/README\.pa\.md/);
  assert.match(rootReadme,/public\/images\/punjab_farm_hero\.jpg/);
  assert.ok(fs.existsSync(`${root}/public/images/punjab_farm_hero.jpg`));
  for(const [name,doc] of [['Hindi',hindi],['Punjabi',punjabi]]){
    assert.match(doc,/README\.md/,`${name} README must link to English`);
    assert.match(doc,/NIRDHOOM/);
    assert.match(doc,/public\/images\/punjab_farm_hero\.jpg/);
    assert.match(doc,/V7/);
    assert.match(doc,/npm run dev/);
  }
});

test('V7 booking RPC uses a matching named dollar-quote delimiter',()=>{
  const sql=read('supabase/migrations/202609270004_nirdhoom_v7.sql');
  const start=sql.indexOf('create or replace function public.reserve_clearance_booking');
  const end=sql.indexOf('-- V7 role-specific writes',start);
  assert.ok(start>=0 && end>start);
  const fn=sql.slice(start,end);
  assert.match(fn,/as \$booking\$\s*declare/);
  assert.match(fn,/\$booking\$;\s*$/);
  assert.doesNotMatch(fn,/as \$\s*declare/);
});
