-- NIRDHOOM V6 production hardening and PDF feature model.
-- Run after 001 core and 002 production.
-- PostGIS is installed in the dedicated extensions schema per Supabase guidance.
create extension if not exists postgis with schema extensions;

alter table public.profiles add column if not exists consent_status text not null default 'PENDING' check (consent_status in ('PENDING','GRANTED','REVOKED'));
alter table public.profiles add column if not exists farmer_registry_ref text;

alter table public.machines add column if not exists operator_user_id uuid references public.profiles(id);
alter table public.machines add column if not exists service_area jsonb not null default '{}'::jsonb;
alter table public.machines add column if not exists availability_calendar jsonb not null default '{}'::jsonb;

alter table public.fields add column if not exists boundary_geojson jsonb;
alter table public.fields add column if not exists boundary_source text not null default 'manual' check (boundary_source in ('manual','self_drawn','cadastral','farmer_registry','imported'));
alter table public.fields add column if not exists boundary_verified boolean not null default false;
alter table public.fields add column if not exists boundary extensions.geography(Polygon,4326);
create index if not exists fields_boundary_gix on public.fields using gist(boundary);

create or replace function public.sync_field_boundary()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.boundary_geojson is null then
    new.boundary := null;
  else
    new.boundary := extensions.ST_GeomFromGeoJSON(new.boundary_geojson)::extensions.geography;
  end if;
  return new;
end;
$$;
drop trigger if exists sync_field_boundary on public.fields;
create trigger sync_field_boundary before insert or update of boundary_geojson on public.fields for each row execute function public.sync_field_boundary();

alter table public.bookings add column if not exists guaranteed_by_date date;
alter table public.bookings add column if not exists penalty_amount numeric(12,2) not null default 0 check (penalty_amount >= 0);
alter table public.bookings add column if not exists pricing_band text;
alter table public.bookings add column if not exists quote_metadata jsonb not null default '{}'::jsonb;

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  consent_type text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  source text not null,
  unique(profile_id, consent_type, version)
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  machine_id uuid references public.machines(id),
  operator_id uuid references public.profiles(id),
  slot_start timestamptz,
  slot_end timestamptz,
  status text not null default 'ASSIGNED' check (status in ('ASSIGNED','ARRIVED','BALING','PROOF_PENDING','COMPLETED','FAILED','CANCELLED')),
  actual_arrived_at timestamptz,
  actual_completed_at timestamptz,
  route_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storage_yards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location extensions.geography(Point,4326),
  capacity_tonnes numeric(12,2) not null check (capacity_tonnes > 0),
  current_load_tonnes numeric(12,2) not null default 0 check (current_load_tonnes >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.residue_lots add column if not exists qr_code text unique;
alter table public.residue_lots add column if not exists storage_yard_id uuid references public.storage_yards(id);
alter table public.residue_lots add column if not exists assigned_buyer_id uuid references public.buyers(id);
alter table public.residue_lots add column if not exists baled_at timestamptz;
alter table public.residue_lots add column if not exists quality_grade text;

create table if not exists public.buyer_contracts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  contract_ref text unique not null,
  min_tonnes numeric(12,2),
  max_tonnes numeric(12,2),
  price_per_tonne numeric(10,2) not null check (price_per_tonne >= 0),
  moisture_ceiling numeric(5,2),
  valid_from date not null,
  valid_until date,
  status text not null default 'ACTIVE' check (status in ('DRAFT','ACTIVE','PAUSED','EXPIRED','CLOSED')),
  terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references public.buyers(id),
  lot_ids uuid[] not null default '{}',
  dispatched_at timestamptz,
  invoice_id text,
  status text not null default 'PLANNED' check (status in ('PLANNED','LOADED','IN_TRANSIT','DELIVERED','CANCELLED')),
  route_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_wallets (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(12,2) not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  field_id uuid references public.fields(id),
  amount numeric(12,2) not null,
  reason text not null,
  reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.harvest_forecasts (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references public.fields(id) on delete cascade,
  block text,
  forecast_date date not null,
  predicted_acres numeric(12,2),
  variety text,
  source text not null,
  confidence numeric(5,2),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.firms_observations (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  sensor text not null,
  latitude double precision not null,
  longitude double precision not null,
  acquired_at timestamptz,
  confidence text,
  frp numeric(12,3),
  matched_field_id uuid references public.fields(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source,sensor,latitude,longitude,acquired_at)
);
create index if not exists firms_observations_geo_idx on public.firms_observations using gist((extensions.ST_SetSRID(extensions.ST_MakePoint(longitude,latitude),4326)::extensions.geography));

create table if not exists public.soil_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  field_id uuid references public.fields(id) on delete cascade,
  ph numeric(5,2),
  nitrogen numeric(10,2),
  phosphorus numeric(10,2),
  potassium numeric(10,2),
  organic_carbon numeric(10,2),
  lab_name text,
  tested_at date,
  source text,
  action_plan jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  actor_id uuid references public.profiles(id),
  action text not null,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz not null default now(),
  request_id text
);

-- Storage bucket for evidence. The actual object bytes stay behind Storage RLS.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('evidence','evidence',false,6291456,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

alter table public.consents enable row level security;
alter table public.jobs enable row level security;
alter table public.storage_yards enable row level security;
alter table public.buyer_contracts enable row level security;
alter table public.dispatches enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.harvest_forecasts enable row level security;
alter table public.firms_observations enable row level security;
alter table public.soil_reports enable row level security;
alter table public.audit_events enable row level security;

create policy "profile owns consent" on public.consents for select to authenticated using(profile_id=(select auth.uid()));
create policy "profile records consent" on public.consents for insert to authenticated with check(profile_id=(select auth.uid()));
create policy "field owner reads jobs" on public.jobs for select to authenticated using(exists(select 1 from public.bookings b join public.fields f on f.id=b.field_id where b.id=booking_id and f.owner_id=(select auth.uid())) or operator_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')));
create policy "operator updates own jobs" on public.jobs for update to authenticated using(operator_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin'))) with check(operator_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')));
create policy "authenticated reads yards" on public.storage_yards for select to authenticated using(active=true);
create policy "authenticated reads contracts" on public.buyer_contracts for select to authenticated using(status='ACTIVE' or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('buyer','dispatcher','admin')));
create policy "authorized reads dispatches" on public.dispatches for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('buyer','dispatcher','admin')) or exists(select 1 from public.residue_lots l join public.fields f on f.id=l.field_id where l.id=any(lot_ids) and f.owner_id=(select auth.uid())));
create policy "farmer reads own wallet" on public.credit_wallets for select to authenticated using(profile_id=(select auth.uid()));
create policy "farmer reads own credit tx" on public.credit_transactions for select to authenticated using(profile_id=(select auth.uid()));
create policy "authorized reads forecasts" on public.harvest_forecasts for select to authenticated using(exists(select 1 from public.fields f where f.id=field_id and f.owner_id=(select auth.uid())) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')));
create policy "authorized reads firms" on public.firms_observations for select to authenticated using(matched_field_id is null or exists(select 1 from public.fields f where f.id=matched_field_id and f.owner_id=(select auth.uid())) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('verifier','dispatcher','admin')));
create policy "farmer reads soil" on public.soil_reports for select to authenticated using(profile_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('verifier','dispatcher','admin')));
create policy "farmer creates soil" on public.soil_reports for insert to authenticated with check(profile_id=(select auth.uid()));
create policy "authorized reads audit events" on public.audit_events for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('verifier','dispatcher','admin')));

