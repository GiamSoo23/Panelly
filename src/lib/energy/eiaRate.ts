type EiaResponse = {
  response: {
    data: Array<{ price: number }>; // cents per kWh
  };
};

// National-average fallback if a state has no recent EIA residential price
// (rare, but a state code from geocoding could be missing/unexpected).
const NATIONAL_AVERAGE_RATE_PER_KWH = 0.17;

export async function getResidentialRatePerKwh(
  state: string | undefined,
): Promise<number> {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    throw new Error("EIA_API_KEY is not set");
  }
  if (!state) {
    return NATIONAL_AVERAGE_RATE_PER_KWH;
  }

  const url = new URL(
    "https://api.eia.gov/v2/electricity/retail-sales/data/",
  );
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("frequency", "monthly");
  url.searchParams.set("data[0]", "price");
  url.searchParams.set("facets[sectorid][]", "RES");
  url.searchParams.set("facets[stateid][]", state.toUpperCase());
  url.searchParams.set("sort[0][column]", "period");
  url.searchParams.set("sort[0][direction]", "desc");
  url.searchParams.set("length", "1");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`EIA API request failed: ${res.status}`);
  }

  const data = (await res.json()) as EiaResponse;
  const priceCentsPerKwh = data.response.data[0]?.price;
  if (priceCentsPerKwh == null) {
    return NATIONAL_AVERAGE_RATE_PER_KWH;
  }

  return priceCentsPerKwh / 100; // cents/kWh -> $/kWh
}
