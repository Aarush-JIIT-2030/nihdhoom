import { createHmac, timingSafeEqual } from 'node:crypto';

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith('sha256=')) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return Response.json({ error: 'Webhook verification failed' }, { status: 403 });
}

export async function POST(request: Request) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return Response.json({ error: 'Webhook secret is not configured' }, { status: 503 });

  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get('x-hub-signature-256'), secret)) {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const messageIds: string[] = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      for (const message of change?.value?.messages || []) {
        if (typeof message?.id === 'string') messageIds.push(message.id);
      }
    }
  }

  return Response.json({ received: true, message_ids: messageIds }, { status: 200 });
}
