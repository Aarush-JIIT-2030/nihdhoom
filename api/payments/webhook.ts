declare const process: { env: Record<string, string | undefined> };

async function supabaseWrite(path: string, body: any, query: string) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}${query}`, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length === 1;
}

function safeEqualHex(a: string, b: string) {
  if (!/^[a-f0-9]{64}$/i.test(a) || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < b.length; i++) mismatch |= a.toLowerCase().charCodeAt(i) ^ b.toLowerCase().charCodeAt(i);
  return mismatch === 0;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'Payment webhook is not configured' });

  // Signature verification must use the exact bytes received, not a re-serialized parsed body.
  const rawBody = req.rawBody;
  if (!(typeof rawBody === 'string' || rawBody instanceof Uint8Array)) {
    return res.status(400).json({ error: 'Raw request body is required for signature verification' });
  }
  const signature = String(req.headers?.['x-nirdhoom-signature'] || req.headers?.['x-webhook-signature'] || '');
  const key = await globalThis.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const bytes = typeof rawBody === 'string' ? new TextEncoder().encode(rawBody) : rawBody;
  const mac = await globalThis.crypto.subtle.sign('HMAC', key, bytes);
  const expected = [...new Uint8Array(mac)].map(value => value.toString(16).padStart(2, '0')).join('');
  if (!safeEqualHex(signature, expected)) return res.status(401).json({ error: 'Invalid webhook signature' });

  let body: any;
  try {
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Webhook payload must be an object' });
  }
  const provider = String(body.provider || '').trim();
  const configuredProvider = String(process.env.PAYMENT_PROVIDER || '').trim();
  const reference = String(body.provider_reference || body.id || '').trim();
  if (!configuredProvider || provider !== configuredProvider) {
    return res.status(400).json({ error: 'Webhook provider does not match the configured payment provider' });
  }
  const event = String(body.status || body.event || '').toLowerCase();
  const statusMap: Record<string, string> = {
    processed: 'PAID', success: 'PAID', paid: 'PAID',
    pending: 'PROCESSING', initiated: 'PROCESSING',
    failed: 'FAILED', reversed: 'REFUNDED',
  };
  const status = statusMap[event];
  if (!provider || provider.length > 80 || !reference || reference.length > 200 || !status) {
    return res.status(400).json({ error: 'Unsupported provider event or missing payment reference' });
  }

  // Store only a small allowlist of event metadata; never persist arbitrary provider payloads.
  const update: any = {
    status,
    provider,
    provider_reference: reference,
    webhook_received_at: new Date().toISOString(),
  };
  if (status === 'PAID') update.settled_at = new Date().toISOString();
  if (status === 'FAILED') update.failure_reason = String(body.failure_reason || 'Provider reported failure').slice(0, 500);
  // Never let a delayed retry downgrade a settled/refunded payment. A provider
  // adapter must normalize its own event semantics before reaching this endpoint.
  const terminalGuard = status === 'PAID'
    ? '&status=in.(PENDING,PROCESSING,FAILED,PAID)'
    : '&status=in.(PENDING,PROCESSING,FAILED)';
  const reconciled = await supabaseWrite(
    'payments', update,
    `?provider_reference=eq.${encodeURIComponent(reference)}&provider=eq.${encodeURIComponent(provider)}${terminalGuard}`,
  );
  if (!reconciled) return res.status(503).json({ error: 'Payment reconciliation failed; retry delivery' });
  return res.status(200).json({ ok: true, provider, status, provider_reference: reference, reconciled: true });
}
