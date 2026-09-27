-- NIRDHOOM V7: close the field -> machine -> evidence -> lot -> payment loop.
-- Run after 001, 002 and 003.

create extension if not exists pgcrypto;
create extension if not exists postgis with schema extensions;

alter table public.buyers add column if not exists profile_id uuid references public.profiles(id) on delete set null;
create unique index if not exists buyers_profile_id_unique on public.buyers(profile_id) where profile_id is not null;

-- Make the production geometry authoritative when supplied, while preserving the farmer-declared acreage.
alter table public.fields add column if not exists geometry_area_acres numeric(10,3);
alter table public.fields add column if not exists geometry_verified_at timestamptz;
alter table public.fields add column if not exists geometry_verified_by uuid references public.profiles(id);
alter table public.fields add column if not exists consent_id uuid references public.consents(id);

create or replace function public.refresh_field_geometry_metrics()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.boundary is not null then
    new.geometry_area_acres := round((extensions.ST_Area(new.boundary) / 4046.8564224)::numeric, 3);
  else
    new.geometry_area_acres := null;
  end if;
  return new;
end;
$$;

drop trigger if exists refresh_field_geometry_metrics on public.fields;
create trigger refresh_field_geometry_metrics
before insert or update of boundary on public.fields
for each row execute function public.refresh_field_geometry_metrics();

create index if not exists bookings_active_field_date_idx
on public.bookings(field_id, requested_date)
where status not in ('CANCELLED','FAILED');

create index if not exists jobs_status_slot_idx on public.jobs(status, slot_start, slot_end);
create index if not exists machine_locations_recent_idx on public.machine_locations(machine_id, recorded_at desc);
create index if not exists evidence_booking_time_idx on public.evidence_assets(booking_id, created_at desc);
create index if not exists residue_lots_field_status_idx on public.residue_lots(field_id, status);

alter table public.jobs add column if not exists failure_reason text;
alter table public.jobs add column if not exists last_transition_at timestamptz;
alter table public.evidence_assets add column if not exists sha256 text;
alter table public.evidence_assets add column if not exists gps_accuracy_m numeric(8,2);
alter table public.evidence_assets add column if not exists sync_source text default 'online';
alter table public.residue_lots add column if not exists booking_id uuid references public.bookings(id);
alter table public.residue_lots add column if not exists job_id uuid references public.jobs(id);
alter table public.residue_lots add column if not exists weight_kg numeric(12,2);
alter table public.residue_lots add column if not exists moisture_checked_at timestamptz;
alter table public.residue_lots add column if not exists chain_of_custody jsonb not null default '{}'::jsonb;
alter table public.residue_lots add column if not exists updated_at timestamptz not null default now();
alter table public.payments add column if not exists idempotency_key text;
alter table public.payments add column if not exists webhook_received_at timestamptz;
alter table public.payments add column if not exists failure_reason text;
create unique index if not exists payments_idempotency_key_idx on public.payments(idempotency_key) where idempotency_key is not null;

-- One active booking per field/date prevents duplicate reservations from double-clicks or retries.
create unique index if not exists one_active_booking_per_field_date
on public.bookings(field_id, requested_date)
where status not in ('CANCELLED','FAILED');

-- Transactional booking reservation. The quote is supplied by the server-side quote service and is locked into the booking.
create or replace function public.reserve_clearance_booking(
  p_field_id uuid,
  p_requested_date date,
  p_rate_per_acre numeric,
  p_quoted_amount numeric,
  p_guaranteed_by_date date,
  p_penalty_amount numeric,
  p_pricing_band text,
  p_quote_metadata jsonb
)
returns public.bookings
language plpgsql
security invoker
set search_path = public
as $$
declare
  f public.fields%rowtype;
  b public.bookings%rowtype;
