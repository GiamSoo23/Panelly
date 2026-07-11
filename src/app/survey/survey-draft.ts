export const homeTypeOptions = [
  "Apartment",
  "Townhouse / Condo",
  "Single-family house",
  "Mobile home",
  "Other",
] as const;

export const homeSizeOptions = [
  "Under 1,000 sq ft",
  "1,000–2,000 sq ft",
  "2,000–3,000 sq ft",
  "3,000+ sq ft",
  "Not sure",
] as const;

export const energyUsageOptions = [
  "AC/heating blasting all day",
  "Pretty conservative, I try to save",
  "Somewhere in the middle",
  "Honestly, no idea",
] as const;

export const showerDurationOptions = [
  "Under 5 min per person",
  "10–20 min per person",
  "20+ min per person",
] as const;

export const cookingFrequencyOptions = [
  "Mostly takeout / cold meals (0–5 meals per week)",
  "Home-cooked dinners a few nights a week (6–12 meals per week)",
  "Full house cooking daily or multiple times a day (13+ meals per week)",
] as const;

export const dishwasherFrequencyOptions = [
  "Hand-Wash Only: We clean all dishes manually",
  "Eco-Run: 1 to 3 times a week",
  "Daily Quest: 4+ times a week (almost daily)",
] as const;

export const laundryLoadsOptions = [
  "1–3 loads total",
  "4–7 loads total",
  "8+ loads total",
] as const;

export const washerTemperatureOptions = [
  "We mostly use Cold Water (Eco Mode)",
  "We frequently use Warm / Hot Water",
] as const;

export const homeFeatureOptions = [
  "Electric vehicle (EV)",
  "Pool or hot tub",
  "Electric water heater",
  "Gaming setup / home office with multiple devices",
  "Washer/dryer (electric)",
  "None of these",
] as const;

export type SurveyDraft = {
  zipCode: string;
  homeType: (typeof homeTypeOptions)[number] | "";
  householdSize: string;
  homeSize: (typeof homeSizeOptions)[number] | "";
  energyUsageHabits: (typeof energyUsageOptions)[number] | "";
  showerDuration: (typeof showerDurationOptions)[number] | "";
  cookingFrequency: (typeof cookingFrequencyOptions)[number] | "";
  dishwasherFrequency: (typeof dishwasherFrequencyOptions)[number] | "";
  laundryLoads: (typeof laundryLoadsOptions)[number] | "";
  washerTemperature: (typeof washerTemperatureOptions)[number] | "";
  homeFeatures: Array<(typeof homeFeatureOptions)[number]>;
};

export const emptySurveyDraft: SurveyDraft = {
  zipCode: "",
  homeType: "",
  householdSize: "",
  homeSize: "",
  energyUsageHabits: "",
  showerDuration: "",
  cookingFrequency: "",
  dishwasherFrequency: "",
  laundryLoads: "",
  washerTemperature: "",
  homeFeatures: [],
};

export const SURVEY_DRAFT_KEY = "panelly:household-survey-draft:v1";

type SurveyField = keyof SurveyDraft;
export type SurveyErrors = Partial<Record<SurveyField, string>>;

export function toggleHomeFeature(
  selected: SurveyDraft["homeFeatures"],
  feature: (typeof homeFeatureOptions)[number],
): SurveyDraft["homeFeatures"] {
  const none = "None of these";
  if (feature === none) return selected.includes(none) ? [] : [none];

  const withoutNone = selected.filter((item) => item !== none);
  return withoutNone.includes(feature)
    ? withoutNone.filter((item) => item !== feature)
    : [...withoutNone, feature];
}

const allowed = <T extends readonly string[]>(options: T, value: unknown): value is T[number] =>
  typeof value === "string" && options.includes(value);

export function parseSurveyDraft(value: string | null): SurveyDraft | null {
  if (!value) return null;
  try {
    const candidate: unknown = JSON.parse(value);
    if (!candidate || typeof candidate !== "object") return null;
    const data = candidate as Partial<Record<SurveyField, unknown>>;
    if (
      typeof data.zipCode !== "string" ||
      typeof data.householdSize !== "string" ||
      !allowed(homeTypeOptions, data.homeType) ||
      !allowed(homeSizeOptions, data.homeSize) ||
      !allowed(energyUsageOptions, data.energyUsageHabits) ||
      !allowed(showerDurationOptions, data.showerDuration) ||
      !allowed(cookingFrequencyOptions, data.cookingFrequency) ||
      !allowed(dishwasherFrequencyOptions, data.dishwasherFrequency) ||
      !allowed(laundryLoadsOptions, data.laundryLoads) ||
      !allowed(washerTemperatureOptions, data.washerTemperature) ||
      !Array.isArray(data.homeFeatures) ||
      !data.homeFeatures.every((item) => allowed(homeFeatureOptions, item))
    ) return null;

    return {
      zipCode: data.zipCode,
      homeType: data.homeType,
      householdSize: data.householdSize,
      homeSize: data.homeSize,
      energyUsageHabits: data.energyUsageHabits,
      showerDuration: data.showerDuration,
      cookingFrequency: data.cookingFrequency,
      dishwasherFrequency: data.dishwasherFrequency,
      laundryLoads: data.laundryLoads,
      washerTemperature: data.washerTemperature,
      homeFeatures: [...new Set(data.homeFeatures)],
    };
  } catch {
    return null;
  }
}

export function validateStep(draft: SurveyDraft, step: number): SurveyErrors {
  const errors: SurveyErrors = {};
  if (step === 0) {
    if (!/^\d{5}$/.test(draft.zipCode)) errors.zipCode = "Enter a 5-digit ZIP code using numbers only.";
    if (!draft.homeType) errors.homeType = "Choose the type of home you live in.";
    if (!/^\d{1,3}$/.test(draft.householdSize) || Number(draft.householdSize) < 1 || Number(draft.householdSize) > 999) {
      errors.householdSize = "Enter a whole number from 1 to 999.";
    }
    if (!draft.homeSize) errors.homeSize = "Choose the size of your home.";
  }
  if (step === 1) {
    if (!draft.energyUsageHabits) errors.energyUsageHabits = "Choose the option that best describes your energy habits.";
    if (!draft.showerDuration) errors.showerDuration = "Choose an average shower duration.";
    if (!draft.cookingFrequency) errors.cookingFrequency = "Choose how often your household cooks hot meals.";
  }
  if (step === 2) {
    if (!draft.dishwasherFrequency) errors.dishwasherFrequency = "Choose how often the dishwasher runs.";
    if (!draft.laundryLoads) errors.laundryLoads = "Choose the household's weekly laundry range.";
    if (!draft.washerTemperature) errors.washerTemperature = "Choose the household's default washer temperature.";
  }
  if (step === 3 && draft.homeFeatures.length === 0) {
    errors.homeFeatures = "Select at least one option, including “None of these” if appropriate.";
  }
  return errors;
}
