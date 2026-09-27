declare const process: { env: Record<string, string | undefined> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function verifyUser(req: any) {
  const auth = String(req.headers?.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) return null;
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required' });

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'A JSON object is required' });
  }

  const bookingId = body.booking_id;
  const amount = Number(body.amount);
  if (typeof bookingId !== 'string' || !UUID.test(bookingId) ||
      !Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
    return res.status(400).json({
      error: 'booking_id must be a UUID and amount must be between 0 and 100000000',
    });
  }

  // This endpoint deliberately does not create a payout until the selected
  // provider's authenticated contract and booking-ownership check are implemented.
  if (!process.env.PAYMENT_PROVIDER || !process.env.PAYMENT_PROVIDER_API_URL) {
    return res.status(503).json({
      error: 'Payment provider is not configured. No money movement was attempted.',
    });
  }

  return res.status(501).json({
    error: 'Payout initiation is disabled until the provider adapter, booking ownership check, and sandbox reconciliation are implemented. No money movement was attempted.',
  });
}
