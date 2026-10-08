-- Read-only RLS role matrix for a dedicated seeded Supabase test database.
begin;
set local row_security = on;

create temp table nirdhoom_rls_subjects as
select
  (select p.id from public.profiles p join public.fields f on f.owner_id=p.id where p.role='farmer' group by p.id order by p.id limit 1) as farmer_a,
  (select p.id from public.profiles p join public.fields f on f.owner_id=p.id group by p.id having count(*) > 0 order by p.id desc limit 1) as farmer_b,
  (select j.operator_id from public.jobs j join public.profiles p on p.id=j.operator_id where p.role='operator' and j.operator_id is not null group by j.operator_id order by j.operator_id limit 1) as operator_a,
  (select j.operator_id from public.jobs j join public.profiles p on p.id=j.operator_id where p.role='operator' and j.operator_id is not null group by j.operator_id order by j.operator_id desc limit 1) as operator_b,
  (select b.profile_id from public.buyers b join public.buyer_demands d on d.buyer_id=b.id where b.profile_id is not null group by b.profile_id order by b.profile_id limit 1) as buyer_a,
  (select b.profile_id from public.buyers b join public.buyer_demands d on d.buyer_id=b.id where b.profile_id is not null group by b.profile_id order by b.profile_id desc limit 1) as buyer_b;

set local role authenticated;

select set_config('request.jwt.claim.sub', (select farmer_a::text from nirdhoom_rls_subjects), true);
select 'farmer_a_own_field' as check_name,
  (select count(*) from public.fields f where f.owner_id=(select farmer_a from nirdhoom_rls_subjects)) > 0 as passed;
select 'farmer_a_cannot_read_farmer_b_field' as check_name,
  (select count(*) from public.fields f where f.owner_id=(select farmer_b from nirdhoom_rls_subjects)) = 0 as passed;

select set_config('request.jwt.claim.sub', (select operator_a::text from nirdhoom_rls_subjects), true);
select 'operator_a_assigned_job' as check_name,
  (select count(*) from public.jobs j where j.operator_id=(select operator_a from nirdhoom_rls_subjects)) > 0 as passed;
select 'operator_a_cannot_read_operator_b_job' as check_name,
  (select count(*) from public.jobs j where j.operator_id=(select operator_b from nirdhoom_rls_subjects)) = 0 as passed;

select set_config('request.jwt.claim.sub', (select buyer_a::text from nirdhoom_rls_subjects), true);
select 'buyer_a_own_demand' as check_name,
  (select count(*) from public.buyer_demands d join public.buyers b on b.id=d.buyer_id where b.profile_id=(select buyer_a from nirdhoom_rls_subjects)) > 0 as passed;
select 'buyer_a_cannot_read_buyer_b_demand' as check_name,
  (select count(*) from public.buyer_demands d join public.buyers b on b.id=d.buyer_id where b.profile_id=(select buyer_b from nirdhoom_rls_subjects)) = 0 as passed;

commit;
