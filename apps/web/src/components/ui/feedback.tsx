import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-md rounded-2xl border border-dashed border-ink-700 bg-ink-850/50 p-10 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-800 text-lime-300">
          <Icon size={26} />
        </span>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-ink-50">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-ink-400">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Alert({
  tone = "red",
  children,
  className,
}: {
  tone?: "red" | "amber" | "lime" | "sky";
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    red: "border-red-500/30 bg-red-500/10 text-red-200",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    lime: "border-lime-400/30 bg-lime-400/10 text-lime-200",
    sky: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  };
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        tones[tone],
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
