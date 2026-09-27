declare const process: { env: Record<string, string | undefined> };

function inside(point:{lat:number,lng:number},poly:any[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const xi=Number(poly[i].lng),yi=Number(poly[i].lat),xj=Number(poly[j].lng),yj=Number(poly[j].lat);const hit=((yi>point.lat)!==(yj>point.lat))&&(point.lng<((xj-xi)*(point.lat-yi))/(yj-yi||1e-12)+xi);if(hit)inside=!inside}return inside}

async function verifyUser(req:any){
  const auth=String(req.headers?.authorization||''); const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token||!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)return null;
  const r=await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  return r.ok?await r.json():null;
}

export default async function handler(req:any,res:any){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const user=await verifyUser(req); if(!user?.id && process.env.REQUIRE_AUTH_FOR_FIRMS==='true')return res.status(401).json({error:'Authentication required'});
  const key=process.env.FIRMS_MAP_KEY;
  if(!key)return res.status(503).json({error:'FIRMS_MAP_KEY is not configured'});
  const field=req.body?.field||{};const lat=Number(field.lat),lng=Number(field.lng),radius=Number(req.body?.radius_km||12);const polygon=Array.isArray(field.geometry)?field.geometry:[];
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return res.status(400).json({error:'field.lat and field.lng are required'});
  const dLat=radius/111,dLng=radius/(111*Math.max(0.2,Math.cos(lat*Math.PI/180)));const bbox=`${lng-dLng},${lat-dLat},${lng+dLng},${lat+dLat}`;
  const url=`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(key)}/VIIRS_NOAA21_NRT/${bbox}/1`;
  try{
    const r=await fetch(url);const text=await r.text();if(!r.ok)return res.status(502).json({error:'FIRMS request failed'});
    const lines=text.trim().split(/\r?\n/);const headers=(lines.shift()||'').split(',');const observations=lines.slice(0,500).map(line=>{const cols=line.split(',');return Object.fromEntries(headers.map((h,i)=>[h,cols[i]]))});
    const parsed=observations.map(o=>({...o,latitude:Number(o.latitude),longitude:Number(o.longitude)}));
    const matched=polygon.length>=3?parsed.filter(o=>Number.isFinite(o.latitude)&&Number.isFinite(o.longitude)&&inside({lat:o.latitude,lng:o.longitude},polygon)):[];
    return res.status(200).json({source:'NASA FIRMS',sensor:'VIIRS_NOAA21_NRT',count:parsed.length,matched_count:matched.length,radius_km:radius,polygon_checked:polygon.length>=3,observations:parsed,matched_observations:matched,queried_at:new Date().toISOString()});
  }catch(e){return res.status(502).json({error:e instanceof Error?e.message:'FIRMS unavailable'})}
}
