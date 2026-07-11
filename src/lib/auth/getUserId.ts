import { auth } from "@clerk/nextjs/server";

export async function getUserId(): Promise<string | undefined> {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!configured) return undefined;

  const { userId } = await auth();
  return userId ?? undefined;
}
