# NIRDHOOM RLS role matrix

The application security boundary is database-level RLS, not React visibility.

The dedicated Supabase test database should be seeded with at least two farmers with fields, two operators with jobs, and two buyers with demands. Run tests/rls_role_matrix.sql as a database owner with row security enabled.

Expected results:

| Actor | Allowed | Denied |
|---|---|---|
| Farmer A | own field | Farmer B field |
| Operator A | assigned job | Operator B job |
| Buyer A | own demand | Buyer B demand |

The SQL captures the test subjects before switching to the authenticated database role, sets request.jwt.claim.sub to each subject, and then checks the actual RLS-filtered rows.

If the fixture set is incomplete, the test must be treated as not run, not as a passing security result.
