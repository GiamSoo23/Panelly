import { describe, expect, it } from "vitest";
import { buildSurveyResultPayload } from "./persistSubmission";

describe("buildSurveyResultPayload", () => {
  it("maps survey input into a result payload with derived values", () => {
    const input = {
      zip: "33620",
      monthlyBillDollars: 140,
      billPhotoBase64: "bill-photo",
      appliancePhotos: [{ id: "ac", imageBase64: "", label: "AC" }],
      userId: "user-123",
    };

    const result = buildSurveyResultPayload(input, {
      zip: "33620",
      lat: 27.95,
      lng: -82.46,
      roofSolarPotential: {
        maxArrayPanelsCount: 18,
        maxSunshineHoursPerYear: 2800,
        panelCapacityWatts: 420,
        carbonOffsetFactorKgPerMwh: 0.8,
        dataSource: "measured" as const,
      },
      payback: {
        systemSizeKw: 5.2,
        panelCount: 12,
        estimatedSystemCostDollars: 18000,
        costEstimateSource: "estimated" as const,
        annualProductionKwh: 8000,
        annualCurrentCostDollars: 1800,
        annualCostAfterSolarDollars: 600,
        annualSavingsDollars: 1200,
        paybackYears: 15,
        ratePerKwh: 0.22,
      },
      installers: [],
      appliances: [{ id: "ac", applianceName: "AC", estWattage: 3500, estDailyKwh: 14 }],
      billRead: null,
      tip: "Switch to cold-water laundry to save more.",
    });

    expect(result.zip).toBe("33620");
    expect(result.appliances[0].applianceName).toBe("AC");
    expect(result.payback.panelCount).toBeGreaterThan(0);
    expect(result.tip).toContain("cold");
  });
});
