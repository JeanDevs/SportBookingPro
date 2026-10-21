/**
 * Constructores PUROS de reportes: reciben registros ya leídos de la BD y arman
 * el DTO `ReportData` (columnas, filas ordenadas y totales). No tocan Supabase,
 * así se prueban sin red y se reutilizan para generar archivos de ejemplo. La
 * consulta y el filtrado por propietario (RLS) viven en `services/reports.ts`.
 */
import { RESERVATION_STATUS_META, type ReservationStatus } from "../domain";
import { formatLimaTime } from "../format";
import { formatRangeLabel, toLimaDateStr } from "./format-cell";
import type { ReportData, ReportRange, ReportRow } from "./types";

export interface ReportContext {
  range: ReportRange;
  /** Nombre del complejo para el subtítulo (opcional). */
  facilityName?: string | null;
  /** ISO del momento de generación; por defecto, ahora. */
  generatedAt?: string;
}

export interface ReservationRecord {
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  totalAmount: number;
  depositAmount: number;
  fieldName: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
}

export interface IncomePaymentRecord {
  fieldName: string;
  kind: "DEPOSIT" | "BALANCE";
  amount: number;
}

/** Estados que nunca llegaron a ser una reserva real (holds vencidos o sin enviar). */
export const NON_REPORTABLE_STATUSES: ReservationStatus[] = ["INTENT_CREATED", "EXPIRED"];

/** Reserva que cuenta para montos y frecuencia: no cancelada ni descartada. */
export function isEffectiveReservation(status: ReservationStatus): boolean {
  return status !== "CANCELLED" && !NON_REPORTABLE_STATUSES.includes(status);
}

/** Redondeo a céntimos para que las sumas de numeric no arrastren decimales binarios. */
const round2 = (n: number) => Math.round(n * 100) / 100;

function subtitle(ctx: ReportContext): string {
  const period = `Período ${formatRangeLabel(ctx.range.from, ctx.range.to)}`;
  return ctx.facilityName ? `${ctx.facilityName} · ${period}` : period;
}

function generatedAt(ctx: ReportContext): string {
  return ctx.generatedAt ?? new Date().toISOString();
}

/** Reporte `reservas`: una fila por reserva, ordenadas por inicio. Los totales
 * excluyen las canceladas (se listan para trazabilidad, pero no suman). */
export function buildReservationsReport(
  records: ReservationRecord[],
  ctx: ReportContext,
): ReportData {
  const sorted = [...records].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const effective = sorted.filter((r) => isEffectiveReservation(r.status));

  return {
    title: "Reporte de reservas",
    subtitle: subtitle(ctx),
    generatedAt: generatedAt(ctx),
    columns: [
      { key: "fecha", label: "Fecha", type: "date" },
      { key: "horario", label: "Horario", type: "text" },
      { key: "cancha", label: "Cancha", type: "text" },
      { key: "cliente", label: "Cliente", type: "text" },
      { key: "estado", label: "Estado", type: "text" },
      { key: "total", label: "Monto total", type: "money" },
      { key: "adelanto", label: "Adelanto", type: "money" },
    ],
    rows: sorted.map((r) => ({
      fecha: r.startAt,
      // Guion simple: las fuentes estándar del PDF no traen el guion largo.
      horario: `${formatLimaTime(r.startAt)} - ${formatLimaTime(r.endAt)}`,
      cancha: r.fieldName,
      cliente: r.customerName,
      estado: RESERVATION_STATUS_META[r.status]?.label ?? r.status,
      total: round2(r.totalAmount),
      adelanto: round2(r.depositAmount),
    })),
    totals: {
      fecha: "TOTAL",
      cliente: `${effective.length} reservas (sin canceladas)`,
      total: round2(effective.reduce((s, r) => s + r.totalAmount, 0)),
      adelanto: round2(effective.reduce((s, r) => s + r.depositAmount, 0)),
    },
  };
}

