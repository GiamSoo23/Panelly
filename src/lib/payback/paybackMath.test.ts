import { describe, expect, it } from "vitest";
import { computePayback } from "./paybackMath";

describe("computePayback", () => {
  it("sizes to actual usage, not max roof capacity", () => {
    const result = computePayback({
      monthlyBillDollars: 150,
      ratePerKwh: 0.25, // $150/mo -> 600 kWh/mo -> 7200 kWh/yr
      panelCapacityWatts: 400,
      costPerWattDollars: 20000 / 6000, // targets a $20k / 6kW system
      solarPanelConfigs: [
        { panelsCount: 10, yearlyEnergyDcKwh: 5200 }, // too small, doesn't cover usage
        { panelsCount: 15, yearlyEnergyDcKwh: 7800 }, // smallest config that covers usage
        { panelsCount: 20, yearlyEnergyDcKwh: 10400 }, // max roof, should NOT be picked
      ],
    });

    expect(result.panelCount).toBe(15);
    expect(result.systemSizeKw).toBeCloseTo(6, 5);
  });

  // Doc's own worked example ($20k / 6kW system, ~$150/mo bill) was tuned
  // assuming the now-repealed 26% federal ITC, targeting 6-9yr payback.
  // Recomputed without a credit (see paybackMath.ts): ~$1,800/yr savings on
  // a $20k system lands ~11.1yr. This is the correct current-law number, not
  // a bug — see OBBBA/Sec. 25D comment in paybackMath.ts.
  it("lands around 10-12yr for the doc's worked example, without a federal credit", () => {
    const result = computePayback({
      monthlyBillDollars: 150,
      ratePerKwh: 0.25,
      panelCapacityWatts: 400,
      costPerWattDollars: 20000 / 6000,
      solarPanelConfigs: [{ panelsCount: 15, yearlyEnergyDcKwh: 7800 }],
    });

    expect(result.estimatedSystemCostDollars).toBeCloseTo(20000, 0);
    expect(result.annualSavingsDollars).toBeCloseTo(1800, 0);
    expect(result.paybackYears).toBeGreaterThan(10);
    expect(result.paybackYears).toBeLessThan(12);
  });

  it("caps offset ratio at 1 when production exceeds usage", () => {
    const result = computePayback({
      monthlyBillDollars: 100,
      ratePerKwh: 0.2, // 500 kWh/mo -> 6000 kWh/yr usage
      panelCapacityWatts: 400,
      costPerWattDollars: 3,
      solarPanelConfigs: [{ panelsCount: 20, yearlyEnergyDcKwh: 20000 }], // way oversized
    });

    expect(result.annualSavingsDollars).toBeCloseTo(result.annualCurrentCostDollars, 5);
    expect(result.annualCostAfterSolarDollars).toBeCloseTo(0, 5);
  });
});
