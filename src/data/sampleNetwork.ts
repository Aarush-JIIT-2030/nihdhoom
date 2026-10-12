/**
 * Sample Punjab operating network.
 *
 * Everything here is FICTIONAL and generated, so the product can be shown with a
 * full map and realistic numbers when no live records exist yet. It is always
 * labelled "sample" in the interface and must never be presented as a real
 * farmer, machine, satellite observation, buyer or transaction.
 *
 * Why it looks believable:
 *  - fields are rectangles whose mapped area matches the declared acreage
 *  - machines sit where their status says (baling machines on a field, en-route
 *    machines between their yard and the field)
 *  - fire detections follow the real satellite overpass pattern (an afternoon
 *    pass near 08:00 UTC and a night pass near 20:30 UTC), measured back from
 *    "now", with VIIRS-range brightness temperatures
 *  - dates are relative to today, so harvest windows and deadlines never go stale
 *  - residue is 2.3 to 2.8 t per acre, in the range reported for paddy straw
 */
import type {
  BurnEvent, Buyer, Field, FieldProvenance, FieldStatus, LatLng, Machine, PaddyVariety, ResidueLot, StorageYard,
} from '../types';
import { distanceToRingM, pointInRing, ringCentroid } from '../lib/fieldGeometry';

const DAY = 86_400_000;
const HOUR = 3_600_000;
const SQ_M_PER_ACRE = 4046.8564224;

/** Moment the sample was assembled; every relative date hangs off this. */
export const SAMPLE_ANCHOR = Date.now();

export const sampleDay = (offsetDays: number) => new Date(SAMPLE_ANCHOR + offsetDays * DAY).toISOString().slice(0, 10);
const iso = (ms: number) => new Date(ms).toISOString();

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Geography
// ---------------------------------------------------------------------------

type Town = { key: string; name: string; district: string; abbr: string; at: LatLng };

const TOWNS: Record<string, Town> = {
  SGR: { key: 'SGR', name: 'Sangrur', district: 'Sangrur', abbr: 'SGR', at: { lat: 30.2458, lng: 75.8421 } },
  SUN: { key: 'SUN', name: 'Sunam', district: 'Sangrur', abbr: 'SNM', at: { lat: 30.1311, lng: 75.8016 } },
  DHU: { key: 'DHU', name: 'Dhuri', district: 'Sangrur', abbr: 'DHR', at: { lat: 30.3683, lng: 75.8672 } },
  BHW: { key: 'BHW', name: 'Bhawanigarh', district: 'Sangrur', abbr: 'BWG', at: { lat: 30.2766, lng: 76.0427 } },
  MLK: { key: 'MLK', name: 'Malerkotla', district: 'Malerkotla', abbr: 'MLK', at: { lat: 30.5304, lng: 75.8803 } },
  AHM: { key: 'AHM', name: 'Ahmedgarh', district: 'Malerkotla', abbr: 'AHM', at: { lat: 30.6733, lng: 75.8266 } },
  BAR: { key: 'BAR', name: 'Barnala', district: 'Barnala', abbr: 'BRN', at: { lat: 30.3745, lng: 75.5487 } },
  DHN: { key: 'DHN', name: 'Dhanaula', district: 'Barnala', abbr: 'DHN', at: { lat: 30.2990, lng: 75.5570 } },
  PAT: { key: 'PAT', name: 'Patiala', district: 'Patiala', abbr: 'PTL', at: { lat: 30.3398, lng: 76.3869 } },
  NAB: { key: 'NAB', name: 'Nabha', district: 'Patiala', abbr: 'NBH', at: { lat: 30.3754, lng: 76.1530 } },
  SAM: { key: 'SAM', name: 'Samana', district: 'Patiala', abbr: 'SMN', at: { lat: 30.1499, lng: 76.1925 } },
  RAJ: { key: 'RAJ', name: 'Rajpura', district: 'Patiala', abbr: 'RJP', at: { lat: 30.4840, lng: 76.5940 } },
  BTI: { key: 'BTI', name: 'Bathinda', district: 'Bathinda', abbr: 'BTI', at: { lat: 30.2110, lng: 74.9455 } },
  TSB: { key: 'TSB', name: 'Talwandi Sabo', district: 'Bathinda', abbr: 'TSB', at: { lat: 29.9875, lng: 75.0825 } },
  RPH: { key: 'RPH', name: 'Rampura Phul', district: 'Bathinda', abbr: 'RPH', at: { lat: 30.2617, lng: 75.2330 } },
  MOG: { key: 'MOG', name: 'Moga', district: 'Moga', abbr: 'MOG', at: { lat: 30.8160, lng: 75.1710 } },
  DHK: { key: 'DHK', name: 'Dharamkot', district: 'Moga', abbr: 'DHK', at: { lat: 30.9580, lng: 75.1840 } },
  LDH: { key: 'LDH', name: 'Ludhiana', district: 'Ludhiana', abbr: 'LDH', at: { lat: 30.9010, lng: 75.8573 } },
  JGN: { key: 'JGN', name: 'Jagraon', district: 'Ludhiana', abbr: 'JGN', at: { lat: 30.7878, lng: 75.4742 } },
  RKT: { key: 'RKT', name: 'Raikot', district: 'Ludhiana', abbr: 'RKT', at: { lat: 30.6540, lng: 75.5980 } },
};

/** Shortcuts used by the map: [label, centre, zoom]. */
export const SAMPLE_CLUSTERS: [string, [number, number], number][] = [
  ['Sangrur', [30.2458, 75.8421], 11],
  ['Malerkotla', [30.6, 75.85], 10],
  ['Barnala', [30.34, 75.55], 11],
  ['Patiala', [30.27, 76.28], 10],
  ['Bathinda', [30.1, 75.05], 10],
  ['Moga', [30.88, 75.18], 11],
  ['Ludhiana', [30.8, 75.62], 10],
];

