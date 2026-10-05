# NIRDHOOM Telegram integration

Telegram is the primary conversational farmer channel for the current release. WhatsApp is no longer the primary website communication surface.

## Why Telegram

Telegram bots provide a native chat interface, inline keyboards, deep links and Mini Apps. Mini Apps can open the NIRDHOOM web workflow inside Telegram, so the same field-first UI can be used without maintaining a second farmer application.

Vercel's Chat SDK now has an official Telegram adapter. The first NIRDHOOM implementation uses the direct Telegram Bot API so the integration stays small and transparent; Chat SDK can be introduced later if NIRDHOOM needs one bot logic layer across several messaging platforms.

## Environment

Server-only:
- TELEGRAM_BOT_TOKEN — BotFather token. Never expose it with VITE_.
- TELEGRAM_WEBHOOK_SECRET — random secret used in Telegram's secret-token webhook header.
- TELEGRAM_BOT_USERNAME — bot username without @.
- TELEGRAM_MINI_APP_URL — optional HTTPS URL for the Mini App/website.
- VITE_TELEGRAM_BOT_USERNAME — browser-safe bot username used by the website link.

## Webhook

Production endpoint:
https://<your-vercel-domain>/api/notify/telegram-webhook

Configure Telegram with setWebhook using the HTTPS URL and the same TELEGRAM_WEBHOOK_SECRET as the secret_token parameter.

The webhook supports /start, /help, /menu, inline action buttons and photo acknowledgement. It intentionally does not claim a booking, GPS position, verification result or payment without the corresponding authenticated NIRDHOOM record.

## Outbound notifications

POST /api/notify/telegram is restricted to authenticated NIRDHOOM dispatcher/admin users. It accepts a Telegram chat_id and text and sends through the Bot API.

Use it for booking confirmation, operator assignment, machine status, verification result and residue-pool status. Do not send sensitive farmer data to an unlinked chat ID.

## Website handoff

The farmer surface links to https://t.me/<BOT_USERNAME>. The next stage is a Telegram Mini App using the same NIRDHOOM frontend. The Mini App must verify Telegram initialization data server-side before linking the Telegram identity to a NIRDHOOM profile.

## Security before pilot

1. Create the bot with BotFather.
2. Store the token only in Vercel server environment variables.
3. Generate a strong random webhook secret.
4. Set the webhook over HTTPS.
5. Verify the webhook secret header.
6. Link Telegram identity to an authenticated NIRDHOOM profile before exposing field data.
7. Store Telegram chat/user IDs as operational identifiers, not public farmer identity.
8. Add consent and notification preferences.
9. Add durable update_id deduplication before relying on side-effecting workflows.
10. Keep payment disabled in this release.

## Setup

After deployment, configure Telegram Bot API setWebhook with the production webhook URL and secret token. Telegram documents webhook HTTPS requirements and recommends the secret-token mechanism for validating webhook requests.
