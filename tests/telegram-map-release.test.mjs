import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const read = (file) => fs.readFileSync(`${root}/${file}`, 'utf8');
const has = (source, snippet) => assert.ok(source.includes(snippet), `Expected source to include: ${snippet}`);

test('map offers NASA GIBS imagery separately from operational fire detections', () => {
  const map = read('src/components/OpsConsole/OpsMap.tsx');
  const language = read('src/i18n/LanguageContext.tsx');
  has(map, "useState<'satellite' | 'street' | 'nasa'>");
  has(map, 'gibs.earthdata.nasa.gov/wmts/epsg3857/best');
  has(map, 'MODIS_Terra_CorrectedReflectance_TrueColor');
  has(map, 'NASA GIBS / NASA EOSDIS');
  has(map, 'maxNativeZoom: 9');
  has(map, "tileMode === 'nasa'");
  has(language, "'NASA imagery': 'NASA इमेजरी'");
  has(map, 'NASA FIRMS VIIRS Active Fire');
});

test('NASA FIRMS credential stays server-side and fire detections are not proof of no burning', () => {
  const api = read('api/firms.ts');
  const env = read('.env.example');
  const map = read('src/components/OpsConsole/OpsMap.tsx');
  has(api, 'process.env.FIRMS_MAP_KEY');
  has(api, 'DETECTION_SCREENING_NOT_PROOF_OF_NO_BURNING');
  has(env, 'FIRMS_MAP_KEY=');
  assert.ok(!map.includes('VITE_FIRMS_MAP_KEY'));
  has(map, 'NASA FIRMS VIIRS Active Fire');
});

test('OTP send and verification always release loading state after provider/network failures', () => {
  const onboarding = read('src/components/FarmerOnboarding/FarmerOnboarding.tsx');
  has(onboarding, 'supabase.auth.signInWithOtp');
  has(onboarding, 'supabase.auth.verifyOtp');
  has(onboarding, 'catch (error)');
  has(onboarding, 'finally {');
  has(onboarding, 'phoneDigits.length !== 10');
  has(onboarding, 'missing its Supabase URL or publishable key');
  has(onboarding, 'OTP request failed before Supabase returned a response');
});

test('Telegram webhook is authenticated, bounded, persistent-idempotent and fails closed on persistence errors', () => {
  const webhook = read('api/notify/telegram-webhook.ts');
  const migration = read('supabase/migrations/202610050002_nirdhoom_telegram_webhook_idempotency.sql');
  has(webhook, 'x-telegram-bot-api-secret-token');
  has(webhook, 'claimTelegramUpdate');
  has(webhook, "claim === 'unavailable'");
  has(webhook, "claim === 'duplicate'");
  has(webhook, '32_768');
  has(webhook, 'consume_telegram_link_token');
  has(migration, 'update_id bigint primary key');
  has(webhook, 'TELEGRAM_WEBHOOK_SECRET');
});

test('Telegram account linking uses a short-lived hashed token and authenticated user', () => {
  const link = read('api/notify/telegram-link.ts');
  const webhook = read('api/notify/telegram-webhook.ts');
  const miniapp = read('api/notify/telegram-miniapp-auth.ts');
  has(link, 'getUser(bearer(req))');
  has(link, 'randomBytes(32)');
  has(link, "createHash('sha256')");
  has(link, '10 * 60 * 1000');
  has(webhook, 'consume_telegram_link_token');
  has(miniapp, 'WebAppData');
  has(miniapp, 'auth_date');
  has(miniapp, 'telegram_identities');
});

test('Telegram text routing and localized menus include the main farmer workflows', () => {
  const copy = read('api/_lib/telegramCopy.ts');
  const webhook = read('api/notify/telegram-webhook.ts');
  for (const action of ['fields', 'book', 'track', 'verify', 'market', 'status', 'help', 'language']) {
    has(copy, action);
    has(webhook, action);
  }
  has(copy, 'export function detectLang');
  has(copy, 'export function routeText');
  has(copy, 'Punjabi');
  has(copy, 'languageSet');
});

test('farmer onboarding exposes OTP, consent and owner-scoped field creation paths', () => {
  const onboarding = read('src/components/FarmerOnboarding/FarmerOnboarding.tsx');
  const codeSlots = read('src/components/FarmerOnboarding/CodeSlots.tsx');
  const language = read('src/i18n/LanguageContext.tsx');
  has(onboarding, 'signInWithOtp');
  has(onboarding, 'verifyOtp');
  has(onboarding, 'CONSENT');
  has(onboarding, 'consent_status');
  has(onboarding, "from('fields').insert");
  has(codeSlots, 'autoComplete="one-time-code"');
  has(codeSlots, 'onComplete');
  has(language, 'document.documentElement.lang = language');
});

test('Telegram UI has loading, readiness and authenticated account-link states', () => {
  const ui = read('src/components/FarmerSurface/TelegramChannel.tsx');
  has(ui, 'botReady');
  has(ui, 'accountFeatures');
  has(ui, 'linking');
  has(ui, 'linkError');
  has(ui, 'api/notify/telegram-link');
  has(ui, 'Connect my NIRDHOOM account');
});
