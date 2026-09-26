import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DemoWalkthrough } from './components/DemoWalkthrough';
import { LiveKPIDashboard } from './components/LiveKPIDashboard';
import { OpsMap } from './components/OpsConsole/OpsMap';
import { VRPDispatchPanel } from './components/OpsConsole/VRPDispatchPanel';
import { FieldDetailDrawer } from './components/OpsConsole/FieldDetailDrawer';
import { WhatsAppSimulator } from './components/FarmerSurface/WhatsAppSimulator';
import { BalerPWA } from './components/FieldOperator/BalerPWA';
import { UpiSettlementModal } from './components/FieldOperator/UpiSettlementModal';
import { SatelliteAudit } from './components/VerificationLayer/SatelliteAudit';
import { CarbonCertificate } from './components/VerificationLayer/CarbonCertificate';
import { MultiOfftakeAuction } from './components/OfftakeAndForecast/MultiOfftakeAuction';
import { HarvestForecast } from './components/OfftakeAndForecast/HarvestForecast';
import { JudgesQnAPanel } from './components/PitchDefense/JudgesQnAPanel';
import { JudgePitchDrawer } from './components/PitchDefense/JudgePitchDrawer';
import { SatelliteEarth3D } from './components/ThreeD/SatelliteEarth3D';
import { BalerModel3D } from './components/ThreeD/BalerModel3D';
import { CardTilt3D } from './components/ThreeD/CardTilt3D';
import { CarbonMarketplace } from './components/CarbonMarketplace/CarbonMarketplace';
import { FarmerOnboarding } from './components/FarmerOnboarding/FarmerOnboarding';
import { AgenticCommandCenter } from './components/AgenticConsole/AgenticCommandCenter';
import { AgenticTelemetryToast } from './components/AgenticConsole/AgenticTelemetryToast';
import { ParticleField } from './components/Effects/ParticleField';
import { AgenticLanding } from './components/Landing/AgenticLanding';


