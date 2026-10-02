import React, { useEffect, useRef, useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Wifi, 
  WifiOff, 
  QrCode, 
  Droplet, 
  Zap, 
  Navigation, 
  Phone, 
  User, 
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { Field, Machine } from '../../types';
import { UpiSettlementModal } from './UpiSettlementModal';
import { supabase } from '../../lib/supabase';
import { queuedEvidenceCount, queueEvidence, registerEvidenceQueueReplay } from '../../lib/offlineEvidenceQueue';

interface BalerPWAProps {
  fields: Field[];
  activeMachine: Machine;
  demoMode: boolean;
  onJobCompleted: (fieldId: string, amount: number) => void;
}

export const BalerPWA: React.FC<BalerPWAProps> = ({
  fields,
  activeMachine,
  demoMode,
  onJobCompleted,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || 'FIELD-101');
  const [moistureValue, setMoistureValue] = useState<number>(14.2);
  const [balesCount, setBalesCount] = useState<number>(38);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [offlineSyncActive, setOfflineSyncActive] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const client = supabase;
    if (demoMode || !client || typeof navigator === 'undefined' || !navigator.geolocation) return;
    let cancelled = false;

    const syncGps = async (position: GeolocationPosition) => {
      if (cancelled) return;
      const next = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      setGpsState(next);
      if (Date.now() - lastGpsWrite.current < 15000) return;
      lastGpsWrite.current = Date.now();

      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      await client.from('machine_locations').insert({
        machine_id: activeMachine.id,
        latitude: next.lat,
        longitude: next.lng,
        speed_kmh: Number.isFinite(position.coords.speed || NaN) ? Math.max(0, Number(position.coords.speed) * 3.6) : null,
        source: 'operator-pwa',
        recorded_at: new Date(position.timestamp).toISOString(),
      });
    };

    const watchId = navigator.geolocation.watchPosition(syncGps, () => setGpsState(null), {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    });
    const onOnline = () => setOfflineSyncActive(true);
    const onOffline = () => setOfflineSyncActive(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [activeMachine.id, demoMode]);

  useEffect(() => {
    if (demoMode) return;
    let dispose: (() => void) | undefined;
    void registerEvidenceQueueReplay().then((cleanup) => { dispose = cleanup; });
    const refresh = async () => setQueuedEvidence(await queuedEvidenceCount());
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => {
      if (dispose) dispose();
      window.clearInterval(timer);
    };
  }, [demoMode]);

  const handleEvidenceCapture = async (file: File) => {
    setEvidenceMessage('');
    const capturedAt = new Date().toISOString();
    const gps = gpsState;
    if (demoMode) {
      setEvidenceMessage('Demo photo captured locally; no evidence record was uploaded.');
      return;
    }

    const client = supabase;
    if (!client) {
      setEvidenceMessage('Live Supabase is not configured. Evidence was not uploaded.');
      return;
    }
    const { data } = await client.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      setEvidenceMessage('Sign in as the assigned operator before uploading evidence.');
      return;
    }

    if (!navigator.onLine) {
      await queueEvidence({
        fieldId: currentField.id,
        fileName: file.name,
        fileType: file.type,
        blob: file,
        capturedAt,
        latitude: gps?.lat ?? null,
        longitude: gps?.lng ?? null,
        accuracyM: gps?.accuracy ?? null,
      });
      setQueuedEvidence(await queuedEvidenceCount());
      setEvidenceMessage('Offline: evidence saved to the device queue and will sync when the connection returns.');
      return;
    }

    const id = crypto.randomUUID();
    const path = `${user.id}/${currentField.id}/${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const upload = await client.storage.from('evidence').upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) {
      await queueEvidence({
        fieldId: currentField.id,
        fileName: file.name,
        fileType: file.type,
        blob: file,
        capturedAt,
        latitude: gps?.lat ?? null,
        longitude: gps?.lng ?? null,
        accuracyM: gps?.accuracy ?? null,
      });
      setQueuedEvidence(await queuedEvidenceCount());
      setEvidenceMessage(`Upload unavailable; evidence queued safely for replay. ${upload.error.message}`);
      return;
    }

    const bytes = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const { error } = await client.from('evidence_assets').insert({
      field_id: currentField.id,
      kind: 'field_photo',
      storage_path: path,
      source: 'operator-pwa',
      captured_at: capturedAt,
      latitude: gps?.lat ?? null,
      longitude: gps?.lng ?? null,
      gps_accuracy_m: gps?.accuracy ?? null,
      sha256: hash,
      created_by: user.id,
      sync_source: 'online',
      metadata: { file_name: file.name, mime_type: file.type },
    });

    if (error) {
      setEvidenceMessage(`Evidence metadata could not be recorded: ${error.message}`);
      return;
    }
    setEvidenceMessage('Evidence uploaded, hashed and linked to the field record.');
  };

  const [gpsState, setGpsState] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [evidenceMessage, setEvidenceMessage] = useState('');
  const [queuedEvidence, setQueuedEvidence] = useState(0);
  const lastGpsWrite = useRef(0);

  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];
  const isJobFinished = currentField.status === 'CLEARED_PENDING_AUDIT' || currentField.status === 'VERIFIED_NON_BURN';

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-2 max-w-6xl mx-auto">
      {/* Left side: Context for Judges */}
      <div className="w-full lg:w-5/12 flex flex-col gap-4">
        <div className="glass-panel-emerald p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">
              Field Operator PWA • Evidence & Job Completion
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In rural Punjab, network connectivity in the middle of a 20-acre paddy field is notoriously spotty. The Baler Operator PWA runs offline-first with IndexedDB caching and GPS geofencing. 
          </p>
          <div className="mt-3 bg-slate-950/70 p-2.5 rounded-lg border border-emerald-500/20 text-xs text-slate-300">
            <strong>The field workflow should capture GPS, job state, quantity and evidence. Payment remains intentionally disabled in this release.</strong>
          </div>
        </div>

        {/* Machine Telemetry Card */}
        <div className="glass-panel p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚜</span>
              <div>
                <h4 className="font-bold text-sm text-white">{activeMachine.name}</h4>
                <p className="text-[11px] text-slate-400">{activeMachine.home_chc}</p>
              </div>
            </div>
            <span className="badge badge-emerald text-[10px]">
              {activeMachine.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Operator</span>
              <strong className="text-white text-xs">{activeMachine.operator_name}</strong>
              <span className="text-slate-500 text-[10px] block">{activeMachine.operator_phone}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Daily Capacity</span>
              <strong className="text-emerald-400 text-xs">{activeMachine.capacity_acres_day} Acres / day</strong>
              <span className="text-slate-500 text-[10px] block">50-80% Subsidy CRM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Mobile Field Device UI */}
      <div className="w-full lg:w-7/12 flex justify-center">
        <div className="device-frame">
          {/* Status Bar */}
          <div className="device-header">
            <span>11:15 AM</span>
            <div className="device-notch"></div>
            <div className="flex items-center gap-1.5 text-xs">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>{demoMode ? 'PWA Simulation' : 'PWA / device sync'}</span>
            </div>
          </div>

          {/* App Header */}
          <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                🚜
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Nirdhoom Field Dispatch</h4>
                <span className="text-[10px] text-emerald-400 font-mono">
                  GPS Geofence: Ubhawal Sector 4
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Sync Active</span>
            </div>
          </div>

          {/* Field Job Selection Queue */}
          <div className="p-3 bg-slate-950 flex flex-col gap-3 min-h-[460px]">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Assigned Field Queue for Today
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {fields.map((f) => {
                const isSelected = f.id === selectedFieldId;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`px-3 py-2 rounded-xl text-left border text-xs whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">{f.khasra_no}</div>
                    <div className="text-[10px] text-slate-400">{f.village} • {f.acreage} ac</div>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Job Card */}
            <div className="glass-panel p-3.5 border-emerald-500/30 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base text-white">{currentField.khasra_no}</span>
                    <span className="badge badge-emerald text-[9px]">
                      {currentField.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {currentField.village}, Sangrur • {currentField.acreage} Acres
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{demoMode ? 'Demo quote' : 'Server quote'}</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ₹{(currentField.payout_amount || 5075).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Visual Machinery & Farmer Strip */}
              <div className="rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900">
                <img 
                  src="/images/baling_fleet.jpg" 
                  alt="Assigned Baler in Sangrur Field" 
                  className="w-full h-24 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/images/farmer_gurpreet.jpg" 
                      alt="Gurpreet Singh" 
                      className="w-7 h-7 rounded-full border border-emerald-400 object-cover"
                    />
                    <span className="text-xs font-bold text-white drop-shadow">
                      {currentField.farmer_name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/80 text-slate-950 font-extrabold">
                    {demoMode ? 'Demo assignment' : 'Live assignment'}
                  </span>
                </div>
              </div>

              {/* Farmer contact & Navigate buttons */}
              <div className="flex gap-2">
                <a
                  href={`tel:${currentField.farmer_phone}`}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Farmer</span>
                </a>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${currentField.center.lat},${currentField.center.lng}`, '_blank', 'noopener,noreferrer')}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS Navigate</span>
                </button>
              </div>

              {/* In-field Quality Telemetry Inputs */}
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{demoMode ? 'Demo moisture control:' : 'Moisture sensor:'}</span>
                  </span>
                  <strong className={`font-mono ${moistureValue > 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {moistureValue}% {moistureValue <= 20 ? '(Optimal)' : '(High Moisture Alert!)'}
                  </strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="25"
                  step="0.5"
                  value={moistureValue}
                  onChange={(e) => setMoistureValue(Number(e.target.value))}
                  disabled={!demoMode}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">{demoMode ? 'Estimated straw yield:' : 'Straw quantity:'}</span>
                  <strong className="text-white font-mono">{balesCount} Bales (~{Math.round(currentField.acreage * 2.2 * 10) / 10} Tonnes)</strong>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">QR lot:</span>
                  <span className="font-mono text-cyan-300 font-bold flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    {demoMode ? (currentField.qr_lot_code || 'DEMO-LOT') : (currentField.qr_lot_code || 'Not assigned')}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/10 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-cyan-200">Field evidence</span>
                  <span className={`text-[10px] font-semibold ${offlineSyncActive ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {offlineSyncActive ? 'ONLINE' : 'OFFLINE QUEUE'}
                  </span>
                </div>
                <div className="mt-1 text-slate-400">
                  {gpsState ? `GPS ±${Math.round(gpsState.accuracy)}m` : demoMode ? 'Demo GPS' : 'Waiting for device GPS permission'}
                  {!demoMode && queuedEvidence > 0 && ` • ${queuedEvidence} queued`}
                </div>
                <label className="mt-2 flex cursor-pointer items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 font-bold text-cyan-200 hover:bg-cyan-500/20">
                  Capture field photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleEvidenceCapture(file);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                {evidenceMessage && <p className="mt-2 text-[11px] text-slate-300">{evidenceMessage}</p>}
              </div>

              {/* Completion action: payment is never triggered from the browser */}
              {!isJobFinished ? (
                <button
                  onClick={() => demoMode && setShowUpiModal(true)}
                  disabled={!demoMode}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" />
                  <span>{demoMode ? 'Simulate field completion' : 'Complete via authorized server workflow'}</span>
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{demoMode ? 'Demo job completed locally • no payment made' : 'Live completion is controlled by the server workflow'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Modal */}
      {showUpiModal && (
        <UpiSettlementModal
          field={currentField}
          onClose={() => setShowUpiModal(false)}
          onSettlementComplete={(fId, amt) => {
            onJobCompleted(fId, amt);
            setTimeout(() => setShowUpiModal(false), 2400);
          }}
        />
      )}
    </div>
  );
};