const metersToLatLng = (origin: LatLng, dx: number, dy: number): LatLng => ({
  lat: origin.lat + dy / 111_320,
  lng: origin.lng + dx / (111_320 * Math.cos((origin.lat * Math.PI) / 180)),
});

function jitterAround(origin: LatLng, minKm: number, maxKm: number, rnd: () => number): LatLng {
  const bearing = rnd() * Math.PI * 2;
  const dist = (minKm + rnd() * (maxKm - minKm)) * 1000;
  return metersToLatLng(origin, Math.cos(bearing) * dist, Math.sin(bearing) * dist);
}

/** Rectangle of (roughly) the declared area, rotated at random. */
function rectRing(center: LatLng, acres: number, rnd: () => number, areaScale = 1): LatLng[] {
  const area = acres * SQ_M_PER_ACRE * areaScale * (0.985 + rnd() * 0.03);
  const aspect = 1.15 + rnd() * 0.9;
  const w = Math.sqrt(area * aspect);
  const h = area / w;
  const angle = rnd() * Math.PI;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) =>
    metersToLatLng(center, x * cos - y * sin, x * sin + y * cos),
  );
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

type FieldSpec = {
  town: string;
  village: string;
  status: FieldStatus;
  acres: number;
  variety: PaddyVariety;
  harvest: number; // days from today
  moisture: number;
  machine?: string;
  /** Scale the mapped area to demonstrate a boundary that needs a second look. */
  areaScale?: number;
};

const EXTRA_FIELDS: FieldSpec[] = [
  { town: 'SGR', village: 'Nagra', status: 'REGISTERED', acres: 4.0, variety: 'PR-126', harvest: 9, moisture: 14.9 },
  { town: 'SUN', village: 'Chhajli', status: 'SCHEDULED', acres: 6.5, variety: 'Pusa-44', harvest: 3, moisture: 15.2 },
  { town: 'DHU', village: 'Ghanauri Kalan', status: 'ON_THE_WAY', acres: 5.0, variety: 'PR-131', harvest: 1, moisture: 14.3, machine: 'MACH-15' },
  { town: 'BHW', village: 'Nadampur', status: 'VERIFIED_NON_BURN', acres: 3.0, variety: 'Basmati-1121', harvest: -9, moisture: 13.1 },
  { town: 'MLK', village: 'Amargarh', status: 'REGISTERED', acres: 3.5, variety: 'PR-126', harvest: 7, moisture: 15.0 },
  { town: 'AHM', village: 'Kup Kalan', status: 'CLEARED_PENDING_AUDIT', acres: 4.5, variety: 'PR-131', harvest: -2, moisture: 13.8, areaScale: 0.88 },
  { town: 'BAR', village: 'Handiaya', status: 'BALING_IN_PROGRESS', acres: 5.5, variety: 'PR-126', harvest: 0, moisture: 14.1, machine: 'MACH-05' },
  { town: 'DHN', village: 'Dhanaula', status: 'ON_THE_WAY', acres: 4.0, variety: 'Pusa-44', harvest: 1, moisture: 14.6, machine: 'MACH-06' },
  { town: 'BAR', village: 'Sehna', status: 'CLEARED_PENDING_AUDIT', acres: 6.0, variety: 'PR-131', harvest: -3, moisture: 13.6 },
  { town: 'BAR', village: 'Bhadaur', status: 'REGISTERED', acres: 2.5, variety: 'Basmati-1509', harvest: 11, moisture: 15.4 },
  { town: 'SAM', village: 'Ghagga', status: 'BALING_IN_PROGRESS', acres: 7.0, variety: 'PR-126', harvest: 0, moisture: 13.9, machine: 'MACH-07' },
  { town: 'NAB', village: 'Alowal', status: 'MACHINE_ASSIGNED', acres: 4.5, variety: 'PR-131', harvest: 2, moisture: 14.8, machine: 'MACH-08' },
  { town: 'PAT', village: 'Bahadurgarh', status: 'SCHEDULED', acres: 3.0, variety: 'Pusa-44', harvest: 4, moisture: 15.1 },
  { town: 'RAJ', village: 'Ghanaur', status: 'VERIFIED_NON_BURN', acres: 5.0, variety: 'PR-126', harvest: -8, moisture: 13.4 },
  { town: 'TSB', village: 'Talwandi Sabo', status: 'BALING_IN_PROGRESS', acres: 8.0, variety: 'PR-126', harvest: 0, moisture: 14.0, machine: 'MACH-09' },
  { town: 'RPH', village: 'Bhucho Khurd', status: 'ON_THE_WAY', acres: 6.0, variety: 'Pusa-44', harvest: 1, moisture: 14.7, machine: 'MACH-10' },
  { town: 'BTI', village: 'Jeed', status: 'REGISTERED', acres: 5.0, variety: 'PR-131', harvest: 6, moisture: 15.3 },
  { town: 'BTI', village: 'Goniana', status: 'SCHEDULED', acres: 3.5, variety: 'PR-126', harvest: 5, moisture: 14.9 },
  { town: 'MOG', village: 'Dhudike', status: 'BALING_IN_PROGRESS', acres: 4.0, variety: 'PR-131', harvest: 0, moisture: 14.2, machine: 'MACH-11' },
  { town: 'DHK', village: 'Dharamkot', status: 'REGISTERED', acres: 3.0, variety: 'Basmati-1121', harvest: 10, moisture: 15.6 },
  { town: 'MOG', village: 'Kokri Kalan', status: 'CLEARED_PENDING_AUDIT', acres: 5.5, variety: 'PR-126', harvest: -2, moisture: 13.7 },
  { town: 'JGN', village: 'Sidhwan Bet', status: 'BALING_IN_PROGRESS', acres: 4.5, variety: 'PR-126', harvest: 0, moisture: 14.4, machine: 'MACH-12' },
  { town: 'RKT', village: 'Halwara', status: 'VERIFIED_NON_BURN', acres: 3.5, variety: 'PR-131', harvest: -10, moisture: 13.2 },
  { town: 'LDH', village: 'Pakhowal', status: 'SCHEDULED', acres: 6.0, variety: 'Pusa-44', harvest: 3, moisture: 15.0 },
  { town: 'JGN', village: 'Kamalpura', status: 'REGISTERED', acres: 2.0, variety: 'PR-126', harvest: 8, moisture: 15.5 },
];

