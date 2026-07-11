import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-2xl font-semibold">OneEthos</h1>
      <p className="text-muted-foreground">BloomHacks · Clean Energy Track</p>
      <nav className="flex gap-4 text-sm underline">
        <Link href="/survey">survey</Link>
        <Link href="/results/demo">results</Link>
        <Link href="/history">history</Link>
      </nav>
    </div>
  );
}
