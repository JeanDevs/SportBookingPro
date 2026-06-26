import { ChevronDown, ShieldCheck } from "lucide-react";

const FAQS = [
  {
    q: "¿Cómo aseguro mi reserva?",
    a: "Eliges cancha, día y hora, y subes el comprobante de tu adelanto (Yape, Plin o efectivo). El complejo lo valida y tu reserva queda confirmada.",
  },
  {
    q: "¿Qué pasa si rechazan mi adelanto?",
    a: "Si el comprobante no es válido, tu horario se libera automáticamente y puedes volver a intentarlo sin perder nada.",
  },
  {
    q: "¿Puedo reservar varias horas seguidas?",
    a: "Sí. Eliges la hora de inicio y la duración; el sistema arma el bloque y evita choques con otras reservas.",
  },
  {
    q: "¿Cómo pago?",
    a: "Por ahora el adelanto se paga por Yape, Plin o efectivo y se confirma con tu comprobante. El saldo lo pagas en el complejo.",
  },
  {
    q: "¿Necesito registrarme?",
    a: "Para reservar sí, solo con tu correo. Explorar complejos y ver disponibilidad es libre.",
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-ink-50 sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <p className="mt-2 text-ink-400">Todo lo que necesitas saber antes de reservar.</p>
      </div>
      <div className="mt-8 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-ink-800 bg-ink-850/60 p-5 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-100">
              {f.q}
              <ChevronDown
                size={18}
                className="shrink-0 text-ink-400 transition group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 text-sm text-ink-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Prueba social honesta: muestra los complejos reales ya publicados (sin logos falsos). */
export function SocialProof({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <section className="border-t border-ink-800">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="flex items-center justify-center gap-2 text-center text-sm font-semibold uppercase tracking-wide text-ink-400">
          <ShieldCheck size={16} className="text-lime-400" />
          Complejos que ya reciben reservas con SportBook Pro
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {names.map((name) => (
            <span
              key={name}
              className="rounded-xl border border-ink-700 bg-ink-850/80 px-4 py-2 font-display text-sm font-semibold text-ink-200"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
