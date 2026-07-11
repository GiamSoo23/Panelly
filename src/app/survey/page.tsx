import { auth } from "@clerk/nextjs/server";
import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { SunburstLogo } from "@/components/results/SunburstLogo";

import { SurveyForm } from "./SurveyForm";

export default async function SurveyPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!configured) redirect("/login");

  const { userId } = await auth();
  if (!userId) redirect("/login");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#17351d]">
      <header className="border-b border-[#355e3b]/15 bg-[#fffaf0]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><SunburstLogo className="size-11" /><span className="text-xl font-black tracking-tight">Panelly</span></div><span className="inline-flex items-center gap-2 rounded-full bg-[#edf5ee] px-3 py-2 text-xs font-black"><LockKeyhole className="size-3.5" aria-hidden="true" /> Household Energy Survey</span></div>
      </header>
      <section className="relative px-4 py-10 sm:px-6 sm:py-14"><div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,#fff080,transparent_70%)] opacity-50" aria-hidden="true" /><div className="relative"><SurveyForm /></div></section>
    </main>
  );
}
