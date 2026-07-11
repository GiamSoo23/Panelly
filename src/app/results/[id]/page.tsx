import { loadSubmission } from "@/lib/persistence/persistSubmission";
import { notFound } from "next/navigation";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await loadSubmission(id);
  if (!submission) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-gradient-to-br from-[#FFF8E7] to-[#FFECB3] p-10 relative overflow-hidden">
        <a href="/" className="absolute top-8 left-8 text-base font-black text-[#2D6A4F] hover:opacity-80 transition-opacity">
          Back home
        </a>
        
        <div className="relative z-10">
          <div className="mb-4">
            <span className="text-4xl font-black text-[#2D6A4F]">Panelly</span>
          </div>
          <div className="mb-8">
            <span className="text-xs font-black text-[#2D6A4F] tracking-[0.25em]">YOUR ESTIMATE IS READY</span>
          </div>

          <h1 className="text-4xl font-black text-[#1B4332] mb-5 leading-tight">
            A projected solar savings estimate
          </h1>
          <p className="text-sm text-[#2D6A4F] mb-6 leading-relaxed max-w-sm">
            This snapshot uses your survey answers and typical residential assumptions to estimate how solar could affect your home over time.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="text-lg font-black text-[#52B788]">✓</span>
              <span className="text-sm font-semibold text-[#2D6A4F]">Estimated annual savings</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-black text-[#52B788]">✓</span>
              <span className="text-sm font-semibold text-[#2D6A4F]">Estimated payback timeline</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg font-black text-[#52B788]">✓</span>
              <span className="text-sm font-semibold text-[#2D6A4F]">A planning-friendly starting point</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FFF59D] rounded-full -mr-40 -mb-40 opacity-30"></div>
      </div>

      {/* RIGHT SIDE - RESULTS CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl border-4 border-[#2D6A4F] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-[#1B4332]">Your estimate</h2>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#558B6A] mt-1">Planning view only</p>
            </div>
            <a href="/" className="lg:hidden text-sm font-black text-[#2D6A4F] hover:opacity-80 transition-opacity">
              Home
            </a>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2.5 bg-[#FFF8E7] rounded-xl border border-[#FFE0B2]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D6A4F] mb-1">Estimated savings</p>
              <p className="text-lg font-black text-[#52B788]">${submission.payback.annualSavingsDollars.toLocaleString()}</p>
            </div>
            <div className="p-2.5 bg-[#FFF8E7] rounded-xl border border-[#FFE0B2]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D6A4F] mb-1">Estimated payback</p>
              <p className="text-lg font-black text-[#2D6A4F]">{submission.payback.paybackYears} years</p>
            </div>
          </div>

          {/* CONFIDENCE BAR */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2D6A4F]">Planning confidence</p>
              <p className="text-sm font-black text-[#1B4332]">Medium</p>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E8F5E9] overflow-hidden">
              <div className="h-full w-[68%] rounded-full bg-[#52B788]" />
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-2.5 mb-4 text-sm">
            <div className="flex justify-between border-b border-[#F1F8F5] pb-2">
              <span className="text-[#2D6A4F]">Location</span>
              <span className="font-semibold text-[#1B4332]">{submission.zip}</span>
            </div>
            <div className="flex justify-between border-b border-[#F1F8F5] pb-2">
              <span className="text-[#2D6A4F]">Estimated annual cost</span>
              <span className="font-semibold text-[#1B4332]">${submission.payback.annualCurrentCostDollars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#F1F8F5] pb-2">
              <span className="text-[#2D6A4F]">Estimated after solar</span>
              <span className="font-semibold text-[#1B4332]">${submission.payback.annualCostAfterSolarDollars.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#F1F8F5] pb-2">
              <span className="text-[#2D6A4F]">Estimated system size</span>
              <span className="font-semibold text-[#1B4332]">{submission.roofSolarPotential.maxArrayPanelsCount} panels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#2D6A4F]">Estimated production</span>
              <span className="font-semibold text-[#1B4332]">{submission.payback.annualProductionKwh.toLocaleString()} kWh</span>
            </div>
          </div>

          {/* HOW WE ESTIMATED THIS */}
          <div className="p-3 bg-[#F1F8F5] rounded-xl border border-[#D4E8E0] mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D6A4F] mb-2">How this estimate works</p>
            <div className="space-y-1.5 text-xs text-[#2D6A4F] leading-relaxed">
              <div className="flex gap-2">
                <span className="font-black text-[#52B788]">•</span>
                <span>Based on your home size, habits, and appliances.</span>
              </div>
              <div className="flex gap-2">
                <span className="font-black text-[#52B788]">•</span>
                <span>Using typical solar assumptions for planning.</span>
              </div>
              <div className="flex gap-2">
                <span className="font-black text-[#52B788]">•</span>
                <span>Meant to help you explore possible savings.</span>
              </div>
            </div>
          </div>

          {/* TIP SECTION */}
          <div className="p-3 bg-[#FFF8E7] rounded-xl border border-[#FFE0B2] mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2D6A4F] mb-2">Key takeaway</p>
            <p className="text-sm text-[#2D6A4F] leading-relaxed">{submission.tip}</p>
          </div>

          {/* CTA */}
          <button className="w-full py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-black text-sm rounded-xl transition-colors">
            See estimated installer options
          </button>
        </div>
      </div>
    </div>
  );
}
