import { NextRequest, NextResponse } from "next/server";
import { persistSubmission } from "@/lib/persistence/persistSubmission";
import type { SurveyInput } from "@/lib/schemas/survey";

interface IncomingSurveyForm {
  zipCode?: string;
  zip?: string;
  householdSize?: string;
  homeType?: string;
  homeSize?: string;
  energyHabits?: string;
  showerTime?: string;
  cookingFrequency?: string;
  dishwasherFrequency?: string;
  laundryLoads?: string;
  laundryTemp?: string;
  appliances?: string[];
  monthlyBillDollars?: number;
  billPhotoBase64?: string;
  appliancePhotos?: Array<{ id: string; imageBase64: string; label?: string }>;
  userId?: string;
}

function estimateAnnualConsumption(form: IncomingSurveyForm): number {
  let baseKwh = 10000; // Base annual consumption

  // Household size adjustment
  const householdSize = parseInt(form.householdSize || "3", 10);
  baseKwh += householdSize * 1500;

  // Home size adjustment
  if (form.homeSize === "Under 1k sq ft") baseKwh -= 2000;
  else if (form.homeSize === "1k–2k sq ft") baseKwh -= 500;
  else if (form.homeSize === "2k–3k sq ft") baseKwh += 1000;
  else if (form.homeSize === "3k+ sq ft") baseKwh += 3000;

  // HVAC habits
  if (form.energyHabits === "Conservative") baseKwh -= 2000;
  else if (form.energyHabits === "HVAC Blasting") baseKwh += 4000;
  else if (form.energyHabits === "Middle") baseKwh += 500;

  // Water heating
  if (form.showerTime === "Under 5 min") baseKwh -= 500;
  else if (form.showerTime === "20+ min") baseKwh += 1500;

  // Cooking
  if (form.cookingFrequency === "Takeout/Cold (0-5)") baseKwh -= 800;
  else if (form.cookingFrequency === "Heavy Cook (13+)") baseKwh += 1200;

  // Dishwasher
  if (form.dishwasherFrequency === "Hand-Wash") baseKwh -= 500;
  else if (form.dishwasherFrequency === "Daily (4+)") baseKwh += 800;

  // Laundry
  const loads = parseInt(form.laundryLoads?.split("-")[0] || "4", 10);
  baseKwh += loads * 600;
  if (form.laundryTemp === "Warm/Hot") baseKwh += 1000;

  // Appliances
  if (form.appliances?.includes("EV Charger")) baseKwh += 2500;
  if (form.appliances?.includes("Pool/Hot Tub")) baseKwh += 3000;
  if (form.appliances?.includes("Electric Heater")) baseKwh += 2000;
  if (form.appliances?.includes("Gaming Rig")) baseKwh += 800;
  if (form.appliances?.includes("Electric Dryer")) baseKwh += 700;

  return Math.max(5000, baseKwh);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestData = body?.formData as IncomingSurveyForm | undefined;
    if (!requestData) {
      return NextResponse.json({ error: "Missing formData" }, { status: 400 });
    }

    const formData: SurveyInput = {
      zip: requestData.zip ?? requestData.zipCode ?? "",
      monthlyBillDollars: requestData.monthlyBillDollars,
      billPhotoBase64: requestData.billPhotoBase64,
      appliancePhotos: requestData.appliancePhotos ?? [],
      userId: requestData.userId,
    };

    // Estimate annual consumption
    const annualConsumption = estimateAnnualConsumption(requestData);
    const ratePerKwh = 0.22;
    const annualCurrentCost = annualConsumption * ratePerKwh;

    // Solar estimation
    const systemSizeKw = annualConsumption / 1600;
    const panelCount = Math.ceil(systemSizeKw / 0.42);
    const costPerKw = 3000;
    const estimatedSystemCost = systemSizeKw * costPerKw;
    const annualProductionKwh = systemSizeKw * 1400;
    const annualCostAfterSolar = Math.max(0, annualCurrentCost - annualProductionKwh * ratePerKwh);
    const annualSavings = annualCurrentCost - annualCostAfterSolar;
    const paybackYears = estimatedSystemCost / (annualSavings + 1);

    const result = {
      zip: formData.zip,
      lat: 0,
      lng: 0,
      roofSolarPotential: {
        maxArrayPanelsCount: panelCount,
        maxSunshineHoursPerYear: 2400,
        panelCapacityWatts: 420,
        carbonOffsetFactorKgPerMwh: 0.75,
        dataSource: "estimated" as const,
      },
      payback: {
        systemSizeKw: Math.round(systemSizeKw * 10) / 10,
        panelCount,
        estimatedSystemCostDollars: Math.round(estimatedSystemCost),
        costEstimateSource: "estimated" as const,
        annualProductionKwh: Math.round(annualProductionKwh),
        annualCurrentCostDollars: Math.round(annualCurrentCost),
        annualCostAfterSolarDollars: Math.round(annualCostAfterSolar),
        annualSavingsDollars: Math.round(annualSavings),
        paybackYears: Math.round(paybackYears * 10) / 10,
        ratePerKwh,
      },
      installers: [],
      appliances: (requestData.appliances ?? []).map((appliance) => ({
        id: appliance.toLowerCase().replace(/\s+/g, "-"),
        applianceName: appliance,
        estWattage: 500,
        estDailyKwh: 3,
      })),
      billRead: null,
      tip: `Your home uses approximately ${annualConsumption.toLocaleString()} kWh annually. A ${systemSizeKw.toFixed(1)} kW solar system could offset ~${Math.round((annualProductionKwh / annualConsumption) * 100)}% of your usage.`,
    };

    const { submissionId } = await persistSubmission(formData, result);
    return NextResponse.json({ submissionId });
  } catch (error) {
    console.error("/api/survey POST failed", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
