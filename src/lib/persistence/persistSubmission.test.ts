import { describe, expect, it } from "vitest";

import { prepareSubmissionRecord } from "./neon";
import { SurveyInputSchema, type SurveyInput } from "@/lib/schemas/survey";

const surveyInput: SurveyInput = {
  zip: "80203",
  homeType: "single_family",
  householdSize: 3,
  homeSize: "1000_2000",
  usageHabits: "in_between",
  showerTime: "10_20",
  hotMeals: "few_nights_6_12",
  dishwasherRuns: "eco_1_3",
  laundryLoads: "4_7",
  washerTemp: "cold_eco",
  homeFeatures: ["ev", "gaming_home_office"],
  userId: "user_123",
};

describe("SurveyInputSchema", () => {
  it("accepts a fully answered 11-question survey", () => {
    expect(SurveyInputSchema.parse(surveyInput)).toEqual(surveyInput);
  });

  it("rejects invalid answers", () => {
    expect(() => SurveyInputSchema.parse({ ...surveyInput, zip: "123" })).toThrow();
    expect(() =>
      SurveyInputSchema.parse({ ...surveyInput, homeType: "castle" }),
    ).toThrow();
    expect(() =>
      SurveyInputSchema.parse({ ...surveyInput, homeFeatures: [] }),
    ).toThrow();
  });
});

describe("prepareSubmissionRecord", () => {
  it("uses the authenticated user id and preserves the survey payload", () => {
    const record = prepareSubmissionRecord(
      surveyInput,
      {
        zip: "80203",
        lat: 39.7392,
        lng: -104.9903,
        roofSolarPotential: {
          maxArrayPanelsCount: 18,
          maxSunshineHoursPerYear: 2000,
          panelCapacityWatts: 400,
          carbonOffsetFactorKgPerMwh: 0.8,
          dataSource: "estimated",
        },
        payback: {
          systemSizeKw: 4.2,
          panelCount: 12,
          estimatedSystemCostDollars: 15000,
          costEstimateSource: "estimated",
          annualProductionKwh: 6500,
          annualCurrentCostDollars: 1440,
          annualCostAfterSolarDollars: 400,
          annualSavingsDollars: 1040,
          paybackYears: 7.6,
          ratePerKwh: 0.2,
        },
        installers: [{ name: "BrightSun", rating: 4.6, address: "123 Main St" }],
        appliances: [{ id: "ev", applianceName: "Electric vehicle (EV)", estWattage: 120, estDailyKwh: 1.4 }],
        billRead: null,
        tip: "Turn off the fridge door seal gap.",
      },
      "user_123",
    );

    expect(record.userId).toBe("user_123");
    expect(record.input.zip).toBe("80203");
    expect(record.input.homeFeatures).toContain("ev");
    expect(record.result.payback.paybackYears).toBeGreaterThan(0);
    expect(record.result.installers).toHaveLength(1);
  });
});
