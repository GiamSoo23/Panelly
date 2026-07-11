import { auth } from "@clerk/nextjs/server";

export async function getUserId(): Promise<string | undefined> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  // Demo-user fallback (Connie) keeps persistence/history usable before
  // Clerk keys are configured locally.
  if (!configured) {
    return process.env.NEXT_PUBLIC_DEMO_USER_ID ?? process.env.DEMO_USER_ID;
  }

  const { userId } = await auth();
  return userId ?? undefined;
}
