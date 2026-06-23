import Link from "next/link";
import { Logo } from "../brand/logo";

export function AuthShell({
  heroTitle,
  heroSubtitle,
  title,
  subtitle,
  children,
  footer,
}: {
  heroTitle: string;
  heroSubtitle: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-ink-800 bg-ink-900 p-10 lg:flex">
        <div className="absolute inset-0 bg-grid-ink [background-size:32px_32px] opacity-40" />
        <div className="absolute inset-0 bg-lime-radial" />
        <div className="relative">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-bold leading-tight text-ink-50">
            {heroTitle}
          </h2>
          <p className="mt-4 max-w-md text-lg text-ink-300">{heroSubtitle}</p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          Reservas · Pagos · Clientes en un solo lugar
        </div>
      </aside>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-50">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-ink-400">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-sm text-ink-400">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
