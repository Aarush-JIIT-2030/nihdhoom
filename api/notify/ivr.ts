declare const process: { env: Record<string, string | undefined> };

export default async function handler(req:any,res:any){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const url=process.env.IVR_WEBHOOK_URL;
  if(!url)return res.status(503).json({error:'IVR provider adapter is not configured'});
  const {to,message,language='pa'}=req.body||{};
  if(!to||!message)return res.status(400).json({error:'to and message are required'});
  try{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.IVR_PROVIDER_TOKEN||''}`},body:JSON.stringify({to,message,language})});const data=await r.json().catch(()=>({}));return res.status(r.ok?200:502).json(r.ok?{ok:true,provider_response:data}:{error:'IVR provider rejected request'})}catch(e){return res.status(502).json({error:e instanceof Error?e.message:'IVR provider unavailable'})}
}
