// NOTE(connie): validation + persistence here are real; the estimate is a
// placeholder. Gregory owns this route — swap estimateMonthlyKwh/the mock
// result for the real geo/solar/payback pipeline and keep the
// persistSubmission(input, result) call at the end.
import { NextResponse } from "next/server";

import {
  HOME_FEATURE_OPTIONS,
  SurveyInputSchema,
  SurveyResultSchema,
  optionLabel,
  type SurveyInput,
} from "@/lib/schemas/survey";
import { persistSubmission } from "@/lib/persistence/persistSubmission";

// Placeholder estimate until the real Solar API / estimation pipeline lands.
// Rough monthly kWh from the survey answers so demo results react to input.
function estimateMonthlyKwh(input: SurveyInput) {
  const baseBySize = {
    under_1000: 500,
    "1000_2000": 750,
    "2000_3000": 1000,
    "3000_plus": 1300,
    not_sure: 800,
  }[input.homeSize];

  const habitMultiplier = {
    blasting: 1.3,
    conservative: 0.85,
    in_between: 1,
    no_idea: 1,
  }[input.usageHabits];

  const featureKwh: Record<string, number> = {
    ev: 300,
    pool_hot_tub: 250,
    electric_water_heater: 150,
    gaming_home_office: 80,
    electric_washer_dryer: 90,
    none: 0,
  };
  const featureLoad = input.homeFeatures.reduce(
    (total, feature) => total + (featureKwh[feature] ?? 0),
    0,
  );

  const perPersonKwh = 60;

  return Math.round(
    (baseBySize + featureLoad + input.householdSize * perPersonKwh) * habitMultiplier,
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = SurveyInputSchema.parse(body.input ?? body);

    const monthlyKwh = estimateMonthlyKwh(input);
    const ratePerKwh = 0.2;
    const annualCurrentCostDollars = Math.round(monthlyKwh * 12 * ratePerKwh);

    const result = {
      zip: input.zip,
      lat: 39.7392,
      lng: -104.9903,
      roofSolarPotential: {
        maxArrayPanelsCount: 16,
        maxSunshineHoursPerYear: 1800,
        panelCapacityWatts: 400,
        carbonOffsetFactorKgPerMwh: 0.82,
        dataSource: "estimated" as const,
      },
      payback: {
        systemSizeKw: 4.2,
        panelCount: 12,
        estimatedSystemCostDollars: 16000,
        costEstimateSource: "estimated" as const,
        annualProductionKwh: 6500,
        annualCurrentCostDollars,
        annualCostAfterSolarDollars: Math.max(
          annualCurrentCostDollars - 6500 * ratePerKwh,
          0,
        ),
        annualSavingsDollars: Math.min(6500 * ratePerKwh, annualCurrentCostDollars),
        paybackYears: 7.6,
        ratePerKwh,
      },
      installers: [
        { name: "BrightSun Solar", rating: 4.8, address: "123 Market St" },
        { name: "Evergreen Energy", rating: 4.6, address: "45 River Ave" },
        { name: "Northwind Installers", rating: 4.4, address: "88 Pine Rd" },
      ],
      appliances: input.homeFeatures
        .filter((feature) => feature !== "none")
        .map((feature) => ({
          id: feature,
          applianceName: optionLabel(HOME_FEATURE_OPTIONS, feature),
          estWattage: 120,
          estDailyKwh: 1.4,
        })),
      billRead: null,
      tip: "A simple habit change like shifting laundry to cooler evenings can cut your bill without adding cost.",
    };

    const parsedResult = SurveyResultSchema.parse({
      ...result,
      submissionId: "pending",
      createdAt: new Date().toISOString(),
    });

    const persisted = await persistSubmission(input, parsedResult);

    return NextResponse.json({
      success: true,
      submissionId: persisted.submissionId,
      result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save survey" },
      { status: 400 },
    );
  }
}
