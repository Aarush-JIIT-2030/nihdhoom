declare const process: { env: Record<string, string | undefined> };

async function verifyDispatcher(req: any) {
  const authorization = String(req.headers?.authorization || '');
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) return false;
  try {
    const userResponse = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!userResponse.ok) return false;
    const user = await userResponse.json();
    const profileResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
      { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) },
    );
    if (!profileResponse.ok) return false;
    const profiles = await profileResponse.json();
    return ['dispatcher', 'admin'].includes(profiles?.[0]?.role);
  } catch { return false; }
}

function validPhone(value: unknown) {
  return typeof value === 'string' && /^\+?[1-9]\d{7,14}$/.test(value);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!(await verifyDispatcher(req))) return res.status(401).json({ error: 'Authenticated dispatcher/admin required' });
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return res.status(503).json({ error: 'WhatsApp Cloud API credentials are not configured' });
  const { to, text } = req.body || {};
  if (!validPhone(to) || typeof text !== 'string' || !text.trim() || text.length > 4096) {
    return res.status(400).json({ error: 'A valid international phone number and message (1–4096 characters) are required' });
  }
  try {
    const response = await fetch(`https://graph.facebook.com/v23.0/${encodeURIComponent(phoneId)}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text.trim() } }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.ok ? 200 : 502).json(response.ok
      ? { ok: true, message_id: data.messages?.[0]?.id || null }
      : { error: data.error?.message || 'WhatsApp send failed' });
  } catch {
    return res.status(502).json({ error: 'WhatsApp provider unavailable' });
  }
}
