import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  accent?: boolean;
}

/** Tarjeta de métrica para el dashboard. `accent` resalta la KPI principal. */
export function StatCard({ label, value, icon: Icon, hint, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-card",
        accent
          ? "border-lime-400/30 bg-gradient-to-br from-lime-400/10 to-ink-850"
          : "border-ink-700/70 bg-ink-850/80",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {label}
        </p>
        {Icon ? (
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl",
              accent ? "bg-lime-400/20 text-lime-300" : "bg-ink-800 text-ink-300",
            )}
          >
            <Icon size={18} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-ink-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}
