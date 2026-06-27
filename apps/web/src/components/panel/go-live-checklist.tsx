"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Circle, Rocket, ExternalLink, Copy, PartyPopper } from "lucide-react";
import { publishFacility } from "@/services/settings";
import type { ActivationStatus } from "@/services/activation";
import { Button } from "@/components/ui";

/**
 * Checklist de activación (go-live) del dueño. Vive en el Dashboard y empuja al
 * complejo hasta `PUBLISHED`. Es la palanca de retención temprana B2B: un dueño
 * que no publica nunca recibe reservas y se va. El padre no lo renderiza cuando
 * el estado ya es `ACTIVATED` (recibió su primera reserva).
 */
export function GoLiveChecklist({ status }: { status: ActivationStatus }) {
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const publicUrl =
    status.slug && typeof window !== "undefined"
      ? `${window.location.origin}/c/${status.slug}`
      : status.slug
        ? `/c/${status.slug}`
        : "";

  const doPublish = () => {
    if (!status.facilityId) return;
    setError("");
    startTransition(async () => {
      const res = await publishFacility(status.facilityId!);
      if (res.error) {
        setError(res.error);
        return;
      }
      // El estado lo recalcula el server al refrescar; forzamos recarga simple.
      window.location.reload();
    });
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(
        publicUrl.startsWith("http") ? publicUrl : window.location.origin + publicUrl,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin clipboard: el enlace sigue visible */
    }
  };

  // Estado PUBLISHED (aún sin primera reserva): celebrar + invitar a compartir.
  if (status.isPublished) {
    return (
      <div className="mb-6 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-400/20 text-lime-300">
            <PartyPopper size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-lime-100">Tu complejo está publicado</p>
            <p className="mt-0.5 text-sm text-ink-200">
              Ya es visible en el marketplace. Comparte tu enlace para recibir tu primera reserva.
            </p>
            {publicUrl && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <code className="min-w-0 max-w-full truncate rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-1.5 text-xs text-ink-200">
                  {publicUrl}
                </code>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-2.5 py-1.5 text-xs font-semibold text-ink-200 hover:border-ink-600"
                >
                  <Copy size={13} /> {copied ? "Copiado" : "Copiar"}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-300 hover:text-lime-200"
                >
                  Ver página <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Crea tu complejo", done: status.hasFacility, href: null as string | null },
    { label: "Agrega una cancha activa", done: status.hasActiveField, href: "/panel/canchas" },
    { label: "Configura los horarios de atención", done: status.hasAvailability, href: "/panel/configuracion" },
    { label: "Publica tu complejo", done: status.isPublished, href: null },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <div className="mb-6 rounded-2xl border border-lime-400/25 bg-ink-900/60 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime-400/15 text-lime-300">
          <Rocket size={18} />
        </span>
        <div>
          <p className="font-semibold text-ink-50">Pon tu complejo en marcha</p>
          <p className="text-sm text-ink-400">
            Completa estos pasos para empezar a recibir reservas online ({completed}/{steps.length}).
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            {s.done ? (
              <Check size={16} className="shrink-0 text-lime-400" strokeWidth={3} />
            ) : (
              <Circle size={16} className="shrink-0 text-ink-600" />
            )}
            <span className={s.done ? "text-ink-400 line-through" : "text-ink-100"}>{s.label}</span>
            {!s.done && s.href && (
              <Link
                href={s.href}
                className="ml-auto text-xs font-semibold text-lime-300 hover:text-lime-200"
              >
                Configurar →
              </Link>
            )}
          </li>
        ))}
      </ul>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {status.canPublish ? (
        <Button className="mt-4 w-full sm:w-auto" onClick={doPublish} disabled={isPending}>
          {isPending ? "Publicando…" : "Publicar mi complejo 🚀"}
        </Button>
      ) : (
        <p className="mt-4 text-xs text-ink-500">
          Agrega una cancha activa con horario para poder publicar.
        </p>
      )}
    </div>
  );
}
