import { AMENITIES, isAmenityKey } from "@/lib/domain";
import { cn } from "@/components/ui/cn";

export function AmenityChips({
  keys,
  max,
  className,
}: {
  keys: string[];
  max?: number;
  className?: string;
}) {
  const valid = keys.filter(isAmenityKey);
  if (valid.length === 0) return null;
  const shown = max ? valid.slice(0, max) : valid;
  const rest = valid.length - shown.length;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((k) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 rounded-lg bg-ink-800 px-2 py-1 text-xs font-medium text-ink-200"
        >
          <span>{AMENITIES[k].emoji}</span> {AMENITIES[k].label}
        </span>
      ))}
      {rest > 0 ? (
        <span className="inline-flex items-center rounded-lg bg-ink-800 px-2 py-1 text-xs text-ink-400">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}