/** Harvest offsets (days from today) for the five hand-authored core fields. */
export const CORE_HARVEST_OFFSETS: Record<string, number> = {
  'FIELD-101': 2, 'FIELD-102': 9, 'FIELD-103': 0, 'FIELD-104': -2, 'FIELD-105': -9,
};

/** Re-date the hand-authored core fields so they sit in a believable harvest window. */
export function redateCoreFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    const offset = CORE_HARVEST_OFFSETS[field.id];
    if (offset === undefined) return field;
    return {
      ...field,
      expected_harvest_date: sampleDay(offset),
      clearance_deadline: `${sampleDay(offset + 2)} 18:00`,
    };
  });
}

const khasra = (rnd: () => number) => `Khasra ${Math.floor(20 + rnd() * 780)}/${Math.floor(1 + rnd() * 9)}`;

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

export function buildSampleFields(coreCount = 5): Field[] {
  const rnd = mulberry32(2610);
  return EXTRA_FIELDS.map((spec, index) => {
    const town = TOWNS[spec.town];
    const n = coreCount + index + 1;
    const center = jitterAround(town.at, 2.5, 8.5, rnd);
    const geometry = rectRing(center, spec.acres, rnd, spec.areaScale ?? 1);
    const stageDone = spec.status === 'CLEARED_PENDING_AUDIT' || spec.status === 'VERIFIED_NON_BURN';
    const withLot = stageDone;
    return {
      id: `FIELD-${100 + n}`,
      farmer_id: `FARMER-${pad(n, 3)}`,
      farmer_name: `Demo Farmer ${pad(n)}`,
      farmer_phone: `+91 90000 000${pad(n)}`,
      khasra_no: khasra(rnd),
      acreage: spec.acres,
      crop: 'Paddy' as const,
      paddy_variety: spec.variety,
      expected_harvest_date: sampleDay(spec.harvest),
      clearance_deadline: `${sampleDay(spec.harvest + 2)} 18:00`,
      status: spec.status,
      village: spec.village,
      block: town.name,
      district: town.district,
      moisture_pct: spec.moisture,
      assigned_machine_id: spec.machine,
      qr_lot_code: stageDone || spec.status === 'BALING_IN_PROGRESS' ? `PB-${town.abbr}-26-LOT-0${100 + n}` : undefined,
      payout_amount: Math.round(spec.acres * (1350 + Math.floor(rnd() * 100))),
      is_verified_non_burn: stageDone,
      residue_lot_id: withLot ? `LOT-DEMO-${100 + n}` : undefined,
      job_id: spec.machine || stageDone ? `JOB-DEMO-${100 + n}` : undefined,
      center,
      geometry,
    };
  });
}

// ---------------------------------------------------------------------------
// Machines
// ---------------------------------------------------------------------------

type MachineSpec = {
  id: string; name: string; type: Machine['type']; owner: Machine['owner_type']; ownerName: string; home: string;
  town: string; status: Machine['status']; capacity: number; fuel: number; hp?: number;
};

const MACHINE_SPECS: MachineSpec[] = [
  { id: 'MACH-05', name: 'Baler Unit #31 (Claas Markant 55)', type: 'Round Baler (50 HP)', owner: 'CHC', ownerName: 'CHC Handiaya Cooperative', home: 'CHC Handiaya (50% Subsidy CRM 2023)', town: 'BAR', status: 'BALING', capacity: 22, fuel: 71, hp: 50 },
  { id: 'MACH-06', name: 'Baler Unit #18 (New Holland BC5070)', type: 'Square Baler (60 HP)', owner: 'FPO', ownerName: 'Barnala Kisan FPO', home: 'Dhanaula Ag-Hub (80% Subsidy CRM 2022)', town: 'DHN', status: 'EN_ROUTE', capacity: 28, fuel: 83, hp: 60 },
  { id: 'MACH-07', name: 'Baler Unit #26 (John Deere 459)', type: 'Round Baler (50 HP)', owner: 'INDIVIDUAL', ownerName: 'Gill Agro Services', home: 'Samana Custom Center', town: 'SAM', status: 'BALING', capacity: 20, fuel: 64, hp: 50 },
  { id: 'MACH-08', name: 'Rake + Baler Combo #05', type: 'Rake + Baler Combo', owner: 'CHC', ownerName: 'Nabha Block CHC', home: 'Nabha Tehsil Hub', town: 'NAB', status: 'IDLE', capacity: 24, fuel: 96, hp: 55 },
  { id: 'MACH-09', name: 'Baler Unit #12 (Claas Markant 55)', type: 'Round Baler (50 HP)', owner: 'CHC', ownerName: 'Talwandi Sabo CHC', home: 'CHC Talwandi Sabo (50% Subsidy CRM 2023)', town: 'TSB', status: 'BALING', capacity: 22, fuel: 58, hp: 50 },
  { id: 'MACH-10', name: 'Baler Unit #09 (New Holland BC5070)', type: 'Square Baler (60 HP)', owner: 'FPO', ownerName: 'Malwa Progressive FPO', home: 'Rampura Phul Ag-Hub', town: 'RPH', status: 'EN_ROUTE', capacity: 28, fuel: 79, hp: 60 },
  { id: 'MACH-11', name: 'Baler Unit #21 (John Deere 459)', type: 'Round Baler (50 HP)', owner: 'INDIVIDUAL', ownerName: 'Brar Implements', home: 'Moga Custom Center', town: 'MOG', status: 'BALING', capacity: 20, fuel: 67, hp: 50 },
  { id: 'MACH-12', name: 'Baler Unit #15 (New Holland BC5070)', type: 'Square Baler (60 HP)', owner: 'CHC', ownerName: 'Jagraon Block CHC', home: 'CHC Jagraon (80% Subsidy CRM 2022)', town: 'JGN', status: 'BALING', capacity: 28, fuel: 61, hp: 60 },
  { id: 'MACH-13', name: 'Baler Unit #34 (Claas Markant 55)', type: 'Round Baler (50 HP)', owner: 'CHC', ownerName: 'Malerkotla CHC', home: 'Malerkotla Tehsil Hub', town: 'MLK', status: 'IDLE', capacity: 22, fuel: 93, hp: 50 },
  { id: 'MACH-14', name: 'Super Seeder Combo #11', type: 'Super Seeder', owner: 'CHC', ownerName: 'Sangrur Block CHC', home: 'Sangrur Custom Hub', town: 'SGR', status: 'IDLE', capacity: 18, fuel: 90, hp: 60 },
  { id: 'MACH-15', name: 'Rake + Baler Combo #08', type: 'Rake + Baler Combo', owner: 'FPO', ownerName: 'Dhuri Progressive Farmers FPO', home: 'Dhuri Ag-Hub (80% Subsidy CRM 2022)', town: 'DHU', status: 'EN_ROUTE', capacity: 24, fuel: 76, hp: 55 },
  { id: 'MACH-16', name: 'Baler Unit #03 (John Deere 459)', type: 'Round Baler (50 HP)', owner: 'INDIVIDUAL', ownerName: 'Sandhu Agro Works', home: 'Jagraon Service Bay', town: 'JGN', status: 'MAINTENANCE', capacity: 20, fuel: 40, hp: 50 },
];

