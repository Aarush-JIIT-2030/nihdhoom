-- NIRDHOOM production-oriented extension.
-- Run after 202609270001_nirdhoom_core.sql.
create extension if not exists pgcrypto;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('farmer','operator','dispatcher','verifier','buyer','admin'));

alter table public.fields add column if not exists geometry_type text default 'demo';
alter table public.machines add column if not exists operator_user_id uuid references public.profiles(id);
alter table public.bookings add column if not exists assigned_at timestamptz;
alter table public.bookings add column if not exists accepted_at timestamptz;
alter table public.bookings add column if not exists cancelled_at timestamptz;

create table if not exists public.machine_locations (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  speed_kmh numeric(7,2),
  fuel_pct numeric(5,2),
  source text not null default 'device',
  recorded_at timestamptz not null default now()
);

create table if not exists public.evidence_assets (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  kind text not null check (kind in ('field_photo','bale_photo','weighment','gps','satellite','document')),
  storage_path text,
  source text,
  captured_at timestamptz,
  latitude double precision,
  longitude double precision,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  farmer_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  provider text,
  provider_reference text,
  status text not null default 'PENDING' check (status in ('PENDING','PROCESSING','PAID','FAILED','REFUNDED')),
  initiated_at timestamptz,
  settled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.buyer_offers (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.residue_lots(id) on delete cascade,
  buyer_id uuid not null references public.buyers(id) on delete cascade,
  price_per_tonne numeric(10,2) not null check (price_per_tonne >= 0),
  quantity_tonnes numeric(10,2) not null check (quantity_tonnes > 0),
  status text not null default 'OPEN' check (status in ('OPEN','ACCEPTED','REJECTED','EXPIRED','SETTLED')),
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.weather_snapshots (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  provider text not null,
  observed_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists machine_locations_machine_time_idx on public.machine_locations(machine_id, recorded_at desc);
create index if not exists bookings_field_date_idx on public.bookings(field_id, requested_date);
create index if not exists evidence_field_time_idx on public.evidence_assets(field_id, created_at desc);
create index if not exists payments_farmer_time_idx on public.payments(farmer_id, created_at desc);
create index if not exists offers_lot_status_idx on public.buyer_offers(lot_id, status);

-- Prevent a farmer from self-promoting their role through the profile update endpoint.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if (select auth.uid()) = old.id and new.role is distinct from old.role then
    raise exception 'role changes must be performed by an authorized operator';
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
for each row execute function public.prevent_role_escalation();

-- Idempotent policies: remove previous versions before recreating them.
do $$ declare p record; begin
  for p in select policyname, tablename from pg_policies where schemaname='public' and tablename in
    ('machine_locations','evidence_assets','payments','buyer_offers','weather_snapshots','audit_log')
  loop execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename); end loop;
end $$;

alter table public.machine_locations enable row level security;
alter table public.evidence_assets enable row level security;
alter table public.payments enable row level security;
alter table public.buyer_offers enable row level security;
alter table public.weather_snapshots enable row level security;
alter table public.audit_log enable row level security;

create policy "authenticated can read machine locations" on public.machine_locations for select to authenticated using (
  exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','admin'))
  or exists (select 1 from public.bookings b join public.fields f on f.id=b.field_id where b.machine_id=public.machine_locations.machine_id and f.owner_id=(select auth.uid()))
);
create policy "operator inserts own machine locations" on public.machine_locations for insert to authenticated with check (
  exists (select 1 from public.machines m where m.id=machine_id and m.operator_user_id=(select auth.uid()))
);

create policy "field owner reads evidence" on public.evidence_assets for select to authenticated using (
  exists (select 1 from public.fields f where f.id=field_id and f.owner_id=(select auth.uid()))
  or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','verifier','admin'))
);
create policy "operator/verifier inserts evidence" on public.evidence_assets for insert to authenticated with check (
  (select auth.uid())=created_by or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','verifier','admin'))
);

create policy "farmer reads own payments" on public.payments for select to authenticated using (
  farmer_id=(select auth.uid()) or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin'))
);

create policy "buyers read open offers" on public.buyer_offers for select to authenticated using (
  status='OPEN' or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','buyer','admin'))
);

drop policy if exists "farmer creates own events" on public.field_events;
create policy "operational roles create field events" on public.field_events for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','verifier','admin'))
);

create policy "field owner reads weather" on public.weather_snapshots for select to authenticated using (
  exists (select 1 from public.fields f where f.id=field_id and f.owner_id=(select auth.uid()))
  or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin'))
);

create policy "authorized reads audit log" on public.audit_log for select to authenticated using (
  exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','verifier','admin'))
);

-- Expand core role access. Farmers keep ownership; operational roles get controlled visibility.
drop policy if exists "authenticated reads machines" on public.machines;
create policy "authenticated reads machines" on public.machines for select to authenticated using (true);

drop policy if exists "farmer reads own fields" on public.fields;
create policy "field access by role" on public.fields for select to authenticated using (
  owner_id=(select auth.uid())
  or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','verifier','admin'))
  or exists (select 1 from public.bookings b join public.machines m on m.id=b.machine_id where b.field_id=fields.id and m.operator_user_id=(select auth.uid()))
);

drop policy if exists "farmer reads own bookings" on public.bookings;
create policy "booking access by role" on public.bookings for select to authenticated using (
  exists (select 1 from public.fields f where f.id=field_id and f.owner_id=(select auth.uid()))
  or exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin'))
  or exists (select 1 from public.machines m where m.id=machine_id and m.operator_user_id=(select auth.uid()))
);

-- Least privilege for the new tables.
grant select, insert on public.machine_locations to authenticated;
grant insert on public.notifications to authenticated;
grant select, insert on public.evidence_assets to authenticated;
grant select on public.payments to authenticated;
grant select on public.buyer_offers to authenticated;
grant select on public.weather_snapshots to authenticated;
grant select on public.audit_log to authenticated;