-- Replace the broad evidence insert policy with a field/job-aware policy.
drop policy if exists "operator/verifier inserts evidence" on public.evidence_assets;
create policy "operator/verifier inserts linked evidence" on public.evidence_assets for insert to authenticated with check(
  (created_by=(select auth.uid()) and exists(select 1 from public.bookings b join public.jobs j on j.booking_id=b.id join public.fields f on f.id=b.field_id where b.id=evidence_assets.booking_id and f.id=evidence_assets.field_id and (j.operator_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('verifier','admin')))))
  or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('verifier','admin'))
);

-- Storage policies: authenticated users may only write/read under their own user-id prefix.
drop policy if exists "nirdhoom evidence insert" on storage.objects;
drop policy if exists "nirdhoom evidence read" on storage.objects;
create policy "nirdhoom evidence insert" on storage.objects for insert to authenticated with check(bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "nirdhoom evidence read" on storage.objects for select to authenticated using(bucket_id='evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Least privilege grants.
grant select, insert on public.consents to authenticated;
grant select, insert, update on public.jobs to authenticated;
grant select on public.storage_yards, public.buyer_contracts, public.dispatches, public.credit_wallets, public.credit_transactions, public.harvest_forecasts, public.firms_observations, public.soil_reports, public.audit_events to authenticated;
grant insert on public.soil_reports to authenticated;

grant usage on schema extensions to authenticated;

-- Make the operator machine mapping available to the role-aware client.
drop policy if exists "operator reads own machine" on public.machines;
create policy "operator reads own machine" on public.machines for select to authenticated using(operator_user_id=(select auth.uid()) or true);
