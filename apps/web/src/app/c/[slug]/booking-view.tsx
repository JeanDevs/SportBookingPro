"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, Loader2, CalendarX2, CheckCircle2 } from "lucide-react";
import { getFieldSlots, type PublicField, type Slot } from "@/services/public-catalog";
import { createBooking } from "@/services/customer-bookings";
import { Button, Alert } from "@/components/ui";
import { formatPEN, formatLimaTime, formatLimaDateLong } from "@/lib/format";
import { fieldTypeMeta } from "@/lib/domain";
import { maxConsecutiveSlots } from "@/lib/slots";

interface BookingViewProps {
  slug: string;
  facilityName: string;
  depositPercentage: number;
  fields: PublicField[];
  isLoggedIn: boolean;
  today: string;
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function BookingView({
  slug,
  facilityName,
  depositPercentage,
  fields,
  isLoggedIn,
  today,
}: BookingViewProps) {
  const router = useRouter();
  const [fieldId, setFieldId] = useState(fields[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [startIdx, setStartIdx] = useState<number | null>(null);
  const [durationSlots, setDurationSlots] = useState(2);
  const [error, setError] = useState("");
  const [isBooking, startBooking] = useTransition();

  useEffect(() => {
    if (!fieldId) return;
    let active = true;
    setLoading(true);
    setStartIdx(null);
    setError("");
    getFieldSlots(fieldId, date)
      .then((s) => {
        if (active) setSlots(s);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fieldId, date]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => shiftDate(today, i)),
    [today],
  );

  const maxDur = startIdx == null ? 0 : maxConsecutiveSlots(slots, startIdx);
  const covered =
    startIdx == null ? [] : slots.slice(startIdx, startIdx + Math.min(durationSlots, maxDur));
  const total = covered.reduce((sum, s) => sum + s.pricePerHour * 0.5, 0);
  const deposit = Math.round((total * depositPercentage) / 100 * 100) / 100;

  const selectStart = (idx: number) => {
    setStartIdx(idx);
    setDurationSlots(Math.min(2, maxConsecutiveSlots(slots, idx)));
    setError("");
  };

  const reserve = () => {
    if (startIdx == null || covered.length === 0) return;
    const first = covered[0];
    const last = covered[covered.length - 1];
    if (!first || !last) return;
    setError("");
    startBooking(async () => {
      const res = await createBooking({ fieldId, startIso: first.start, endIso: last.end });
      if (res.error) {
        setError(res.error);
        // refrescamos slots por si el horario se ocupó
        getFieldSlots(fieldId, date).then(setSlots);
        setStartIdx(null);
        return;
      }
      router.push("/cuenta?nueva=1");
      router.refresh();
    });
  };

  if (fields.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <Alert tone="amber">Este complejo aún no tiene canchas disponibles.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_340px]">
      <div>
        {/* Canchas */}
        <h2 className="font-display text-lg font-semibold text-ink-50">Elige tu cancha</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {fields.map((f) => {
            const meta = fieldTypeMeta(f.type);
            const active = f.id === fieldId;
            return (
              <button
                key={f.id}
                onClick={() => setFieldId(f.id)}
                className={
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition " +
                  (active
                    ? "border-lime-400/50 bg-lime-400/15 text-lime-200"
                    : "border-ink-700 bg-ink-850 text-ink-200 hover:border-ink-600")
                }
              >
                <span>{meta.emoji}</span>
                {f.name}
                <span className="text-xs font-normal text-ink-400">{formatPEN(f.pricePerHour)}/h</span>
              </button>
            );
          })}
        </div>

        {/* Días */}
        <h2 className="mt-7 font-display text-lg font-semibold text-ink-50">Elige el día</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const active = d === date;
            const dd = new Date(`${d}T12:00:00Z`);
            const wd = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][dd.getUTCDay()];
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={
                  "flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 transition " +
                  (active
                    ? "border-lime-400/50 bg-lime-400/15 text-lime-200"
                    : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600")
                }
              >
                <span className="text-xs">{wd}</span>
                <span className="font-display text-lg font-bold">{d.slice(8, 10)}</span>
              </button>
            );
          })}
        </div>

