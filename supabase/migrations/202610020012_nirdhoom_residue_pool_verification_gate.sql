-- Pool only verified residue; expose open buyer demand to authenticated participants.
drop policy if exists "buyers read own demands" on public.buyer_demands;
create policy "authenticated read open demands" on public.buyer_demands
for select to authenticated using (
  status='OPEN'
  or buyer_id=(select auth.uid())
  or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin'))
);

drop policy if exists "verified lot owners can commit" on public.residue_pool_members;
create policy "verified lot owners can commit" on public.residue_pool_members
for insert to authenticated
with check (
  farmer_id=(select auth.uid())
  and exists(
    select 1 from public.residue_lots l
    join public.fields f on f.id=l.field_id
    where l.id=residue_lot_id
      and f.owner_id=(select auth.uid())
      and l.status in ('VERIFIED','VERIFIED_NON_BURN')
  )
);

create or replace function public.join_residue_pool(p_pool_id uuid, p_quantity_tonnes numeric)
returns public.residue_pool_members
language plpgsql
security definer
set search_path = public
as $$
declare
  lot_row public.residue_lots%rowtype;
  member_row public.residue_pool_members%rowtype;
  remaining numeric;
  actor uuid := (select auth.uid());
begin
  if actor is null then raise exception 'authentication required'; end if;
  if p_quantity_tonnes <= 0 then raise exception 'quantity must be positive'; end if;

  select l.* into lot_row
  from public.residue_lots l
  join public.fields f on f.id=l.field_id
  where f.owner_id=actor
    and l.status in ('VERIFIED','VERIFIED_NON_BURN')
  order by l.created_at asc
  for update of l
  limit 1;

  if lot_row.id is null then raise exception 'no verified residue lot'; end if;

  select greatest(0, p.target_tonnes - p.current_tonnes) into remaining
  from public.residue_pools p where p.id=p_pool_id and p.status='FILLING' for update;

  if remaining is null then raise exception 'pool is not accepting commitments'; end if;
  if p_quantity_tonnes > remaining then raise exception 'commitment exceeds pool remaining capacity'; end if;
  if exists(select 1 from public.residue_pool_members m where m.pool_id=p_pool_id and m.residue_lot_id=lot_row.id and m.status='COMMITTED') then
    raise exception 'residue lot already committed to this pool';
  end if;

  insert into public.residue_pool_members(pool_id,residue_lot_id,farmer_id,committed_tonnes)
  values(p_pool_id,lot_row.id,actor,p_quantity_tonnes)
  returning * into member_row;

  update public.residue_pools
  set current_tonnes=current_tonnes+p_quantity_tonnes,
      status=case when current_tonnes+p_quantity_tonnes >= target_tonnes then 'MATCHED' else status end
  where id=p_pool_id;

  return member_row;
end;
$$;

revoke execute on function public.join_residue_pool(uuid,numeric) from anon;
revoke execute on function public.join_residue_pool(uuid,numeric) from public;
grant execute on function public.join_residue_pool(uuid,numeric) to authenticated;