/** Reporte `ingresos`: pagos VALIDATED agrupados por cancha, de mayor a menor total. */
export function buildIncomeReport(payments: IncomePaymentRecord[], ctx: ReportContext): ReportData {
  const byField = new Map<string, { pagos: number; adelantos: number; saldos: number }>();
  for (const p of payments) {
    const acc = byField.get(p.fieldName) ?? { pagos: 0, adelantos: 0, saldos: 0 };
    acc.pagos += 1;
    if (p.kind === "DEPOSIT") acc.adelantos += p.amount;
    else acc.saldos += p.amount;
    byField.set(p.fieldName, acc);
  }

  const rows: ReportRow[] = [...byField.entries()]
    .map(([cancha, a]) => ({
      cancha,
      pagos: a.pagos,
      adelantos: round2(a.adelantos),
      saldos: round2(a.saldos),
      total: round2(a.adelantos + a.saldos),
    }))
    .sort((a, b) => b.total - a.total || a.cancha.localeCompare(b.cancha, "es"));

  const sum = (key: "pagos" | "adelantos" | "saldos" | "total") =>
    round2(rows.reduce((s, r) => s + Number(r[key]), 0));

  return {
    title: "Reporte de ingresos por cancha",
    subtitle: subtitle(ctx),
    generatedAt: generatedAt(ctx),
    columns: [
      { key: "cancha", label: "Cancha", type: "text" },
      { key: "pagos", label: "N° pagos", type: "number" },
      { key: "adelantos", label: "Total adelantos", type: "money" },
      { key: "saldos", label: "Total saldos", type: "money" },
      { key: "total", label: "Total", type: "money" },
    ],
    rows,
    totals: {
      cancha: "TOTAL GENERAL",
      pagos: sum("pagos"),
      adelantos: sum("adelantos"),
      saldos: sum("saldos"),
      total: sum("total"),
    },
  };
}

/** Reporte `clientes`: frecuencia y monto por cliente (solo reservas efectivas),
 * ordenado por n° de reservas y luego por monto, ambos descendentes. */
export function buildCustomersReport(records: ReservationRecord[], ctx: ReportContext): ReportData {
  const byCustomer = new Map<
    string,
    { cliente: string; telefono: string; reservas: number; monto: number; ultima: string }
  >();
  for (const r of records) {
    if (!isEffectiveReservation(r.status)) continue;
    const acc = byCustomer.get(r.customerId) ?? {
      cliente: r.customerName,
      telefono: r.customerPhone ?? "",
      reservas: 0,
      monto: 0,
      ultima: r.startAt,
    };
    acc.reservas += 1;
    acc.monto += r.totalAmount;
    if (r.startAt > acc.ultima) acc.ultima = r.startAt;
    byCustomer.set(r.customerId, acc);
  }

  const rows: ReportRow[] = [...byCustomer.values()]
    .sort(
      (a, b) =>
        b.reservas - a.reservas || b.monto - a.monto || a.cliente.localeCompare(b.cliente, "es"),
    )
    .map((c) => ({ ...c, monto: round2(c.monto), ultima: toLimaDateStr(c.ultima) }));

  return {
    title: "Reporte de clientes frecuentes",
    subtitle: subtitle(ctx),
    generatedAt: generatedAt(ctx),
    columns: [
      { key: "cliente", label: "Cliente", type: "text" },
      { key: "telefono", label: "Teléfono", type: "text" },
      { key: "reservas", label: "N° reservas", type: "number" },
      { key: "monto", label: "Monto total", type: "money" },
      { key: "ultima", label: "Última reserva", type: "date" },
    ],
    rows,
    totals: {
      cliente: `TOTAL (${rows.length} clientes)`,
      reservas: rows.reduce((s, r) => s + Number(r.reservas), 0),
      monto: round2(rows.reduce((s, r) => s + Number(r.monto), 0)),
    },
  };
}
