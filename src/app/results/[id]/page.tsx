// NOTE(connie): minimal placeholder so history-log links resolve to a real
// page. Julia owns this route — replace the UI freely; load the saved data
// with getSubmissionById(id), which returns { input, result } already parsed
// against the shared schemas.
import Link from "next/link";

import { getSubmissionById } from "@/lib/persistence/neon";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-6">
        <h1 className="text-3xl font-semibold">Result not found</h1>
        <p className="text-muted-foreground">The requested survey result could not be loaded.</p>
        <Link className="text-sm font-medium text-primary" href="/history">
          Back to history
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Saved result
        </p>
        <h1 className="text-3xl font-semibold">Survey result for ZIP {submission.input.zip}</h1>
        <p className="text-muted-foreground">
          Payback estimate: {submission.result.payback.paybackYears.toFixed(1)} years
        </p>
      </header>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Solar snapshot</h2>
        <p className="mt-2 text-sm text-muted-foreground">{submission.result.tip}</p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-medium">Installer preview</h2>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {submission.result.installers.map((installer) => (
            <li key={`${installer.name}-${installer.address}`}>
              {installer.name} · {installer.rating ?? "n/a"} ⭐ · {installer.address}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
