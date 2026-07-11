import { SurveyResultSchema, type SurveyResult } from "@/lib/schemas/survey";
import type { ResultsLocation } from "@/lib/results/presentation";

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
] as const;

type StateName = (typeof US_STATES)[number];

const mockLocations: Record<string, ResultsLocation & { state: StateName }> = {
  "demo-florida-home": { state: "Florida", stateCode: "FL" },
  "demo-measured-home": { state: "Texas", stateCode: "TX" },
  "demo-estimated-home": { state: "Pennsylvania", stateCode: "PA" },
};

const rawMockResults: Record<string, unknown> = {
  "demo-florida-home": {
    submissionId: "demo-florida-home",
    zip: "33602",
    lat: 27.9506,
    lng: -82.4572,
    roofSolarPotential: {
      maxArrayPanelsCount: 28,
      maxSunshineHoursPerYear: 2_930,
      panelCapacityWatts: 400,
      carbonOffsetFactorKgPerMwh: 410,
      dataSource: "estimated",
    },
    payback: {
      systemSizeKw: 8.8,
      panelCount: 22,
      estimatedSystemCostDollars: 24_600,
      costEstimateSource: "estimated",
      annualProductionKwh: 13_200,
      annualCurrentCostDollars: 2_520,
      annualCostAfterSolarDollars: 720,
      annualSavingsDollars: 1_800,
      paybackYears: 13.7,
      ratePerKwh: 0.17,
    },
    installers: [],
    appliances: [
      { id: "fl-ac", applianceName: "Central air conditioning", estWattage: 3_600, estDailyKwh: 18.2 },
      { id: "fl-water", applianceName: "Water heater", estWattage: 4_500, estDailyKwh: 5.2 },
      { id: "fl-fridge", applianceName: "Refrigerator", estWattage: 180, estDailyKwh: 2.8 },
      { id: "fl-laundry", applianceName: "Washer and dryer", estWattage: 3_000, estDailyKwh: 3.1 },
    ],
    billRead: { totalKwh: 1_215, totalDollars: 210, billingPeriod: "June 2026" },
    tip: "Improving cooling efficiency may lower demand before solar is installed.",
    createdAt: "2026-07-08T14:30:00.000Z",
  },
  "demo-measured-home": {
    submissionId: "demo-measured-home",
    zip: "78704",
    lat: 30.2457,
    lng: -97.7688,
    roofSolarPotential: {
      maxArrayPanelsCount: 25,
      maxSunshineHoursPerYear: 2_720,
      panelCapacityWatts: 400,
      carbonOffsetFactorKgPerMwh: 390,
      dataSource: "measured",
    },
    payback: {
      systemSizeKw: 7.6,
      panelCount: 19,
      estimatedSystemCostDollars: 21_300,
      costEstimateSource: "estimated",
      annualProductionKwh: 11_100,
      annualCurrentCostDollars: 2_184,
      annualCostAfterSolarDollars: 660,
      annualSavingsDollars: 1_524,
      paybackYears: 14,
      ratePerKwh: 0.16,
    },
    installers: [],
    appliances: [
      { id: "tx-ac", applianceName: "Heat pump", estWattage: 3_000, estDailyKwh: 12.6 },
      { id: "tx-ev", applianceName: "EV charging", estWattage: 7_200, estDailyKwh: 7.4 },
      { id: "tx-fridge", applianceName: "Refrigerator", estWattage: 160, estDailyKwh: 2.4 },
    ],
    billRead: { totalKwh: 1_035, totalDollars: 182, billingPeriod: "June 1–30, 2026" },
    tip: "Schedule EV charging outside peak-rate hours when your utility plan rewards it.",
    createdAt: "2026-07-05T10:15:00.000Z",
  },
  "demo-estimated-home": {
    submissionId: "demo-estimated-home",
    zip: "19103",
    lat: 39.9523,
    lng: -75.174,
    roofSolarPotential: {
      maxArrayPanelsCount: 20,
      maxSunshineHoursPerYear: 2_060,
      panelCapacityWatts: 400,
      carbonOffsetFactorKgPerMwh: 340,
      dataSource: "estimated",
    },
    payback: {
      systemSizeKw: 6.4,
      panelCount: 16,
      estimatedSystemCostDollars: 19_200,
      costEstimateSource: "estimated",
      annualProductionKwh: 7_900,
      annualCurrentCostDollars: 2_040,
      annualCostAfterSolarDollars: 948,
      annualSavingsDollars: 1_092,
      paybackYears: 17.6,
      ratePerKwh: 0.2,
    },
    installers: [],
    appliances: [
      { id: "pa-heat", applianceName: "Electric heating", estWattage: 4_800, estDailyKwh: 10.8 },
      { id: "pa-water", applianceName: "Water heater", estWattage: 4_000, estDailyKwh: 4.7 },
      { id: "pa-fridge", applianceName: "Refrigerator", estWattage: 170, estDailyKwh: 2.6 },
    ],
    billRead: null,
    tip: "A home energy audit may help confirm heating demand before choosing a system size.",
    createdAt: "2026-07-02T16:45:00.000Z",
  },
};

export type MockLookup =
  | { success: true; data: SurveyResult; location: ResultsLocation }
  | { success: false; reason: "unknown" | "malformed" };

export function getMockSurveyResult(submissionId: string): MockLookup {
  const candidate = rawMockResults[submissionId];
  const location = mockLocations[submissionId];
  if (!candidate || !location) return { success: false, reason: "unknown" };

  const parsed = SurveyResultSchema.safeParse(candidate);
  return parsed.success
    ? { success: true, data: parsed.data, location }
    : { success: false, reason: "malformed" };
}

export const mockSubmissionIds = Object.keys(rawMockResults);
