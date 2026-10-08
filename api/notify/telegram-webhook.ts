declare const process: { env: Record<string, string | undefined> };

const TELEGRAM_API = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? `https://api.telegram.org/bot${encodeURIComponent(token)}` : null;
};

async function sendMessage(chatId: number, text: string, replyMarkup?: unknown) {
  const api = TELEGRAM_API();
  if (!api) return false;
  const response = await fetch(`${api}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
    signal: AbortSignal.timeout(9000),
  });
  return response.ok;
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
    {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      signal: AbortSignal.timeout(7000),
    },
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0] || null;
}

function menu() {
  const rows = [
    [{ text: '🌾 My fields', callback_data: 'fields' }, { text: '🚜 Book clearance', callback_data: 'book' }],
    [{ text: '📍 Track machine', callback_data: 'track' }, { text: '🧾 Verification', callback_data: 'verify' }],
    [{ text: '🌱 Residue market', callback_data: 'market' }],
  ];
  const miniAppUrl = process.env.TELEGRAM_MINI_APP_URL;
  if (miniAppUrl) rows.push([{ text: '📱 Open NIRDHOOM', web_app: { url: miniAppUrl } }]);
  return { inline_keyboard: rows };
}

async function handle(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Telegram webhook secret is not configured' }, { status: 503 });
  if (request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return Response.json({ error: 'Invalid Telegram webhook secret' }, { status: 401 });
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
    const answers: Record<string, string> = {
      fields: '🌾 Your fields will appear here once your Telegram account is linked to your NIRDHOOM farmer profile.',
      book: '🚜 Booking is connected to NIRDHOOM capacity. Open the website/Mini App to select a field and confirm consent before booking.',
      track: '📍 Live machine location is only shown from authenticated operator telemetry.',
      verify: '🧾 Verification combines field evidence, operator records and supporting remote-sensing signals. A missing satellite detection is not proof that no burning occurred.',
      market: '🌱 Residue lots become buyer-visible only after the required verification and pooling gates are satisfied.',
    };
    const api = TELEGRAM_API();
    if (api) {
      await fetch(`${api}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callback.id, text: 'NIRDHOOM Sathi' }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }
    await sendMessage(chatId, answers[String(callback.data)] || 'NIRDHOOM Sathi can help with your field workflow.', menu());
    return Response.json({ ok: true, update_id: updateId });
  }

  const text = String(message?.text || '').trim();
  const firstName = String(message?.from?.first_name || 'farmer');

  if (/^\/start(?:\s|$)/i.test(text)) {
    const startPayload = text.replace(/^\/start/i, '').trim();
    if (startPayload) {
      const linkedProfile = await linkTelegramIdentity(startPayload, message);
      if (linkedProfile) {
        await sendMessage(chatId, '✅ Your Telegram account is securely linked to your NIRDHOOM farmer profile. You can now receive approved field and booking updates here.', menu());
        return Response.json({ ok: true, update_id: updateId, linked: true });
      }
      await sendMessage(chatId, 'This linking link is invalid or expired. Start a new link from your authenticated NIRDHOOM account.', menu());
      return Response.json({ ok: true, update_id: updateId, linked: false });
    }
    await sendMessage(
      chatId,
      `ਸਤ ਸ੍ਰੀ ਅਕਾਲ / नमस्ते ${firstName}! 🌾\n\nI’m NIRDHOOM Sathi. This Telegram channel is your field-first connection for clearance booking, machine status, evidence and verification.\n\nChoose an action below. Live capacity and operational status are only reported from authenticated NIRDHOOM records.`,
      menu(),
    );
    return Response.json({ ok: true, update_id: updateId });
  }

  if (/^\/(help|menu)/i.test(text)) {
    await sendMessage(chatId, 'NIRDHOOM Sathi menu:', menu());
    return Response.json({ ok: true, update_id: updateId });
  }

  if (message?.photo?.length) {
    await sendMessage(chatId, '📷 Photo received. For field evidence, NIRDHOOM will link the upload to an authenticated job/operator record before it can become verification evidence.');
    return Response.json({ ok: true, update_id: updateId });
  }

  await sendMessage(chatId, 'I can help with NIRDHOOM field operations. Use the buttons below, or open the NIRDHOOM web experience from the bot for the full field workflow.', menu());
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
