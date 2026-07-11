import Link from "next/link";
import { connection } from "next/server";

import { getUserId } from "@/lib/auth/getUserId";
import { getUserSubmissions } from "@/lib/persistence/neon";
import { HOME_TYPE_OPTIONS, optionLabel } from "@/lib/schemas/survey";

export default async function HistoryPage() {
  // History must reflect the latest submissions on every request; without
  // this the page is prerendered once at build time with an empty list.
  await connection();

  const userId = await getUserId();
  const submissions = await getUserSubmissions(userId);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          History log
        </p>
        <h1 className="text-3xl font-semibold">Your saved survey runs</h1>
        <p className="text-muted-foreground">
          Each submission is stored with its survey input and the computed result so the history button has something real to show.
        </p>
      </header>

      {submissions.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No surveys saved yet. Fill out the survey page to create your first record.
        </p>
      ) : (
        <ul className="space-y-3">
          {submissions.map((submission) => (
            <li key={submission.submissionId} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">
                    ZIP {submission.input.zip} · {optionLabel(HOME_TYPE_OPTIONS, submission.input.homeType)} · {submission.input.householdSize} {submission.input.householdSize === 1 ? "person" : "people"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saved {new Date(submission.createdAt).toLocaleString()} · payback {submission.result.payback.paybackYears.toFixed(1)} yrs
                  </p>
                </div>
                <Link className="text-sm font-medium text-primary" href={`/results/${submission.submissionId}`}>
                  Open result
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
