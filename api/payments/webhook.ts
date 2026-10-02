export default async function handler(req: any, res: any) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(501).json({
    error: 'Live payment reconciliation is intentionally disabled in this release.',
    payment_scope: 'simulation-only',
  });
}
