import { identifyAppliance } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return Response.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    const identification = await identifyAppliance(imageBase64);
    return Response.json(identification);
  } catch (error) {
    console.error("Error identifying appliance:", error);
    return Response.json({ error: "Failed to identify appliance" }, { status: 500 });
  }
}
