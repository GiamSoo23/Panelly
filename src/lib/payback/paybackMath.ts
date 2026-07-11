import type { PaybackResult } from "@/lib/schemas/survey";

export type SolarPanelConfig = {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
};

export type PaybackInputs = {
  monthlyBillDollars: number;
  ratePerKwh: number;
  panelCapacityWatts: number;
  costPerWattDollars: number;
  solarPanelConfigs: SolarPanelConfig[];
};

export function computePayback(inputs: PaybackInputs): PaybackResult {
  const annualUsageKwh = (inputs.monthlyBillDollars / inputs.ratePerKwh) * 12;
  const annualCurrentCostDollars = inputs.monthlyBillDollars * 12;

  // Size to ACTUAL usage, not max roof capacity.
  const sorted = [...inputs.solarPanelConfigs].sort(
    (a, b) => a.panelsCount - b.panelsCount,
  );
  const fit =
    sorted.find((c) => c.yearlyEnergyDcKwh >= annualUsageKwh) ?? sorted.at(-1);
  if (!fit) {
    throw new Error("computePayback: solarPanelConfigs must not be empty");
  }

  const systemSizeKw = (fit.panelsCount * inputs.panelCapacityWatts) / 1000;
  const estimatedSystemCostDollars =
    systemSizeKw * 1000 * inputs.costPerWattDollars;

  // --- Federal ITC line intentionally removed ---
  // As of 2026-07-11: OBBBA (signed July 2025) repealed the Sec. 25D
  // residential clean energy credit for systems placed in service after
  // 2025-12-31. No federal residential solar tax credit currently exists.
  // This is where `estimatedSystemCostDollars *= (1 - 0.26)` used to live.
  // Do NOT re-add without re-verifying current federal policy — this was
  // deliberately removed, not a bug.
  const netSystemCostDollars = estimatedSystemCostDollars;

  const offsetRatio = Math.min(fit.yearlyEnergyDcKwh / annualUsageKwh, 1);
  const annualSavingsDollars = annualCurrentCostDollars * offsetRatio;
  const paybackYears =
    annualSavingsDollars > 0
      ? netSystemCostDollars / annualSavingsDollars
      : Infinity;

  return {
    systemSizeKw,
    panelCount: fit.panelsCount,
    estimatedSystemCostDollars: netSystemCostDollars,
    costEstimateSource: "estimated",
    annualProductionKwh: fit.yearlyEnergyDcKwh,
    annualCurrentCostDollars,
    annualCostAfterSolarDollars: annualCurrentCostDollars - annualSavingsDollars,
    annualSavingsDollars,
    paybackYears,
    ratePerKwh: inputs.ratePerKwh,
  };
}
