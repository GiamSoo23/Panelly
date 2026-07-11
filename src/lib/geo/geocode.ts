export type GeocodeResult = {
  lat: number;
  lng: number;
  state: string | undefined; // USPS abbreviation, e.g. "CA" — for the EIA rate lookup
};

type GoogleGeocodeResponse = {
  status: string;
  results: Array<{
    geometry: { location: { lat: number; lng: number } };
    address_components: Array<{
      short_name: string;
      types: string[];
    }>;
  }>;
};

export async function geocodeZip(zip: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("components", `postal_code:${zip}|country:US`);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding API request failed: ${res.status}`);
  }

  const data = (await res.json()) as GoogleGeocodeResponse;
  const first = data.results[0];
  if (data.status !== "OK" || !first) {
    throw new Error(`Geocoding API returned no results for zip ${zip} (${data.status})`);
  }

  const state = first.address_components.find((c) =>
    c.types.includes("administrative_area_level_1"),
  )?.short_name;

  return {
    lat: first.geometry.location.lat,
    lng: first.geometry.location.lng,
    state,
  };
}
