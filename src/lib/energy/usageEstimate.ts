// NOTE(connie): written during the merge of Gregory's /api/survey pipeline
// with the 11-question survey pivot — with no bill photo to OCR, monthly
// usage is estimated from the survey answers instead. All numbers here are
// rough demo values; Gregory, refine or replace freely.
import {
  HOME_FEATURE_OPTIONS,
  optionLabel,
  type ApplianceResult,
  type SurveyInput,
} from "@/lib/schemas/survey";

const BASE_MONTHLY_KWH_BY_HOME_SIZE: Record<SurveyInput["homeSize"], number> = {
  under_1000: 500,
  "1000_2000": 750,
  "2000_3000": 1000,
  "3000_plus": 1300,
  not_sure: 800,
};

const HABIT_MULTIPLIER: Record<SurveyInput["usageHabits"], number> = {
  blasting: 1.3,
  conservative: 0.85,
  in_between: 1,
  no_idea: 1,
};

// Monthly kWh added by the habit questions (water heating, cooking, laundry).
const SHOWER_KWH: Record<SurveyInput["showerTime"], number> = {
  under_5: 0,
  "10_20": 20,
  "20_plus": 45,
};
const HOT_MEALS_KWH: Record<SurveyInput["hotMeals"], number> = {
  takeout_0_5: 0,
  few_nights_6_12: 30,
  daily_13_plus: 60,
};
const DISHWASHER_KWH: Record<SurveyInput["dishwasherRuns"], number> = {
  hand_wash_only: 0,
  eco_1_3: 10,
  daily_4_plus: 25,
};
const LAUNDRY_KWH: Record<SurveyInput["laundryLoads"], number> = {
  "1_3": 10,
  "4_7": 25,
  "8_plus": 45,
};
const WASHER_TEMP_KWH: Record<SurveyInput["washerTemp"], number> = {
  cold_eco: 0,
  warm_hot: 15,
};

// Big-ticket extras from Q11, with typical wattage for the appliance list.
const FEATURE_PROFILE: Record<string, { monthlyKwh: number; wattage: number }> = {
  ev: { monthlyKwh: 300, wattage: 7200 },
  pool_hot_tub: { monthlyKwh: 250, wattage: 1500 },
  electric_water_heater: { monthlyKwh: 150, wattage: 4000 },
  gaming_home_office: { monthlyKwh: 80, wattage: 500 },
  electric_washer_dryer: { monthlyKwh: 90, wattage: 3000 },
  electric_oven_stove: { monthlyKwh: 60, wattage: 3000 },
  air_conditioner: { monthlyKwh: 200, wattage: 1500 },
  space_heater: { monthlyKwh: 120, wattage: 1500 },
};

const PER_PERSON_MONTHLY_KWH = 60;

export function estimateMonthlyKwh(input: SurveyInput): number {
  const base =
    BASE_MONTHLY_KWH_BY_HOME_SIZE[input.homeSize] +
    input.householdSize * PER_PERSON_MONTHLY_KWH +
    SHOWER_KWH[input.showerTime] +
    HOT_MEALS_KWH[input.hotMeals] +
    DISHWASHER_KWH[input.dishwasherRuns] +
    LAUNDRY_KWH[input.laundryLoads] +
    WASHER_TEMP_KWH[input.washerTemp] +
    input.homeFeatures.reduce(
      (total, feature) => total + (FEATURE_PROFILE[feature]?.monthlyKwh ?? 0),
      0,
    );

  return Math.round(base * HABIT_MULTIPLIER[input.usageHabits]);
}

// Stand-in for the old photo-based appliance identification: the Q11
// checklist becomes the appliance list shown in results and fed to the tip.
export function featureAppliances(input: SurveyInput): ApplianceResult[] {
  return input.homeFeatures
    .filter((feature) => feature !== "none")
    .map((feature) => {
      const profile = FEATURE_PROFILE[feature];
      return {
        id: feature,
        applianceName: optionLabel(HOME_FEATURE_OPTIONS, feature),
        estWattage: profile?.wattage ?? 0,
        estDailyKwh: profile ? Math.round((profile.monthlyKwh / 30) * 10) / 10 : 0,
      };
    });
}
