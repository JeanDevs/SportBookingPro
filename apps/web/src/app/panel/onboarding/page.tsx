"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Building2, Dumbbell, Rocket, ExternalLink, Copy } from "lucide-react";
import { createFacility } from "@/services/facilities";
import { createField } from "@/services/fields";
import { publishFacility } from "@/services/settings";
import { getActivationStatus, type ActivationStatus } from "@/services/activation";
import { FIELD_TYPE_META } from "@/lib/domain";
import type { FieldType } from "@/lib/domain";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";
import { formatPEN } from "@/lib/format";

type Step = 1 | 2 | 3;

const STEP_META: Record<Step, { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; subtitle: string; motivation: string }> = {
  1: {
    icon: Building2,
    title: "Crea tu complejo",
    subtitle: "Es el primer paso. En minutos estarás recibiendo reservas.",
    motivation: "Los complejos bien configurados reciben hasta 3x más reservas.",
  },
  2: {
    icon: Dumbbell,
    title: "Agrega tu primera cancha",
    subtitle: "Cada cancha es un flujo de ingresos independiente.",
    motivation: "Una cancha de fútbol 5 puede generarte S/. 1,500 por semana.",
  },
  3: {
    icon: Rocket,
    title: "Publica y empieza a recibir reservas",
    subtitle: "Un clic para que tu complejo aparezca en el marketplace.",
    motivation: "Un complejo sin publicar es invisible: nadie puede reservarlo todavía.",
  },
};

