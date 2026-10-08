declare const process: { env: Record<string, string | undefined> };

const TELEGRAM_API = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? `https://api.telegram.org/bot${encodeURIComponent(token)}` : null;
};

async function telegram(method: string, body: Record<string, unknown>) {
  const api = TELEGRAM_API();
  if (!api) return false;
  const response = await fetch(`${api}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(9000),
  });
  return response.ok;
}

async function sendMessage(chatId: number, text: string, replyMarkup?: unknown) {
  return telegram('sendMessage', { chat_id: chatId, text, reply_markup: replyMarkup });
}

async function claimTelegramUpdate(updateId: number) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return 'unavailable' as const;
  const response = await fetch(`${supabaseUrl}/rest/v1/telegram_webhook_updates`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ update_id: updateId }),
    signal: AbortSignal.timeout(7000),
  });
  if (response.status === 409) return 'duplicate' as const;
  return response.ok ? 'claimed' as const : 'unavailable' as const;
}

async function linkTelegramIdentity(token: string, message: any) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl || !token) return null;
  const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  const hash = Array.from(new Uint8Array(tokenHash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_telegram_link_token`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_token_hash: hash,
      p_telegram_user_id: Number(message?.from?.id),
      p_telegram_chat_id: Number(message?.chat?.id),
      p_username: message?.from?.username || null,
      p_first_name: message?.from?.first_name || null,
      p_language_code: message?.from?.language_code || null,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  return response.json();
}

async function getLinkedProfile(chatId: number) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  const response = await fetch(
    `${supabaseUrl}/rest/v1/telegram_identities?telegram_chat_id=eq.${chatId}&select=profile_id,notification_enabled&limit=1`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }, signal: AbortSignal.timeout(7000) },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0] || null;
}

async function getFarmerStatus(profileId: string) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const fieldsResponse = await fetch(
    `${supabaseUrl}/rest/v1/fields?owner_id=eq.${encodeURIComponent(profileId)}&select=id,village,status,external_id&order=updated_at.desc&limit=20`,
    { headers, signal: AbortSignal.timeout(7000) },
  );
  if (!fieldsResponse.ok) return null;
  const fields = await fieldsResponse.json();
  const active = fields.filter((field: any) => ['SCHEDULED', 'MACHINE_ASSIGNED', 'ON_THE_WAY', 'BALING_IN_PROGRESS'].includes(field.status));
  const verified = fields.filter((field: any) => field.status === 'VERIFIED_NON_BURN');
  const latest = fields[0];
  return { fieldCount: fields.length, activeCount: active.length, verifiedCount: verified.length, latest };
}

function miniAppUrl(view?: string) {
  const raw = process.env.TELEGRAM_MINI_APP_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (view) url.searchParams.set('view', view);
    return url.toString();
  } catch {
    return null;
  }
}

function actionButton(text: string, view: string) {
  const url = miniAppUrl(view);
  return url ? { inline_keyboard: [[{ text, web_app: { url } }]] } : undefined;
}

function menu() {
  const rows: Array<Array<Record<string, unknown>>> = [
    [{ text: '🌾 My fields', callback_data: 'fields' }, { text: '🚜 Book clearance', callback_data: 'book' }],
    [{ text: '📍 Track machine', callback_data: 'track' }, { text: '🧾 Verification', callback_data: 'verify' }],
    [{ text: '🌱 Residue market', callback_data: 'market' }, { text: '📊 My status', callback_data: 'status' }],
  ];
  const url = miniAppUrl();
  if (url) rows.push([{ text: '📱 Open NIRDHOOM', web_app: { url } }]);
  return { inline_keyboard: rows };
}

async function handleAction(chatId: number, action: string) {
  const identity = await getLinkedProfile(chatId);
  const status = identity?.profile_id ? await getFarmerStatus(identity.profile_id) : null;
  const open = (label: string, view: string) => actionButton(label, view);

  const answers: Record<string, { text: string; markup?: unknown }> = {
    fields: {
      text: status
        ? `🌾 Your NIRDHOOM fields\n\nRegistered: ${status.fieldCount}\nActive operations: ${status.activeCount}\nVerified fields: ${status.verifiedCount}${status.latest ? `\nLatest field: ${status.latest.village || status.latest.external_id || 'registered field'} — ${String(status.latest.status).replaceAll('_', ' ').toLowerCase()}` : ''}`
        : '🌾 Link your NIRDHOOM account first to see your private field status.',
      markup: open('Open My Fields', 'fields'),
    },
    book: {
      text: identity ? '🚜 Start a clearance request from your linked NIRDHOOM account. The booking screen will show only the fields and capacity checks available to your account.' : '🚜 Link your NIRDHOOM account first, then start a clearance request.',
      markup: open('Book clearance', 'booking'),
    },
    track: {
      text: identity ? '📍 Machine tracking uses authenticated operator telemetry. A stale reading is shown as stale rather than treated as current.' : '📍 Link your NIRDHOOM account first to see field-scoped tracking.',
      markup: open('Track operation', 'tracking'),
    },
    verify: {
      text: '🧾 Verification combines field provenance, operator evidence and supporting remote-sensing observations. A missing satellite detection is not proof that no burning occurred.',
      markup: open('Review evidence', 'verification'),
    },
    market: {
      text: '🌱 Only residue that passes the required verification and pooling gates should enter a buyer pathway. A buyer need is not a contract.',
      markup: open('Open residue market', 'market'),
    },
    status: {
      text: status
        ? `📊 NIRDHOOM status\n\nFields: ${status.fieldCount}\nActive operations: ${status.activeCount}\nVerified fields: ${status.verifiedCount}`
        : '📊 No linked farmer account was found. Use NIRDHOOM on the web to securely connect Telegram.',
      markup: open('Open NIRDHOOM', ''),
    },
  };

  const answer = answers[action] || { text: 'NIRDHOOM Sathi can help with fields, clearance, tracking, verification and residue.' };
  await sendMessage(chatId, answer.text, answer.markup || menu());
}

