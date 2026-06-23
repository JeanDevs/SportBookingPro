import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="font-display text-7xl font-bold text-lime-400">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold text-ink-50">Página no encontrada</h1>
        <p className="mt-2 text-ink-400">La cancha que buscas no existe o se movió.</p>
        <Link href="/" className={buttonClasses({ className: "mt-6" })}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
