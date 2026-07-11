import { auth } from "@clerk/nextjs/server";
import {
  ArrowDown,
  ArrowRight,
  Camera,
  ClipboardList,
  FileCheck2,
  Gauge,
  Lightbulb,
  LockKeyhole,
  Map,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SunburstLogo } from "@/components/results/SunburstLogo";

import { ChallengeSignOut } from "./ChallengeSignOut";

const journey = [
  {
    number: "01",
    title: "Tell us about your home",
    description: "Share a few household and energy details in a short survey.",
    icon: ClipboardList,
    current: true,
  },
  {
    number: "02",
    title: "Map your energy habits",
    description: "Add appliance information so Panelly can understand major energy loads.",
    icon: Camera,
    current: false,
  },
  {
    number: "03",
    title: "Review personalized tips",
    description: "Explore practical opportunities that may reduce household energy costs.",
    icon: Lightbulb,
    current: false,
  },
  {
    number: "04",
    title: "Unlock your solar comparison",
    description: "See prospective solar costs and savings beside your current utility outlook.",
    icon: PanelsTopLeft,
    current: false,
  },
] as const;

const unlocks = [
  { title: "Energy profile", description: "An estimated picture of how your household uses power.", icon: Gauge },
  { title: "Savings tips", description: "Personalized ideas for lowering energy expenses.", icon: Lightbulb },
  { title: "Solar comparison", description: "A clear utility-versus-solar planning view.", icon: SunMedium },
  { title: "Saved report", description: "A persistent in-app summary you can revisit later.", icon: FileCheck2 },
] as const;

const primaryLink = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#355e3b] px-6 py-3.5 text-sm font-black text-white shadow-[5px_5px_0_#ffd84d] transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[7px_7px_0_#ffd84d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]";

