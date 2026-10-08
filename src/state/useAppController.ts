import { useCallback, useEffect, useState } from 'react';
import { ActiveTab } from '../components/Header';
import { INITIAL_FIELDS, INITIAL_MACHINES, MOCK_FIRMS_FIRE_EVENTS } from '../data/mockData';
import { Field, Machine, BurnEvent, LatLng } from '../types';
import { supabase } from '../lib/supabase';
import { normalizeField } from '../lib/domain';

const DEMO_MODE = import.meta.env.VITE_NIRDHOOM_DEMO_MODE === 'true';
const DEMO_STATE_KEY = 'nirdhoom.demo.state.v2';

type DemoState = { fields: Field[]; machines: Machine[]; fireEvents: BurnEvent[] };

export function useAppController() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('OVERVIEW');

  const [demoSeed] = useState<DemoState>(() => {
    const fallback = { fields: INITIAL_FIELDS, machines: INITIAL_MACHINES, fireEvents: MOCK_FIRMS_FIRE_EVENTS };
    if (!DEMO_MODE || typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(DEMO_STATE_KEY);
      if (!raw) return fallback;
      const saved = JSON.parse(raw) as Partial<DemoState>;
      if (Array.isArray(saved.fields) && Array.isArray(saved.machines) && Array.isArray(saved.fireEvents)) {
        return saved as DemoState;
      }
    } catch {
      // Storage is optional; the seeded demo remains usable.
    }
    return fallback;
  });

  const [fields, setFields] = useState<Field[]>(DEMO_MODE ? demoSeed.fields : []);
  const [machines, setMachines] = useState<Machine[]>(DEMO_MODE ? demoSeed.machines : []);
  const [fireEvents, setFireEvents] = useState<BurnEvent[]>(DEMO_MODE ? demoSeed.fireEvents : []);
  const [selectedField, setSelectedField] = useState<Field | null>(DEMO_MODE ? demoSeed.fields[0] || null : null);
  const [loadingLiveData, setLoadingLiveData] = useState(!DEMO_MODE && Boolean(supabase));
  const [liveDataError, setLiveDataError] = useState<string | null>(null);
  const [activeRoutePolyline, setActiveRoutePolyline] = useState<LatLng[]>([]);
  const [isPitchDrawerOpen, setIsPitchDrawerOpen] = useState(false);
  const [certificateField, setCertificateField] = useState<Field | null>(null);
  const [fieldForUpiModal, setFieldForUpiModal] = useState<Field | null>(null);

  useEffect(() => {
    if (!DEMO_MODE || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify({ fields, machines, fireEvents }));
    } catch {
      // Some privacy modes disable localStorage; do not block the product.
    }
  }, [fields, machines, fireEvents]);

  const refreshLiveData = useCallback(async () => {
    if (DEMO_MODE || !supabase) {
      setLoadingLiveData(false);
      return;
    }
    setLoadingLiveData(true);
    setLiveDataError(null);
    const client = supabase;
    const [{ data: fieldRows, error: fieldError }, { data: machineRows, error: machineError }] =
      await Promise.all([
        client.from('fields').select('id,external_id,owner_id,khasra_no,village,block,district,acreage,crop,variety,expected_harvest_date,clearance_deadline,status,moisture_pct,center_lat,center_lng,geometry,boundary_geojson,boundary_source,boundary_verified,geometry_area_acres'),
        client.from('machines').select('id,external_id,name,machine_type,owner_name,operator_name,operator_phone,status,capacity_acres_day,tractor_hp_required,residue_types,operating_conditions,capability_source,capability_source_date,fuel_pct,current_lat,current_lng,operator_user_id'),
      ]);
    if (fieldError || machineError) {
      setLiveDataError(fieldError?.message || machineError?.message || 'Unable to load live operational data');
      setFields([]);
      setMachines([]);
      setSelectedField(null);
      setLoadingLiveData(false);
      return;
    }
    const rows = fieldRows || [];
    const normalizedFields: Field[] = rows.map(normalizeField).map((f) => ({
      ...f,
      dbId: f.dbId,
      acreage: f.acres,
      farmer_id: String(rows.find((row) => row.id === f.dbId)?.owner_id || ''),
      farmer_name: '',
      farmer_phone: '',
      khasra_no: f.khasra,
      paddy_variety: (f.variety || 'PR-126') as Field['paddy_variety'],
      expected_harvest_date: f.harvest,
      clearance_deadline: f.deadline,
      status: f.status as Field['status'],
      center: { lat: f.lat, lng: f.lng },
      geometry: f.geometry || [],
      crop: 'Paddy',
    }));
    const normalizedMachines: Machine[] = (machineRows || []).map((m) => ({
      id: String(m.external_id || m.id),
      name: String(m.name || m.external_id || 'Machine'),
      type: String(m.machine_type || 'Round Baler (50 HP)') as Machine['type'],
      owner_type: 'CHC',
      owner_name: String(m.owner_name || ''),
      operator_name: String(m.operator_name || ''),
      operator_phone: String(m.operator_phone || ''),
      capacity_acres_day: Number(m.capacity_acres_day || 0),
      current_location: { lat: Number(m.current_lat || 0), lng: Number(m.current_lng || 0) },
      home_chc: '',
      status: String(m.status || 'IDLE') as Machine['status'],
      assigned_field_ids: [],
      battery_or_fuel_pct: Number(m.fuel_pct || 0),
    }));
    setFields(normalizedFields);
    setMachines(normalizedMachines);
    setFireEvents([]);
    setSelectedField((current) => normalizedFields.find((f) => f.id === current?.id) || normalizedFields[0] || null);
    setLoadingLiveData(false);
  }, []);

  useEffect(() => {
    if (DEMO_MODE || !supabase) {
      setLoadingLiveData(false);
      return;
    }
    let active = true;
    void refreshLiveData().finally(() => { if (!active) return; });
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel('nirdhoom-live-operations', { config: { private: true } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fields' }, () => { void refreshLiveData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => { void refreshLiveData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => { void refreshLiveData(); })
      .subscribe();
    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [refreshLiveData]);


  const handleUpdateFieldStatus = (
    fieldId: string,
    newStatus: Field['status'],
    payoutAmt?: number,
  ) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              status: newStatus,
              payout_amount: payoutAmt ?? field.payout_amount,
              is_verified_non_burn:
                newStatus === 'CLEARED_PENDING_AUDIT' ||
                newStatus === 'VERIFIED_NON_BURN',
            }
          : field,
      ),
    );
  };

  return {
    demoMode: DEMO_MODE,
    loadingLiveData,
    liveDataError,
    activeTab,
    setActiveTab,
    fields,
    machines,
    fireEvents,
    selectedField,
    setSelectedField,
    activeRoutePolyline,
    setActiveRoutePolyline,
    isPitchDrawerOpen,
    setIsPitchDrawerOpen,
    certificateField,
    setCertificateField,
    fieldForUpiModal,
    setFieldForUpiModal,
    handleUpdateFieldStatus,
    refreshLiveData,
  };
}