begin
  select * into f from public.fields where id=p_field_id for update;
  if not found or f.owner_id <> auth.uid() then raise exception 'Field is not owned by the current farmer'; end if;
  if coalesce(f.consent_id::text,'') = '' and not exists(select 1 from public.consents c where c.profile_id=auth.uid() and c.consent_type='farmer_network' and c.revoked_at is null) then
    raise exception 'Active farmer consent is required before booking';
  end if;
  if p_requested_date < current_date then raise exception 'Requested date is in the past'; end if;
  if p_requested_date > current_date + 90 then raise exception 'Requested date is outside the booking window'; end if;
  if p_rate_per_acre is null or p_quoted_amount is null or p_rate_per_acre <= 0 or p_quoted_amount <= 0
     or p_rate_per_acre > 100000 or p_quoted_amount > 100000000 then raise exception 'Invalid quote'; end if;
  if p_guaranteed_by_date is null or p_guaranteed_by_date < p_requested_date
     or p_guaranteed_by_date > p_requested_date + 30 then raise exception 'Invalid guarantee date'; end if;
  if p_penalty_amount is null or p_penalty_amount < 0 or p_penalty_amount > p_quoted_amount then raise exception 'Invalid penalty amount'; end if;
  if p_pricing_band is null or length(trim(p_pricing_band))=0 or length(p_pricing_band)>80 then raise exception 'Invalid pricing band'; end if;
  if p_quote_metadata is not null and jsonb_typeof(p_quote_metadata)<>'object' then raise exception 'Quote metadata must be an object'; end if;
  insert into public.bookings(field_id,requested_date,rate_per_acre,quoted_amount,guaranteed_by_date,penalty_amount,pricing_band,quote_metadata,status,accepted_at)
  values(p_field_id,p_requested_date,p_rate_per_acre,p_quoted_amount,p_guaranteed_by_date,p_penalty_amount,p_pricing_band,coalesce(p_quote_metadata,'{}'::jsonb),'BOOKED',now())
  returning * into b;
  update public.fields set status='BOOKED',clearance_deadline=(p_guaranteed_by_date::text||'T18:00:00+05:30')::timestamptz,updated_at=now() where id=p_field_id;
  return b;
exception when unique_violation then
  raise exception 'This field already has an active booking for that date';
end;
$$;

-- V7 role-specific writes.
drop policy if exists "farmer creates own fields" on public.fields;
create policy "farmer creates own fields with consent" on public.fields for insert to authenticated with check (
  owner_id=auth.uid() and exists(select 1 from public.consents c where c.profile_id=auth.uid() and c.consent_type='farmer_network' and c.revoked_at is null)
);

drop policy if exists "farmer creates own bookings" on public.bookings;
-- Booking creation is intentionally RPC-only after V7.
create policy "farmer updates own booking cancellation" on public.bookings for update to authenticated using(
  exists(select 1 from public.fields f where f.id=field_id and f.owner_id=auth.uid())
) with check(status in ('BOOKED','CANCELLED'));

drop policy if exists "operational roles create field events" on public.field_events;
create policy "operational roles create field events" on public.field_events for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('operator','dispatcher','verifier','admin'))
);

grant update on public.bookings to authenticated;
grant select, insert on public.verification_events to authenticated;

-- V7 security correction: operational RPCs cross farmer-owned rows, so they run as definer
-- after validating the caller role. Farmers cannot directly mutate booking quote/rate fields.
create or replace function public.cancel_clearance_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare b public.bookings%rowtype;
begin
  select * into b from public.bookings where id=p_booking_id for update;
  if not found then raise exception 'Booking not found'; end if;
  if not exists(select 1 from public.fields f where f.id=b.field_id and f.owner_id=auth.uid()) then raise exception 'Booking is not owned by the current farmer'; end if;
  if b.status not in ('BOOKED','MACHINE_ASSIGNED') then raise exception 'Booking cannot be cancelled at this stage'; end if;
  update public.bookings set status='CANCELLED',cancelled_at=now(),updated_at=now() where id=p_booking_id returning * into b;
  update public.fields set status='CANCELLED',updated_at=now() where id=b.field_id;
  return b;
end;
$$;

grant execute on function public.cancel_clearance_booking(uuid) to authenticated;

drop policy if exists "farmer updates own booking cancellation" on public.bookings;
create policy "dispatcher updates booking assignments" on public.bookings for update to authenticated using(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('dispatcher','admin'))
) with check(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('dispatcher','admin'))
);

grant update on public.bookings to authenticated;

