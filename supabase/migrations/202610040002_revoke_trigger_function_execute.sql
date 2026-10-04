-- NIRDHOOM V7.7: trigger-only functions do not need API EXECUTE privileges.
revoke all on function public.prevent_role_escalation() from public, anon, authenticated;
revoke all on function public.refresh_field_geometry_metrics() from public, anon, authenticated;
revoke all on function public.sync_field_boundary() from public, anon, authenticated;