        {/* Slots */}
        <h2 className="mt-7 font-display text-lg font-semibold text-ink-50">Elige la hora</h2>
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-ink-400">
              <Loader2 size={18} className="animate-spin" /> Cargando disponibilidad…
            </div>
          ) : slots.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-850/60 px-4 py-6 text-ink-400">
              <CalendarX2 size={18} /> No hay horarios configurados para este día.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {slots.map((s, idx) => {
                const selected =
                  startIdx != null && idx >= startIdx && idx < startIdx + covered.length;
                const isStart = idx === startIdx;
                return (
                  <button
                    key={s.start}
                    disabled={!s.available}
                    onClick={() => selectStart(idx)}
                    className={
                      "rounded-lg border px-2 py-2 text-sm font-semibold transition " +
                      (!s.available
                        ? "cursor-not-allowed border-ink-800 bg-ink-900/40 text-ink-600 line-through"
                        : selected
                          ? "border-lime-400 bg-lime-400 text-ink-950"
                          : "border-ink-700 bg-ink-850 text-ink-100 hover:border-lime-400/50")
                    }
                    title={isStart ? "Inicio" : undefined}
                  >
                    {formatLimaTime(s.start)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Resumen / checkout */}
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="rounded-2xl border border-ink-700/70 bg-ink-850/80 p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold text-ink-50">Tu reserva</h3>
          <p className="mt-1 text-sm text-ink-400">{facilityName}</p>

          {startIdx != null && covered.length > 0 ? (
            <>
              <div className="mt-4 rounded-xl border border-ink-700 bg-ink-900/60 p-4">
                <p className="text-sm capitalize text-ink-300">{formatLimaDateLong(`${date}T12:00:00Z`)}</p>
                <p className="mt-1 font-display text-xl font-bold text-ink-50">
                  {covered[0] ? formatLimaTime(covered[0].start) : ""} –{" "}
                  {covered[covered.length - 1] ? formatLimaTime(covered[covered.length - 1]!.end) : ""}
                </p>
                <p className="text-sm text-ink-400">
                  {(covered.length * 0.5).toFixed(1)} h · {fields.find((f) => f.id === fieldId)?.name}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-ink-300">Duración</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDurationSlots((d) => Math.max(1, d - 1))}
                    disabled={durationSlots <= 1}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-ink-200 hover:bg-ink-800 disabled:opacity-40"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-14 text-center text-sm font-semibold text-ink-100">
                    {(Math.min(durationSlots, maxDur) * 0.5).toFixed(1)} h
                  </span>
                  <button
                    onClick={() => setDurationSlots((d) => Math.min(maxDur, d + 1))}
                    disabled={durationSlots >= maxDur}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-ink-700 text-ink-200 hover:bg-ink-800 disabled:opacity-40"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-ink-800 pt-4 text-sm">
                <div className="flex justify-between text-ink-300">
                  <dt>Total</dt>
                  <dd className="font-semibold text-ink-50">{formatPEN(total)}</dd>
                </div>
                <div className="flex justify-between text-ink-300">
                  <dt>Adelanto ({depositPercentage}%)</dt>
                  <dd className="font-semibold text-lime-300">{formatPEN(deposit)}</dd>
                </div>
              </dl>

              {error ? (
                <div className="mt-4">
                  <Alert>{error}</Alert>
                </div>
              ) : null}

              {isLoggedIn ? (
                <Button className="mt-4 w-full" size="lg" onClick={reserve} disabled={isBooking}>
                  {isBooking ? "Reservando…" : "Reservar ahora"}
                </Button>
              ) : (
                <Link
                  href={`/ingresar?next=${encodeURIComponent(`/c/${slug}`)}`}
                  className="mt-4 block w-full rounded-xl bg-lime-400 px-6 py-3 text-center font-semibold text-ink-950 shadow-glow-sm hover:bg-lime-300"
                >
                  Inicia sesión para reservar
                </Link>
              )}
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
                <CheckCircle2 size={13} className="text-lime-400" />
                Aseguras tu horario enviando el adelanto.
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink-400">
              Selecciona una cancha, un día y una hora para ver el resumen y reservar.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
