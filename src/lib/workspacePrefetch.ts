import type { ActiveTab } from '../components/Header';

const loaders: Partial<Record<ActiveTab, () => Promise<unknown>>> = {
  OPS_CONSOLE: () => import('../components/OpsConsole/OpsMap'),
  BALER_OPERATOR: () => import('../components/FieldOperator/BalerPWA'),
  RESIDUE_POOLS: () => import('../components/ResiduePooling/ResiduePooling'),
  IMPACT_RESEARCH: () => import('../components/ImpactResearch/ImpactResearch'),
  FIELD_JOBS: () => import('../components/FieldJobs/FieldJobBoard'),
  FARMER_ONBOARDING: () => import('../components/ClearanceBooking/ClearanceBooking'),
  FARMER_KYC: () => import('../components/FarmerOnboarding/FarmerOnboarding'),
  SATELLITE_AUDIT: () => import('../components/VerificationLayer/SatelliteAudit'),
  OFFTAKE_AUCTION: () => import('../components/OfftakeAndForecast/MultiOfftakeAuction'),
  HARVEST_INTELLIGENCE: () => import('../components/HarvestIntelligence/HarvestIntelligence'),
  CARBON_MARKET: () => import('../components/CarbonMarketplace/CarbonMarketplace'),
  AGENTIC_CONSOLE: () => import('../components/AgenticConsole/AgenticCommandCenter'),
  DIGITAL_TWIN_3D: () => import('../components/ThreeD/SatelliteEarth3D'),
  MACHINERY_3D: () => import('../components/ThreeD/BalerModel3D'),
  FARMER_SURFACE: () => import('../components/FarmerSurface/TelegramChannel'),
};

const warmed = new Set<ActiveTab>();

export function prefetchWorkspace(tab: ActiveTab) {
  if (warmed.has(tab)) return;
  const load = loaders[tab];
  if (!load) return;
  warmed.add(tab);
  void load().catch(() => warmed.delete(tab));
}
