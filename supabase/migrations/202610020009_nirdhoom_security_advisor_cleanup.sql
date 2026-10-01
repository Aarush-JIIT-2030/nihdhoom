-- NIRDHOOM V7.6: close Supabase security/performance advisor findings.
-- SECURITY DEFINER trigger helpers are not RPC endpoints. Operational RPCs remain
-- callable only by authenticated users and enforce role/ownership internally.

revoke all on function public.prevent_farmer_field_tampering() from public, anon, authenticated;
revoke all on function public.prevent_self_privileged_profile() from public, anon, authenticated;
revoke all on function public.validate_evidence_asset() from public, anon, authenticated;

revoke all on function public.reserve_clearance_booking_v2(uuid,date) from public, anon;
grant execute on function public.reserve_clearance_booking_v2(uuid,date) to authenticated;

revoke all on function public.accept_buyer_offer(uuid) from public, anon;
grant execute on function public.accept_buyer_offer(uuid) to authenticated;

revoke all on function public.cancel_clearance_booking(uuid) from public, anon;
grant execute on function public.cancel_clearance_booking(uuid) to authenticated;

revoke all on function public.record_verification_review(uuid,text,numeric,jsonb) from public, anon;
grant execute on function public.record_verification_review(uuid,text,numeric,jsonb) to authenticated;

revoke all on function public.transition_job(uuid,text,jsonb) from public, anon;
grant execute on function public.transition_job(uuid,text,jsonb) to authenticated;

revoke all on function public.verify_field_geometry(uuid,text,jsonb) from public, anon;
grant execute on function public.verify_field_geometry(uuid,text,jsonb) to authenticated;

drop index if exists public.buyers_profile_unique_idx;

drop policy if exists "buyer creates own offer" on public.buyer_offers;
create policy "buyer creates own offer" on public.buyer_offers
for insert to authenticated
with check (
  exists(
    select 1 from public.profiles p
    where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')
  )
  or exists(
    select 1 from public.buyers b
    where b.id=buyer_id and b.profile_id=(select auth.uid()) and b.active=true
  )
);

drop policy if exists "operator inserts linked evidence" on public.evidence_assets;
create policy "operator inserts linked evidence" on public.evidence_assets
for insert to authenticated
with check (
  (select p.role from public.profiles p where p.id=(select auth.uid()))='operator'
  and created_by=(select auth.uid())
  and exists(
    select 1
    from public.jobs j
    join public.bookings b on b.id=j.booking_id
    where j.operator_id=(select auth.uid())
      and j.status in ('ARRIVED','BALING','PROOF_PENDING','COMPLETED')
      and b.id=evidence_assets.booking_id
      and b.field_id=evidence_assets.field_id
  )
);