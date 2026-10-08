-- First-class residue object: field -> machine -> evidence -> verification -> market.
-- Existing quantity/status columns remain compatible; new fields make provenance explicit.

alter table public.residue_lots
  add column if not exists farmer_id uuid references public.profiles(id) on delete restrict,
  add column if not exists crop text,
  add column if not exists residue_type text not null default 'PADDY_STRAW',
  add column if not exists estimated_quantity_tonnes numeric(10,2),
  add column if not exists verified_quantity_tonnes numeric(10,2),
  add column if not exists quality_grade text,
  add column if not exists bale_type text,
  add column if not exists harvest_date date,
  add column if not exists ready_from timestamptz,
  add column if not exists pickup_deadline timestamptz,
  add column if not exists machine_id uuid references public.machines(id) on delete set null,
  add column if not exists geometry_provenance jsonb not null default '{}'::jsonb,
  add column if not exists verification_source text,
  add column if not exists verified_at timestamptz;

update public.residue_lots l
set
  farmer_id = coalesce(l.farmer_id, f.owner_id),
  crop = coalesce(l.crop, f.crop),
  estimated_quantity_tonnes = coalesce(l.estimated_quantity_tonnes, l.quantity_tonnes),
  harvest_date = coalesce(l.harvest_date, f.expected_harvest_date),
  ready_from = coalesce(l.ready_from, f.expected_harvest_date::timestamptz),
  pickup_deadline = coalesce(l.pickup_deadline, f.clearance_deadline),
  geometry_provenance = case
    when l.geometry_provenance = '{}'::jsonb and f.geometry is not null
      then jsonb_build_object(
        'source', 'FIELD_RECORD',
        'field_geometry', f.geometry,
        'field_id', f.id
      )
    else l.geometry_provenance
  end
from public.fields f
where f.id = l.field_id;

alter table public.residue_lots
  alter column farmer_id set not null,
  alter column crop set default 'Paddy',
  alter column crop set not null;

alter table public.residue_lots
  drop constraint if exists residue_lots_estimated_quantity_nonnegative,
  drop constraint if exists residue_lots_verified_quantity_nonnegative;

alter table public.residue_lots
  add constraint residue_lots_estimated_quantity_nonnegative
    check (estimated_quantity_tonnes is null or estimated_quantity_tonnes >= 0),
  add constraint residue_lots_verified_quantity_nonnegative
    check (verified_quantity_tonnes is null or verified_quantity_tonnes >= 0);

create index if not exists residue_lots_farmer_status_idx
  on public.residue_lots(farmer_id, status, created_at desc);

create index if not exists residue_lots_ready_window_idx
  on public.residue_lots(ready_from, pickup_deadline)
  where status in ('AVAILABLE','VERIFIED','VERIFIED_NON_BURN');

-- Append-only custody/provenance events. Clients can read their own lot history,
-- but cannot forge custody events.
drop policy if exists "authorized read residue lot events" on public.residue_lot_events;
create policy "authorized read residue lot events"
on public.residue_lot_events
for select
to authenticated
using (
  exists (
    select 1
    from public.residue_lots l
    where l.id = residue_lot_id
      and (
        l.farmer_id = (select auth.uid())
        or exists (
          select 1 from public.profiles p
          where p.id=(select auth.uid())
            and p.role in ('operator','dispatcher','verifier','buyer','admin')
        )
      )
  )
);

revoke insert, update, delete on public.residue_lot_events from anon, authenticated;
grant select on public.residue_lot_events to authenticated;

create or replace function public.record_residue_lot_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_event text;
begin
  if tg_op = 'INSERT' then
    next_event := case
      when coalesce(new.verified_quantity_tonnes, 0) > 0 then 'WEIGHED'
      else 'PICKUP_REQUESTED'
    end;

    insert into public.residue_lot_events(
      residue_lot_id, event_type, occurred_at, source, actor_profile_id, metadata
    )
    values (
      new.id,
      next_event,
      coalesce(new.baled_at, now()),
      coalesce(new.verification_source, 'NIRDHOOM_RESIDUE_RECORD'),
      (select auth.uid()),
      jsonb_build_object(
        'quantity_tonnes', new.quantity_tonnes,
        'estimated_quantity_tonnes', new.estimated_quantity_tonnes,
        'verified_quantity_tonnes', new.verified_quantity_tonnes,
        'residue_type', new.residue_type
      )
    );
    return new;
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    next_event := case new.status
      when 'VERIFIED' then 'VERIFIED'
      when 'VERIFIED_NON_BURN' then 'VERIFIED'
      when 'ALLOCATED' then 'BUYER_MATCHED'
      when 'DELIVERED' then 'DELIVERED'
      else null
    end;

    if next_event is not null then
      insert into public.residue_lot_events(
        residue_lot_id, event_type, occurred_at, source, actor_profile_id, metadata
      )
      values (
        new.id,
        next_event,
        now(),
        coalesce(new.verification_source, 'NIRDHOOM_STATUS_TRANSITION'),
        (select auth.uid()),
        jsonb_build_object('from_status', old.status, 'to_status', new.status)
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists residue_lot_event_ledger on public.residue_lots;
create trigger residue_lot_event_ledger
after insert or update of status on public.residue_lots
for each row execute function public.record_residue_lot_event();

revoke all on function public.record_residue_lot_event() from public, anon, authenticated;

comment on table public.residue_lots is
  'First-class residue object: field origin, quantity/quality, machine/pickup window, provenance, verification and buyer/custody state.';
comment on column public.residue_lots.geometry_provenance is
  'Provenance metadata for the field geometry used by this lot; this does not assert authoritative cadastral ownership.';
comment on column public.residue_lots.verification_source is
  'Source of the verification decision. Remote sensing may support the decision but is not itself proof of no burning.';
