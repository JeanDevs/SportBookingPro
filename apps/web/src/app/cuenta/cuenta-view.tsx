"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LogOut, Upload, Loader2, Search, CheckCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, Badge, Modal, Field, Select, Alert, EmptyState } from "@/components/ui";
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
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    startTransition(async () => {
      const res = await submitProof({
        reservationId: booking.id,
        method,
        proofUrl: "whatsapp-pending",
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  };

  if (done) {
    return (
      <Modal
        open
        onClose={onDone}
        title="¡Adelanto registrado!"
        description={`${booking.facilityName} · ${formatLimaRange(booking.startAt, booking.endAt)}`}
        footer={
          <Button onClick={onDone} className="w-full">
            Entendido
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle size={48} className="text-lime-400" />
          <p className="text-sm text-ink-300">
            Tu adelanto de{" "}
            <span className="font-semibold text-ink-100">{formatPEN(booking.depositRequiredAmount)}</span>{" "}
            fue registrado. El complejo lo validará en breve.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Confirmar adelanto"
      description={`${booking.facilityName} · ${formatLimaRange(booking.startAt, booking.endAt)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Confirmando…
              </>
            ) : (
              "Confirmar adelanto"
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
            Paga por Yape/Plin o en efectivo y envía el comprobante por WhatsApp al complejo.
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
        {error ? <Alert>{error}</Alert> : null}
      </div>
    </Modal>
  );
}
