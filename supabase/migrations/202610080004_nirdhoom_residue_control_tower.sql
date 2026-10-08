-- NIRDHOOM residue operations control tower.
-- Adds physical-network objects for machine capacity, yards, transport, demand matching and exceptions.
-- All operational assertions remain provisional until confirmed by the relevant actor/workflow.

create table if not exists public.storage_yards (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null,
  latitude double precision,
  longitude double precision,
  capacity_tonnes numeric(12,2) not null check (capacity_tonnes > 0),
  current_load_tonnes numeric(12,2) not null default 0 check (current_load_tonnes >= 0),
  incoming_tonnes numeric(12,2) not null default 0 check (incoming_tonnes >= 0),
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE','WATCH','FULL')),
  source text not null default 'LIVE_RECORD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.machine_capacity_windows (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  window_start timestamptz not null,
  window_end timestamptz not null,
  capacity_acres numeric(10,2) not null check (capacity_acres >= 0),
  reserved_acres numeric(10,2) not null default 0 check (reserved_acres >= 0),
  status text not null default 'OPEN' check (status in ('OPEN','HELD','FULL','CANCELLED')),
  source text not null default 'DISPATCH_PLANNING',
  created_at timestamptz not null default now(),
  check (window_end > window_start),
  check (reserved_acres <= capacity_acres)
);

create table if not exists public.residue_matches (
  id uuid primary key default gen_random_uuid(),
  residue_lot_id uuid not null references public.residue_lots(id) on delete cascade,
  buyer_demand_id uuid not null references public.buyer_demands(id) on delete cascade,
  proposed_tonnes numeric(12,2) not null check (proposed_tonnes > 0),
  accepted_tonnes numeric(12,2) not null default 0 check (accepted_tonnes >= 0),
  status text not null default 'PROPOSED' check (status in ('PROPOSED','ACCEPTED','REJECTED','DELIVERED')),
  match_reason jsonb not null default '{}'::jsonb,
  proposed_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table if not exists public.residue_transport_jobs (
  id uuid primary key default gen_random_uuid(),
  residue_lot_id uuid not null references public.residue_lots(id) on delete restrict,
  origin_type text not null check (origin_type in ('FIELD','YARD')),
  origin_id uuid,
  destination_type text not null check (destination_type in ('YARD','BUYER')),
  destination_id uuid,
  assigned_machine_id uuid references public.machines(id) on delete set null,
  planned_start timestamptz,
  planned_arrival timestamptz,
  actual_departure timestamptz,
  actual_arrival timestamptz,
  status text not null default 'PROPOSED' check (status in ('PROPOSED','ASSIGNED','EN_ROUTE','ARRIVED','DELIVERED','CANCELLED')),
  route_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.residue_exceptions (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references public.fields(id) on delete cascade,
  residue_lot_id uuid references public.residue_lots(id) on delete cascade,
  machine_id uuid references public.machines(id) on delete set null,
  yard_id uuid references public.storage_yards(id) on delete set null,
  kind text not null check (kind in ('PICKUP_OVERDUE','MACHINE_SHORTFALL','UNWEIGHED_LOT','UNMATCHED_DEMAND','YARD_CAPACITY','STALE_GPS','WEATHER_CAUTION')),
  severity text not null check (severity in ('CRITICAL','HIGH','WATCH')),
  title text not null,
  detail text not null,
  action text not null,
  status text not null default 'OPEN' check (status in ('OPEN','ACKNOWLEDGED','RESOLVED')),
  source text not null default 'CONTROL_TOWER',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists machine_capacity_windows_machine_time_idx on public.machine_capacity_windows(machine_id, window_start, window_end);
create index if not exists residue_matches_demand_idx on public.residue_matches(buyer_demand_id, status);
create index if not exists residue_matches_lot_idx on public.residue_matches(residue_lot_id, status);
create index if not exists residue_transport_status_idx on public.residue_transport_jobs(status, planned_start);
create index if not exists residue_exceptions_open_idx on public.residue_exceptions(status, severity, created_at desc);

alter table public.storage_yards enable row level security;
alter table public.machine_capacity_windows enable row level security;
alter table public.residue_matches enable row level security;
alter table public.residue_transport_jobs enable row level security;
alter table public.residue_exceptions enable row level security;

create policy "operations read storage yards" on public.storage_yards
for select to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('farmer','operator','dispatcher','verifier','buyer','admin')));

create policy "operations read capacity windows" on public.machine_capacity_windows
for select to authenticated using (exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','verifier','admin')));

create policy "buyers and operations read residue matches" on public.residue_matches
for select to authenticated using (
  exists(select 1 from public.buyer_demands d where d.id=buyer_demand_id and d.buyer_id=(select auth.uid()))
  or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','verifier','buyer','admin'))
);

create policy "operations read transport jobs" on public.residue_transport_jobs
for select to authenticated using (
  exists(select 1 from public.residue_lots l join public.fields f on f.id=l.field_id where l.id=residue_lot_id and f.owner_id=(select auth.uid()))
  or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','verifier','buyer','admin'))
);

create policy "operations read exceptions" on public.residue_exceptions
for select to authenticated using (
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','verifier','buyer','admin'))
  or exists(select 1 from public.fields f where f.id=field_id and f.owner_id=(select auth.uid()))
);

revoke insert, update, delete on public.storage_yards, public.machine_capacity_windows, public.residue_matches, public.residue_transport_jobs, public.residue_exceptions from anon, authenticated;
grant select on public.storage_yards, public.machine_capacity_windows, public.residue_matches, public.residue_transport_jobs, public.residue_exceptions to authenticated;

comment on table public.storage_yards is 'Residue aggregation/storage capacity. Capacity and load are operational records, not inferred map facts.';
comment on table public.machine_capacity_windows is 'Dispatch capacity windows used to match machines to harvest pressure.';
comment on table public.residue_matches is 'Proposed or accepted residue-to-demand matches; proposal is not a transaction.';
comment on table public.residue_transport_jobs is 'Physical movement of a residue lot from field/yard to yard/buyer.';
comment on table public.residue_exceptions is 'Operational exception queue; resolution requires the responsible workflow actor.';