const FIELD_TYPES = Object.entries(FIELD_TYPE_META).map(([value, meta]) => ({
  value: value as FieldType,
  ...meta,
}));

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const n = (i + 1) as Step;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={
                "grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold transition-colors " +
                (done
                  ? "border-lime-400 bg-lime-400 text-ink-950"
                  : active
                    ? "border-lime-400 bg-transparent text-lime-300"
                    : "border-ink-700 bg-transparent text-ink-500")
              }
            >
              {done ? <Check size={13} strokeWidth={3} /> : n}
            </div>
            {i < total - 1 && (
              <div className={"h-px w-6 " + (n < current ? "bg-lime-400/60" : "bg-ink-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isPending, startTransition] = useTransition();

  // Step 1 state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Step 2 state
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("FUTBOL_5");
  const [pricePerHour, setPricePerHour] = useState("");

  const [error, setError] = useState("");

  const meta = STEP_META[step];
  const Icon = meta.icon;

  const submitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createFacility({ name, phone, address });
      if (res.error) return setError(res.error);
      setStep(2);
    });
  };

  const submitStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const price = parseFloat(pricePerHour);
    if (!fieldName.trim()) return setError("El nombre de la cancha es obligatorio.");
    if (isNaN(price) || price <= 0) return setError("Ingresa un precio válido por hora.");
    startTransition(async () => {
      // Sembramos el horario por defecto (L–D 08:00–23:00) para que la cancha
      // quede reservable y el complejo se pueda publicar en el paso 3.
      const res = await createField(
        { name: fieldName, type: fieldType, pricePerHour: price },
        { seedAvailability: true },
      );
      if (res.error) return setError(res.error);
      setStep(3);
    });
  };

  const skipStep2 = () => {
    setError("");
    setStep(3);
  };

  return (
    <AuthShell
      heroTitle="Bienvenido a SportBook Pro."
      heroSubtitle={meta.motivation}
      title={meta.title}
      subtitle={meta.subtitle}
    >
      <StepIndicator current={step} total={3} />

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-lime-400/20 bg-lime-400/5 px-4 py-3">
        <Icon size={18} className="shrink-0 text-lime-400" />
        <p className="text-sm text-lime-200">{meta.motivation}</p>
      </div>

      {step === 1 && (
        <form onSubmit={submitStep1} className="space-y-4">
          <Field label="Nombre del complejo">
            <Input
              placeholder="Ej. Complejo La Bombonera"
              autoComplete="organization"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Teléfono (opcional)">
            <Input
              type="tel"
              placeholder="Ej. 999 888 777"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Dirección (opcional)">
            <Input
              placeholder="Ej. Av. Siempre Viva 123"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </Field>
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Creando complejo…" : "Crear complejo y continuar →"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitStep2} className="space-y-4">
          <Field label="Nombre de la cancha">
            <Input
              placeholder="Ej. Cancha 1 — Grass Sintético"
              required
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </Field>
          <Field label="Tipo de cancha">
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((ft) => (
                <button
                  key={ft.value}
                  type="button"
                  onClick={() => setFieldType(ft.value)}
                  className={
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition " +
                    (fieldType === ft.value
                      ? "border-lime-400/50 bg-lime-400/10 text-lime-200"
                      : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600")
                  }
                >
                  <span>{ft.emoji}</span>
                  {ft.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Precio por hora (S/.)">
            <Input
              type="number"
              placeholder="Ej. 60"
              min="1"
              step="0.5"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
            />
            {pricePerHour && !isNaN(parseFloat(pricePerHour)) && parseFloat(pricePerHour) > 0 && (
              <p className="mt-1.5 text-xs text-ink-400">
                Eso es {formatPEN(parseFloat(pricePerHour) * 2)} por reserva de 2h — muy competitivo.
              </p>
            )}
          </Field>
          <p className="rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-xs text-ink-400">
            Le asignaremos un horario de atención por defecto (todos los días 08:00–23:00).
            Podrás ajustarlo luego en Configuración.
          </p>
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Guardando cancha…" : "Agregar cancha y continuar →"}
          </Button>
          <button
            type="button"
            onClick={skipStep2}
            className="w-full text-center text-sm text-ink-400 hover:text-ink-200"
          >
            Saltaré este paso por ahora
          </button>
        </form>
      )}

      {step === 3 && <PublishStep onBack={() => setStep(2)} onGoToPanel={() => { router.push("/panel"); router.refresh(); }} />}
    </AuthShell>
  );
}

/** Paso final accionable: publica el complejo (si ya es reservable) y entrega el
 * link público. Sustituye al antiguo checklist estático que dejaba al dueño sin
 * publicar (invisible en el marketplace). */
function PublishStep({ onBack, onGoToPanel }: { onBack: () => void; onGoToPanel: () => void }) {
  const [status, setStatus] = useState<ActivationStatus | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getActivationStatus().then(setStatus);
  }, []);

  const publicUrl =
    status?.slug && typeof window !== "undefined"
      ? `${window.location.origin}/c/${status.slug}`
      : "";

  const doPublish = () => {
    if (!status?.facilityId) return;
    setError("");
    startTransition(async () => {
      const res = await publishFacility(status.facilityId!);
      if (res.error) return setError(res.error);
      const fresh = await getActivationStatus();
      setStatus(fresh);
    });
  };

  const copyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible: el enlace sigue visible para copiar a mano */
    }
  };

  if (!status) {
    return <p className="py-8 text-center text-sm text-ink-400">Cargando…</p>;
  }

  // Ya publicado → éxito + link para compartir.
  if (status.isPublished) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 p-5">
          <p className="font-display text-lg font-bold text-lime-200">¡Tu complejo está publicado! 🎉</p>
          <p className="mt-1 text-sm text-ink-200">
            Ya aparece en el marketplace y cualquiera puede reservar. Comparte tu enlace por
            WhatsApp y redes para llenar tus horas.
          </p>
        </div>

        {publicUrl && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Tu enlace público
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-sm text-ink-200">
                {publicUrl}
              </code>
              <Button type="button" variant="outline" onClick={copyLink}>
                <Copy size={15} /> {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300 hover:text-lime-200"
            >
              Ver mi página pública <ExternalLink size={14} />
            </a>
          </div>
        )}

        <Button className="w-full" size="lg" onClick={onGoToPanel}>
          Ir al panel ahora →
        </Button>
      </div>
    );
  }

  // Listo para publicar (tiene cancha activa con horario).
  if (status.canPublish) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5">
          <p className="font-semibold text-ink-50">Todo listo para publicar</p>
          <ul className="mt-3 space-y-2.5">
            {[
              "Complejo creado",
              "Cancha activa con horario de atención",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink-300">
                <Check size={14} className="mt-0.5 shrink-0 text-lime-400" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-400">
            Al publicar, tu complejo aparece en el marketplace y empieza a recibir reservas online.
          </p>
        </div>
        {error ? <Alert>{error}</Alert> : null}
        <Button className="w-full" size="lg" onClick={doPublish} disabled={isPending}>
          {isPending ? "Publicando…" : "Publicar mi complejo 🚀"}
        </Button>
        <button
          type="button"
          onClick={onGoToPanel}
          className="w-full text-center text-sm text-ink-400 hover:text-ink-200"
        >
          Publicar más tarde, ir al panel
        </button>
      </div>
    );
  }

  // Falta una cancha (saltó el paso 2): no se puede publicar todavía.
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
        <p className="font-semibold text-amber-100">Te falta una cancha para publicar</p>
        <p className="mt-1 text-sm text-amber-200/80">
          Un complejo sin canchas no puede recibir reservas. Agrega tu primera cancha y podrás
          publicar en un clic.
        </p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Button className="w-full" size="lg" onClick={onBack}>
        ← Agregar mi primera cancha
      </Button>
      <button
        type="button"
        onClick={onGoToPanel}
        className="w-full text-center text-sm text-ink-400 hover:text-ink-200"
      >
        Lo haré después, ir al panel
      </button>
    </div>
  );
}
