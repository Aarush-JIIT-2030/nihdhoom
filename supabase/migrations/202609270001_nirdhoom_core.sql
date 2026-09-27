-- NIRDHOOM core schema. Run in Supabase SQL Editor or as a migration.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en','pa','hi')),
  village text,
  district text,
  role text not null default 'farmer' check (role in ('farmer','operator','dispatcher','verifier','buyer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  external_id text unique,
  khasra_no text not null,
  village text not null,
  block text,
  district text not null,
  crop text not null default 'Paddy',
  variety text,
  acreage numeric(8,2) not null check (acreage > 0),
  expected_harvest_date date,
  clearance_deadline timestamptz,
  moisture_pct numeric(5,2),
  status text not null default 'REGISTERED' check (status in ('REGISTERED','SCHEDULED','MACHINE_ASSIGNED','ON_THE_WAY','BALING_IN_PROGRESS','CLEARED_PENDING_AUDIT','VERIFIED_NON_BURN','PAYMENT_PROCESSING','PAID','CANCELLED')),
  center_lat double precision,
  center_lng double precision,
  geometry jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,
  name text not null,
  machine_type text,
  owner_name text,
  operator_name text,
  operator_phone text,
  status text not null default 'IDLE',
  capacity_acres_day numeric(8,2),
  fuel_pct numeric(5,2),
  current_lat double precision,
  current_lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  requested_date date not null,
  rate_per_acre numeric(10,2) not null,
  quoted_amount numeric(12,2) not null,
  machine_id uuid references public.machines(id),
  status text not null default 'BOOKED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.field_events (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  event_type text not null,
  note text,
  actor_id uuid references public.profiles(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_events (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  method text not null,
  result text not null,
  confidence numeric(5,2),
  evidence_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.residue_lots (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  quantity_tonnes numeric(10,2),
  moisture_pct numeric(5,2),
  quality_notes text,
  status text not null default 'AVAILABLE',
  created_at timestamptz not null default now()
);

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pathway text not null,
  price_per_tonne numeric(10,2),
  moisture_ceiling numeric(5,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  field_id uuid references public.fields(id),
  role text not null check (role in ('user','assistant')),
  message text not null,
  created_at timestamptz not null default now()
);

-- Keep exposed data behind RLS.
alter table public.profiles enable row level security;
alter table public.fields enable row level security;
alter table public.machines enable row level security;
alter table public.bookings enable row level security;
alter table public.field_events enable row level security;
alter table public.verification_events enable row level security;
alter table public.residue_lots enable row level security;
alter table public.buyers enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_conversations enable row level security;

create policy "profile owner select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile owner insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profile owner update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "farmer reads own fields" on public.fields for select to authenticated using ((select auth.uid()) = owner_id);
create policy "farmer creates own fields" on public.fields for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "farmer updates own fields" on public.fields for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "authenticated reads machines" on public.machines for select to authenticated using (true);
create policy "farmer reads own bookings" on public.bookings for select to authenticated using (exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())));
create policy "farmer creates own bookings" on public.bookings for insert to authenticated with check (exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())));
create policy "farmer reads own events" on public.field_events for select to authenticated using (exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())));
create policy "farmer creates own events" on public.field_events for insert to authenticated with check (exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())));
create policy "farmer reads own verification" on public.verification_events for select to authenticated using (exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())));
create policy "authenticated reads buyers" on public.buyers for select to authenticated using (active = true);
create policy "farmer reads own lots" on public.residue_lots for select to authenticated using (exists (select 1 from public.fields f where f.id = field_id and f.owner_id = (select auth.uid())));
create policy "farmer reads own notifications" on public.notifications for select to authenticated using ((select auth.uid()) = profile_id);
create policy "farmer updates own notifications" on public.notifications for update to authenticated using ((select auth.uid()) = profile_id) with check ((select auth.uid()) = profile_id);
create policy "farmer reads own ai chats" on public.ai_conversations for select to authenticated using ((select auth.uid()) = profile_id);
create policy "farmer creates own ai chats" on public.ai_conversations for insert to authenticated with check ((select auth.uid()) = profile_id);

-- Data API least-privilege grants. Explicit exposure is now required for new Supabase projects.
grant select on public.machines, public.buyers to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.fields to authenticated;
grant select, insert on public.bookings to authenticated;
grant select, insert on public.field_events to authenticated;
grant select on public.verification_events, public.residue_lots, public.notifications, public.ai_conversations to authenticated;
grant update on public.notifications to authenticated;
grant insert on public.ai_conversations to authenticated;
