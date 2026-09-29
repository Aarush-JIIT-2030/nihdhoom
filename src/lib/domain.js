// Domain helpers shared by the active Vite application.
const STATUS = ['REGISTERED','BOOKED','MACHINE_ASSIGNED','ON_THE_WAY','BALING_IN_PROGRESS','CLEARED_PENDING_AUDIT','VERIFIED_NON_BURN','PAYMENT_PROCESSING','PAID'];
const statusIndex = s => Math.max(0, STATUS.indexOf(s));
const pretty = s => String(s || '').replaceAll('_', ' ');
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, days) => { const d = new Date(`${iso || today()}T00:00:00`); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
const haversineKm = (a,b) => { if(!a||!b) return Infinity; const R=6371, p1=Number(a.lat)*Math.PI/180, p2=Number(b.lat)*Math.PI/180, dp=(Number(b.lat)-Number(a.lat))*Math.PI/180, dl=(Number(b.lng)-Number(a.lng))*Math.PI/180; const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
const sha256File = async file => { if(!globalThis.crypto?.subtle) return null; const buf=await file.arrayBuffer(); const hash=await crypto.subtle.digest('SHA-256',buf); return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join(''); };

function normalizeGeometry(g) {
  if (!Array.isArray(g) || g.length < 3) return null;
  if (!g.every(p => Number.isFinite(Number(p?.lat)) && Number.isFinite(Number(p?.lng)))) return null;
  const points = g.map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }));
  // Reject malformed coordinates before they reach maps or PostGIS.
  if (points.some(p => p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180)) return null;
  const distinct = new Set(points.map(p => `${p.lat.toFixed(7)},${p.lng.toFixed(7)}`));
  if (distinct.size < 3) return null;
  return points;
}
function normalizeField(f) {
  return {
    id: f.external_id || f.id,
    dbId: f.dbId || f.id,
    farmer: f.farmer || '', phone: f.phone || '', khasra: f.khasra_no || f.khasra || '',
    acres: Number(f.acreage ?? f.acres ?? 0), crop: f.crop || 'Paddy', variety: f.variety || '',
    harvest: f.expected_harvest_date || f.harvest || '', deadline: f.clearance_deadline || f.deadline || '',
    status: f.status || 'REGISTERED', village: f.village || '', block: f.block || '', district: f.district || '',
    moisture: Number(f.moisture_pct ?? f.moisture ?? 0), payout: Number(f.payout ?? 0),
    machine: f.machine || f.machine_id || '', lat: Number(f.center_lat ?? f.lat ?? 30.2285),
    lng: Number(f.center_lng ?? f.lng ?? 75.8214), verified: Boolean(f.verified ?? f.status === 'VERIFIED_NON_BURN'),
    geometry: normalizeGeometry(f.geometry || (Array.isArray(f.boundary_geojson?.coordinates?.[0]) ? f.boundary_geojson.coordinates[0].slice(0,-1).map(([lng,lat]) => ({lat,lng})) : null)),
    boundarySource: f.boundary_source || 'demo', boundaryVerified: Boolean(f.boundary_verified)
  };
}


export { STATUS, statusIndex, pretty, today, addDays, haversineKm, sha256File, normalizeGeometry, normalizeField };
