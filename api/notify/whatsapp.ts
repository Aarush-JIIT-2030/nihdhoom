declare const process: { env: Record<string, string | undefined> };

export default async function handler(req:any,res:any){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const token=process.env.WHATSAPP_ACCESS_TOKEN,phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;
  if(!token||!phoneId)return res.status(503).json({error:'WhatsApp Cloud API credentials are not configured'});
  const {to,text}=req.body||{};
  if(!to||!text)return res.status(400).json({error:'to and text are required'});
  const r=await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:String(text).slice(0,4096)}})});
  const data=await r.json();
  return res.status(r.ok?200:502).json(r.ok?{ok:true,message_id:data.messages?.[0]?.id||null}:{error:data.error?.message||'WhatsApp send failed'});
}
