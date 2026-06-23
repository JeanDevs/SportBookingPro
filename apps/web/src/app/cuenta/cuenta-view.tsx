"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LogOut, Upload, Loader2, Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, Badge, Modal, Field, Select, Alert, EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { submitProof, type CustomerBooking } from "@/services/customer-bookings";
import { signOutCustomer } from "@/services/customer-auth";
import { formatPEN, formatLimaDateLong, formatLimaRange } from "@/lib/format";
import {
  RESERVATION_STATUS_META,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_META,
  fieldTypeMeta,
  type PaymentMethod,
} from "@/lib/domain";

export function CuentaView({ bookings, name }: { bookings: CustomerBooking[]; name: string }) {
  const router = useRouter();
  const [proofFor, setProofFor] = useState<CustomerBooking | null>(null);
  const [justBooked, setJustBooked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJustBooked(new URLSearchParams(window.location.search).get("nueva") === "1");
    }
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-300 hover:text-ink-50 sm:inline-flex sm:items-center sm:gap-1.5"
            >
              <Search size={15} /> Explorar
            </Link>
            <button
              onClick={() => void signOutCustomer()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <h1 className="font-display text-2xl font-bold text-ink-50">Hola, {name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-ink-400">Tus reservas y su estado.</p>

        {justBooked ? (
          <div className="mt-5">
            <Alert tone="lime">
              ¡Reserva creada! Envía tu adelanto para asegurar tu horario antes de que expire.
            </Alert>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {bookings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Todavía no tienes reservas"
              description="Explora los complejos y reserva tu primera cancha."
              action={
                <Link href="/">
                  <Button>
                    <Search size={16} /> Explorar canchas
                  </Button>
                </Link>
              }
            />
          ) : (
            bookings.map((b) => {
              const meta = RESERVATION_STATUS_META[b.status];
              const type = fieldTypeMeta(b.fieldType);
              const needsDeposit =
                (b.status === "AWAITING_DEPOSIT" || b.status === "INTENT_CREATED") &&
                b.depositStatus == null;
              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-ink-700/70 bg-ink-850/80 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-ink-50">
                        {b.facilityName}
                      </p>
                      <p className="text-sm text-ink-400">
                        {type.emoji} {b.fieldName}
                      </p>
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <div className="mt-3 border-t border-ink-800 pt-3 text-sm">
                    <p className="capitalize text-ink-200">{formatLimaDateLong(b.startAt)}</p>
                    <p className="font-display text-base font-bold text-ink-50">
                      {formatLimaRange(b.startAt, b.endAt)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-ink-300">
                      Total {formatPEN(b.totalAmount)} · Adelanto {formatPEN(b.depositRequiredAmount)}
                    </div>
                    {needsDeposit ? (
                      <Button size="sm" onClick={() => setProofFor(b)}>
                        <Upload size={15} /> Enviar adelanto
                      </Button>
                    ) : b.depositStatus ? (
                      <Badge tone={PAYMENT_STATUS_META[b.depositStatus].tone}>
                        Adelanto: {PAYMENT_STATUS_META[b.depositStatus].label}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {proofFor ? (
        <ProofModal
          booking={proofFor}
          onClose={() => setProofFor(null)}
          onDone={() => {
            setProofFor(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function ProofModal({
  booking,
  onClose,
  onDone,
}: {
  booking: CustomerBooking;
  onClose: () => void;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<PaymentMethod>("YAPE");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    if (!file) return setError("Adjunta una imagen del comprobante.");
    if (!file.type.startsWith("image/")) return setError("El comprobante debe ser una imagen.");
    if (file.size > 5 * 1024 * 1024) return setError("La imagen no debe superar 5 MB.");

    startTransition(async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Tu sesión expiró. Inicia sesión de nuevo.");
          return;
        }
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${user.id}/${booking.id}-${file.size}.${ext}`;
        const up = await supabase.storage
          .from("payment-proofs")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (up.error) {
          setError("No se pudo subir la imagen. Inténtalo de nuevo.");
          return;
        }
        const { data: pub } = supabase.storage.from("payment-proofs").getPublicUrl(path);
        const res = await submitProof({
          reservationId: booking.id,
          method,
          proofUrl: pub.publicUrl,
        });
        if (res.error) {
          setError(res.error);
          return;
        }
        onDone();
      } catch {
        setError("Ocurrió un error al enviar el comprobante.");
      }
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Enviar adelanto"
      description={`${booking.facilityName} · ${formatLimaRange(booking.startAt, booking.endAt)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Enviando…
              </>
            ) : (
              "Enviar comprobante"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-lime-400/25 bg-lime-400/10 px-4 py-3">
          <p className="text-sm text-lime-100">
            Adelanto a pagar:{" "}
            <span className="font-display font-bold">{formatPEN(booking.depositRequiredAmount)}</span>
          </p>
          <p className="mt-0.5 text-xs text-lime-200/70">
            Paga por Yape/Plin o en efectivo y sube tu comprobante. El complejo lo validará.
          </p>
        </div>
        <Field label="Método de pago">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {(Object.keys(PAYMENT_METHOD_META) as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_META[m].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Comprobante (imagen)">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink-300 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink-100 hover:file:bg-ink-600"
          />
        </Field>
        {error ? <Alert>{error}</Alert> : null}
      </div>
    </Modal>
  );
}
