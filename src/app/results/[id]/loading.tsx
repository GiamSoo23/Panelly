import { SunburstLogo } from "@/components/results/SunburstLogo";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsLoading() {
  return (
    <main className="min-h-screen bg-[#fffaf0] px-4 py-8 text-[#17351d]">
      <div className="mx-auto max-w-6xl" aria-busy="true" aria-label="Loading energy results">
        <div className="mb-16 flex items-center gap-3">
          <SunburstLogo className="size-10" />
          <span className="text-xl font-black">Panelly</span>
        </div>
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <Skeleton className="mx-auto h-7 w-44 bg-[#355e3b]/10" />
          <Skeleton className="mx-auto h-14 w-full bg-[#355e3b]/10" />
          <Skeleton className="mx-auto h-6 w-4/5 bg-[#355e3b]/10" />
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-36 rounded-3xl bg-[#355e3b]/10" />
          ))}
        </div>
      </div>
    </main>
  );
}
