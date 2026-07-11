import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SurveyGameForm } from "./SurveyGameForm";

export default async function SurveyPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!configured) redirect("/login");

  const { userId } = await auth();
  if (!userId) redirect("/login");

  return <SurveyGameForm />;
}