export default async function ChallengePage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!configured) redirect("/login");

  const { userId } = await auth();
  if (!userId) redirect("/login");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf0] text-[#17351d]">
      <header className="border-b border-[#355e3b]/15 bg-[#fffaf0]/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Challenge navigation">
          <div className="flex items-center gap-3"><SunburstLogo className="size-11" /><span className="text-xl font-black tracking-tight">Panelly</span></div>
          <div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-full bg-[#edf5ee] px-3 py-2 text-xs font-black sm:inline-flex"><LockKeyhole className="size-3.5" aria-hidden="true" /> Signed in securely</span><ChallengeSignOut /></div>
        </nav>
      </header>

      <section className="relative overflow-hidden bg-[#fff4b8] px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-28 -top-32 size-[30rem] rounded-full border-[5rem] border-[#ffd84d]/35" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-8 left-[8%] size-20 rounded-full bg-white/55" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#355e3b]/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-sm"><Sparkles className="size-4 text-[#9a7600]" aria-hidden="true" /> Your Energy Quest · Mission 1 of 4</div>
            <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">Ready to unlock your home&apos;s solar potential?</h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#59705d]">Complete a short energy challenge and Panelly will estimate how your household uses power, where you may be able to save, and how solar could compare with your current utility costs.</p>
            <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <Link href="/survey" className={primaryLink}>Start the Challenge <ArrowRight className="size-4" aria-hidden="true" /></Link>
              <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-[#355e3b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]">See how it works <ArrowDown className="size-4" aria-hidden="true" /></a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs font-bold text-[#59705d]"><ShieldCheck className="size-4" aria-hidden="true" /> Planning guidance, not a guaranteed quote or engineering assessment.</p>
          </div>

          <div className="relative mx-auto w-full max-w-md" aria-label="Challenge starting point">
            <SunburstLogo className="absolute -right-8 -top-12 size-36 opacity-30 motion-safe:animate-[spin_24s_linear_infinite] motion-reduce:animate-none" />
            <div className="relative rounded-[2rem] border-2 border-[#355e3b] bg-white p-7 shadow-[9px_10px_0_#355e3b] sm:p-9">
              <div className="flex items-center justify-between gap-4"><span className="grid size-14 place-items-center rounded-2xl bg-[#ffd84d]"><Map className="size-7" aria-hidden="true" /></span><span className="rounded-full bg-[#edf5ee] px-3 py-1.5 text-xs font-black">Not started</span></div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">Mission briefing</p>
              <h2 className="mt-2 text-3xl font-black">Your path starts at home</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-[#657568]">Begin with household basics. Each later stage builds on the information you choose to share.</p>
              <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#edf2ed]" role="progressbar" aria-label="Energy Quest progress" aria-valuenow={0} aria-valuemin={0} aria-valuemax={4}><div className="h-full w-0 bg-[#ffd84d]" /></div>
              <div className="mt-3 flex justify-between text-xs font-black text-[#657568]"><span>Start</span><span>4 stages to unlock</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-6 px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a7f6e]">How it works</p><h2 id="journey-heading" className="mt-2 text-4xl font-black tracking-tight">Four clear stages. One useful plan.</h2><p className="mt-4 font-medium leading-7 text-[#657568]">You are at the beginning. These cards preview the journey; no stage is marked complete yet.</p></div>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {journey.map(({ number, title, description, icon: Icon, current }) => (
              <li key={number} className={`relative rounded-3xl border-2 p-6 ${current ? "border-[#355e3b] bg-[#fff4b8] shadow-[5px_6px_0_#355e3b]" : "border-[#355e3b]/15 bg-white"}`}>
                <div className="flex items-center justify-between"><span className={`grid size-12 place-items-center rounded-2xl ${current ? "bg-white" : "bg-[#edf5ee]"}`}><Icon className="size-6" aria-hidden="true" /></span><span className="text-sm font-black text-[#6a7f6e]">{number}</span></div>
                {current && <span className="mt-5 inline-flex rounded-full bg-[#355e3b] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">You are here</span>}
                <h3 className={`${current ? "mt-3" : "mt-7"} text-xl font-black`}>{title}</h3><p className="mt-3 text-sm font-medium leading-6 text-[#657568]">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#355e3b] px-4 py-16 text-white sm:px-6 sm:py-20" aria-labelledby="unlocks-heading">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><span className="grid size-14 place-items-center rounded-2xl bg-[#ffd84d] text-[#17351d]"><Trophy className="size-7" aria-hidden="true" /></span><p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#ffd84d]">What you&apos;ll unlock</p><h2 id="unlocks-heading" className="mt-2 text-4xl font-black">A clearer energy picture</h2><p className="mt-4 max-w-lg font-medium leading-7 text-white/70">Panelly turns the information you provide into practical planning guidance that is easy to revisit.</p></div><div className="grid gap-4 sm:grid-cols-2">{unlocks.map(({ title, description, icon: Icon }) => <article key={title} className="rounded-2xl border border-white/15 bg-white/8 p-5"><Icon className="size-6 text-[#ffd84d]" aria-hidden="true" /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{description}</p></article>)}</div></div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="trust-heading">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-3xl border border-[#355e3b]/20 bg-[#edf5ee] p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white"><Zap className="size-6" aria-hidden="true" /></span><div><h2 id="trust-heading" className="text-2xl font-black">Transparent from the start</h2><p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[#59705d]">When measured household information is unavailable, Panelly may use estimates based on the details you provide. Later results will identify estimated values clearly so you can understand what shaped your outlook.</p></div></div></div>
          <div className="rounded-3xl bg-[#ffd84d] p-7 text-center lg:w-80"><SunMedium className="mx-auto size-9" aria-hidden="true" /><p className="mt-3 text-xl font-black">Ready when you are</p><Link href="/survey" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#355e3b] px-5 py-3 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white">Start the Challenge <ArrowRight className="size-4" aria-hidden="true" /></Link></div>
        </div>
      </section>

      <footer className="border-t border-[#355e3b]/15 px-4 py-8 text-center text-xs font-bold text-[#657568]">Panelly · Your Energy Quest begins here</footer>
    </main>
  );
}
