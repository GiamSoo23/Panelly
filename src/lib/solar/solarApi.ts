export type SolarPanelConfig = {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
};

export type SolarPotential = {
  maxArrayPanelsCount: number;
  maxSunshineHoursPerYear: number;
  panelCapacityWatts: number;
  carbonOffsetFactorKgPerMwh: number;
  solarPanelConfigs: SolarPanelConfig[];
  dataSource: "measured" | "estimated";
};

type GoogleSolarResponse = {
  solarPotential: {
    maxArrayPanelsCount: number;
    maxSunshineHoursPerYear: number;
    panelCapacityWatts: number;
    carbonOffsetFactorKgPerMwh: number;
    solarPanelConfigs: SolarPanelConfig[];
  };
};

// Fallback used when the Solar API has no coverage for an address (a real,
// common gap — confirmed as a live-demo risk). National-average assumptions:
// 400W panels, ~1300 kWh/kW/yr production factor (typical US capacity factor).
const FALLBACK_PANEL_CAPACITY_WATTS = 400;
const FALLBACK_KWH_PER_KW_PER_YEAR = 1300;
const FALLBACK_MAX_PANELS = 30;

function buildFallbackSolarPotential(): SolarPotential {
  const perPanelAnnualKwh =
    (FALLBACK_PANEL_CAPACITY_WATTS / 1000) * FALLBACK_KWH_PER_KW_PER_YEAR;

  const solarPanelConfigs: SolarPanelConfig[] = [];
  for (let panelsCount = 4; panelsCount <= FALLBACK_MAX_PANELS; panelsCount++) {
    solarPanelConfigs.push({
      panelsCount,
      yearlyEnergyDcKwh: panelsCount * perPanelAnnualKwh,
    });
  }

  return {
    maxArrayPanelsCount: FALLBACK_MAX_PANELS,
    maxSunshineHoursPerYear: 1600, // rough US average
    panelCapacityWatts: FALLBACK_PANEL_CAPACITY_WATTS,
    carbonOffsetFactorKgPerMwh: 400, // rough US grid average
    solarPanelConfigs,
    dataSource: "estimated",
  };
}

export async function getSolarPotential(
  lat: number,
  lng: number,
): Promise<SolarPotential> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set");
  }

  const url = new URL(
    "https://solar.googleapis.com/v1/buildingInsights:findClosest",
  );
  url.searchParams.set("location.latitude", String(lat));
  url.searchParams.set("location.longitude", String(lng));
  url.searchParams.set("requiredQuality", "HIGH");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);

  // Real, common coverage gap — fall back to a conservative estimate rather
  // than failing the whole survey.
  if (res.status === 404) {
    return buildFallbackSolarPotential();
  }
  if (!res.ok) {
    throw new Error(`Solar API request failed: ${res.status}`);
  }

  const data = (await res.json()) as GoogleSolarResponse;
  const { solarPotential } = data;

  return {
    maxArrayPanelsCount: solarPotential.maxArrayPanelsCount,
    maxSunshineHoursPerYear: solarPotential.maxSunshineHoursPerYear,
    panelCapacityWatts: solarPotential.panelCapacityWatts,
    carbonOffsetFactorKgPerMwh: solarPotential.carbonOffsetFactorKgPerMwh,
    solarPanelConfigs: solarPotential.solarPanelConfigs,
    dataSource: "measured",
  };
}
