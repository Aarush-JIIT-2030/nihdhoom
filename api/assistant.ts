declare const process: { env: Record<string, string | undefined> };

async function readLiveField(base:string, token:string, fieldId:string){
  const url=`${base}/rest/v1/fields?id=eq.${encodeURIComponent(fieldId)}&select=id,external_id,khasra_no,village,block,district,acreage,crop,variety,expected_harvest_date,clearance_deadline,status,moisture_pct,center_lat,center_lng`;
  const r=await fetch(url,{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY||'',Authorization:`Bearer ${token}`}});
  if(!r.ok)return null;const data=await r.json();return data?.[0]||null;
}

export default async function handler(req:any,res:any){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const body=typeof req.body==='object'&&req.body?req.body:{};const{question,field}=body;
  if(!question||typeof question!=='string')return res.status(400).json({error:'question is required'});
  const auth=String(req.headers?.authorization||'');const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(process.env.REQUIRE_AUTH_FOR_AI==='true'){
    if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)return res.status(401).json({error:'Authentication required'});
    try{const verify=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});if(!verify.ok)return res.status(401).json({error:'Invalid session'})}catch{return res.status(401).json({error:'Authentication check failed'})}
  }
  let liveField=null;
  if(token&&process.env.SUPABASE_URL&&field?.dbId)liveField=await readLiveField(process.env.SUPABASE_URL,token,String(field.dbId));
  const source=liveField||field||{};
  const safeField={id:source.id||'',village:typeof source.village==='string'?source.village:'',block:typeof source.block==='string'?source.block:'',acres:Number(source.acreage??source.acres??0),variety:typeof source.variety==='string'?source.variety:'',crop:typeof source.crop==='string'?source.crop:'Paddy',status:typeof source.status==='string'?source.status:'',machine:typeof source.machine==='string'?source.machine:'',payout:Number(source.payout||0),harvest:source.expected_harvest_date||source.harvest||'',deadline:source.clearance_deadline||source.deadline||''};
  if(process.env.OPENAI_API_KEY){
    try{const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.NIRDHOOM_AI_MODEL||'gpt-5.6-luna',instructions:'You are NIRDHOOM Sathi. Answer only from the supplied live field context. Never invent booking, machine ETA, payment, verification, subsidy, buyer offer, weather, harvest forecast or carbon credit. Clearly label demo/indicative values. If remote sensing is discussed, explain that a missing FIRMS/VIIRS detection is not proof of no burning. Use simple English unless Punjabi or Hindi is requested.',input:[{role:'user',content:[{type:'input_text',text:`Live field context: ${JSON.stringify(safeField)}\nFarmer question: ${question}`}]}],max_output_tokens:300})});if(response.ok){const data=await response.json();if(data.output_text)return res.status(200).json({answer:data.output_text,mode:'openai-live-record'})}}catch{/* safe fallback */}
  }
  const q=question.toLowerCase();let answer=`For ${safeField.village||'your field'}, the current record shows ${safeField.acres} acres of ${safeField.variety||safeField.crop}. `;
  if(q.includes('machine')||q.includes('baler'))answer+=`A live machine ETA should only be reported from dispatch/GPS data; this field record currently shows ${safeField.machine||'no machine assigned'}.`;
  else if(q.includes('pay')||q.includes('money'))answer+=`The current displayed amount is ${safeField.payout?`₹${Math.round(safeField.payout)}`:'not set'}. Final settlement must come from the payment ledger/webhook.`;
  else if(q.includes('verify')||q.includes('burn'))answer+='Verification should combine field geometry, operational evidence and remote-sensing observations. A missing FIRMS detection is not absolute proof of no burning.';
  else if(q.includes('harvest'))answer+=`The field harvest estimate is ${safeField.harvest||'not set'}. Weather and crop-maturity services should refine it in production.`;
  else answer+='I can help with clearance, machine status, verification, payment, harvest timing and residue pathways.';
  return res.status(200).json({answer,mode:'safe-fallback'});
}
