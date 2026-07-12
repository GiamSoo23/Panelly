import { ocrBill } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return Response.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    const billRead = await ocrBill(imageBase64);
    return Response.json(billRead);
  } catch (error) {
    console.error("Error doing OCR on bill:", error);
    return Response.json({ error: "Failed to read bill" }, { status: 500 });
  }
}