export function buildSampleMachines(fields: Field[], coreCount = 4): Machine[] {
  const rnd = mulberry32(4417);
  return MACHINE_SPECS.map((spec, index) => {
    const n = coreCount + index + 1;
    const town = TOWNS[spec.town];
    const assigned = fields.filter((f) => f.assigned_machine_id === spec.id);
    const target = assigned[0]?.center;
    const home = jitterAround(town.at, 0.4, 1.8, rnd);
    let current = home;
    if (spec.status === 'BALING' && target) {
      current = metersToLatLng(target, (rnd() - 0.5) * 80, (rnd() - 0.5) * 80);
    } else if (spec.status === 'EN_ROUTE' && target) {
      const t = 0.35 + rnd() * 0.4; // part-way from the yard to the field
      current = { lat: home.lat + (target.lat - home.lat) * t, lng: home.lng + (target.lng - home.lng) * t };
    }
    return {
      id: spec.id,
      name: spec.name,
      type: spec.type,
      owner_type: spec.owner,
      owner_name: spec.ownerName,
      operator_name: `Demo Operator ${pad(n)}`,
      operator_phone: `+91 90000 00${100 + n}`,
      capacity_acres_day: spec.capacity,
      tractor_hp_required: spec.hp,
      residue_types: ['PADDY_STRAW'],
      operating_conditions: 'Dry standing or loose paddy straw; confirm field access and operator safety on site.',
      capability_source: 'ICAR / PAU crop-residue machinery references',
      capability_source_date: '2026-10-01',
      current_location: current,
      home_chc: spec.home,
      status: spec.status,
      assigned_field_ids: assigned.map((f) => f.id),
      battery_or_fuel_pct: spec.fuel,
    };
  });
}

// ---------------------------------------------------------------------------
// Satellite fire detections (sample)
// ---------------------------------------------------------------------------

const FIRE_TOWN_WEIGHTS: [string, number][] = [
  ['SGR', 5], ['SUN', 3], ['DHU', 3], ['BHW', 2], ['MLK', 3], ['BAR', 5], ['DHN', 3], ['SAM', 4], ['NAB', 3],
  ['PAT', 2], ['BTI', 6], ['TSB', 4], ['RPH', 4], ['MOG', 4], ['LDH', 3], ['JGN', 3], ['RKT', 2],
];

const FIRE_VILLAGES: Record<string, string[]> = {
  SGR: ['Mangwal', 'Ubhawal North', 'Kauhrian', 'Ramnagar'], SUN: ['Sunam Border', 'Shahpur Kalan', 'Chhajli'],
  DHU: ['Dhuri East Bypass', 'Bhalwan Outskirts', 'Ghanauri'], BHW: ['Bhawanigarh Canal', 'Nadampur'],
  MLK: ['Amargarh', 'Malerkotla Bypass'], BAR: ['Handiaya', 'Sehna', 'Bhadaur'], DHN: ['Dhanaula', 'Mehal Kalan'],
  SAM: ['Ghagga', 'Samana Outskirts'], NAB: ['Alowal', 'Nabha Bypass'], PAT: ['Bahadurgarh', 'Patiala Outskirts'],
  BTI: ['Jeed', 'Goniana', 'Bathinda Canal'], TSB: ['Talwandi Sabo', 'Sangat'], RPH: ['Bhucho Khurd', 'Rampura Outskirts'],
  MOG: ['Dhudike', 'Kokri Kalan', 'Moga Bypass'], LDH: ['Pakhowal', 'Ludhiana Outskirts'], JGN: ['Sidhwan Bet', 'Kamalpura'],
  RKT: ['Halwara', 'Raikot Outskirts'],
};

const SATELLITES: { name: string; product: string }[] = [
  { name: 'VIIRS NOAA-20', product: 'VIIRS_NOAA20_NRT' },
  { name: 'VIIRS Suomi-NPP', product: 'VIIRS_SNPP_NRT' },
  { name: 'VIIRS NOAA-21', product: 'VIIRS_NOAA21_NRT' },
];

