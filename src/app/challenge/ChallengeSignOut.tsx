"use client";

import { useClerk } from "@clerk/nextjs";
import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";

export function ChallengeSignOut() {
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOut({ redirectUrl: "/login" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleSignOut} disabled={loading} aria-busy={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#355e3b]/20 bg-white px-3 py-2 text-xs font-black transition hover:bg-[#edf5ee] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d] disabled:cursor-wait disabled:opacity-60">
      {loading ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
