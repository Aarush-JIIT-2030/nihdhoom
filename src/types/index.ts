// Nirdhoom: Parali Reframe Core Data Model
// Directly matching Section 08 of the Hackathon Architecture Document

export type PaddyVariety = 'PR-126' | 'Pusa-44' | 'Basmati-1509' | 'Basmati-1121' | 'PR-131';

export type FieldStatus = 
  | 'REGISTERED' 
  | 'SCHEDULED' 
  | 'BALING_IN_PROGRESS' 
  | 'CLEARED_PENDING_AUDIT' 
  | 'VERIFIED_NON_BURN';

export type MachineOwnerType = 'CHC' | 'FPO' | 'INDIVIDUAL';

export type BuyerType = 'MUSHROOM' | 'PACKAGING' | 'BIOCHAR' | 'FODDER' | 'CBG';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  village: string;
  block: string;
  district: string;
  lang: 'pa' | 'hi' | 'en';
  wallet_balance: number;
  upi_id: string;
  aadhaar_last4: string;
  avatar?: string;
  totalAcres?: number;
  cropVariety?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}


export type ProvenanceStatus = 'DECLARED' | 'MAPPED' | 'REFERENCE_MATCHED' | 'FIELD_VERIFIED';

export type ProvenanceSource = 'FARMER_DECLARATION' | 'CADASTRAL_REFERENCE' | 'GPS_OPERATOR' | 'SYSTEM_DERIVED' | 'UNKNOWN';

export interface FieldProvenance {
  acreage: ProvenanceSource;
  geometry: ProvenanceSource;
  khasra: ProvenanceSource;
  crop: ProvenanceSource;
  harvest_date: ProvenanceSource;
  status: ProvenanceStatus;
  verified_by?: string;
  verified_at?: string;
  verification_method?: string;
  notes?: string;
}

export interface Field {
  id: string;
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  geometry: LatLng[];
  center: LatLng;
  khasra_no: string;
  acreage: number;
  crop: 'Paddy';
  paddy_variety: PaddyVariety;
  expected_harvest_date: string;
  clearance_deadline: string;
  status: FieldStatus;
  village: string;
  block: string;
  district: string;
  moisture_pct?: number;
  assigned_machine_id?: string;
  qr_lot_code?: string;
  payout_amount?: number;
  is_verified_non_burn?: boolean;
  provenance?: FieldProvenance;
  job_id?: string;
  residue_lot_id?: string;
  last_operational_update_at?: string;
}

export interface PickupRequest {
  id: string;
  field_id: string;
  farmer_id: string;
  booked_at: string;
  days_to_harvest_at_booking: number;
  quoted_rate_per_acre: number;
  total_quote: number;
  guaranteed_by_date: string;
  penalty_amount: number;
  status: 'PENDING_DISPATCH' | 'ASSIGNED' | 'COMPLETED' | 'PENALTY_PAID';
}

export interface Machine {
  id: string;
  name: string;
  type: 'Round Baler (50 HP)' | 'Square Baler (60 HP)' | 'Super Seeder' | 'Rake + Baler Combo';
  owner_type: MachineOwnerType;
  owner_name: string;
  operator_name: string;
  operator_phone: string;
  capacity_acres_day: number;
  current_location: LatLng;
  home_chc: string;
  status: 'IDLE' | 'EN_ROUTE' | 'BALING' | 'MAINTENANCE';
  assigned_field_ids: string[];
  battery_or_fuel_pct: number;
}

export interface Job {
  id: string;
  request_id: string;
  field_id: string;
  machine_id: string;
  operator_id: string;
  slot_start: string;
  slot_end: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'ACTIVE' | 'COMPLETED' | 'DELAYED';
  actual_completed_at?: string;
  route_polyline?: LatLng[];
  deadhead_km: number;
  estimated_hours: number;
}

export interface Lot {
  id: string;
  field_id: string;
  khasra_no: string;
  qr_code: string;
  weight_kg: number;
  bales_count: number;
  moisture_pct: number;
  silica_pct: number;
  baled_at: string;
  storage_yard_id: string;
  assigned_buyer_id: string;
  buyer_type: BuyerType;
  sale_price_per_tonne: number;
}

export interface StorageYard {
  id: string;
  name: string;
  location: LatLng;
  capacity_tonnes: number;
  current_load: number;
  moisture_alert: boolean;
}

export interface Buyer {
  id: string;
  name: string;
  type: BuyerType;
  location_name: string;
  price_per_tonne: number;
  moisture_ceiling: number;
  silica_tolerance: string;
  demand_tonnes: number;
  margin_tier: 'ULTRA_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface Payout {
  id: string;
  farmer_id: string;
  farmer_name: string;
  job_id: string;
  field_id: string;
  khasra_no: string;
  acreage: number;
  rate_per_acre: number;
  amount: number;
  upi_ref: string;
  status: 'INITIATED' | 'PROCESSING' | 'SETTLED' | 'FAILED';
  settled_at: string;
  duration_seconds: number;
  timestamp: string;
}

export interface BurnEvent {
  id: string;
  firms_point: LatLng;
  detected_at: string;
  confidence: number; // 0-100%
  brightness_temp_kelvin: number;
  satellite: 'VIIRS Suomi-NPP' | 'VIIRS NOAA-20';
  matched_field_id: string | null;
  nearest_village: string;
  is_registered_customer: boolean;
}

export interface NonBurnCertificate {
  certificate_id: string;
  field_id: string;
  farmer_name: string;
  khasra_no: string;
  village: string;
  block: string;
  district: string;
  acreage: number;
  paddy_variety: PaddyVariety;
  clearance_timestamp: string;
  firms_audit_pass: boolean;
  firms_fires_detected_in_polygon: number;
  firms_buffer_meters: number;
  ndvi_pre_harvest: number;
  ndvi_post_clearance: number;
  co2e_avoided_tonnes: number;
  pm25_prevented_kg: number;
  methane_prevented_kg: number;
  carbon_credit_value_inr: number;
  sha256_hash: string;
  issued_at: string;
  verra_vm0042_eligible: boolean;
  certificate_status: 'ILLUSTRATIVE_DEMO' | 'VERIFIED_INTERNAL';
}
