import { cn } from "../ui/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 place-items-center rounded-xl bg-lime-400 text-ink-950 shadow-glow-sm",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        {/* Marca: cancha + pelota estilizada */}
        <path
          d="M3 12h18M12 4v16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3.2" fill="currentColor" />
        <circle
          cx="12"
          cy="12"
          r="8.4"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-none">
        <p className="font-display text-base font-bold tracking-tight text-ink-50">
          APP<span className="text-lime-400">DEPORTE</span>
        </p>
        {subtitle ? (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
