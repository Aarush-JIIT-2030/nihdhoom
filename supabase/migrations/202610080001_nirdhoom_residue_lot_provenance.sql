-- Provenance-aware residue lot extensions and chronological evidence events.
-- This migration adds traceability without changing existing residue status semantics.

alter table public.residue_lots
  add column if not exists residue_type text not null default 'PADDY_STRAW',
  add column if not exists verified_quantity_tonnes numeric(10,2),
  add column if not exists ready_from timestamptz,
  add column if not exists pickup_deadline timestamptz,
  add column if not exists verification_source text,
  add column if not exists verified_at timestamptz;

alter table public.residue_lots
  drop constraint if exists residue_lots_verified_quantity_nonnegative;

alter table public.residue_lots
  add constraint residue_lots_verified_quantity_nonnegative
  check (verified_quantity_tonnes is null or verified_quantity_tonnes >= 0);

create table if not exists public.residue_lot_events (
  id uuid primary key default gen_random_uuid(),
  residue_lot_id uuid not null references public.residue_lots(id) on delete cascade,
  event_type text not null check (event_type in (
    'FIELD_REGISTERED',
    'PICKUP_REQUESTED',
    'MACHINE_ASSIGNED',
    'MACHINE_ARRIVED',
    'EVIDENCE_CAPTURED',
    'WEIGHED',
    'VERIFIED',
    'POOLED',
    'BUYER_MATCHED',
    'DELIVERED'
  )),
  occurred_at timestamptz not null default now(),
  source text not null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists residue_lot_events_lot_time_idx
  on public.residue_lot_events(residue_lot_id, occurred_at desc);

alter table public.residue_lot_events enable row level security;

drop policy if exists "authorized read residue lot events" on public.residue_lot_events;
create policy "authorized read residue lot events"
on public.residue_lot_events
for select
to authenticated
using (
  exists (
    select 1
    from public.residue_lots l
    join public.fields f on f.id=l.field_id
    where l.id=residue_lot_id
      and (
        f.owner_id=(select auth.uid())
        or exists (
          select 1
          from public.profiles p
          where p.id=(select auth.uid())
            and p.role in ('operator','dispatcher','verifier','buyer','admin')
        )
      )
  )
);

revoke insert, update, delete on public.residue_lot_events from anon, authenticated;
grant select on public.residue_lot_events to authenticated;

comment on column public.residue_lots.verification_source is
  'Human/provider source label for the verification decision; never infer authority from UI state alone.';

comment on table public.residue_lot_events is
  'Chronological evidence and custody ledger for residue lots. Inserts are server-authoritative.';
