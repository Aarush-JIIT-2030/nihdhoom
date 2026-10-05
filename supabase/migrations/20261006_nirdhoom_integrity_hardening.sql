-- NIRDHOOM 2026-10-06 integrity hardening.
-- Pin SECURITY DEFINER search paths and prevent residue-lot over-allocation.

alter function public.accept_buyer_offer(uuid) set search_path = '';
alter function public.cancel_clearance_booking(uuid) set search_path = '';
alter function public.create_residue_pool(text,numeric,date,uuid) set search_path = '';
alter function public.join_residue_pool(uuid,numeric) set search_path = '';
alter function public.record_verification_review(uuid,text,numeric,jsonb) set search_path = '';
alter function public.reserve_clearance_booking_v2(uuid,date) set search_path = '';
alter function public.transition_job(uuid,text,jsonb) set search_path = '';
alter function public.verify_field_geometry(uuid,text,jsonb) set search_path = '';
alter function public.consume_telegram_link_token(text,bigint,bigint,text,text,text) set search_path = '';

create or replace function public.join_residue_pool(p_pool_id uuid, p_quantity_tonnes numeric)
returns public.residue_pool_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  lot_id uuid;
  member_row public.residue_pool_members%rowtype;
  remaining numeric;
  actor uuid := (select auth.uid());
begin
  if actor is null then raise exception 'authentication required'; end if;
  if p_quantity_tonnes <= 0 then raise exception 'quantity must be positive'; end if;

  select greatest(0, p.target_tonnes - p.current_tonnes)
    into remaining
  from public.residue_pools p
  where p.id=p_pool_id and p.status='FILLING'
  for update;

  if remaining is null then raise exception 'pool is not accepting commitments'; end if;
  if p_quantity_tonnes > remaining then raise exception 'commitment exceeds pool remaining capacity'; end if;

  select l.id
    into lot_id
  from public.residue_lots l
  join public.fields f on f.id=l.field_id
  where f.owner_id=actor
    and l.status in ('VERIFIED','VERIFIED_NON_BURN')
    and greatest(
      0,
      l.quantity_tonnes - coalesce((
        select sum(m.committed_tonnes)
        from public.residue_pool_members m
        where m.residue_lot_id=l.id and m.status='COMMITTED'
      ),0)
    ) >= p_quantity_tonnes
  order by l.created_at asc
  for update of l
  limit 1;

  if lot_id is null then raise exception 'no verified residue lot with sufficient uncommitted quantity'; end if;

  insert into public.residue_pool_members(pool_id,residue_lot_id,farmer_id,committed_tonnes)
  values(p_pool_id,lot_id,actor,p_quantity_tonnes)
  returning * into member_row;

  update public.residue_pools
  set current_tonnes=current_tonnes+p_quantity_tonnes,
      status=case when current_tonnes+p_quantity_tonnes >= target_tonnes then 'MATCHED' else status end,
      updated_at=now()
  where id=p_pool_id;

  return member_row;
end;
$$;

revoke execute on function public.join_residue_pool(uuid,numeric) from anon;
revoke execute on function public.join_residue_pool(uuid,numeric) from public;
grant execute on function public.join_residue_pool(uuid,numeric) to authenticated;
