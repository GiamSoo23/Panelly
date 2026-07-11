// NOTE(connie): this is Gregory's real pipeline from main, adapted during the
// merge with the survey pivot — the survey no longer collects bill/appliance
// photos, so bill OCR and photo appliance-ID are gone. The monthly bill is now
// estimated from the 11 survey answers (see @/lib/energy/usageEstimate — rough
// numbers, refine freely). Everything else is unchanged.
import {
  SurveyInputSchema,
  SurveyResultSchema,
  type SurveyResult,
} from "@/lib/schemas/survey";
import { geocodeZip } from "@/lib/geo/geocode";
import { getSolarPotential } from "@/lib/solar/solarApi";
import { getResidentialRatePerKwh } from "@/lib/energy/eiaRate";
import { estimateMonthlyKwh, featureAppliances } from "@/lib/energy/usageEstimate";
import { findNearbyInstallers } from "@/lib/places/installers";
import { generateTip } from "@/lib/ai/gemini";
import { computePayback } from "@/lib/payback/paybackMath";
import { getCostPerWattDollars } from "@/lib/payback/costTable";
import { persistSubmission } from "@/lib/persistence/persistSubmission";
import { getUserId } from "@/lib/auth/getUserId";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const parsedInput = SurveyInputSchema.safeParse(body);
  if (!parsedInput.success) {
    return Response.json(
      { error: "Invalid survey input", issues: parsedInput.error.issues },
      { status: 400 },
    );
  }
  const input = parsedInput.data;

  try {
    const { lat, lng, state } = await geocodeZip(input.zip);

    // All depend only on lat/lng/state — run together.
    const [solarPotential, ratePerKwh, installers] = await Promise.all([
      getSolarPotential(lat, lng),
      getResidentialRatePerKwh(state),
      findNearbyInstallers(lat, lng),
    ]);

    const monthlyBillDollars = estimateMonthlyKwh(input) * ratePerKwh;

    const payback = computePayback({
      monthlyBillDollars,
      ratePerKwh,
      panelCapacityWatts: solarPotential.panelCapacityWatts,
      costPerWattDollars: getCostPerWattDollars(state),
      solarPanelConfigs: solarPotential.solarPanelConfigs,
    });

    const appliances = featureAppliances(input);

    const tip = await generateTip({
      applianceNames: appliances.map((a) => a.applianceName),
      annualSavingsDollars: payback.annualSavingsDollars,
      paybackYears: payback.paybackYears,
    });

    const resolvedUserId = input.userId ?? (await getUserId());

    const resultWithoutIdAndTimestamp: Omit<SurveyResult, "submissionId" | "createdAt"> = {
      zip: input.zip,
      lat,
      lng,
      roofSolarPotential: {
        maxArrayPanelsCount: solarPotential.maxArrayPanelsCount,
        maxSunshineHoursPerYear: solarPotential.maxSunshineHoursPerYear,
        panelCapacityWatts: solarPotential.panelCapacityWatts,
        carbonOffsetFactorKgPerMwh: solarPotential.carbonOffsetFactorKgPerMwh,
        dataSource: solarPotential.dataSource,
      },
      payback,
      installers,
      appliances,
      billRead: null,
      tip,
    };

    const { submissionId } = await persistSubmission(
      { ...input, userId: resolvedUserId },
      resultWithoutIdAndTimestamp,
    );

    const result: SurveyResult = {
      ...resultWithoutIdAndTimestamp,
      submissionId,
      createdAt: new Date().toISOString(),
    };

    const parsedResult = SurveyResultSchema.safeParse(result);
    if (!parsedResult.success) {
      console.error("SurveyResultSchema validation failed", parsedResult.error);
      return Response.json({ error: "Internal error building survey result" }, { status: 500 });
    }

    return Response.json(parsedResult.data);
  } catch (error) {
    console.error("/api/survey failed", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: `Survey processing failed: ${message}` }, { status: 502 });
  }
}
