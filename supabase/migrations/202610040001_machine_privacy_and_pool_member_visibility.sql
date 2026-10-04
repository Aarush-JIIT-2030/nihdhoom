-- NIRDHOOM V7.6: tighten machine and residue-pool member privacy.
-- Machines contain operator phone/location telemetry; farmers only need machines
-- assigned to one of their bookings. Pool members expose farmer commitments and
-- are operationally private except to buyers/ops.

drop policy if exists "authenticated reads machines" on public.machines;
create policy "authorized reads machines"
on public.machines
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id=(select auth.uid())
      and p.role in ('dispatcher','admin')
  )
  or operator_user_id=(select auth.uid())
  or exists (
    select 1
    from public.bookings b
    join public.fields f on f.id=b.field_id
    where b.machine_id=public.machines.id
      and f.owner_id=(select auth.uid())
      and b.status not in ('CANCELLED','FAILED')
  )
);

drop policy if exists "operational read pool members" on public.residue_pool_members;
create policy "authorized read pool members"
on public.residue_pool_members
for select
to authenticated
using (
  farmer_id=(select auth.uid())
  or exists (
    select 1 from public.profiles p
    where p.id=(select auth.uid())
      and p.role in ('buyer','operator','dispatcher','verifier','admin')
  )
);
