export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/80 px-5 py-4 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{eyebrow}</p>
          ) : null}
          <h1 className="truncate font-display text-xl font-bold text-ink-50">{title}</h1>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">{children}</div>
  );
}