import { 
  INITIAL_FIELDS, 
  INITIAL_MACHINES, 
  MOCK_FIRMS_FIRE_EVENTS, 
  INITIAL_STORAGE_YARDS, 
  INITIAL_BUYERS 
} from './data/mockData';
import { Field, Machine, BurnEvent, LatLng } from './types';
import { generateNonBurnCertificate } from './utils/spatialVerification';
import { Globe, Box, Map, Sparkles, ShieldCheck, Zap, UserCheck, Leaf } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('OVERVIEW');
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [fireEvents] = useState<BurnEvent[]>(MOCK_FIRMS_FIRE_EVENTS);

  const [selectedField, setSelectedField] = useState<Field | null>(fields[0]);
  const [activeRoutePolyline, setActiveRoutePolyline] = useState<LatLng[]>([]);
  const [isPitchDrawerOpen, setIsPitchDrawerOpen] = useState(false);
  const [certificateField, setCertificateField] = useState<Field | null>(null);
  const [fieldForUpiModal, setFieldForUpiModal] = useState<Field | null>(null);

  // Update field state across the application
  const handleUpdateFieldStatus = (
    fieldId: string,
    newStatus: Field['status'],
    payoutAmt?: number
  ) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          return {
            ...f,
            status: newStatus,
            payout_amount: payoutAmt || f.payout_amount,
            is_verified_non_burn: newStatus === 'CLEARED_PENDING_AUDIT' || newStatus === 'VERIFIED_NON_BURN',
          };
        }
        return f;
      })
    );
  };

  const handleSelectField = (field: Field) => {
    setSelectedField(field);
  };

  return (
    <div className="min-h-screen bg-[#03060f] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Ambient Interactive Particle Field with Mouse Repulsion (Agentic AI design) */}
      <ParticleField />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPitchDrawer={() => setIsPitchDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 relative z-10">
        {/* TAB: AGENTIC AI MASTER OVERVIEW & STRATEGIC BENTO HUB */}
        {activeTab === 'OVERVIEW' && (
          <AgenticLanding
            onNavigateTab={(tab) => setActiveTab(tab)}
            openPitchDrawer={() => setIsPitchDrawerOpen(true)}
            acresScheduled={88.4}
            totalPayoutInr={128150}
            co2Avoided={72.6}
            firmsZeroBurnCount={fields.filter(f => f.is_verified_non_burn || f.status === 'VERIFIED_NON_BURN').length || fields.length}
            activeMachines={machines.length}
            fireEventsOutsideCount={fireEvents.length}
          />
        )}

        {/* TAB 0: AGENTIC AI MULTI-AGENT SWARM */}
        {activeTab === 'AGENTIC_CONSOLE' && (
          <AgenticCommandCenter
            onTriggerDemoBeat={(_beat) => setActiveTab('DEMO_RUNNER')}
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          />
        )}

        {/* TAB 1: 4-BEAT DEMO WALKTHROUGH */}
        {activeTab === 'DEMO_RUNNER' && (
          <div className="flex flex-col gap-2">
            <LiveKPIDashboard
              acresScheduled={88.4}
              totalPayoutInr={128150}
              co2Avoided={72.6}
              firmsZeroBurnCount={fields.filter(f => f.is_verified_non_burn || f.status === 'VERIFIED_NON_BURN').length || fields.length}
              activeMachines={machines.length}
              fireEventsOutsideCount={fireEvents.length}
            />
            <DemoWalkthrough
              fields={fields}
              machines={machines}
              fireEvents={fireEvents}
              onUpdateFieldStatus={handleUpdateFieldStatus}
              onViewCertificateModal={(f) => setCertificateField(f)}
            />
          </div>
        )}

        {/* TAB: 3D DIGITAL TWIN (HOLOGRAPHIC SATELLITE & HOTSPOT SCAN) */}
        {activeTab === 'DIGITAL_TWIN_3D' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-emerald-500/30">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-extrabold text-lg text-white font-['Outfit']">
                    3D Geospatial Agricultural Digital Twin
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Real-time Three.js spatial model of Punjab Malwa hotspot, orbiting NASA VIIRS satellite with radar cone, 3D volcanic fire plumes, and emerald customer polygons.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('MACHINERY_3D')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Inspect 3D Baler</span>
                </button>
                <button
                  onClick={() => setActiveTab('OPS_CONSOLE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Switch to 2D GIS Map</span>
                </button>
              </div>
            </div>

            <SatelliteEarth3D
              fields={fields}
              fireEvents={fireEvents}
              onSelectField={handleSelectField}
            />

            {/* Telemetry Summary Cards with 3D Tilt */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CardTilt3D>
                <div className="glass-panel p-4 border-emerald-500/30 h-full">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>3D Verified Parcels</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    {fields.length} Polygons (20.7 ac)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Zero thermal intersection inside protective domes
                  </p>
                </div>
              </CardTilt3D>

              <CardTilt3D>
                <div className="glass-panel p-4 border-red-500/30 h-full">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Active Thermal Plumes</span>
                    <span className="text-sm">🔥</span>
                  </div>
                  <div className="text-xl font-extrabold text-red-400 font-mono">
                    {fireEvents.length} Points (442 K)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Detected outside customer boundaries in buffer zone
                  </p>
                </div>
              </CardTilt3D>

              <CardTilt3D>
                <div className="glass-panel p-4 border-cyan-500/30 h-full">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Satellite Sensor</span>
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-xl font-extrabold text-cyan-300 font-mono">
                    NOAA-20 VIIRS 375m
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    824 km Sun-synchronous orbit • 3h data freshness
                  </p>
                </div>
              </CardTilt3D>
            </div>
          </div>
        )}

        {/* TAB: 3D BALER MACHINERY TWIN */}
        {activeTab === 'MACHINERY_3D' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-cyan-500/30">
              <div>
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-cyan-400" />
                  <h2 className="font-extrabold text-lg text-white font-['Outfit']">
                    3D Subsidised Baler Machinery Twin
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Wedge 1 Asset Strategy: Route Punjab's 50-80% subsidised CRM machinery. Interactive 3D component CAD model with rotating pickup reel and dual moisture telemetry probe.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('DIGITAL_TWIN_3D')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>3D Digital Twin</span>
                </button>
                <button
                  onClick={() => setActiveTab('BALER_OPERATOR')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Open Field PWA</span>
                </button>
              </div>
            </div>

            <BalerModel3D />
          </div>
        )}

        {/* TAB 2: OPS COMMAND CONSOLE (The Real Product) */}
        {activeTab === 'OPS_CONSOLE' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div>
                <h2 className="font-extrabold text-base text-white font-['Outfit']">
                  Central Ops & VRP Dispatch Console
                </h2>
                <p className="text-xs text-slate-400">
                  Live GIS monitoring of Sangrur cluster, idle CRM machinery allocation, and NASA FIRMS active fire anomalies
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('DIGITAL_TWIN_3D')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3 h-3" />
                  <span>View in 3D</span>
                </button>
                <span className="badge badge-emerald text-xs">
                  GPS Live Feed
                </span>
                <span className="text-xs text-slate-400">
                  {fields.length} Farms • {machines.length} Balers
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 flex flex-col gap-3">
                <OpsMap
                  fields={fields}
                  machines={machines}
                  fireEvents={fireEvents}
                  storageYards={INITIAL_STORAGE_YARDS}
                  buyers={INITIAL_BUYERS}
                  selectedField={selectedField}
                  onSelectField={handleSelectField}
                  activeRoutePolyline={activeRoutePolyline}
                />

                {selectedField && (
                  <FieldDetailDrawer
                    field={selectedField}
                    onClose={() => setSelectedField(null)}
                    onTriggerUpiPayout={(f) => setFieldForUpiModal(f)}
                    onViewCertificate={(f) => setCertificateField(f)}
                  />
                )}
              </div>

              <div className="lg:col-span-4">
                <VRPDispatchPanel
                  fields={fields}
                  machines={machines}
                  onRouteSelected={(route) => setActiveRoutePolyline(route)}
                  onSelectField={handleSelectField}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FARMER WHATSAPP & IVR SURFACE */}
        {activeTab === 'FARMER_SURFACE' && (
          <WhatsAppSimulator
            onSlotConfirmed={(fId) => handleUpdateFieldStatus(fId, 'SCHEDULED')}
          />
        )}

        {/* TAB 4: FIELD BALER OPERATOR PWA */}
        {activeTab === 'BALER_OPERATOR' && (
          <BalerPWA
            fields={fields}
            activeMachine={machines[0]}
            onJobCompleted={(fId, amt) => handleUpdateFieldStatus(fId, 'CLEARED_PENDING_AUDIT', amt)}
          />
        )}

        {/* TAB 5: NASA FIRMS SATELLITE AUDIT (The Money Shot) */}
        {activeTab === 'SATELLITE_AUDIT' && (
          <SatelliteAudit
            fields={fields}
            fireEvents={fireEvents}
          />
        )}

        {/* TAB 6: MULTI-OFFTAKE AUCTION & HARVEST FORECAST */}
        {activeTab === 'OFFTAKE_AUCTION' && (
          <div className="flex flex-col gap-8">
            <MultiOfftakeAuction />
            <HarvestForecast />
          </div>
        )}

        {/* TAB: CARBON CREDIT MARKETPLACE */}
        {activeTab === 'CARBON_MARKET' && (
          <CarbonMarketplace />
        )}

        {/* TAB: FARMER ONBOARDING KYC */}
        {activeTab === 'FARMER_ONBOARDING' && (
          <FarmerOnboarding />
        )}

        {/* TAB 7: JUDGE DEFENSE & UNIT ECONOMICS */}
        {activeTab === 'JUDGE_DEFENSE' && (
          <JudgesQnAPanel />
        )}
      </main>

      {/* Global Modals */}
      {/* 1. Verifiable Institutional Carbon Certificate Modal */}
      {certificateField && (
        <CarbonCertificate
          certificate={generateNonBurnCertificate(certificateField)}
          onClose={() => setCertificateField(null)}
        />
      )}

      {/* 2. Instant UPI Settlement Modal */}
      {fieldForUpiModal && (
        <UpiSettlementModal
          field={fieldForUpiModal}
          onClose={() => setFieldForUpiModal(null)}
          onSettlementComplete={(fId, amt) => {
            handleUpdateFieldStatus(fId, 'CLEARED_PENDING_AUDIT', amt);
            setTimeout(() => setFieldForUpiModal(null), 2500);
          }}
        />
      )}

      {/* 3. Judge Pitch Brief Drawer */}
      <JudgePitchDrawer
        isOpen={isPitchDrawerOpen}
        onClose={() => setIsPitchDrawerOpen(false)}
      />

      {/* Live Agentic Telemetry Toast Stream */}
      <AgenticTelemetryToast onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)} />

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-emerald-500/15 bg-slate-950/95 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-400 font-['Outfit'] text-base">NIRDHOOM (ਨਿਰਧੂਮ)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">The Parali Reframe</span>
          </div>

          <div className="text-slate-500 text-[11px] text-center">
            3D Digital Twin • OR-Tools Dispatch • NASA FIRMS 0-Burn Audit • &lt;90s UPI Settlement • Carbon Marketplace
          </div>

          <button
            onClick={() => setIsPitchDrawerOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Review Pitch Deck &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
