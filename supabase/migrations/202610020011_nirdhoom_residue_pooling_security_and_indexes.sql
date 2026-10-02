-- Lock residue pooling SECURITY DEFINER RPCs to signed-in users.
revoke execute on function public.join_residue_pool(uuid,numeric) from anon;
revoke execute on function public.join_residue_pool(uuid,numeric) from public;
grant execute on function public.join_residue_pool(uuid,numeric) to authenticated;

revoke execute on function public.create_residue_pool(text,numeric,date,uuid) from anon;
revoke execute on function public.create_residue_pool(text,numeric,date,uuid) from public;
grant execute on function public.create_residue_pool(text,numeric,date,uuid) to authenticated;

create index if not exists buyer_demands_buyer_id_idx on public.buyer_demands(buyer_id);
create index if not exists residue_pools_buyer_demand_id_idx on public.residue_pools(buyer_demand_id);
create index if not exists residue_pools_created_by_idx on public.residue_pools(created_by);
create index if not exists residue_pool_members_farmer_id_idx on public.residue_pool_members(farmer_id);
