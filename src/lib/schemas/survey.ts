import { z } from "zod";

export const ApplianceInputSchema = z.object({
  id: z.string(), // client-generated, correlates output back to the right photo
  imageBase64: z.string(),
  label: z.string().optional(),
});

// NOTE(adriana): base64 photos over ~4.5MB will hit Vercel's Node route body
// limit. Resize/compress client-side before encoding.
export const SurveyInputSchema = z.object({
  zip: z.string().regex(/^\d{5}$/),
  monthlyBillDollars: z.number().positive().optional(), // manual fallback if no bill photo
  billPhotoBase64: z.string().optional(),
  appliancePhotos: z.array(ApplianceInputSchema).min(1).max(6),
  userId: z.string().optional(), // Clerk id — optional until Connie wires auth
});
export type SurveyInput = z.infer<typeof SurveyInputSchema>;

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