async function handle(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Telegram webhook secret is not configured' }, { status: 503 });
  if (request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return Response.json({ error: 'Invalid Telegram webhook secret' }, { status: 401 });
  }
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (Number.isFinite(contentLength) && contentLength > 32_768) {
    return Response.json({ error: 'Telegram update too large' }, { status: 413 });
  }

  let update: any;
  try { update = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const updateId = Number(update?.update_id);
  if (!Number.isSafeInteger(updateId) || updateId < 0) return Response.json({ received: true, ignored: true });
  const claim = await claimTelegramUpdate(updateId);
  if (claim === 'unavailable') return Response.json({ error: 'Telegram webhook persistence is unavailable' }, { status: 503 });
  if (claim === 'duplicate') return Response.json({ ok: true, duplicate: true, update_id: updateId });

  const message = update?.message;
  const callback = update?.callback_query;
  const chatId = Number(message?.chat?.id ?? callback?.message?.chat?.id);
  if (!Number.isSafeInteger(chatId)) return Response.json({ received: true, ignored: true, update_id: updateId });

  if (callback?.id) {
    await telegram('answerCallbackQuery', { callback_query_id: callback.id, text: 'NIRDHOOM Sathi' });
    await handleAction(chatId, String(callback.data || 'status'));
    return Response.json({ ok: true, update_id: updateId });
  }

  const text = String(message?.text || '').trim();
  const firstName = String(message?.from?.first_name || 'farmer');

  if (/^\/start(?:\s|$)/i.test(text)) {
    const startPayload = text.replace(/^\/start/i, '').trim();
    if (startPayload) {
      const linkedProfile = await linkTelegramIdentity(startPayload, message);
      if (linkedProfile) {
        await sendMessage(chatId, '✅ Telegram is securely linked to your NIRDHOOM farmer profile. Your private field status can now be shown here.', menu());
        return Response.json({ ok: true, update_id: updateId, linked: true });
      }
      await sendMessage(chatId, 'This linking link is invalid or expired. Start a new link from your authenticated NIRDHOOM account.', menu());
      return Response.json({ ok: true, update_id: updateId, linked: false });
    }
    await sendMessage(
      chatId,
      `ਸਤ ਸ੍ਰੀ ਅਕਾਲ / नमस्ते ${firstName}! 🌾\n\nI’m NIRDHOOM Sathi. Use the buttons below for fields, clearance, tracking, verification and residue pathways. Live capacity and operational status are only reported from authenticated NIRDHOOM records.`,
      menu(),
    );
    return Response.json({ ok: true, update_id: updateId });
  }

  if (/^\/(help|menu)/i.test(text)) {
    await sendMessage(chatId, 'NIRDHOOM Sathi menu:', menu());
    return Response.json({ ok: true, update_id: updateId });
  }

  const command = text.match(/^\/(status|fields|book|track|verify|market)\\b/i)?.[1]?.toLowerCase();
  if (command) {
    await handleAction(chatId, command === 'fields' ? 'fields' : command);
    return Response.json({ ok: true, update_id: updateId });
  }

  if (message?.photo?.length) {
    await sendMessage(chatId, '📷 Photo received. It is not treated as verification evidence until NIRDHOOM can associate it with an authenticated job/operator record.');
    return Response.json({ ok: true, update_id: updateId });
  }

  await sendMessage(chatId, 'I can help with NIRDHOOM field operations. Choose an action below.', menu());
  return Response.json({ ok: true, update_id: updateId });
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const configured = Boolean(
      process.env.TELEGRAM_BOT_TOKEN
      && process.env.TELEGRAM_WEBHOOK_SECRET
      && process.env.SUPABASE_URL
      && process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    return res.status(configured ? 200 : 503).json({
      ok: configured,
      configured,
      service: 'nirdhoom-telegram-webhook',
    });
  }
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  const request = new Request('https://nirdhoom.local/api/notify/telegram-webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-telegram-bot-api-secret-token': String(req.headers?.['x-telegram-bot-api-secret-token'] || ''),
    },
    body,
  });
  const response = await handle(request);
  const responseBody = await response.json().catch(() => ({}));
  return res.status(response.status).json(responseBody);
}
