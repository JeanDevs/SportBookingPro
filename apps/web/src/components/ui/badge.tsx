import { cn } from "./cn";

export type BadgeTone =
  | "lime"
  | "emerald"
  | "amber"
  | "red"
  | "sky"
  | "violet"
  | "ink";

const toneClasses: Record<BadgeTone, string> = {
  lime: "bg-lime-400/15 text-lime-300 ring-lime-400/30",
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  red: "bg-red-500/15 text-red-300 ring-red-500/30",
  sky: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  violet: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  ink: "bg-ink-700/60 text-ink-200 ring-ink-600/50",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({
  tone = "ink",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      ) : null}
      {children}
    </span>
  );
}
