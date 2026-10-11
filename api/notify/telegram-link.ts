/// <reference types="node" />
import { createHash, randomBytes } from 'node:crypto';
import { rateLimit } from '../_lib/rateLimit.js';

declare const process: { env: Record<string, string | undefined> };

function bearer(req: any) {
  const value = String(req.headers?.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

async function getUser(accessToken: string) {
  if (!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) || !(process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY) || !accessToken) return null;
  const response = await fetch(`${(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)}/auth/v1/user`, {
    headers: { apikey: (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY), Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  return response.json();
}

async function resolveBotUsername() {
  const configured = String(process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '').trim();
  if (configured) return configured;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return '';
  try {
    const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`, { signal: AbortSignal.timeout(5000) });
    const payload = await response.json();
    return payload?.ok && typeof payload?.result?.username === 'string' ? payload.result.username : '';
  } catch {
    return '';
  }
}

async function ensureFarmerProfile(user: any) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl || !user?.id) return false;
  const metadata = user.user_metadata || {};
  const response = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: user.id,
      full_name: String(metadata.full_name || metadata.name || metadata.fullName || '').trim() || null,
      phone: typeof user.phone === 'string' ? user.phone : null,
      role: 'farmer',
    }),
    signal: AbortSignal.timeout(8000),
  });
  return response.ok;
}

async function supabaseRpc(tokenHash: string, profileId: string, expiresAt: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)) return false;
  const response = await fetch(`${(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)}/rest/v1/telegram_link_tokens`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ token_hash: tokenHash, profile_id: profileId, expires_at: expiresAt }),
    signal: AbortSignal.timeout(8000),
  });
  return response.ok;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!rateLimit(req, res, 'telegram-link', 5, 60_000)) return res.status(429).json({ error: 'Too many link requests' });

  const user = await getUser(bearer(req));
  if (!user?.id) return res.status(401).json({ error: 'Authenticated NIRDHOOM farmer required' });

  const botUsername = await resolveBotUsername();
  if (!botUsername) return res.status(503).json({ error: 'Unable to resolve the Telegram bot username. Check TELEGRAM_BOT_TOKEN and verify the bot with @BotFather.' });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'Server-side Supabase service role is not configured' });
  }
  // Older accounts may predate the auth.users -> profiles trigger. Ensure the
  // authenticated farmer has a profile before creating a token with a profile FK.
  if (!(await ensureFarmerProfile(user))) {
    return res.status(502).json({ error: 'Could not prepare your farmer profile. Check the Supabase profiles table policies and signup trigger.' });
  }

  if (String(req.headers?.['content-length'] || '') && Number(req.headers['content-length']) > 4096) {
    return res.status(413).json({ error: 'Request too large' });
  }

  const raw = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  if (!(await supabaseRpc(hash, user.id, expiresAt))) {
    return res.status(502).json({ error: 'Unable to create Telegram link token' });
  }

  return res.status(200).json({
    ok: true,
    expires_at: expiresAt,
    bot_url: `https://t.me/${encodeURIComponent(botUsername)}?start=${encodeURIComponent(raw)}`,
  });
}
