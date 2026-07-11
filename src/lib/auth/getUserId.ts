// TODO(connie): replace with Clerk once wired, e.g.:
//   import { auth } from "@clerk/nextjs/server";
//   export async function getUserId() {
//     const { userId } = await auth();
//     return userId ?? undefined;
//   }
export async function getUserId(): Promise<string | undefined> {
  return process.env.NEXT_PUBLIC_DEMO_USER_ID ?? process.env.DEMO_USER_ID;
}
