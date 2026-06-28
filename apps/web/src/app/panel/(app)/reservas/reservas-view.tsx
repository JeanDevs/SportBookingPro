"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, X, Wallet } from "lucide-react";
import {
  Button,
  Modal,
  Field,
  Input,
  Select,
  Badge,
  EmptyState,
  Alert,
} from "@/components/ui";
import {
  createReservation,
  cancelReservation,
  type OwnerReservation,
} from "@/services/reservations";
import { registerPayment } from "@/services/payments";
import { formatPEN, formatLimaRange, formatLimaDateLong } from "@/lib/format";
import {
  RESERVATION_STATUS_META,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_META,
  fieldTypeMeta,
  type PaymentMethod,
} from "@/lib/domain";

interface FieldOpt {
  id: string;
  name: string;
  type: Parameters<typeof fieldTypeMeta>[0];
  pricePerHour: number;
}

interface ReservasViewProps {
  date: string;
  reservations: OwnerReservation[];
  fields: FieldOpt[];
  customers: { id: string; name: string }[];
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const START_TIMES = Array.from({ length: 36 }, (_, i) => {
  const minutes = 6 * 60 + i * 30; // 06:00 → 23:30
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
});

const DURATIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4];

export function ReservasView({ date, reservations, fields, customers }: ReservasViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [payFor, setPayFor] = useState<OwnerReservation | null>(null);

  const go = (d: string) => router.push(`/panel/reservas?date=${d}`);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/80 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Calendario</p>
            <h1 className="font-display text-xl font-bold capitalize text-ink-50">
              {formatLimaDateLong(`${date}T12:00:00Z`)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-ink-700 bg-ink-900">
              <button
                onClick={() => go(shiftDate(date, -1))}
                className="grid h-10 w-10 place-items-center rounded-l-xl text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                aria-label="Día anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && go(e.target.value)}
                className="h-10 border-x border-ink-700 bg-transparent px-2 text-base sm:text-sm text-ink-100 outline-none"
              />
              <button
                onClick={() => go(shiftDate(date, 1))}
                className="grid h-10 w-10 place-items-center rounded-r-xl text-ink-300 hover:bg-ink-800 hover:text-ink-50"
                aria-label="Día siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              size="sm"
              disabled={fields.length === 0}
              title={fields.length === 0 ? "Crea una cancha primero" : undefined}
            >
              <Plus size={16} /> Nueva
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
        {reservations.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No hay reservas este día"
            description="Crea una reserva manual o espera las que entren desde el sitio público."
            action={
              fields.length > 0 ? (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus size={16} /> Nueva reserva
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {reservations.map((r) => {
              const meta = RESERVATION_STATUS_META[r.status];
              const type = r.fieldType ? fieldTypeMeta(r.fieldType) : null;
              const cancellable = r.status !== "CANCELLED" && r.status !== "COMPLETED";
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-700/70 bg-ink-850/80 p-4"
                >
                  <div className="w-32 shrink-0">
                    <p className="font-display text-base font-bold text-ink-50">
                      {formatLimaRange(r.startAt, r.endAt)}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-50">
                      {type ? `${type.emoji} ` : ""}
                      {r.fieldName}
                    </p>
                    <p className="truncate text-sm text-ink-400">
                      {r.customerName}
                      {r.customerPhone ? ` · ${r.customerPhone}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink-100">{formatPEN(r.totalAmount)}</p>
                    {r.depositStatus ? (
                      <p className="text-xs text-ink-400">
                        Adelanto: {PAYMENT_STATUS_META[r.depositStatus].label}
                      </p>
                    ) : null}
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => setPayFor(r)}>
                      <Wallet size={15} /> Cobrar
                    </Button>
                    {cancellable ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await cancelReservation(r.id);
                            router.refresh();
                          })
                        }
                        aria-label="Cancelar reserva"
                      >
                        <X size={15} />
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {createOpen ? (
        <CreateReservationModal
          date={date}
          fields={fields}
          customers={customers}
          onClose={() => setCreateOpen(false)}
          onDone={() => {
            setCreateOpen(false);
            router.refresh();
          }}
        />
      ) : null}

      {payFor ? (
        <RegisterPaymentModal
          reservation={payFor}
          onClose={() => setPayFor(null)}
          onDone={() => {
            setPayFor(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

function CreateReservationModal({
  date,
  fields,
  customers,
  onClose,
  onDone,
}: {
  date: string;
  fields: FieldOpt[];
  customers: { id: string; name: string }[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldId, setFieldId] = useState(fields[0]?.id ?? "");
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [startTime, setStartTime] = useState("19:00");
  const [hours, setHours] = useState(1);

  const field = useMemo(() => fields.find((f) => f.id === fieldId), [fields, fieldId]);
  const total = field ? field.pricePerHour * hours : 0;

  const submit = () => {
    setError("");
    if (!customerId) {
      setError("Primero registra un cliente en la sección Clientes.");
      return;
    }
    startTransition(async () => {
      const res = await createReservation({ fieldId, customerId, dateStr: date, startTime, hours });
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Nueva reserva"
      description="Reserva manual (mostrador). El sistema evita choques de horario."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending || !fieldId}>
            {isPending ? "Creando…" : "Crear reserva"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Cancha">
          <Select value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {fieldTypeMeta(f.type).label} · {f.name} ({formatPEN(f.pricePerHour)}/h)
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Cliente"
          hint={customers.length === 0 ? "No tienes clientes aún." : undefined}
        >
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.length === 0 ? <option value="">— sin clientes —</option> : null}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hora de inicio">
            <Select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {START_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Duración">
            <Select value={String(hours)} onChange={(e) => setHours(Number(e.target.value))}>
              {DURATIONS.map((h) => (
                <option key={h} value={h}>
                  {h} h
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3">
          <span className="text-sm text-ink-300">Total estimado</span>
          <span className="font-display text-lg font-bold text-lime-300">{formatPEN(total)}</span>
        </div>
        {error ? <Alert>{error}</Alert> : null}
      </div>
    </Modal>
  );
}

function RegisterPaymentModal({
  reservation,
  onClose,
  onDone,
}: {
  reservation: OwnerReservation;
  onClose: () => void;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [kind, setKind] = useState<"DEPOSIT" | "BALANCE">("DEPOSIT");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState(String(reservation.depositRequiredAmount || ""));

  const submit = () => {
    setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    startTransition(async () => {
      const res = await registerPayment({
        reservationId: reservation.id,
        kind,
        method,
        amount: value,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onDone();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar pago"
      description={`${reservation.fieldName} · ${reservation.customerName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Guardando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <Select value={kind} onChange={(e) => setKind(e.target.value as "DEPOSIT" | "BALANCE")}>
              <option value="DEPOSIT">Adelanto</option>
              <option value="BALANCE">Saldo</option>
            </Select>
          </Field>
          <Field label="Método">
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(PAYMENT_METHOD_META) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_META[m].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Monto (S/)">
          <Input
            type="number"
            min="0"
            step="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <p className="text-xs text-ink-400">
          Total de la reserva: {formatPEN(reservation.totalAmount)} · Adelanto sugerido:{" "}
          {formatPEN(reservation.depositRequiredAmount)}
        </p>
        {error ? <Alert>{error}</Alert> : null}
      </div>
    </Modal>
  );
}
