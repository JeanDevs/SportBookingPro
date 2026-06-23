import Link from "next/link";
import { CalendarCheck, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Monetiza tu capacidad ociosa",
    desc: "Convierte tus horas muertas en ingresos. Recibe reservas online 24/7, sin depender de WhatsApp.",
  },
  {
    icon: Wallet,
    title: "Cobra adelantos garantizados",
    desc: "Sin ausencias, sin sorpresas, sin riesgo. Recibe el pago antes de que jueguen.",
  },
  {
    icon: TrendingUp,
    title: "Gana más cada mes",
    desc: "Controla cada sol que entra. Panel simple diseñado para maximizar tus ingresos.",
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
              Convierte tus <span className="text-lime-400">horas muertas</span> en ingresos
            </h2>
            <p className="mt-3 max-w-lg text-sm font-semibold text-lime-300">
              Gratis para publicar • Gana en cada reserva • Sin comisión oculta
            </p>
            <div className="mt-5 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
              <p className="text-sm text-ink-100">
                💰 <span className="font-semibold">Propietarios promedian S/. 5,000/mes</span> monetizando sus horas ociosas
              </p>
            </div>
            <p className="mt-6 max-w-lg text-ink-300">
              Empieza sin costo. Tus clientes reservan y pagan adelantos online. Tú validas, gestionas y cobras todo desde un panel.
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
