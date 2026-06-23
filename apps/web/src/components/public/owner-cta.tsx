import Link from "next/link";
import { CalendarCheck, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Llena tus horas muertas",
    desc: "Recibe reservas online 24/7, no solo por WhatsApp o llamadas.",
  },
  {
    icon: Wallet,
    title: "Asegura cada reserva",
    desc: "Cobra el adelanto por Yape/Plin antes de jugar y reduce las ausencias.",
  },
  {
    icon: TrendingUp,
    title: "Controla tu negocio",
    desc: "Reservas, pagos y clientes en un panel hecho para dueños de canchas.",
  },
];

export function OwnerCta() {
  return (
    <section className="relative overflow-hidden border-y border-ink-800 bg-ink-900">
      <div className="absolute inset-0 bg-lime-radial opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lime-300 ring-1 ring-inset ring-lime-400/25">
              Para dueños de complejos
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink-50 sm:text-4xl">
              ¿Tienes un complejo? <span className="text-lime-400">Publícalo gratis</span> y llena
              tus canchas.
            </h2>
            <p className="mt-4 max-w-lg text-ink-300">
              Empieza sin costo. Tus clientes reservan y pagan el adelanto online; tú validas y
              gestionas todo desde un panel simple.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/panel/registro" className={buttonClasses({ size: "lg" })}>
                Publicar mi complejo <ArrowRight size={18} />
              </Link>
              <Link
                href="/panel"
                className={buttonClasses({ variant: "outline", size: "lg" })}
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-ink-700/70 bg-ink-850/80 p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lime-400/15 text-lime-300">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-semibold text-ink-50">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
