-- Use verified PostGIS area as the authoritative booking acreage.
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
security definer
set search_path = public
as $booking$
declare
  f public.fields%rowtype;
  b public.bookings%rowtype;
  billable_acres numeric;
begin
  select * into f from public.fields where id=p_field_id for update;
  if not found or f.owner_id <> auth.uid() then raise exception 'Field is not owned by the current farmer'; end if;
  if coalesce(f.consent_id::text,'') = '' and not exists(select 1 from public.consents c where c.profile_id=auth.uid() and c.consent_type='farmer_network' and c.revoked_at is null) then
    raise exception 'Active farmer consent is required before booking';
  end if;
  if f.boundary is null or not coalesce(f.boundary_verified,false) or f.geometry_area_acres is null then
    raise exception 'Field acreage must be verified before booking';
  end if;
  billable_acres := f.geometry_area_acres;
  if p_requested_date < current_date then raise exception 'Requested date is in the past'; end if;
  if p_requested_date > current_date + 90 then raise exception 'Requested date is outside the booking window'; end if;
  if p_rate_per_acre is null or p_quoted_amount is null or p_rate_per_acre <= 0 or p_quoted_amount <= 0
     or p_rate_per_acre > 100000 or p_quoted_amount > 100000000 then raise exception 'Invalid quote'; end if;
  if round(p_rate_per_acre * billable_acres, 2) <> round(p_quoted_amount, 2) then
    raise exception 'Quoted amount does not match verified field acreage';
  end if;
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
$booking$;

revoke all on function public.reserve_clearance_booking(uuid,date,numeric,numeric,date,numeric,text,jsonb) from public, anon;
grant execute on function public.reserve_clearance_booking(uuid,date,numeric,numeric,date,numeric,text,jsonb) to authenticated;