const stamp = (ms: number) => `${new Date(ms).toISOString().slice(0, 19).replace('T', ' ')} UTC`;

/** Most recent satellite passes at or before `now`: day passes ~08:05/08:50 UTC, night pass ~20:35 UTC. */
function recentPasses(now: number, count: number): { at: number; day: boolean }[] {
  const out: { at: number; day: boolean }[] = [];
  const startDay = Math.floor(now / DAY) * DAY;
  for (let back = 0; back < 5 && out.length < count + 4; back += 1) {
    const base = startDay - back * DAY;
    [[8 * HOUR + 5 * 60_000, true], [8 * HOUR + 50 * 60_000, true], [20 * HOUR + 35 * 60_000, false]].forEach(([offset, day]) => {
      const at = base + (offset as number);
      if (at <= now - 20 * 60_000) out.push({ at, day: day as boolean });
    });
  }
  return out.sort((a, b) => b.at - a.at).slice(0, count);
}

export function buildSampleFires(fields: Field[]): BurnEvent[] {
  const rnd = mulberry32(9131);
  const passes = recentPasses(SAMPLE_ANCHOR, 5);
  const totalWeight = FIRE_TOWN_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  const pickTown = () => {
    let r = rnd() * totalWeight;
    for (const [key, weight] of FIRE_TOWN_WEIGHTS) { r -= weight; if (r <= 0) return key; }
    return 'SGR';
  };
  const rings = fields.map((f) => ({ field: f, ring: f.geometry }));
  const events: BurnEvent[] = [];

  const push = (point: LatLng, townKey: string, matched: Field | null, forcePassIndex?: number) => {
    const pass = passes[forcePassIndex ?? Math.floor(rnd() * passes.length * (rnd() < 0.7 ? 0.6 : 1))] ?? passes[0];
    const at = Math.min(SAMPLE_ANCHOR - 15 * 60_000, pass.at + Math.floor(rnd() * 18) * 60_000);
    const satellite = SATELLITES[Math.floor(rnd() * SATELLITES.length)];
    const villages = FIRE_VILLAGES[townKey] || [TOWNS[townKey].name];
    const confidence = Math.round(62 + rnd() * 37);
    events.push({
      id: `SAMPLE-FIRE-${pad(events.length + 1, 3)}`,
      firms_point: { lat: Math.round(point.lat * 1e5) / 1e5, lng: Math.round(point.lng * 1e5) / 1e5 },
      detected_at: stamp(at),
      confidence,
      brightness_temp_kelvin: Math.round((331 + Math.pow(rnd(), 1.6) * 64) * 10) / 10,
      satellite: satellite.name,
      sensor: 'VIIRS',
      product: satellite.product,
      source_version: 'sample',
      observation_role: 'SUPPORTING_EVIDENCE',
      matched_field_id: matched ? matched.id : null,
      nearest_village: matched ? `${matched.village} (Registered field)` : `${villages[Math.floor(rnd() * villages.length)]} (Unregistered)`,
      is_registered_customer: Boolean(matched),
    });
  };

  const clearOfDoneFields = (point: LatLng) => !rings.some(({ field, ring }) =>
    (field.status === 'CLEARED_PENDING_AUDIT' || field.status === 'VERIFIED_NON_BURN') && pointInRing(point, ring));

  // 1. Background detections, clustered where paddy is grown.
  for (let i = 0; i < 52; i += 1) {
    const townKey = pickTown();
    let point = jitterAround(TOWNS[townKey].at, 1.5, 11, rnd);
    let guard = 0;
    while ((!clearOfDoneFields(point) || rings.some(({ ring }) => pointInRing(point, ring))) && guard < 8) {
      point = jitterAround(TOWNS[townKey].at, 1.5, 11, rnd);
      guard += 1;
    }
    push(point, townKey, null);
  }

  // 2. Burn alerts inside fields that have not been cleared yet.
  const alertTargets = fields.filter((f) => f.status === 'REGISTERED').slice(0, 3);
  alertTargets.forEach((field, i) => {
    const town = Object.values(TOWNS).find((t) => t.district === field.district) ?? TOWNS.SGR;
    push(ringCentroid(field.geometry), town.key, field, i % 2);
  });

  // 3. A few detections just outside field boundaries (within 1 km), so proximity checks have something to show.
  const nearTargets = fields.filter((f) => ['SCHEDULED', 'ON_THE_WAY', 'MACHINE_ASSIGNED', 'CLEARED_PENDING_AUDIT', 'BALING_IN_PROGRESS'].includes(f.status));
  nearTargets.filter((_, i) => i % 3 === 0).slice(0, 7).forEach((field) => {
    const town = Object.values(TOWNS).find((t) => t.district === field.district) ?? TOWNS.SGR;
    for (let tries = 0; tries < 12; tries += 1) {
      const point = jitterAround(field.center, 0.45, 0.9, rnd);
      if (!rings.some(({ ring }) => pointInRing(point, ring)) && distanceToRingM(point, field.geometry) <= 1000 && clearOfDoneFields(point)) {
        push(point, town.key, null);
        return;
      }
    }
  });

  // 4. Every field has at least one detection within 5 km, as is usual in the burning season.
  fields.forEach((field) => {
    const has = events.some((e) => distanceToRingM(e.firms_point, field.geometry) <= 5000);
    if (has) return;
    const town = Object.values(TOWNS).find((t) => t.district === field.district) ?? TOWNS.SGR;
    for (let tries = 0; tries < 12; tries += 1) {
      const point = jitterAround(field.center, 1.8, 4.2, rnd);
      if (!rings.some(({ ring }) => pointInRing(point, ring))) { push(point, town.key, null); return; }
    }
  });

  return events.sort((a, b) => (a.detected_at < b.detected_at ? 1 : -1));
}

// ---------------------------------------------------------------------------
// Yards and buyers
// ---------------------------------------------------------------------------

