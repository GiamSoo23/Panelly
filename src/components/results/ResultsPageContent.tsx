import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  History,
  Home,
  Info,
  Leaf,
  Lightbulb,
  MapPin,
  RefreshCw,
  SearchX,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatAnnualKwh,
  formatCarbon,
  formatCurrency,
  formatDate,
  formatPanels,
  formatPercent,
  formatSystemSize,
  formatYears,
  type ResultsViewModel,
} from "@/lib/results/presentation";

import { SunburstLogo } from "./SunburstLogo";

const ROUTES = {
  savedReports: "/history",
  survey: "/survey",
} as const;

const linkBase = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]";

function Header() {
  return (
    <header className="border-b border-[#355e3b]/15 bg-[#fffaf0]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-lg font-black tracking-tight focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]">
          <SunburstLogo className="size-10" />
          <span className="text-xl">Panelly</span>
        </Link>
        <Badge className="h-auto bg-[#e8f2e9] px-3 py-1.5 font-black text-[#244229]">
          <Check aria-hidden="true" /> Challenge complete
        </Badge>
      </div>
    </header>
  );
}

function Hero({ model }: { model: ResultsViewModel }) {
  return (
    <section className="relative overflow-hidden bg-[#fff4b8] px-4 py-14 sm:px-6 sm:py-20">
      <div className="absolute -right-24 -top-28 size-96 rounded-full border-[55px] border-[#ffd84d]/35" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_350px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#355e3b]">Your challenge is complete</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.045em] text-[#17351d] sm:text-6xl">Your solar savings outlook is ready</h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-[#355e3b]/80 sm:text-lg">Your prospective solar scenario could reduce the household energy cost shown in this report while covering {formatPercent(model.coverage)} of modeled annual use.</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2"><MapPin className="size-4" aria-hidden="true" /> {model.location.state} · {model.maskedZip}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2"><CalendarDays className="size-4" aria-hidden="true" /> {formatDate(model.result.createdAt)}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2"><ShieldCheck className="size-4" aria-hidden="true" /> Ref. {model.submissionReference}</span>
          </div>
        </div>
        <div className="relative mx-auto grid size-72 place-items-center rounded-full border-[14px] border-white bg-[#ffd84d] text-center shadow-[0_20px_55px_rgba(53,94,59,.18)] motion-safe:animate-[pulse_2.5s_ease-in-out_1]">
          <SunburstLogo className="absolute size-80 opacity-20" />
          <div className="relative px-5">
            <p className="text-7xl font-black leading-none">{model.score ?? "—"}</p>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em]">Panelly Solar Fit / 100</p>
            <p className="mt-3 font-black text-[#355e3b]">{model.rank}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreExplanation({ model }: { model: ResultsViewModel }) {
  return (
    <section className="rounded-2xl border border-[#355e3b]/20 bg-white p-5 sm:p-6" aria-labelledby="score-explanation">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff4b8]"><Trophy className="size-6 text-[#7a5d00]" aria-hidden="true" /></span>
        <div>
          <h2 id="score-explanation" className="font-black">What your Solar Fit score means</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-[#607164]">This Panelly guidance score summarizes projected energy coverage and projected bill reduction from the supplied result. It helps compare the opportunity at a glance; it is not a scientific or professional engineering rating.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-[#355e3b] text-white"><Sparkles aria-hidden="true" /> {model.rank} unlocked</Badge>
            <Badge className="bg-[#fff4b8] text-[#17351d]"><CircleDollarSign aria-hidden="true" /> Savings outlook revealed</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

function CostComparison({ model }: { model: ResultsViewModel }) {
  const maxCost = Math.max(model.currentMonthlyCost ?? 0, model.monthlySolarCost ?? 0, 1);
  return (
    <section aria-labelledby="cost-heading">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">The headline comparison</p>
      <h2 id="cost-heading" className="mt-1 text-3xl font-black">Current utility versus prospective solar</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_.9fr]">
        <Card className="border-2 border-[#355e3b]/15 bg-white">
          <CardHeader><Zap className="size-7 text-[#355e3b]" aria-hidden="true" /><CardTitle className="mt-3 text-lg font-black">Current utility</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black">{formatCurrency(model.currentMonthlyCost)}<span className="text-sm text-[#6a7f6e]">/month</span></p><div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf2ed]"><div className="h-full rounded-full bg-[#355e3b]" style={{ width: `${(model.currentMonthlyCost ?? 0) / maxCost * 100}%` }} /></div></CardContent>
        </Card>
        <Card className="border-2 border-[#355e3b] bg-[#355e3b] text-white shadow-[6px_7px_0_#ffd84d]">
          <CardHeader><div className="flex items-center justify-between gap-3"><SunMedium className="size-7 text-[#ffd84d]" aria-hidden="true" /><Badge className="bg-[#ffd84d] text-[#17351d]">Prospective</Badge></div><CardTitle className="mt-3 text-lg font-black">With solar</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black">{formatCurrency(model.monthlySolarCost)}<span className="text-sm text-white/70">/month</span></p><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#ffd84d]" style={{ width: `${(model.monthlySolarCost ?? 0) / maxCost * 100}%` }} /></div></CardContent>
        </Card>
        <Card className="border-2 border-[#ffd84d] bg-[#fff4b8]">
          <CardHeader><CircleDollarSign className="size-7" aria-hidden="true" /><CardTitle className="mt-3 text-lg font-black">Potential savings</CardTitle></CardHeader>
          <CardContent><p className="text-4xl font-black">{formatCurrency(model.monthlySavings)}<span className="text-sm text-[#6a7f6e]">/month</span></p><p className="mt-4 text-sm font-black">{formatCurrency(model.annualSavings)} per year</p></CardContent>
        </Card>
      </div>
    </section>
  );
}

function LongTermOutlook({ model }: { model: ResultsViewModel }) {
  const metrics = [
    { label: "Five-year savings outlook", value: formatCurrency(model.fiveYearSavings), icon: CircleDollarSign, note: "Annual estimate multiplied across five years; rate changes are not modeled." },
    { label: "Estimated payback", value: formatYears(model.result.payback.paybackYears), icon: Target, note: "Based on the supplied system cost and savings estimate." },
    { label: "Annual solar production", value: formatAnnualKwh(model.result.payback.annualProductionKwh), icon: SunMedium, note: "Prospective production from the supplied result." },
    { label: "Estimated carbon impact", value: formatCarbon(model.carbonMetricTons), icon: Leaf, note: "Derived from production and the supplied carbon-offset factor." },
  ];
  return (
    <section aria-labelledby="outlook-heading">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">Looking ahead</p>
      <h2 id="outlook-heading" className="mt-1 text-3xl font-black">Long-term outlook</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, note }) => <Card key={label} className="border border-[#355e3b]/15 bg-white"><CardContent><span className="grid size-10 place-items-center rounded-xl bg-[#fff4b8]"><Icon className="size-5" aria-hidden="true" /></span><p className="mt-5 text-sm font-bold text-[#6a7f6e]">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-3 text-xs leading-5 text-[#6a7f6e]">{note}</p></CardContent></Card>)}
      </div>
    </section>
  );
}

function SolarScenario({ model }: { model: ResultsViewModel }) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-[#355e3b] text-white shadow-xl" aria-labelledby="scenario-heading">
      <div className="grid lg:grid-cols-[1.05fr_.95fr]">
        <div className="p-7 sm:p-10">
          <Badge className="h-auto bg-[#ffd84d] px-3 py-1.5 font-black text-[#17351d]"><Check aria-hidden="true" /> Supplied solar scenario</Badge>
          <h2 id="scenario-heading" className="mt-5 text-4xl font-black">A system sized for your modeled usage</h2>
          <p className="mt-4 max-w-xl leading-7 text-white/75">The supplied result suggests this system may suit the household because its projected generation covers {formatPercent(model.coverage)} of modeled annual electricity use. Confirm roof conditions, equipment, and pricing with qualified providers.</p>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {[
              ["System size", formatSystemSize(model.result.payback.systemSizeKw)],
              ["Panel estimate", formatPanels(model.result.payback.panelCount)],
              ["Annual production", formatAnnualKwh(model.result.payback.annualProductionKwh)],
              ["Energy coverage", formatPercent(model.coverage)],
              ["Roof capacity", formatPanels(model.result.roofSolarPotential.maxArrayPanelsCount)],
              ["Sunshine", `${Math.round(model.result.roofSolarPotential.maxSunshineHoursPerYear).toLocaleString()} hrs/yr`],
            ].map(([label, value]) => <div key={label}><p className="text-xs font-black uppercase tracking-wider text-[#ffd84d]">{label}</p><p className="mt-1 font-black">{value}</p></div>)}
          </div>
        </div>
        <div className="bg-[#ffd84d] p-7 text-[#17351d] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em]">Estimated cost context</p>
          <p className="mt-5 text-5xl font-black">{formatCurrency(model.result.payback.estimatedSystemCostDollars)}</p>
          <p className="mt-2 font-bold text-[#355e3b]">Supplied installation estimate</p>
          <dl className="mt-8 space-y-4 border-t border-[#355e3b]/25 pt-6">
            <div className="flex justify-between gap-4"><dt className="font-bold">After-solar annual cost</dt><dd className="font-black">{formatCurrency(model.result.payback.annualCostAfterSolarDollars)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-bold">Annual savings</dt><dd className="font-black">{formatCurrency(model.annualSavings)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-bold">Payback estimate</dt><dd className="font-black">{formatYears(model.result.payback.paybackYears)}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function HouseholdInsights({ model }: { model: ResultsViewModel }) {
  const appliance = model.largestAppliance;
  return (
    <section className="grid gap-6 lg:grid-cols-2" aria-label="Household insights">
      <Card className="border border-[#355e3b]/15 bg-[#edf5ee]">
        <CardHeader><p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">Household context</p><CardTitle className="text-2xl font-black">What shaped this result</CardTitle></CardHeader>
        <CardContent><dl className="grid grid-cols-2 gap-5 text-sm"><div><dt className="font-bold text-[#6a7f6e]">State</dt><dd className="mt-1 font-black">{model.location.state}</dd></div><div><dt className="font-bold text-[#6a7f6e]">ZIP</dt><dd className="mt-1 font-black">{model.maskedZip}</dd></div><div><dt className="font-bold text-[#6a7f6e]">Billing source</dt><dd className="mt-1 font-black">{model.result.billRead ? model.result.billRead.billingPeriod : "Unavailable"}</dd></div><div><dt className="font-bold text-[#6a7f6e]">Detected appliances</dt><dd className="mt-1 font-black">{model.result.appliances.length || "Unavailable"}</dd></div></dl><p className="mt-6 text-sm leading-6 text-[#607164]">Home type, household size, and home size are not included in the current result contract, so they are not inferred here.</p></CardContent>
      </Card>
      <Card className="border border-[#355e3b]/15 bg-white">
        <CardHeader><p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">Largest detected load</p><CardTitle className="text-2xl font-black">{appliance?.name ?? "Appliance data unavailable"}</CardTitle></CardHeader>
        <CardContent>{appliance ? <><p className="text-sm font-medium leading-6 text-[#607164]">{appliance.name} appears to be the largest appliance load in this result. {model.result.tip}</p><div className="mt-6 flex justify-between gap-3 text-sm font-black"><span>{Math.round(appliance.monthlyKwh)} kWh/month</span><span>{formatCurrency(appliance.monthlyCost)}/month</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-[#edf2ed]"><div className="h-full rounded-full bg-[#355e3b]" style={{ width: `${Math.min(100, appliance.share)}%` }} /></div><p className="mt-2 text-xs font-bold text-[#6a7f6e]">{formatPercent(appliance.share)} of detected appliance usage</p></> : <p className="text-sm text-[#6a7f6e]">No appliance breakdown was supplied for this report.</p>}</CardContent>
      </Card>
    </section>
  );
}

function Confidence({ model }: { model: ResultsViewModel }) {
  const measured = model.result.roofSolarPotential.dataSource === "measured";
  return (
    <section className="rounded-3xl border-2 border-[#355e3b] bg-white p-6 sm:p-8" aria-labelledby="confidence-heading">
      <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf5ee]"><ShieldCheck className="size-6" aria-hidden="true" /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">Data confidence</p><h2 id="confidence-heading" className="mt-1 text-2xl font-black">What is known and what is estimated</h2><div className="mt-5 flex flex-wrap gap-2"><Badge className={measured ? "bg-[#355e3b] text-white" : "bg-[#fff4b8] text-[#17351d]"}>{measured ? "Measured data" : "Estimated data"}</Badge>{model.result.payback.costEstimateSource === "estimated" && <Badge className="bg-[#fff4b8] text-[#17351d]">Cost estimate</Badge>}</div><p className="mt-4 text-sm font-medium leading-6 text-[#607164]">{measured ? "The solar-potential source is marked as measured in this result. This does not mean utility-provider verification." : "Solar-potential values were estimated using the available household and location inputs."} Solar cost, production, savings, and payback values are projections, not guaranteed quotes.</p></div></div>
    </section>
  );
}

function Assumptions({ model }: { model: ResultsViewModel }) {
  return (
    <section className="rounded-3xl border border-[#9b6b27]/25 bg-[#fff7e8] p-6 sm:p-8" aria-labelledby="assumptions-heading">
      <div className="flex items-start gap-4"><Info className="mt-1 size-6 shrink-0 text-[#9b6b27]" aria-hidden="true" /><div><h2 id="assumptions-heading" className="text-2xl font-black">Assumptions used</h2><div className="mt-5 grid gap-6 sm:grid-cols-3"><div><p className="font-black">Known inputs</p><p className="mt-2 text-sm leading-6 text-[#594a35]">{model.location.state}, masked ZIP, supplied appliance estimates, roof capacity, and {model.result.billRead ? "billing information" : "annual cost information"}.</p></div><div><p className="font-black">Estimated values</p><p className="mt-2 text-sm leading-6 text-[#594a35]">Solar system cost, production, savings, coverage, payback, and carbon impact.</p></div><div><p className="font-black">Not available</p><p className="mt-2 text-sm leading-6 text-[#594a35]">Home type, household size, home size, roof orientation, shading detail, future rate changes, fees, and local net-metering rules.</p></div></div></div></div>
    </section>
  );
}

function Actions({ submissionId }: { submissionId: string }) {
  return (
    <section className="rounded-[2rem] bg-[#ffd84d] p-7 text-center sm:p-10" aria-labelledby="actions-heading">
      <Lightbulb className="mx-auto size-9" aria-hidden="true" /><h2 id="actions-heading" className="mt-3 text-3xl font-black">Keep your energy momentum going</h2><p className="mx-auto mt-3 max-w-xl font-medium text-[#355e3b]">Your report stays inside Panelly. Continue with the next useful step whenever you are ready.</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href={ROUTES.savedReports} className={`${linkBase} bg-[#355e3b] text-white`}><History className="size-4" aria-hidden="true" /> View saved reports</Link><Link href={ROUTES.survey} className={`${linkBase} border-2 border-[#355e3b] bg-white text-[#17351d]`}><RefreshCw className="size-4" aria-hidden="true" /> Retake survey</Link><Link href={`/tips/${encodeURIComponent(submissionId)}`} className={`${linkBase} text-[#17351d]`}>Review energy-saving tips <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
    </section>
  );
}

export function ResultsPageContent({ model }: { model: ResultsViewModel }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#17351d]">
      <Header />
      <Hero model={model} />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <ScoreExplanation model={model} />
        <CostComparison model={model} />
        <LongTermOutlook model={model} />
        <SolarScenario model={model} />
        <HouseholdInsights model={model} />
        <Confidence model={model} />
        <Assumptions model={model} />
        <Actions submissionId={model.result.submissionId} />
      </div>
      <footer className="border-t border-[#355e3b]/15 px-4 py-8 text-center text-xs font-bold text-[#6a7f6e]">Panelly · In-app solar outlook · {model.location.stateCode}</footer>
    </main>
  );
}

export function UnknownResult({ malformed = false }: { malformed?: boolean }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf0] px-4 py-12 text-[#17351d]"><div className="w-full max-w-xl text-center"><SunburstLogo className="mx-auto size-20" /><span className="mx-auto mt-5 grid size-14 place-items-center rounded-full bg-[#edf5ee]"><SearchX className="size-7" aria-hidden="true" /></span><h1 className="mt-5 text-4xl font-black">{malformed ? "This report needs a quick check" : "We couldn’t find that result"}</h1><p className="mx-auto mt-4 max-w-md font-medium leading-7 text-[#6a7f6e]">{malformed ? "The saved result is incomplete or malformed, so Panelly did not display uncertain values." : "This submission may not be available yet, or the link may be incorrect."}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={ROUTES.savedReports} className={`${linkBase} bg-[#355e3b] text-white`}>View saved reports</Link><Link href={ROUTES.survey} className={`${linkBase} border-2 border-[#355e3b] bg-white`}><Home className="size-4" aria-hidden="true" /> Retake survey</Link></div></div></main>
  );
}
