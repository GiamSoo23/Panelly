import { cn } from "@/lib/utils";

export function SunburstLogo({ className }: { className?: string }) {
  const rays = [0, 31, 68, 102, 143, 180, 217, 258, 292, 329];

  return (
    <svg viewBox="0 0 64 64" className={cn("text-[#ffd84d]", className)} role="img" aria-label="Panelly sunburst">
      <g fill="currentColor">
        {rays.map((angle, index) => (
          <path
            key={angle}
            d={index % 2 === 0 ? "M29 2h6l2 16H27z" : "M30 5h4l1.5 13h-7z"}
            transform={`rotate(${angle} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="13" />
      </g>
      <circle cx="32" cy="32" r="9" fill="#355e3b" opacity=".16" />
    </svg>
  );
}