export const EXTRA_YARDS: StorageYard[] = [
  { id: 'YARD-04', name: 'Barnala Biomass Collection Yard', location: { lat: 30.3600, lng: 75.5300 }, capacity_tonnes: 7200, current_load: 3100, incoming_tonnes: 380, moisture_alert: false, status: 'AVAILABLE', provenance: 'DEMO' },
  { id: 'YARD-05', name: 'Nabha Straw Aggregation Depot', location: { lat: 30.3800, lng: 76.1400 }, capacity_tonnes: 9000, current_load: 5400, incoming_tonnes: 900, moisture_alert: false, status: 'AVAILABLE', provenance: 'DEMO' },
  { id: 'YARD-06', name: 'Talwandi Sabo Biomass Terminal', location: { lat: 29.9900, lng: 75.0900 }, capacity_tonnes: 15000, current_load: 11800, incoming_tonnes: 1600, moisture_alert: true, status: 'WATCH', provenance: 'DEMO' },
  { id: 'YARD-07', name: 'Moga Agro Buffer Yard', location: { lat: 30.8100, lng: 75.1700 }, capacity_tonnes: 6500, current_load: 2300, incoming_tonnes: 260, moisture_alert: false, status: 'AVAILABLE', provenance: 'DEMO' },
  { id: 'YARD-08', name: 'Jagraon Fodder & Biomass Yard', location: { lat: 30.7900, lng: 75.4700 }, capacity_tonnes: 5200, current_load: 4980, incoming_tonnes: 340, moisture_alert: false, status: 'FULL', provenance: 'DEMO' },
  { id: 'YARD-09', name: 'Malerkotla Feeder Yard', location: { lat: 30.5300, lng: 75.8800 }, capacity_tonnes: 5500, current_load: 1900, incoming_tonnes: 240, moisture_alert: false, status: 'AVAILABLE', provenance: 'DEMO' },
];

export const EXTRA_BUYERS: Buyer[] = [
  {
    id: 'BUYER-06', name: 'Malwa Biomass Co-firing Unit (Demo)', type: 'CBG', location_name: 'Bathinda Industrial Focal Point',
    location: { lat: 30.2000, lng: 74.9700 }, price_per_tonne: 2100, moisture_ceiling: 18.0,
    silica_tolerance: 'Pelletised straw preferred', demand_tonnes: 40000, margin_tier: 'MEDIUM',
    description: 'Illustrative co-firing offtake for baled straw. Fictional buyer used to show matching and map layers.',
  },
  {
    id: 'BUYER-07', name: 'Moga Soil Carbon Biochar Works (Demo)', type: 'BIOCHAR', location_name: 'Moga Agro Park',
    location: { lat: 30.8300, lng: 75.1500 }, price_per_tonne: 2550, moisture_ceiling: 22.0,
    silica_tolerance: 'High silica accepted', demand_tonnes: 12000, margin_tier: 'HIGH',
    description: 'Illustrative pyrolysis unit producing soil-amending biochar. Fictional buyer for demonstration.',
  },
  {
    id: 'BUYER-08', name: 'Ludhiana Dairy Fodder Union (Demo)', type: 'FODDER', location_name: 'Jagraon Dairy Belt',
    location: { lat: 30.8000, lng: 75.4900 }, price_per_tonne: 2300, moisture_ceiling: 17.0,
    silica_tolerance: 'Low silica preferred', demand_tonnes: 16000, margin_tier: 'MEDIUM',
    description: 'Illustrative urea-treated fodder buyer. Fictional buyer for demonstration.',
  },
];

// ---------------------------------------------------------------------------
// Residue lots, jobs, evidence, demand (all keyed to the fields above)
// ---------------------------------------------------------------------------

const isDone = (f: Field) => f.status === 'CLEARED_PENDING_AUDIT' || f.status === 'VERIFIED_NON_BURN';

export function buildSampleLots(fields: Field[]): ResidueLot[] {
  const rnd = mulberry32(7741);
  return fields.filter(isDone).map((field, index) => {
    const verified = field.status === 'VERIFIED_NON_BURN';
    const perAcre = 2.3 + rnd() * 0.5;
    const estimated = Math.round(field.acreage * perAcre * 10) / 10;
    const weighed = Math.round(estimated * (0.96 + rnd() * 0.05) * 10) / 10;
    const baledAt = SAMPLE_ANCHOR - (verified ? 6 + index : 1 + (index % 3)) * 18 * HOUR;
    return {
      id: field.residue_lot_id || `LOT-DEMO-${field.id.slice(-3)}`,
      field_id: field.id,
      farmer_id: field.farmer_id,
      crop: 'Paddy',
      residue_type: 'PADDY_STRAW',
      estimated_quantity_tonnes: estimated,
      quantity_tonnes: weighed,
      verified_quantity_tonnes: verified ? Math.round(weighed * 0.98 * 10) / 10 : null,
      moisture_pct: field.moisture_pct ?? 14.2,
      quality_grade: verified ? (index % 3 === 0 ? 'A' : 'B') : 'PENDING',
      quality_notes: verified ? 'Sample weighment record; not a live buyer transaction.' : 'Awaiting weighment in the sample flow.',
      bale_type: field.assigned_machine_id === 'MACH-06' || index % 2 ? 'SQUARE' : 'ROUND',
      harvest_date: field.expected_harvest_date,
      ready_from: `${field.expected_harvest_date}T08:00:00+05:30`,
      pickup_deadline: `${field.expected_harvest_date}T18:00:00+05:30`,
      machine_id: field.assigned_machine_id ?? null,
      status: verified ? (index === 1 ? 'ALLOCATED' : 'VERIFIED') : 'AVAILABLE',
      geometry_provenance: { source: 'FIELD_RECORD', authority: 'SAMPLE' },
      verification_source: verified ? 'Sample operator weighment' : null,
      verified_at: verified ? iso(baledAt + 4 * HOUR) : null,
      assigned_buyer_id: verified && index === 1 ? 'BUYER-04' : null,
      qr_code: `SAMPLE-LOT-${field.id.slice(-3)}`,
      baled_at: iso(baledAt),
      created_at: iso(baledAt),
    };
  });
}

