import type { Installer } from "@/lib/schemas/survey";

type PlacesSearchTextResponse = {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    rating?: number;
    formattedAddress?: string;
  }>;
};

export async function findNearbyInstallers(
  lat: number,
  lng: number,
): Promise<Installer[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set");
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.rating,places.formattedAddress,places.id",
    },
    body: JSON.stringify({
      textQuery: "solar panel installer",
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 40000,
        },
      },
      maxResultCount: 3,
    }),
  });

  if (!res.ok) {
    throw new Error(`Places API request failed: ${res.status}`);
  }

  const data = (await res.json()) as PlacesSearchTextResponse;

  return (data.places ?? []).slice(0, 3).map((place) => ({
    name: place.displayName?.text ?? "Unknown installer",
    rating: place.rating ?? null,
    address: place.formattedAddress ?? "",
    placeId: place.id,
  }));
}
