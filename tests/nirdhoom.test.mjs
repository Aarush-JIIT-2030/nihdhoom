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
