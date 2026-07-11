import { describe, expect, it } from "vitest";

import {
  emptySurveyDraft,
  parseSurveyDraft,
  toggleHomeFeature,
  type SurveyDraft,
  validateStep,
} from "./survey-draft";

const validDraft: SurveyDraft = {
  zipCode: "01234",
  homeType: "Apartment",
  householdSize: "2",
  homeSize: "Under 1,000 sq ft",
  energyUsageHabits: "Somewhere in the middle",
  showerDuration: "10–20 min per person",
  cookingFrequency: "Home-cooked dinners a few nights a week (6–12 meals per week)",
  dishwasherFrequency: "Eco-Run: 1 to 3 times a week",
  laundryLoads: "1–3 loads total",
  washerTemperature: "We mostly use Cold Water (Eco Mode)",
  homeFeatures: ["Electric water heater"],
};

describe("survey draft validation", () => {
  it("accepts a five-digit ZIP with a leading zero", () => {
    expect(validateStep(validDraft, 0)).toEqual({});
  });

  it("rejects invalid ZIP and household values", () => {
    const errors = validateStep({ ...validDraft, zipCode: "1234", householdSize: "0" }, 0);
    expect(errors.zipCode).toBeDefined();
    expect(errors.householdSize).toBeDefined();
    expect(validateStep({ ...validDraft, householdSize: "999" }, 0).householdSize).toBeUndefined();
  });

  it("requires at least one home feature", () => {
    expect(validateStep({ ...validDraft, homeFeatures: [] }, 3).homeFeatures).toBeDefined();
  });

  it("keeps None of these mutually exclusive", () => {
    expect(toggleHomeFeature(["Electric vehicle (EV)"], "None of these")).toEqual(["None of these"]);
    expect(toggleHomeFeature(["None of these"], "Pool or hot tub")).toEqual(["Pool or hot tub"]);
  });

  it("restores only a complete, valid draft shape", () => {
    expect(parseSurveyDraft(JSON.stringify(validDraft))).toEqual(validDraft);
    expect(parseSurveyDraft(JSON.stringify(emptySurveyDraft))).toBeNull();
    expect(parseSurveyDraft("not-json")).toBeNull();
  });
});