-- Recreate the cross-row functions as SECURITY DEFINER after the authorization checks.
create or replace function public.transition_job(
  p_job_id uuid,
  p_next_status text,
  p_metadata jsonb default '{}'::jsonb
)
returns public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare j public.jobs%rowtype; role_name text; allowed boolean := false;
begin
  select * into j from public.jobs where id=p_job_id for update;
  if not found then raise exception 'Job not found'; end if;
  select role into role_name from public.profiles where id=auth.uid();
  if j.operator_id=auth.uid() or role_name in ('dispatcher','admin') then
    allowed := (j.status='ASSIGNED' and p_next_status='ARRIVED') or (j.status='ARRIVED' and p_next_status='BALING') or (j.status='BALING' and p_next_status='PROOF_PENDING') or (j.status='PROOF_PENDING' and p_next_status='COMPLETED') or (p_next_status in ('FAILED','CANCELLED') and j.status not in ('COMPLETED','FAILED','CANCELLED'));
  end if;
  if not allowed then raise exception 'Invalid job transition'; end if;
  if p_next_status='COMPLETED' and not exists(
    select 1 from public.evidence_assets e
    where e.booking_id=j.booking_id and e.field_id=(select field_id from public.bookings where id=j.booking_id)
      and e.kind in ('field_photo','bale_photo','weighment')
      and e.storage_path is not null and length(trim(e.storage_path))>0
  ) then raise exception 'Field photo, bale photo, or weighment evidence is required before completion'; end if;
  if p_metadata is not null and jsonb_typeof(p_metadata)<>'object' then raise exception 'Transition metadata must be an object'; end if;
  update public.jobs set status=p_next_status,actual_arrived_at=case when p_next_status='ARRIVED' then now() else actual_arrived_at end,actual_completed_at=case when p_next_status='COMPLETED' then now() else actual_completed_at end,last_transition_at=now(),route_metadata=coalesce(route_metadata,'{}'::jsonb)||coalesce(p_metadata,'{}'::jsonb),updated_at=now() where id=p_job_id returning * into j;
  update public.bookings set status=case when p_next_status='COMPLETED' then 'CLEARED_PENDING_AUDIT' when p_next_status='CANCELLED' then 'CANCELLED' else status end,updated_at=now() where id=j.booking_id;
  update public.fields f set status=case when p_next_status='ARRIVED' then 'ON_THE_WAY' when p_next_status='BALING' then 'BALING_IN_PROGRESS' when p_next_status='COMPLETED' then 'CLEARED_PENDING_AUDIT' when p_next_status='CANCELLED' then 'CANCELLED' else f.status end,updated_at=now() where f.id=(select field_id from public.bookings where id=j.booking_id);
  return j;
end;
$$;

create or replace function public.record_verification_review(
  p_field_id uuid,
  p_result text,
  p_confidence numeric,
  p_metadata jsonb default '{}'::jsonb
)
returns public.verification_events
language plpgsql
security definer
set search_path = public
as $$
declare v public.verification_events%rowtype; role_name text;
begin
  select role into role_name from public.profiles where id=auth.uid();
  if role_name not in ('verifier','dispatcher','admin') then raise exception 'Verifier role required'; end if;
  if p_result not in ('VERIFIED_NON_BURN','BURN_DETECTED','INCONCLUSIVE','REQUIRES_FIELD_REVIEW') then raise exception 'Unsupported verification result'; end if;
  if p_confidence is null or p_confidence < 0 or p_confidence > 100 then raise exception 'Confidence must be between 0 and 100'; end if;
  if p_metadata is not null and jsonb_typeof(p_metadata)<>'object' then raise exception 'Verification metadata must be an object'; end if;
  if not exists(select 1 from public.fields f where f.id=p_field_id) then raise exception 'Field not found'; end if;
  if p_result='VERIFIED_NON_BURN' and not exists(
    select 1 from public.evidence_assets e
    join public.bookings b on b.id=e.booking_id
    join public.jobs j on j.booking_id=b.id
    where e.field_id=p_field_id and j.status='COMPLETED'
      and e.kind in ('field_photo','bale_photo','weighment')
  ) then raise exception 'Completed-job field evidence is required before verification'; end if;
  insert into public.verification_events(field_id,method,result,confidence,metadata)
  values(p_field_id,'field_evidence_plus_firms',p_result,p_confidence,coalesce(p_metadata,'{}'::jsonb)) returning * into v;
  if p_result='VERIFIED_NON_BURN' then update public.fields set status='VERIFIED_NON_BURN',updated_at=now() where id=p_field_id; end if;
  return v;
