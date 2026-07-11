"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { LoaderCircle } from "lucide-react";

export function SsoCallbackClient() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fffaf0] px-4 text-[#17351d]">
      <div className="text-center" role="status">
        <LoaderCircle className="mx-auto size-10 animate-spin text-[#355e3b] motion-reduce:animate-none" aria-hidden="true" />
        <p className="mt-4 font-black">Finishing your secure sign-in…</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </main>
  );
}
