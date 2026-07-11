import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Check, ShieldCheck, Sparkles, SunMedium } from "lucide-react";
import { redirect } from "next/navigation";

import { SunburstLogo } from "@/components/results/SunburstLogo";

import { GoogleSignInButton } from "../GoogleSignInButton";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3a10 10 0 0 0 0 9.1L6.4 14Z" />
      <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.5l3.4 2.6C7.2 7.7 9.4 6 12 6Z" />
    </svg>
  );
}

export default async function LoginPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
  if (configured) {
    const { userId } = await auth();
    if (userId) redirect("/challenge");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf0] text-[#17351d]">
      <div className="pointer-events-none absolute -left-36 -top-36 size-[34rem] rounded-full border-[6rem] border-[#ffd84d]/30" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[30rem] rounded-full bg-[#355e3b]/8" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <section className="mx-auto max-w-2xl py-8 lg:mx-0" aria-labelledby="login-heading">
          <div className="flex items-center gap-3"><SunburstLogo className="size-12" /><span className="text-2xl font-black tracking-tight">Panelly</span></div>
          <div className="mt-14 inline-flex items-center gap-2 rounded-full border border-[#355e3b]/15 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] shadow-sm"><Sparkles className="size-4 text-[#9a7600]" aria-hidden="true" /> Begin your energy challenge</div>
          <h1 id="login-heading" className="mt-6 text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">Turn your energy habits into a solar savings plan.</h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#59705d]">Complete a quick household challenge and discover how solar could change your monthly energy costs.</p>
          <ul className="mt-9 grid gap-4 text-sm font-bold sm:grid-cols-3" aria-label="Panelly journey highlights">
            {["Complete the challenge", "See your opportunity", "Unlock next steps"].map((item) => <li key={item} className="flex items-center gap-2"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#ffd84d]"><Check className="size-4" aria-hidden="true" /></span>{item}</li>)}
          </ul>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[2rem] border-2 border-[#355e3b] bg-white p-6 shadow-[9px_10px_0_#355e3b] sm:p-9" aria-labelledby="signin-heading">
          <span className="grid size-14 place-items-center rounded-2xl bg-[#fff4b8]"><SunMedium className="size-8 text-[#355e3b]" aria-hidden="true" /></span>
          <h2 id="signin-heading" className="mt-6 text-3xl font-black tracking-tight">Welcome to Panelly</h2>
          <p className="mt-3 font-medium leading-6 text-[#657568]">Sign up or log in with Google to begin your personalized energy challenge.</p>
          <div className="mt-8">
            {configured ? <GoogleSignInButton icon={<GoogleMark />} /> : <div role="alert" className="rounded-2xl border border-[#a94a3f]/30 bg-[#fff2f0] p-4 text-sm text-[#7a2f27]"><p className="font-black">Google sign-in is not configured yet.</p><p className="mt-1 leading-6">Add the Clerk environment variables from <code className="font-mono text-xs">.env.example</code>, then restart the development server.</p></div>}
          </div>
          <div className="mt-7 flex items-start gap-3 border-t border-[#355e3b]/15 pt-6 text-xs font-medium leading-5 text-[#657568]"><ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p>Authentication is handled securely by Clerk and Google. Panelly never receives your Google password.</p></div>
          <div className="mt-5 flex items-center gap-2 text-xs font-black text-[#355e3b]"><span>Next: Start your challenge</span><ArrowRight className="size-4" aria-hidden="true" /></div>
        </section>
      </div>
    </main>
  );
}
