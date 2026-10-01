// Domain helpers shared by the active Vite application.
export const STATUS = [
  'REGISTERED','BOOKED','MACHINE_ASSIGNED','ON_THE_WAY','BALING_IN_PROGRESS',
  'CLEARED_PENDING_AUDIT','VERIFIED_NON_BURN','PAYMENT_PROCESSING','PAID',
] as const;

export type Status = typeof STATUS[number];

export interface LatLng {
  lat: number;
  lng: number;
}

export interface NormalizedField {
  id: string;
  dbId: string;
  farmer: string;
  phone: string;
  khasra: string;
  acres: number;
  crop: string;
  variety: string;
  harvest: string;
  deadline: string;
  status: string;
  village: string;
  block: string;
  district: string;
  moisture: number;
  payout: number;
  machine: string;
  lat: number;
  lng: number;
  verified: boolean;
  geometry: LatLng[] | null;
  boundarySource: string;
  boundaryVerified: boolean;
  geometryAreaAcres: number;
}

type UnknownRecord = Record<string, any>;

export const statusIndex = (s: string): number => Math.max(0, STATUS.indexOf(s as Status));
export const pretty = (s: string | null | undefined): string => String(s || '').replaceAll('_', ' ');
export const today = (): string => new Date().toISOString().slice(0, 10);
export const addDays = (iso: string | undefined, days: number): string => {
  const d = new Date(`${iso || today()}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const haversineKm = (a: LatLng | null | undefined, b: LatLng | null | undefined): number => {
  if (!a || !b) return Infinity;
  const R = 6371;
  const p1 = Number(a.lat) * Math.PI / 180;
  const p2 = Number(b.lat) * Math.PI / 180;
  const dp = (Number(b.lat) - Number(a.lat)) * Math.PI / 180;
  const dl = (Number(b.lng) - Number(a.lng)) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const sha256File = async (file: File): Promise<string | null> => {
  if (!globalThis.crypto?.subtle) return null;
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join('');
};

export function normalizeGeometry(g: unknown): LatLng[] | null {
  if (!Array.isArray(g) || g.length < 3) return null;
  if (!g.every(p => Number.isFinite(Number((p as UnknownRecord)?.lat)) && Number.isFinite(Number((p as UnknownRecord)?.lng)))) return null;
  const points = g.map(p => ({ lat: Number((p as UnknownRecord).lat), lng: Number((p as UnknownRecord).lng) }));
  if (points.some(p => p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180)) return null;
  const distinct = new Set(points.map(p => `${p.lat.toFixed(7)},${p.lng.toFixed(7)}`));
  if (distinct.size < 3) return null;
  return points;
}

export function normalizeField(f: UnknownRecord): NormalizedField {
  const coordinates = f.boundary_geojson?.coordinates;
  const geo = Array.isArray(coordinates?.[0])
    ? coordinates[0].slice(0, -1).map((pair: unknown) => {
        const [lng, lat] = Array.isArray(pair) ? pair : [undefined, undefined];
        return { lat: Number(lat), lng: Number(lng) };
      })
    : null;

  return {
    id: String(f.external_id || f.id || ''),
    dbId: String(f.dbId || f.id || ''),
    farmer: String(f.farmer || ''),
    phone: String(f.phone || ''),
    khasra: String(f.khasra_no || f.khasra || ''),
    acres: Number(f.acreage ?? f.acres ?? 0),
    crop: String(f.crop || 'Paddy'),
    variety: String(f.variety || ''),
    harvest: String(f.expected_harvest_date || f.harvest || ''),
    deadline: String(f.clearance_deadline || f.deadline || ''),
    status: String(f.status || 'REGISTERED'),
    village: String(f.village || ''),
    block: String(f.block || ''),
    district: String(f.district || ''),
    moisture: Number(f.moisture_pct ?? f.moisture ?? 0),
    payout: Number(f.payout ?? 0),
    machine: String(f.machine || f.machine_id || ''),
    lat: Number(f.center_lat ?? f.lat ?? 0),
    lng: Number(f.center_lng ?? f.lng ?? 0),
    verified: Boolean(f.verified ?? f.status === 'VERIFIED_NON_BURN'),
    geometry: normalizeGeometry(f.geometry || geo),
    boundarySource: String(f.boundary_source || 'demo'),
    boundaryVerified: Boolean(f.boundary_verified),
    geometryAreaAcres: Number(f.geometry_area_acres ?? 0),
  };
}
