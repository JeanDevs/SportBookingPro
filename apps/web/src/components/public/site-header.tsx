import Link from "next/link";
import { Logo } from "../brand/logo";
import { buttonClasses } from "../ui/button";
import { getCustomerUser } from "@/services/customer-auth";

export async function SiteHeader() {
  const user = await getCustomerUser();
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/panel"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-300 hover:text-ink-50 sm:inline-block"
          >
            Para complejos
          </Link>
          {user ? (
            <Link href="/cuenta" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Mis reservas
            </Link>
          ) : (
            <>
              <Link
                href="/ingresar"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-200 hover:text-ink-50"
              >
                Ingresar
              </Link>
              <Link href="/registro" className={buttonClasses({ size: "sm" })}>
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-800 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-ink-400 sm:flex-row">
        <Logo subtitle="Canchas deportivas en Perú" />
        <p>© {new Date().getFullYear()} SportBook Pro · Hecho en Lima 🇵🇪</p>
        <Link href="/panel" className="font-semibold text-lime-300 hover:text-lime-200">
          ¿Tienes un complejo? Publícalo →
        </Link>
      </div>
    </footer>
  );
}
