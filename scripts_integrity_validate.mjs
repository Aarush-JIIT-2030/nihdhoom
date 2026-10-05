import fs from 'node:fs';
import path from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const fail = message => { console.error(message); process.exit(1); };

const hardening = 'supabase/migrations/20261006_nirdhoom_integrity_hardening.sql';
const quantityInvariants = 'supabase/migrations/20261006_nirdhoom_residue_quantity_invariants.sql';
if (!exists(quantityInvariants)) fail('missing residue quantity invariant migration');
const invariantSql = read(quantityInvariants);
if (!exists(hardening)) fail('missing latest Supabase integrity hardening migration');
const sql = read(hardening);

for (const name of [
  'accept_buyer_offer',
  'cancel_clearance_booking',
  'create_residue_pool',
  'join_residue_pool',
  'record_verification_review',
  'reserve_clearance_booking_v2',
  'transition_job',
  'verify_field_geometry',
  'consume_telegram_link_token',
]) {
  if (!sql.includes("set search_path = ''")) fail('SECURITY DEFINER search_path is not pinned');
  if (!sql.includes(`alter function public.${name}`)) fail(`missing search_path hardening for ${name}`);
}

if (!sql.includes('l.quantity_tonnes - coalesce')) fail('residue allocation is missing lot-level uncommitted quantity protection');
if (!sql.includes('no verified residue lot with sufficient uncommitted quantity')) fail('residue allocation is missing verified-lot capacity failure');
if (!sql.includes('revoke execute on function public.join_residue_pool(uuid,numeric) from anon')) fail('residue pool RPC remains callable by anon');

if (!invariantSql.includes('residue_lots_quantity_positive') || !invariantSql.includes('residue_pools_current_not_over_target')) fail('residue quantity invariants are incomplete');

const migrationFiles = fs.readdirSync(path.join(root, 'supabase/migrations')).filter(f => f.endsWith('.sql'));
if (migrationFiles.length < 10) fail('unexpectedly small migration set');

console.log(`NIRDHOOM integrity audit passed: ${migrationFiles.length} migration files and latest RPC hardening verified.`);
