# NIRDHOOM connected Supabase

The dedicated NIRDHOOM Supabase project is provisioned in ap-south-1 and the production schema is deployed.

## Project

- Project ref: igqgtlmnwssjaoxkkzbm
- API URL: https://igqgtlmnwssjaoxkkzbm.supabase.co
- Browser key: use the Supabase publishable key as VITE_SUPABASE_PUBLISHABLE_KEY; never commit server secrets.
- Payments remain deliberately non-live for the current release scope.

## Deployed migrations

1. 202609270001_nirdhoom_core
2. 202609270002_nirdhoom_production
3. 202609270003a_nirdhoom_v6_schema
4. 202609270003b_nirdhoom_v6_storage_policies
5. 202609270004_nirdhoom_v7
6. 20261001_nirdhoom_database_hygiene
7. 20261001_nirdhoom_rls_initplan_fix

The split V6 deployment exists because the original PostGIS expression-index statement was rejected by PostgreSQL syntax validation. The repository migration has been corrected to the equivalent parenthesized expression.

## Current database verification

- 27 public tables
- RLS enabled on the NIRDHOOM public tables
- 43 public RLS policies after hygiene consolidation
- 5 authoritative V7 RPCs
- private evidence Storage bucket
- PostGIS 3.3 installed
- no application rows are seeded; live farmer/operator identities must come through Auth

## Required deployment environment

Browser:

VITE_SUPABASE_URL=https://igqgtlmnwssjaoxkkzbm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>

Server functions also require:

SUPABASE_URL=https://igqgtlmnwssjaoxkkzbm.supabase.co
SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>

Provider credentials are intentionally separate:

- DISPATCH_SERVICE_URL / DISPATCH_SERVICE_TOKEN
- FIRMS_MAP_KEY
- WhatsApp / IVR credentials
- AI credentials, if enabled

Do not put service-role, provider, or AI secrets in VITE_* variables.

## Remaining external gates

The database is connected, but these cannot be honestly marked live until credentials/data exist:

- Supabase SMS provider configuration and real OTP delivery
- authoritative cadastral/Khasra source
- real machine/operator records and device GPS
- production OR-Tools service
- FIRMS MAP key and scheduled ingestion
- WhatsApp Cloud API / IVR provider
- real buyer/offtake contracts
- Vercel environment variables and deployment
- field pilot validation
