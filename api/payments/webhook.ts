declare const process: { env: Record<string, string | undefined> };

async function supabaseWrite(path:string, body:any, method='PATCH', query=''){
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  const r=await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}${query}`,{method,headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(body)});
  return r.ok;
}

export default async function handler(req:any,res:any){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const secret=process.env.PAYMENT_WEBHOOK_SECRET;
  if(!secret)return res.status(503).json({error:'PAYMENT_WEBHOOK_SECRET is not configured'});
  const raw=typeof req.body==='string'?req.body:JSON.stringify(req.body||{});
  const signature=String(req.headers?.['x-nirdhoom-signature']||req.headers?.['x-webhook-signature']||'');
  if(!signature)return res.status(401).json({error:'Invalid webhook signature'});
  const key=await globalThis.crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const mac=await globalThis.crypto.subtle.sign('HMAC',key,new TextEncoder().encode(raw));
  const expected=[...new Uint8Array(mac)].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(signature.length!==expected.length || signature.toLowerCase()!==expected.toLowerCase())return res.status(401).json({error:'Invalid webhook signature'});
  let body:any;try{body=typeof req.body==='object'?req.body:JSON.parse(raw)}catch{return res.status(400).json({error:'Invalid JSON'})}
  const provider=String(body.provider||'unknown');
  const ref=String(body.provider_reference||body.id||'');
  const statusMap:any={processed:'PAID',success:'PAID',paid:'PAID',pending:'PROCESSING',initiated:'PROCESSING',failed:'FAILED',reversed:'REFUNDED'};
  const status=statusMap[String(body.status||body.event||'').toLowerCase()]||'PROCESSING';
  const updated=await supabaseWrite('payments',{status,provider,provider_reference:ref||null,webhook_received_at:new Date().toISOString(),settled_at:status==='PAID'?new Date().toISOString():null,metadata:body},'PATCH',`?provider_reference=eq.${encodeURIComponent(ref)}`);
  return res.status(200).json({ok:true,provider,status,provider_reference:ref||null,reconciled:updated});
}
