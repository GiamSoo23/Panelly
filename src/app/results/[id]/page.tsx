import type { Metadata } from "next";

import { ResultsPageContent, UnknownResult } from "@/components/results/ResultsPageContent";
import { getMockSurveyResult } from "@/lib/results/mock-survey-results";
import { toResultsViewModel } from "@/lib/results/presentation";

export const metadata: Metadata = {
  title: "Challenge Complete | Panelly",
  description: "Your personalized utility and solar comparison.",
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Integration point: replace this isolated mock lookup with the persisted
  // SurveyResult lookup for this submissionId when the backend is available.
  const lookup = getMockSurveyResult(id);

  if (!lookup.success) {
    return <UnknownResult malformed={lookup.reason === "malformed"} />;
  }

  return <ResultsPageContent model={toResultsViewModel(lookup.data, lookup.location)} />;
}
