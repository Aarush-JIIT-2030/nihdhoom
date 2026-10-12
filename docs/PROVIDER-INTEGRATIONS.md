# NIRDHOOM provider integrations

## 1. Hosting — Vercel

The Vercel project is the production frontend/API host. The repository now relies on Vercel's default Node.js runtime for `/api` functions and pins Node 24.x in `package.json`. The invalid custom runtime declaration was removed from `vercel.json`.

Required Vercel variables should be configured in the Vercel dashboard, not committed to Git:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_NIRDHOOM_DEMO_MODE=false`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (if Sathi is enabled)
- `DISPATCH_SERVICE_URL`
- `DISPATCH_SERVICE_TOKEN`

## 2. AI assistant — Groq + OpenAI fallback

NIRDHOOM Sathi supports Groq through the OpenAI-compatible Chat Completions API. Configure `GROQ_API_KEY` and optionally `GROQ_MODEL`; when Groq is unavailable, a configured `OPENAI_API_KEY` is used as a fallback. Both providers are server-only and are never exposed to the browser.

## 3. Farmer sign-in code — Supabase Auth email OTP

NIRDHOOM signs farmers in with a 6-digit code sent by email. The frontend calls `signInWithOtp({ email, options: { shouldCreateUser: true } })` and `verifyOtp({ email, token, type: 'email' })`. No SMS provider, DLT registration or per-message cost is involved. Setup steps (Email provider, `{{ .Token }}` in the Magic Link and Confirm signup templates, Site URL, custom SMTP) are in [GO-LIVE.md](GO-LIVE.md) section 2.

For production, enable the Email provider and attach a custom SMTP sender, because Supabase's built-in mailer is heavily rate limited and meant for testing only. Enable CAPTCHA and keep the OTP rate limits on before a field pilot. Phone/SMS login was removed from the app; the earlier Twilio trial failure below is kept only as history.

**Historical (SMS, superseded by email login):** Supabase Auth logs recorded two OTP delivery failures with HTTP 422 / `sms_send_failed`; Twilio returned error 572006, `Invalid template name. Trial accounts can only use predefined SMS templates`. Resolve the configured SMS template/provider mismatch or upgrade the Twilio account to permit the intended custom template. Then verify the sender ID, message template and India's DLT requirements, and retest with a dedicated test phone before the pilot. See [Twilio trial restrictions](https://www.twilio.com/docs/usage/trials) and [Supabase phone sign-in](https://supabase.com/docs/guides/auth/phone-login).

The live flow creates/updates a farmer `profiles` row only after successful OTP verification.

## 4. Cadastral / Khasra — Punjab official sources

The integration boundary uses Punjab's official land-record sources:

- BhuNaksha: https://gisbhunaksha.punjab.gov.in/index.jsp
- Punjab Land Records cadastral map: https://jamabandi.punjab.gov.in/CadastralMap.aspx

These portals expose district/tehsil/village/Khasra-oriented cadastral viewing. The public BhuNaksha page explicitly labels its displayed spatial data as provisional and for viewing, not legal/administrative/financial use.

NIRDHOOM therefore does **not** scrape or treat the public viewer as an authoritative API. The repository has an authenticated adapter endpoint that returns the official source references. Automatic polygon ingestion should be switched on only after the relevant state authority provides an authorized API/export or approved data feed. Until then, `boundary_source=cadastral` must only be set by an authorized ingestion workflow.

## 5. Telegram — primary farmer channel

NIRDHOOM uses Telegram as the primary farmer communication channel in this release. The repository includes a secret-verified webhook, authenticated one-time account linking and server-side Mini App identity verification.

Required secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_BOT_USERNAME`
- `SUPABASE_SERVICE_ROLE_KEY`

The webhook validates Telegram's `x-telegram-bot-api-secret-token` header. Link tokens are single-use, expire after 10 minutes and are stored only as SHA-256 hashes. Mini App `initData` is verified server-side before a linked profile is returned.

See `docs/TELEGRAM-INTEGRATION.md` for setup and operational checks.

## 6. Weather — Open-Meteo

The weather adapter uses Open-Meteo's forecast API for prototype/evaluation use. It requests temperature, humidity, precipitation probability/amount, wind, gusts and shallow soil moisture and persists a snapshot to Supabase when the server service-role key is configured.

Open-Meteo's free endpoint is for non-commercial use and requires CC-BY attribution. For a commercial NIRDHOOM deployment, configure a paid Open-Meteo endpoint/API key (or replace the provider adapter with another commercial weather provider).

## 7. Dispatch — Render + FastAPI + OR-Tools

The OR-Tools service is configured for Render in `render.yaml`. It runs from `services/dispatch-ortools`, exposes `/health` and `/solve`, and requires `DISPATCH_SERVICE_TOKEN`.

After the Render service is created, copy its `/solve` URL into Vercel as `DISPATCH_SERVICE_URL` and use the same random secret for `DISPATCH_SERVICE_TOKEN` on both sides.

The Vercel dispatch gateway validates the solver's assignments before returning them. If the remote solver is unavailable, it returns a clearly labelled heuristic fallback rather than pretending it is an optimized plan.
