declare const process: { env: Record<string, string | undefined> };

const clamp = (n:number,min:number,max:number) => Math.max(min, Math.min(max,n));

export default async function handler(req:any,res:any){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const body=req.body||{};
  const field=body.field||{};
  const acres=Number(field.acres||0);
  if(!Number.isFinite(acres)||acres<=0) return res.status(400).json({error:'field.acres must be positive'});
  const days=Number.isFinite(Number(body.days_to_harvest))?Number(body.days_to_harvest):14;
  const requested=String(body.requested_date||'');
  const harvestUrgency=days<=3?1.28:days<=7?1.14:days<=14?1.04:0.94;
  const dayPenalty=requested && new Date(`${requested}T00:00:00`).getDay()===0?1.08:1;
  const distanceFactor=Number.isFinite(Number(field.lat))&&Number.isFinite(Number(field.lng))?1:1.05;
  const rate=Math.round(clamp(1500*harvestUrgency*dayPenalty*distanceFactor,1000,3200)/10)*10;
  const guaranteed=requested||new Date(Date.now()+48*3600*1000).toISOString().slice(0,10);
  const penalty=Math.round(Math.max(2500,acres*2500));
  return res.status(200).json({
    rate_per_acre:rate,
    quoted_amount:Math.round(rate*acres),
    guaranteed_by_date:guaranteed,
    penalty_amount:penalty,
    pricing_band:harvestUrgency>=1.2?'urgent':harvestUrgency>=1?'standard':'early-booking',
    reason_codes:['days_to_harvest','target_date','machine_capacity_window'],
    engine:'nirdhoom-pricing-v1'
  });
}
