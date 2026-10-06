-- NIRDHOOM private Realtime authorization for live operational refreshes.
drop policy if exists "nirdhoom live operations realtime read" on realtime.messages;
create policy "nirdhoom live operations realtime read"
on realtime.messages
for select
to authenticated
using (realtime.topic() = 'nirdhoom-live-operations');
