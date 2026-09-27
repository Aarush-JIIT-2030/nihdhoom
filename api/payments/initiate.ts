declare const process: { env: Record<string, string | undefined> };

async function verifyUser(req:any){
  const auth=String(req.headers?.authorization||'');
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY) return null;
  const r=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  return r.ok?await r.json():null;
}

export default async function handler(req:any,res:any){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const user=await verifyUser(req);
  if(!user?.id) return res.status(401).json({error:'Authentication required'});
  const bookingId=String(req.body?.booking_id||'');
  const amount=Number(req.body?.amount||0);
  if(!bookingId||!Number.isFinite(amount)||amount<=0) return res.status(400).json({error:'booking_id and positive amount are required'});
  if(!process.env.PAYMENT_PROVIDER||!process.env.PAYMENT_PROVIDER_API_URL) return res.status(503).json({error:'Payment provider is not configured. No money movement was attempted.'});
  // Provider-specific payout creation belongs behind this adapter. Never mark PAID here.
  return res.status(501).json({error:'Provider adapter is configured but its payout contract is not implemented for this account. Configure the RazorpayX/Cashfree adapter before enabling live money movement.'});
}
