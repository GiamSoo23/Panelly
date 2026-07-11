import type { SurveyInput, SurveyResult } from "@/lib/schemas/survey";

import {
  getDemoUserId,
  prepareSubmissionRecord,
  saveSubmissionToDatabase,
} from "@/lib/persistence/neon";

export async function persistSubmission(
  input: SurveyInput,
  result: Omit<SurveyResult, "submissionId" | "createdAt">,
): Promise<{ submissionId: string }> {
  const userId = input.userId ?? (await getDemoUserId());
  const record = prepareSubmissionRecord(input, result, userId);
  const submissionId = await saveSubmissionToDatabase(record);

  return { submissionId: submissionId ?? record.submissionId };
}
