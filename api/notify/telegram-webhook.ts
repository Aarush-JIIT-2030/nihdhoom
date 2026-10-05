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

function menu() {
  return {
    inline_keyboard: [
      [{ text: '🌾 My fields', callback_data: 'fields' }, { text: '🚜 Book clearance', callback_data: 'book' }],
      [{ text: '📍 Track machine', callback_data: 'track' }, { text: '🧾 Verification', callback_data: 'verify' }],
      [{ text: '🌱 Residue market', callback_data: 'market' }],
    ],
  };
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'Telegram webhook secret is not configured' }, { status: 503 });
  if (request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return Response.json({ error: 'Invalid Telegram webhook secret' }, { status: 401 });
  }

  let update: any;
  try { update = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const message = update?.message;
  const callback = update?.callback_query;
  const chatId = Number(message?.chat?.id ?? callback?.message?.chat?.id);
  if (!Number.isSafeInteger(chatId)) return Response.json({ received: true, ignored: true });

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
    return Response.json({ ok: true, update_id: update.update_id });
  }

  const text = String(message?.text || '').trim();
  const firstName = String(message?.from?.first_name || 'farmer');

  if (/^\/start(?:\s|$)/i.test(text)) {
    await sendMessage(
      chatId,
      `ਸਤ ਸ੍ਰੀ ਅਕਾਲ / नमस्ते ${firstName}! 🌾\n\nI’m NIRDHOOM Sathi. This Telegram channel is your field-first connection for clearance booking, machine status, evidence and verification.\n\nChoose an action below. Live capacity and operational status are only reported from authenticated NIRDHOOM records.`,
      menu(),
    );
    return Response.json({ ok: true, update_id: update.update_id });
  }

  if (/^\/(help|menu)/i.test(text)) {
    await sendMessage(chatId, 'NIRDHOOM Sathi menu:', menu());
    return Response.json({ ok: true, update_id: update.update_id });
  }

  if (message?.photo?.length) {
    await sendMessage(chatId, '📷 Photo received. For field evidence, NIRDHOOM will link the upload to an authenticated job/operator record before it can become verification evidence.');
    return Response.json({ ok: true, update_id: update.update_id });
  }

  await sendMessage(chatId, 'I can help with NIRDHOOM field operations. Use the buttons below, or open the NIRDHOOM web experience from the bot for the full field workflow.', menu());
  return Response.json({ ok: true, update_id: update.update_id });
}

export async function GET() {
  return Response.json({ ok: true, service: 'nirdhoom-telegram-webhook' });
}
