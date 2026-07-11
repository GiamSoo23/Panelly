import Link from "next/link";

import { SsoCallbackClient } from "./SsoCallbackClient";

export default function SsoCallbackPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  if (!configured) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fffaf0] px-4 text-[#17351d]">
        <div className="max-w-md text-center" role="alert">
          <h1 className="text-3xl font-black">Sign-in setup is incomplete</h1>
          <p className="mt-3 font-medium text-[#657568]">Clerk credentials are required before the Google callback can be completed.</p>
          <Link href="/login" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#355e3b] px-5 py-3 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd84d]">Return to login</Link>
        </div>
      </main>
    );
  }

  return <SsoCallbackClient />;
}
