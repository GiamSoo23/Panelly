// Public SEIA/EnergySage national + per-state average installed cost per
// watt (pre-any-incentive), as of 2026. These are estimates, not quotes —
// PaybackResultSchema.costEstimateSource is always "estimated".
const NATIONAL_AVERAGE_COST_PER_WATT_DOLLARS = 3.0;

const STATE_COST_PER_WATT_DOLLARS: Partial<Record<string, number>> = {
  CA: 3.3,
  NY: 3.4,
  TX: 2.7,
  FL: 2.8,
  AZ: 2.6,
};

export function getCostPerWattDollars(state: string | undefined): number {
  if (!state) return NATIONAL_AVERAGE_COST_PER_WATT_DOLLARS;
  return (
    STATE_COST_PER_WATT_DOLLARS[state.toUpperCase()] ??
    NATIONAL_AVERAGE_COST_PER_WATT_DOLLARS
  );
}
