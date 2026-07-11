"use client";

import { useSignIn } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";
import { useState, type ReactNode } from "react";

export function GoogleSignInButton({ icon }: { icon: ReactNode }) {
  const { signIn, fetchStatus, errors } = useSignIn();
  const [localError, setLocalError] = useState<string | null>(null);
  const loading = fetchStatus === "fetching";
  const hasProviderError = Boolean(errors && Object.keys(errors).length > 0);

  const startGoogleSignIn = async () => {
    if (loading) return;
    setLocalError(null);
    try {
      const { error } = await signIn.sso({ strategy: "oauth_google", redirectCallbackUrl: "/sso-callback", redirectUrl: "/challenge" });
      if (error) setLocalError("Google sign-in could not start. Please try again.");
    } catch {
      setLocalError("Google sign-in could not start. Check your connection and try again.");
    }
  };

  return (
    <div>
      <button type="button" onClick={startGoogleSignIn} disabled={loading} aria-busy={loading} className="flex min-h-13 w-full items-center justify-center gap-3 rounded-xl border-2 border-[#355e3b] bg-white px-5 py-3.5 text-base font-black shadow-[4px_4px_0_#ffd84d] transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[6px_6px_0_#ffd84d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d] disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0">
        {loading ? <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : icon}
        {loading ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {(localError || hasProviderError) && <p role="alert" className="mt-4 rounded-xl bg-[#fff2f0] px-4 py-3 text-sm font-bold text-[#7a2f27]">{localError ?? "Google sign-in was not completed. Please try again."}</p>}
    </div>
  );
}
