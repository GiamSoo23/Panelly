import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmissionById } from "@/lib/persistence/neon";
import { getMockSurveyResult } from "@/lib/results/mock-survey-results";
import { Lightbulb, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Energy Saving Tips | Panelly",
  description: "Personalized ideas for lowering energy expenses.",
};

export default async function TipsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let tip = "";
  
  const submission = await getSubmissionById(id);
  if (submission) {
    tip = submission.result.tip;
  } else {
    const lookup = getMockSurveyResult(id);
    if (!lookup.success) {
      return notFound();
    }
    tip = lookup.data.tip;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf0] px-4 py-12 text-[#17351d]">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#edf5ee]">
          <Lightbulb className="size-8 text-[#FFD700]" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-4xl font-black">Your Personalized Energy Tips</h1>
        
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm border border-[#e5e7eb] text-left">
          <p className="text-lg font-medium leading-relaxed text-[#355e3b]">
            {tip}
          </p>
        </div>

        <div className="mt-8">
          <Link 
            href={`/results/${encodeURIComponent(id)}`} 
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#355e3b] bg-transparent px-5 py-3 text-sm font-black transition motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to results
          </Link>
        </div>
      </div>
    </main>
  );
}
