import type { SurveyResult } from "@/lib/schemas/survey";

export const formatCurrency = (value: number | null) =>
  value === null || !Number.isFinite(value)
    ? "Unavailable"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);

export const formatPercent = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "Unavailable" : `${Math.round(value)}%`;
export const formatAnnualKwh = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "Unavailable" : `${Math.round(value).toLocaleString()} kWh/yr`;
export const formatSystemSize = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "Unavailable" : `${value.toFixed(1)} kW`;
export const formatYears = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "Unavailable" : `${value.toFixed(1)} years`;
export const formatPanels = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "Unavailable" : `${Math.round(value)} panels`;
export const formatCarbon = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "Unavailable" : `${value.toFixed(1)} metric tons CO₂/yr`;
export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const safeNonNegative = (value: number) => (Number.isFinite(value) && value >= 0 ? value : null);
const safePositive = (value: number) => (Number.isFinite(value) && value > 0 ? value : null);

export type ResultsLocation = {
  state: string;
  stateCode: string;
};

export type ResultsViewModel = {
  result: SurveyResult;
  location: ResultsLocation;
  maskedZip: string;
  submissionReference: string;
  currentMonthlyCost: number | null;
  monthlySolarCost: number | null;
  monthlySavings: number | null;
  annualSavings: number | null;
  fiveYearSavings: number | null;
  coverage: number | null;
  score: number | null;
  rank: string;
  carbonMetricTons: number | null;
  largestAppliance: {
    name: string;
    monthlyKwh: number;
    monthlyCost: number | null;
    share: number;
  } | null;
};

// Results-only adapter. It formats and summarizes fields already supplied by
// SurveyResult; it does not create alternate solar engineering scenarios.
export function toResultsViewModel(result: SurveyResult, location: ResultsLocation): ResultsViewModel {
  const { payback, roofSolarPotential, billRead } = result;
  const annualCurrentCost = safePositive(payback.annualCurrentCostDollars);
  const annualSolarCost = safeNonNegative(payback.annualCostAfterSolarDollars);
  const annualSavings = safeNonNegative(payback.annualSavingsDollars);
  const ratePerKwh = safePositive(payback.ratePerKwh);
  const currentMonthlyCost = safePositive(billRead?.totalDollars ?? 0) ??
    (annualCurrentCost === null ? null : annualCurrentCost / 12);
  const monthlySolarCost = annualSolarCost === null ? null : annualSolarCost / 12;
  const monthlySavings = annualSavings === null ? null : annualSavings / 12;
  const householdAnnualKwh = safePositive(billRead?.totalKwh ?? 0)
    ? (billRead?.totalKwh ?? 0) * 12
    : annualCurrentCost !== null && ratePerKwh !== null
      ? annualCurrentCost / ratePerKwh
      : null;
  const production = safeNonNegative(payback.annualProductionKwh);
  const coverage = householdAnnualKwh && production !== null
    ? Math.min(100, Math.max(0, production / householdAnnualKwh * 100))
    : null;
  const savingsRate = annualCurrentCost && annualSavings !== null
    ? Math.min(100, annualSavings / annualCurrentCost * 100)
    : null;

  // Panelly guidance score: 60% projected household-energy coverage and 40%
  // projected bill reduction. It is a UI summary, not an engineering rating.
  const score = coverage !== null && savingsRate !== null
    ? Math.round(coverage * 0.6 + savingsRate * 0.4)
    : null;
  const rank = score === null
    ? "Energy Explorer"
    : score >= 80
      ? "Grid Guardian"
      : score >= 65
        ? "Solar Strategist"
        : score >= 45
          ? "Savings Seeker"
          : "Energy Explorer";

  const carbonFactor = safeNonNegative(roofSolarPotential.carbonOffsetFactorKgPerMwh);
  const carbonMetricTons = production !== null && carbonFactor !== null
    ? production / 1000 * carbonFactor / 1000
    : null;
  const applianceTotalKwh = result.appliances.reduce(
    (sum, item) => sum + Math.max(0, Number.isFinite(item.estDailyKwh) ? item.estDailyKwh * 30 : 0),
    0,
  );
  const largest = [...result.appliances]
    .filter((item) => Number.isFinite(item.estDailyKwh) && item.estDailyKwh >= 0)
    .sort((a, b) => b.estDailyKwh - a.estDailyKwh)[0];
  const largestMonthlyKwh = largest ? largest.estDailyKwh * 30 : 0;

  return {
    result,
    location,
    maskedZip: /^\d{5}$/.test(result.zip) ? `${result.zip.slice(0, 3)}••` : "ZIP unavailable",
    submissionReference: result.submissionId.length > 8
      ? `••••${result.submissionId.slice(-8)}`
      : result.submissionId,
    currentMonthlyCost,
    monthlySolarCost,
    monthlySavings,
    annualSavings,
    fiveYearSavings: annualSavings === null ? null : annualSavings * 5,
    coverage,
    score,
    rank,
    carbonMetricTons,
    largestAppliance: largest
      ? {
          name: largest.applianceName,
          monthlyKwh: largestMonthlyKwh,
          monthlyCost: ratePerKwh === null ? null : largestMonthlyKwh * ratePerKwh,
          share: applianceTotalKwh > 0 ? largestMonthlyKwh / applianceTotalKwh * 100 : 0,
        }
      : null,
  };
}
