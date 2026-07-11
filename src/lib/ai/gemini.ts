import { generateText, Output } from "ai";
import { z } from "zod";

const MODEL = "google/gemini-2.5-flash";

// Accepts either a raw base64 string or a data: URL (e.g. from
// FileReader.readAsDataURL on the client) and returns { data, mediaType }.
function parseImageInput(imageBase64: string): {
  data: string;
  mediaType: string;
} {
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    return { data: match[2], mediaType: match[1] };
  }
  return { data: imageBase64, mediaType: "image/jpeg" };
}

const ApplianceSchema = z.object({
  applianceName: z.string(),
  estWattage: z.number(),
  estDailyKwh: z.number(),
});
export type ApplianceIdentification = z.infer<typeof ApplianceSchema>;

export async function identifyAppliance(
  imageBase64: string,
): Promise<ApplianceIdentification> {
  const { data, mediaType } = parseImageInput(imageBase64);
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: ApplianceSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify this home appliance from the photo. Estimate its typical wattage and average daily kWh usage. This is a rough estimate for a home-energy app, not a data source of record.",
          },
          { type: "image", image: data, mediaType },
        ],
      },
    ],
  });
  return output;
}

const BillReadSchema = z.object({
  totalKwh: z.number(),
  totalDollars: z.number(),
  billingPeriod: z.string(),
});
export type BillOcrResult = z.infer<typeof BillReadSchema>;

export async function ocrBill(imageBase64: string): Promise<BillOcrResult> {
  const { data, mediaType } = parseImageInput(imageBase64);
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: BillReadSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Read this electricity bill photo. Extract only the total kWh used, the total dollar amount due, and the billing period (e.g. 'Jun 1 - Jun 30, 2026'). Do not extract any personal information such as name or account number.",
          },
          { type: "image", image: data, mediaType },
        ],
      },
    ],
  });
  return output;
}

export type TipContext = {
  applianceNames: string[];
  annualSavingsDollars: number;
  paybackYears: number;
};

export async function generateTip(context: TipContext): Promise<string> {
  const { text } = await generateText({
    model: MODEL,
    prompt: `Write one short, actionable, encouraging energy-saving tip (max 2 sentences) for a homeowner.
Their identified appliances: ${context.applianceNames.join(", ") || "none identified"}.
Estimated annual solar savings: $${context.annualSavingsDollars.toFixed(0)}. Estimated payback period: ${context.paybackYears.toFixed(1)} years.
Do not mention any federal solar tax credit, ITC, or "26%"/"30%" incentive — no federal residential solar tax credit currently exists (repealed for systems placed in service after 2025-12-31). Only reference the estimated savings/payback numbers given.`,
  });
  return text.trim();
}