end;
$$;

create or replace function public.accept_buyer_offer(p_offer_id uuid)
returns public.buyer_offers
language plpgsql
security definer
set search_path = public
as $$
declare o public.buyer_offers%rowtype; role_name text; updated_lot_id uuid;
begin
  select role into role_name from public.profiles where id=auth.uid();
  if role_name not in ('buyer','dispatcher','admin') then raise exception 'Buyer/dispatcher role required'; end if;
  select * into o from public.buyer_offers where id=p_offer_id and status='OPEN' and (valid_until is null or valid_until > now()) for update;
  if not found then raise exception 'Offer is no longer open or has expired'; end if;
  if role_name='buyer' and not exists(select 1 from public.buyers b where b.id=o.buyer_id and b.profile_id=auth.uid() and b.active) then
    raise exception 'Offer does not belong to the current buyer';
  end if;
  update public.residue_lots set assigned_buyer_id=o.buyer_id,status='ALLOCATED',updated_at=now()
  where id=o.lot_id and status in ('AVAILABLE','OPEN') and (quantity_tonnes is null or quantity_tonnes >= o.quantity_tonnes)
  returning id into updated_lot_id;
  if updated_lot_id is null then raise exception 'Residue lot is no longer available or has insufficient quantity'; end if;
  update public.buyer_offers set status='ACCEPTED' where id=p_offer_id returning * into o;
  return o;
end;
$$;

-- Operational write policies for the connected handoffs.
create policy "dispatcher creates jobs" on public.jobs for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('dispatcher','admin'))
);
create policy "dispatcher updates jobs" on public.jobs for update to authenticated using(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('dispatcher','admin'))
) with check(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('dispatcher','admin'))
);

grant insert on public.jobs to authenticated;

drop policy if exists "farmer creates own residue lots" on public.residue_lots;
create policy "operator creates linked residue lot" on public.residue_lots for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='operator')
  and exists(select 1 from public.jobs j join public.bookings b on b.id=j.booking_id join public.fields f on f.id=b.field_id where j.id=public.residue_lots.job_id and j.operator_id=auth.uid() and j.status='COMPLETED' and f.id=public.residue_lots.field_id)
);
grant insert on public.residue_lots to authenticated;

create policy "buyer creates offer" on public.buyer_offers for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('buyer','dispatcher','admin'))
);
grant insert on public.buyer_offers to authenticated;


-- Explicit execute grants for the single authoritative V7 RPC definitions.
grant execute on function public.reserve_clearance_booking(uuid,date,numeric,numeric,date,numeric,text,jsonb) to authenticated;
grant execute on function public.transition_job(uuid,text,jsonb) to authenticated;
grant execute on function public.record_verification_review(uuid,text,numeric,jsonb) to authenticated;
grant execute on function public.accept_buyer_offer(uuid) to authenticated;

-- Do not leave security-definer RPCs executable by anonymous or PUBLIC roles.
revoke all on function public.cancel_clearance_booking(uuid) from public, anon;
revoke all on function public.reserve_clearance_booking(uuid,date,numeric,numeric,date,numeric,text,jsonb) from public, anon;
revoke all on function public.transition_job(uuid,text,jsonb) from public, anon;
revoke all on function public.record_verification_review(uuid,text,numeric,jsonb) from public, anon;
revoke all on function public.accept_buyer_offer(uuid) from public, anon;
grant execute on function public.cancel_clearance_booking(uuid) to authenticated;
grant execute on function public.reserve_clearance_booking(uuid,date,numeric,numeric,date,numeric,text,jsonb) to authenticated;
grant execute on function public.transition_job(uuid,text,jsonb) to authenticated;
grant execute on function public.record_verification_review(uuid,text,numeric,jsonb) to authenticated;
grant execute on function public.accept_buyer_offer(uuid) to authenticated;
