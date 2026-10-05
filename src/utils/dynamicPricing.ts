// Pricing prototype: server-side booking RPC is authoritative in live mode; this helper is UI/demo logic.
// "Yield-manage the window. Register 3 weeks pre-harvest, get the top rate.
// Day-of walk-in, get the floor rate. This is airline pricing applied to a 30-day supply spike."

export interface PricingQuote {
  daysToHarvest: number;
  ratePerAcre: number;
  totalPayout: number;
  penaltyCoverage: number;
  planningWindowHours: number;
  tierName: string;
  tierBadgeColor: string;
  urgencyDiscountOrBonusPct: number;
}

/**
 * Calculates dynamic quote per acre based on how early the farmer books before harvest.
 * Early bookings flatten the supply curve and allow machine pre-positioning.
 */
export function calculateDynamicQuote(acreage: number, daysToHarvest: number): PricingQuote {
  // Bounded between 0 and 30 days
  const d = Math.max(0, Math.min(30, daysToHarvest));

  let ratePerAcre = 750; // Floor rate for day-of walk-in
  let tierName = 'Walk-in / Urgent Rate';
  let tierBadgeColor = '#ef4444'; // red
  let urgencyBonus = 0;

  if (d >= 21) {
    ratePerAcre = 1450;
    tierName = 'Early Bird Golden Tier (3+ Weeks Prior)';
    tierBadgeColor = '#10b981'; // emerald
    urgencyBonus = 93; // 93% higher than floor
  } else if (d >= 14) {
    ratePerAcre = 1300;
    tierName = 'Advance Buffer Tier (2 Weeks Prior)';
    tierBadgeColor = '#3b82f6'; // blue
    urgencyBonus = 73;
  } else if (d >= 7) {
    ratePerAcre = 1100;
    tierName = 'Standard Tier (1 Week Prior)';
    tierBadgeColor = '#f59e0b'; // amber
    urgencyBonus = 46;
  } else if (d >= 3) {
    ratePerAcre = 900;
    tierName = 'Short Window Tier (3-6 Days)';
    tierBadgeColor = '#f97316'; // orange
    urgencyBonus = 20;
  } else {
    ratePerAcre = 750;
    tierName = 'Same-Day Walk-in (High Congestion)';
    tierBadgeColor = '#ef4444';
    urgencyBonus = 0;
  }

  const totalPayout = Math.round(ratePerAcre * acreage);

  // Illustrative late-sowing impact coverage only; this is not a payment promise.
  // No automatic transfer or settlement occurs in the current release.
  const penaltyCoverage = Math.round(Math.max(2500, acreage * 1250));

  return {
    daysToHarvest: d,
    ratePerAcre,
    totalPayout,
    penaltyCoverage,
    planningWindowHours: 48,
    tierName,
    tierBadgeColor,
    urgencyDiscountOrBonusPct: urgencyBonus,
  };
}
