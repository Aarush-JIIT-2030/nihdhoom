-- Remove the last per-row auth() evaluation warning from the dispatcher job insert policy.
drop policy if exists "dispatcher creates jobs" on public.jobs;
create policy "dispatcher creates jobs" on public.jobs for insert to authenticated
with check(
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin'))
);