export type SampleJob = {
  id: string; booking_id: string; machine_id: string | null; operator_id: string | null; status: string;
  slot_start: string | null; slot_end: string | null; actual_arrived_at: string | null; actual_completed_at: string | null;
  failure_reason: string | null; last_transition_at: string | null; booking: { field_id: string };
};

export type SampleEvidence = {
  id: string; field_id: string; booking_id: string | null; kind: string; captured_at: string | null;
  latitude: number | null; longitude: number | null; created_at: string;
};

export function buildSampleJobs(fields: Field[]): SampleJob[] {
  const jobs: SampleJob[] = [];
  fields.forEach((field, index) => {
    const machine = field.assigned_machine_id ?? null;
    let status: string | null = null;
    if (isDone(field)) status = 'COMPLETED';
    else if (field.status === 'BALING_IN_PROGRESS') status = 'BALING';
    else if (field.status === 'ON_THE_WAY') status = 'DISPATCHED';
    else if (field.status === 'MACHINE_ASSIGNED') status = 'ASSIGNED';
    if (!status) return;
    const slotStart = SAMPLE_ANCHOR + (status === 'COMPLETED' ? -30 : status === 'BALING' ? -4 : 6) * HOUR;
    const slotEnd = slotStart + (status === 'COMPLETED' ? 8 : 10) * HOUR;
    jobs.push({
      id: field.job_id || `JOB-DEMO-${pad(index + 1, 3)}`,
      booking_id: `BKG-DEMO-${field.id.slice(-3)}`,
      machine_id: machine,
      operator_id: null,
      status,
      slot_start: iso(slotStart),
      slot_end: iso(slotEnd),
      actual_arrived_at: status === 'BALING' || status === 'COMPLETED' ? iso(slotStart + 20 * 60_000) : null,
      actual_completed_at: status === 'COMPLETED' ? iso(slotEnd - 90 * 60_000) : null,
      failure_reason: null,
      last_transition_at: iso(Math.min(SAMPLE_ANCHOR, slotStart + 40 * 60_000)),
      booking: { field_id: field.id },
    });
  });
  return jobs;
}

export function buildSampleEvidence(fields: Field[]): SampleEvidence[] {
  const out: SampleEvidence[] = [];
  const add = (field: Field, kind: string, minutesAgo: number, n: number) => {
    const at = SAMPLE_ANCHOR - minutesAgo * 60_000;
    const near = metersToLatLng(field.center, ((n * 37) % 60) - 30, ((n * 53) % 60) - 30);
    out.push({
      id: `EVID-${field.id.slice(-3)}-${kind}-${n}`, field_id: field.id, booking_id: `BKG-DEMO-${field.id.slice(-3)}`, kind,
      captured_at: iso(at), latitude: Math.round(near.lat * 1e6) / 1e6, longitude: Math.round(near.lng * 1e6) / 1e6, created_at: iso(at + 60_000),
    });
  };
  fields.forEach((field) => {
    if (field.status === 'BALING_IN_PROGRESS') { add(field, 'gps_trace', 95, 1); add(field, 'field_photo', 70, 1); }
    if (field.status === 'CLEARED_PENDING_AUDIT') {
      add(field, 'gps_trace', 1500, 1); add(field, 'field_photo', 1450, 1); add(field, 'field_photo', 1440, 2); add(field, 'bale_photo', 1380, 1);
    }
    if (field.status === 'VERIFIED_NON_BURN') {
      add(field, 'gps_trace', 6000, 1); add(field, 'field_photo', 5950, 1); add(field, 'field_photo', 5940, 2); add(field, 'field_photo', 5930, 3);
      add(field, 'bale_photo', 5880, 1); add(field, 'bale_photo', 5870, 2); add(field, 'weighment', 5800, 1);
    }
  });
  return out;
}

export type SamplePool = { id: string; name: string; target_tonnes: number; current_tonnes: number; status: string; buyer_demand_id?: string | null };
export type SampleDemand = { id: string; buyer_name: string; target_tonnes: number; pickup_deadline: string; radius_km: number; status: string };
export type SampleOffer = { id: string; lot_id: string; price_per_tonne: number; quantity_tonnes: number; status: string };

export const SAMPLE_DEMANDS: SampleDemand[] = [
  { id: 'DEM-DEMO-1', buyer_name: 'Punjab Agro-Fungi Ltd (Mushroom Substrate)', target_tonnes: 120, pickup_deadline: sampleDay(12), radius_km: 60, status: 'OPEN' },
  { id: 'DEM-DEMO-2', buyer_name: 'Takachar Mobile Pyrolysis Biochar Unit', target_tonnes: 80, pickup_deadline: sampleDay(9), radius_km: 40, status: 'OPEN' },
  { id: 'DEM-DEMO-3', buyer_name: 'Malwa Dairy Cooperative (Urea-Treated Fodder)', target_tonnes: 150, pickup_deadline: sampleDay(15), radius_km: 80, status: 'OPEN' },
  { id: 'DEM-DEMO-4', buyer_name: 'Malwa Biomass Co-firing Unit (Demo)', target_tonnes: 200, pickup_deadline: sampleDay(18), radius_km: 90, status: 'OPEN' },
  { id: 'DEM-DEMO-5', buyer_name: 'Craste Eco-Packaging & Moulded Fibre', target_tonnes: 60, pickup_deadline: sampleDay(10), radius_km: 70, status: 'OPEN' },
];

