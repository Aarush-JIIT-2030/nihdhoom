-- NIRDHOOM post-deploy database hygiene.
set search_path = public, extensions;
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select auth.uid()) = old.id and new.role is distinct from old.role then
    raise exception 'role changes must be performed by an authorized operator';
  end if;
  return new;
end; $$;

drop policy if exists "operator reads own machine" on public.machines;

drop policy if exists "operator updates own jobs" on public.jobs;
drop policy if exists "dispatcher updates jobs" on public.jobs;
create policy "authorized updates jobs" on public.jobs for update to authenticated
using(operator_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')))
with check(operator_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')));

drop policy if exists "farmer creates own fields with consent" on public.fields;
create policy "farmer creates own fields with consent" on public.fields for insert to authenticated with check(
  owner_id=(select auth.uid()) and exists(select 1 from public.consents c where c.profile_id=(select auth.uid()) and c.consent_type='farmer_network' and c.revoked_at is null)
);

drop policy if exists "dispatcher updates booking assignments" on public.bookings;
create policy "dispatcher updates booking assignments" on public.bookings for update to authenticated
using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')))
with check(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('dispatcher','admin')));

drop policy if exists "operational roles create field events" on public.field_events;
create policy "operational roles create field events" on public.field_events for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('operator','dispatcher','verifier','admin'))
);

drop policy if exists "operator creates linked residue lot" on public.residue_lots;
create policy "operator creates linked residue lot" on public.residue_lots for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='operator')
  and exists(select 1 from public.jobs j join public.bookings b on b.id=j.booking_id join public.fields f on f.id=b.field_id where j.id=public.residue_lots.job_id and j.operator_id=(select auth.uid()) and j.status='COMPLETED' and f.id=public.residue_lots.field_id)
);

drop policy if exists "buyer creates offer" on public.buyer_offers;
create policy "buyer creates offer" on public.buyer_offers for insert to authenticated with check(
  exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('buyer','dispatcher','admin'))
);

create index if not exists ai_conversations_field_id_idx on public.ai_conversations(field_id);
create index if not exists ai_conversations_profile_id_idx on public.ai_conversations(profile_id);
create index if not exists audit_events_actor_id_idx on public.audit_events(actor_id);
create index if not exists audit_log_actor_id_idx on public.audit_log(actor_id);
create index if not exists bookings_machine_id_idx on public.bookings(machine_id);
create index if not exists buyer_contracts_buyer_id_idx on public.buyer_contracts(buyer_id);
create index if not exists buyer_offers_buyer_id_idx on public.buyer_offers(buyer_id);
create index if not exists credit_transactions_field_id_idx on public.credit_transactions(field_id);
create index if not exists credit_transactions_profile_id_idx on public.credit_transactions(profile_id);
create index if not exists dispatches_buyer_id_idx on public.dispatches(buyer_id);
create index if not exists evidence_assets_created_by_idx on public.evidence_assets(created_by);
create index if not exists field_events_actor_id_idx on public.field_events(actor_id);
create index if not exists field_events_field_id_idx on public.field_events(field_id);
create index if not exists fields_consent_id_idx on public.fields(consent_id);
create index if not exists fields_geometry_verified_by_idx on public.fields(geometry_verified_by);
create index if not exists fields_owner_id_idx on public.fields(owner_id);
create index if not exists firms_observations_matched_field_id_idx on public.firms_observations(matched_field_id);
create index if not exists harvest_forecasts_field_id_idx on public.harvest_forecasts(field_id);
create index if not exists jobs_machine_id_idx on public.jobs(machine_id);
create index if not exists jobs_operator_id_idx on public.jobs(operator_id);
create index if not exists machines_operator_user_id_idx on public.machines(operator_user_id);
create index if not exists notifications_profile_id_idx on public.notifications(profile_id);
create index if not exists payments_booking_id_idx on public.payments(booking_id);
create index if not exists residue_lots_assigned_buyer_id_idx on public.residue_lots(assigned_buyer_id);
create index if not exists residue_lots_booking_id_idx on public.residue_lots(booking_id);
create index if not exists residue_lots_job_id_idx on public.residue_lots(job_id);
create index if not exists residue_lots_storage_yard_id_idx on public.residue_lots(storage_yard_id);
create index if not exists soil_reports_field_id_idx on public.soil_reports(field_id);
create index if not exists soil_reports_profile_id_idx on public.soil_reports(profile_id);
create index if not exists verification_events_field_id_idx on public.verification_events(field_id);
create index if not exists weather_snapshots_field_id_idx on public.weather_snapshots(field_id);
drop index if exists public.machine_locations_recent_idx;
