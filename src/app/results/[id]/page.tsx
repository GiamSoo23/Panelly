import type { Metadata } from "next";

import { ResultsPageContent, UnknownResult } from "@/components/results/ResultsPageContent";
import { getSubmissionById } from "@/lib/persistence/neon";
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

  // Real persisted submission first (Connie's Neon lookup), rendered with
  // Julia's results UI. The saved result doesn't store a state name yet, so
  // the location label falls back to a generic one — persist the geocoded
  // state alongside the result to fix that properly.
  const submission = await getSubmissionById(id);
  if (submission) {
    return (
      <ResultsPageContent
        model={toResultsViewModel(submission.result, {
          state: "United States",
          stateCode: "US",
        })}
      />
    );
  }

  // Fallback: Julia's mock results, so her demo submission ids keep working.
  const lookup = getMockSurveyResult(id);

  if (!lookup.success) {
    return <UnknownResult malformed={lookup.reason === "malformed"} />;
  }

  return <ResultsPageContent model={toResultsViewModel(lookup.data, lookup.location)} />;
}
