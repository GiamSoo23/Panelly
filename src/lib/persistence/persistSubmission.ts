import type { SurveyInput, SurveyResult } from "@/lib/schemas/survey";

// TODO(connie): replace with real Neon/Drizzle queries once the schema
// (users, submissions, results) exists. Keep this exact signature so the
// route calling it doesn't need to change.
export async function persistSubmission(
  _input: SurveyInput,
  _result: Omit<SurveyResult, "submissionId" | "createdAt">,
): Promise<{ submissionId: string }> {
  console.warn("persistSubmission() is stubbed — no data is being saved.");
  return { submissionId: `stub-${crypto.randomUUID()}` };
}
