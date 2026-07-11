import {
  SurveyInputSchema,
  SurveyResultSchema,
  type SurveyResult,
} from "@/lib/schemas/survey";
import { geocodeZip } from "@/lib/geo/geocode";
import { getSolarPotential } from "@/lib/solar/solarApi";
import { getResidentialRatePerKwh } from "@/lib/energy/eiaRate";
import { findNearbyInstallers } from "@/lib/places/installers";
import { identifyAppliance, ocrBill, generateTip } from "@/lib/ai/gemini";
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

  if (!input.monthlyBillDollars && !input.billPhotoBase64) {
    return Response.json(
      { error: "Provide either monthlyBillDollars or billPhotoBase64" },
      { status: 400 },
    );
  }

  try {
    // Independent of geocoding — kick off immediately.
    const applianceIdPromises = input.appliancePhotos.map(async (photo) => {
      const identification = await identifyAppliance(photo.imageBase64);
      return { id: photo.id, ...identification };
    });
    const billOcrPromise = input.billPhotoBase64
      ? ocrBill(input.billPhotoBase64)
      : Promise.resolve(null);

    const { lat, lng, state } = await geocodeZip(input.zip);

    // All depend only on lat/lng/state — run together.
    const [solarPotential, ratePerKwh, installers] = await Promise.all([
      getSolarPotential(lat, lng),
      getResidentialRatePerKwh(state),
      findNearbyInstallers(lat, lng),
    ]);

    const [appliances, billRead] = await Promise.all([
      Promise.all(applianceIdPromises),
      billOcrPromise,
    ]);

    // Manual entry takes precedence; otherwise fall back to the OCR'd bill
    // total, assuming a ~1-month billing period (a known hackathon shortcut).
    const monthlyBillDollars = input.monthlyBillDollars ?? billRead?.totalDollars;
    if (monthlyBillDollars == null) {
      throw new Error("Unable to determine a monthly bill amount");
    }

    const payback = computePayback({
      monthlyBillDollars,
      ratePerKwh,
      panelCapacityWatts: solarPotential.panelCapacityWatts,
      costPerWattDollars: getCostPerWattDollars(state),
      solarPanelConfigs: solarPotential.solarPanelConfigs,
    });

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
      billRead,
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