export const SAMPLE_POOLS: SamplePool[] = [
  { id: 'POOL-DEMO-1', name: 'Sangrur biochar pool', target_tonnes: 80, current_tonnes: 52.4, status: 'FILLING', buyer_demand_id: 'DEM-DEMO-2' },
  { id: 'POOL-DEMO-2', name: 'Barnala fodder aggregation', target_tonnes: 150, current_tonnes: 150, status: 'READY', buyer_demand_id: 'DEM-DEMO-3' },
  { id: 'POOL-DEMO-3', name: 'Bathinda co-firing pool', target_tonnes: 200, current_tonnes: 74.8, status: 'FILLING', buyer_demand_id: 'DEM-DEMO-4' },
];

export function buildSampleOffers(lots: ResidueLot[]): SampleOffer[] {
  return lots.filter((l) => l.status === 'VERIFIED' || l.status === 'ALLOCATED').map((lot, index) => ({
    id: `OFFER-DEMO-${index + 1}`,
    lot_id: lot.id,
    price_per_tonne: [2400, 2650, 2300, 2100][index % 4],
    quantity_tonnes: Number(lot.verified_quantity_tonnes ?? lot.quantity_tonnes ?? 0),
    status: 'OPEN',
  }));
}


// ---------------------------------------------------------------------------
// Field provenance for the sample fields (what each value is based on)
// ---------------------------------------------------------------------------

/** Sources follow how far a field has progressed: declared -> mapped -> reference-matched -> verified. */
export function sampleProvenance(field: Field, index: number): FieldProvenance {
  const base: FieldProvenance = {
    acreage: 'FARMER_DECLARATION', geometry: 'FARMER_DECLARATION', khasra: 'FARMER_DECLARATION',
    crop: 'FARMER_DECLARATION', harvest_date: 'FARMER_DECLARATION', status: 'DECLARED',
  };
  switch (field.status) {
    case 'REGISTERED':
      // A couple of registrations arrive without a stated harvest date, so "needs source" stays visible.
      return index % 3 === 0 ? { ...base, harvest_date: 'UNKNOWN', notes: 'Harvest date not stated by the farmer.' } : base;
    case 'BOOKED':
      return { ...base, geometry: 'SYSTEM_DERIVED', status: 'MAPPED', verification_method: 'Pin placed at the field, boundary drawn by the system' };
    case 'SCHEDULED':
    case 'MACHINE_ASSIGNED':
      return { ...base, acreage: 'CADASTRAL_REFERENCE', geometry: 'CADASTRAL_REFERENCE', khasra: 'CADASTRAL_REFERENCE', status: 'REFERENCE_MATCHED', verification_method: 'Matched to a cadastral reference (sample)' };
    case 'ON_THE_WAY':
      return { ...base, acreage: 'CADASTRAL_REFERENCE', geometry: 'CADASTRAL_REFERENCE', khasra: 'CADASTRAL_REFERENCE', status: 'REFERENCE_MATCHED', verification_method: 'Matched to a cadastral reference (sample)' };
    case 'BALING_IN_PROGRESS':
      return { ...base, acreage: 'SYSTEM_DERIVED', geometry: 'GPS_OPERATOR', status: 'MAPPED', verification_method: 'Operator GPS trace in progress' };
    case 'CLEARED_PENDING_AUDIT':
      return { ...base, acreage: 'SYSTEM_DERIVED', geometry: 'GPS_OPERATOR', status: 'MAPPED', verification_method: 'Operator GPS trace, awaiting review' };
    case 'VERIFIED_NON_BURN':
      return {
        ...base, acreage: 'SYSTEM_DERIVED', geometry: 'GPS_OPERATOR', khasra: 'CADASTRAL_REFERENCE', status: 'FIELD_VERIFIED',
        verified_by: 'Sample verifier (fictional)', verified_at: iso(SAMPLE_ANCHOR - (3 + (index % 4)) * DAY),
        verification_method: 'Photos, GPS trace and weighment reviewed (sample)',
      };
    default:
      return base;
  }
}


// ---------------------------------------------------------------------------
// Sample photos: drawn illustrations, never real field images
// ---------------------------------------------------------------------------

/** A small drawn scene (cleared field or bales) as an SVG data URI, stamped as a sample image. */
export function samplePhotoDataUri(kind: 'field_photo' | 'bale_photo', seed: number, caption: string): string {
  const rnd = mulberry32(seed * 7919 + (kind === 'bale_photo' ? 17 : 3));
  const hue = 36 + Math.round(rnd() * 10);
  const rows = Array.from({ length: 9 }, (_, i) => `<path d="M-20 ${190 + i * 16} Q 160 ${176 + i * 16 + rnd() * 10} 340 ${192 + i * 16}" stroke="hsl(${hue} 45% ${38 + (i % 3) * 4}%)" stroke-width="3" fill="none" opacity=".55"/>`).join('');
  const bales = kind === 'bale_photo'
    ? Array.from({ length: 4 + Math.round(rnd() * 2) }, (_, i) => {
        const cx = 50 + i * 52 + rnd() * 10; const cy = 215 + (i % 2) * 22; const r = 24 + rnd() * 5;
        return `<g><ellipse cx="${cx}" cy="${cy + r * 0.85}" rx="${r}" ry="5" fill="#000" opacity=".18"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${hue} 70% 62%)" stroke="hsl(${hue} 55% 38%)" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="hsl(${hue} 55% 42%)" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="none" stroke="hsl(${hue} 55% 42%)" stroke-width="1.5"/></g>`;
      }).join('')
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6ea"/><stop offset="1" stop-color="#f6e7c8"/></linearGradient></defs><rect width="320" height="240" fill="url(#s)"/><rect y="150" width="320" height="90" fill="hsl(${hue} 38% 46%)"/><path d="M0 150 Q 80 138 160 148 T 320 146 V 160 H 0Z" fill="#6f8f4a" opacity=".7"/>${rows}${bales}<rect x="10" y="10" width="146" height="22" rx="6" fill="#14213d" opacity=".82"/><text x="20" y="25" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">SAMPLE IMAGE · ${caption}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
