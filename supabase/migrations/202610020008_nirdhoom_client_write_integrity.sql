-- NIRDHOOM V7.5: close direct client-write and demo-truth gaps.
-- Booking authority lives in reserve_clearance_booking_v2; field identity and
-- operational state must not be editable through the generic farmer UPDATE path.

revoke insert, update, delete on public.bookings from authenticated;
drop policy if exists "farmer creates own bookings" on public.bookings;
drop policy if exists "farmer updates own bookings" on public.bookings;

create or replace function public.prevent_farmer_field_tampering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
begin
  select role into actor_role from public.profiles where id=auth.uid();

  if actor_role='farmer' and TG_OP='INSERT' and new.owner_id=auth.uid() then
    if coalesce(new.status,'REGISTERED') <> 'REGISTERED'
       or new.clearance_deadline is not null
       or new.boundary_verified
       then
      raise exception 'New farmer fields must begin in REGISTERED state with unverified boundaries';
    end if;
  end if;

  if actor_role='farmer' and TG_OP='UPDATE' and old.owner_id=auth.uid() then
    if new.owner_id is distinct from old.owner_id
       or new.khasra_no is distinct from old.khasra_no
       or new.acreage is distinct from old.acreage
       or new.status is distinct from old.status
       or new.clearance_deadline is distinct from old.clearance_deadline
       or new.center_lat is distinct from old.center_lat
       or new.center_lng is distinct from old.center_lng
       or new.geometry is distinct from old.geometry
       or new.boundary_geojson is distinct from old.boundary_geojson
       or new.boundary_source is distinct from old.boundary_source
       or new.boundary_verified is distinct from old.boundary_verified
       or new.boundary is distinct from old.boundary
       then
      raise exception 'Protected field attributes must be changed through an authorized workflow';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_farmer_field_tampering on public.fields;
create trigger prevent_farmer_field_tampering
before insert or update on public.fields
for each row execute function public.prevent_farmer_field_tampering();

-- The authoritative RPC is the only authenticated client path for booking creation.
grant execute on function public.reserve_clearance_booking_v2(uuid,date) to authenticated;

-- Defense in depth: do not leave the legacy server-authoritative function executable to clients.
revoke all on function public.reserve_clearance_booking(uuid,date,numeric,numeric,date,numeric,text,jsonb) from public, anon, authenticated;

-- Keep the estimate endpoint mathematically consistent with the booking invariant.
