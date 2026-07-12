import { z } from "zod";

// --- Survey input: the 11-question household energy survey ---
// Each option list is the single source of truth: the Zod enum is derived
// from the `value`s, and the `label`s are what the survey form and history
// log render.

function optionValues<T extends readonly { value: string }[]>(options: T) {
  return options.map((option) => option.value) as [
    T[number]["value"],
    ...T[number]["value"][],
  ];
}

// Q2
export const HOME_TYPE_OPTIONS = [
  { value: "apartment", label: "Apartment" },
  { value: "townhouse_condo", label: "Townhouse / Condo" },
  { value: "single_family", label: "Single-family house" },
  { value: "mobile_home", label: "Mobile home" },
  { value: "other", label: "Other" },
] as const;

// Q4
export const HOME_SIZE_OPTIONS = [
  { value: "under_1000", label: "Under 1,000 sq ft" },
  { value: "1000_2000", label: "1,000–2,000 sq ft" },
  { value: "2000_3000", label: "2,000–3,000 sq ft" },
  { value: "3000_plus", label: "3,000+ sq ft" },
  { value: "not_sure", label: "Not sure" },
] as const;

// Q5
export const USAGE_HABITS_OPTIONS = [
  { value: "blasting", label: "AC/heating blasting all day" },
  { value: "conservative", label: "Pretty conservative, I try to save" },
  { value: "in_between", label: "Somewhere in the middle" },
  { value: "no_idea", label: "Honestly, no idea" },
] as const;

// Q6
export const SHOWER_TIME_OPTIONS = [
  { value: "under_5", label: "Under 5 min per person" },
  { value: "10_20", label: "10–20 min per person" },
  { value: "20_plus", label: "20+ min per person" },
] as const;

// Q7
export const HOT_MEALS_OPTIONS = [
  { value: "takeout_0_5", label: "Mostly takeout / cold meals (0-5 meals per week)" },
  { value: "few_nights_6_12", label: "Home-cooked dinners a few nights a week (6-12 meals per week)" },
  { value: "daily_13_plus", label: "Full house cooking daily or multiple times a day (13+ meals per week)" },
] as const;

// Q8
export const DISHWASHER_OPTIONS = [
  { value: "hand_wash_only", label: "Hand-Wash Only: We clean all dishes manually" },
  { value: "eco_1_3", label: "Eco-Run: 1 to 3 times a week" },
  { value: "daily_4_plus", label: "Daily Quest: 4+ times a week (almost daily)" },
] as const;

// Q9
export const LAUNDRY_LOADS_OPTIONS = [
  { value: "1_3", label: "1-3 loads total" },
  { value: "4_7", label: "4-7 loads total" },
  { value: "8_plus", label: "8+ loads total" },
] as const;

// Q10
export const WASHER_TEMP_OPTIONS = [
  { value: "cold_eco", label: "We mostly use Cold Water (Eco Mode)" },
  { value: "warm_hot", label: "We frequently use Warm / Hot Water" },
] as const;

// Q11 (select all that apply)
export const HOME_FEATURE_OPTIONS = [
  { value: "ev", label: "Electric vehicle (EV)" },
  { value: "pool_hot_tub", label: "Pool or hot tub" },
  { value: "electric_water_heater", label: "Electric water heater" },
  { value: "gaming_home_office", label: "Gaming setup / home office with multiple devices" },
  { value: "electric_washer_dryer", label: "Washer/dryer (electric)" },
  { value: "electric_oven_stove", label: "Electric oven / stove" },
  { value: "air_conditioner", label: "Air conditioner" },
  { value: "space_heater", label: "Space heater" },
  { value: "none", label: "None of these" },
] as const;

export const SurveyInputSchema = z.object({
  zip: z.string().regex(/^\d{5}$/), // Q1
  homeType: z.enum(optionValues(HOME_TYPE_OPTIONS)), // Q2
  householdSize: z.number().int().min(1).max(999), // Q3
  homeSize: z.enum(optionValues(HOME_SIZE_OPTIONS)), // Q4
  usageHabits: z.enum(optionValues(USAGE_HABITS_OPTIONS)), // Q5
  showerTime: z.enum(optionValues(SHOWER_TIME_OPTIONS)), // Q6
  hotMeals: z.enum(optionValues(HOT_MEALS_OPTIONS)), // Q7
  dishwasherRuns: z.enum(optionValues(DISHWASHER_OPTIONS)), // Q8
  laundryLoads: z.enum(optionValues(LAUNDRY_LOADS_OPTIONS)), // Q9
  washerTemp: z.enum(optionValues(WASHER_TEMP_OPTIONS)), // Q10
  homeFeatures: z.array(z.enum(optionValues(HOME_FEATURE_OPTIONS))).min(1), // Q11
  userId: z.string().optional(), // Clerk id — optional until Connie wires auth
  identifiedAppliances: z.array(z.object({
    id: z.string(),
    applianceName: z.string(),
    estWattage: z.number(),
    estDailyKwh: z.number(),
  })).optional(),
  billRead: z.object({
    totalKwh: z.number(),
    totalDollars: z.number(),
    billingPeriod: z.string(),
  }).optional(),
});
export type SurveyInput = z.infer<typeof SurveyInputSchema>;

export function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

// --- Survey result: computed solar estimate, unchanged by the survey pivot ---

export const ApplianceResultSchema = z.object({
  id: z.string(),
  applianceName: z.string(),
  estWattage: z.number(),
  estDailyKwh: z.number(),
});
export type ApplianceResult = z.infer<typeof ApplianceResultSchema>;

export const BillReadSchema = z.object({
  totalKwh: z.number(),
  totalDollars: z.number(),
  billingPeriod: z.string(),
});
export type BillRead = z.infer<typeof BillReadSchema>;

export const InstallerSchema = z.object({
  name: z.string(),
  rating: z.number().nullable(),
  address: z.string(),
  placeId: z.string().optional(),
});
export type Installer = z.infer<typeof InstallerSchema>;

export const PaybackResultSchema = z.object({
  systemSizeKw: z.number(),
  panelCount: z.number(),
  estimatedSystemCostDollars: z.number(),
  costEstimateSource: z.literal("estimated"),
  annualProductionKwh: z.number(),
  annualCurrentCostDollars: z.number(),
  annualCostAfterSolarDollars: z.number(),
  annualSavingsDollars: z.number(),
  paybackYears: z.number(),
  ratePerKwh: z.number(),
  // No federal-credit field: see paybackMath.ts comment re: OBBBA repeal of
  // Sec. 25D (residential solar ITC), effective for systems placed in
  // service after 2025-12-31.
});
export type PaybackResult = z.infer<typeof PaybackResultSchema>;

export const SurveyResultSchema = z.object({
  submissionId: z.string(),
  zip: z.string(),
  lat: z.number(),
  lng: z.number(),
  roofSolarPotential: z.object({
    maxArrayPanelsCount: z.number(),
    maxSunshineHoursPerYear: z.number(),
    panelCapacityWatts: z.number(),
    carbonOffsetFactorKgPerMwh: z.number(),
    // "estimated" when the Solar API has no coverage for this address
    // (real, common gap) and we fell back to a conservative default.
    dataSource: z.enum(["measured", "estimated"]),
  }),
  payback: PaybackResultSchema,
  installers: z.array(InstallerSchema).max(3),
  appliances: z.array(ApplianceResultSchema),
  billRead: BillReadSchema.nullable(),
  tip: z.string(),
  createdAt: z.string(),
});
export type SurveyResult = z.infer<typeof SurveyResultSchema>;
