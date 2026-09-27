declare const process: { env: Record<string, string | undefined> };

type Point={id:string;lat:number;lng:number;acres?:number;deadline?:string};
type Machine={id:string;lat:number;lng:number;capacity_acres_day:number;status?:string};
const km=(a:{lat:number;lng:number},b:{lat:number;lng:number})=>{const R=6371,la1=a.lat*Math.PI/180,la2=b.lat*Math.PI/180,dla=(b.lat-a.lat)*Math.PI/180,dlo=(b.lng-a.lng)*Math.PI/180;const h=Math.sin(dla/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dlo/2)**2;return 2*R*Math.asin(Math.sqrt(h));};

function fallback(fields:Point[],machines:Machine[]){
  const routes=machines.filter(m=>m.status!=='OFFLINE').map(m=>({machine_id:m.id,stops:[] as string[],total_acres:0,status:'PLANNED'}));
  const pending=[...fields].sort((a,b)=>String(a.deadline||'').localeCompare(String(b.deadline||'')));
  for(const f of pending){
    const candidates=routes.map((r,i)=>({r,i,m:machines.find(x=>x.id===r.machine_id)!})).filter(x=>x.m&&x.r.total_acres+Number(f.acres||0)<=Number(x.m.capacity_acres_day||0));
    const pick=(candidates.length?candidates:routes.map((r,i)=>({r,i,m:machines.find(x=>x.id===r.machine_id)!}))).sort((a,b)=>{
      const da=km(f,a.m)+a.r.total_acres*0.25,db=km(f,b.m)+b.r.total_acres*0.25;return da-db;
    })[0];
    if(pick){pick.r.stops.push(f.id);pick.r.total_acres+=Number(f.acres||0)}
  }
  return {engine:'fallback-heuristic',routes,total_distance_km:routes.reduce((s,r)=>{let prev: {lat:number;lng:number}|undefined=machines.find(m=>m.id===r.machine_id);for(const id of r.stops){const f=fields.find(x=>x.id===id);if(f&&prev){s+=km(prev as {lat:number;lng:number},f as {lat:number;lng:number});prev=f}}return s},0)};
}

async function verifyRole(req:any,roles:string[]){
  const auth=String(req.headers?.authorization||''); const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)return {ok:false,status:401,error:'Authentication required'};
  const u=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  if(!u.ok)return {ok:false,status:401,error:'Invalid session'};
  const user=await u.json();
  const pr=await fetch(`${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  const row=(await pr.json())?.[0];
  return roles.includes(row?.role)?{ok:true,user}:{ok:false,status:403,error:'Dispatcher/admin role required'};
}

export default async function handler(req:any,res:any){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const auth=await verifyRole(req,['dispatcher','admin']); if(!auth.ok)return res.status(auth.status).json({error:auth.error});
  const {fields=[],machines=[]}=req.body||{};
  if(!Array.isArray(fields)||!Array.isArray(machines))return res.status(400).json({error:'fields and machines arrays are required'});
  if(process.env.DISPATCH_SERVICE_URL){
    try{const r=await fetch(process.env.DISPATCH_SERVICE_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields,machines})});if(r.ok)return res.status(200).json(await r.json())}catch(_){/* use local safe fallback */}
  }
  return res.status(200).json(fallback(fields,machines));
}
