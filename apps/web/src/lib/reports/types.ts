/**
 * Contrato de datos del módulo de reportes. `ReportData` es el DTO genérico que
 * produce la capa de servicio (Modelo) y que consumen por igual la vista previa
 * (Vista) y los exportadores (Strategy). Ningún exportador conoce de Supabase ni
 * de un reporte en particular: solo de columnas tipadas y filas.
 *
 * Este archivo no importa librerías pesadas para que el Client Component pueda
 * usar tipos y constantes sin arrastrar exceljs/jspdf al bundle del navegador.
 */

export type ReportType = "reservas" | "ingresos" | "clientes";
export type ReportFormat = "pdf" | "xlsx" | "csv";
export type ReportColumnType = "text" | "money" | "date" | "number";

/** Valor de una celda. Las fechas viajan como ISO (timestamptz) o "YYYY-MM-DD". */
export type ReportCellValue = string | number | null;
export type ReportRow = Record<string, ReportCellValue>;

export interface ReportColumn {
  key: string;
  label: string;
  type: ReportColumnType;
}

export interface ReportData {
  title: string;
  subtitle: string;
  /** ISO del momento de generación. */
  generatedAt: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Fila de totales alineada a `columns` (claves ausentes = celda vacía). */
  totals?: ReportRow;
}

/** Rango de fechas local de Lima, ambos extremos inclusive ("YYYY-MM-DD"). */
export interface ReportRange {
  from: string;
  to: string;
}

export const REPORT_TYPES: Record<ReportType, { label: string; description: string }> = {
  reservas: {
    label: "Reservas del período",
    description: "Detalle de cada reserva con horario, cancha, cliente, estado y montos.",
  },
  ingresos: {
    label: "Ingresos por cancha",
    description: "Pagos validados agrupados por cancha: adelantos, saldos y total.",
  },
  clientes: {
    label: "Clientes frecuentes",
    description: "Clientes ordenados por número de reservas y monto en el período.",
  },
};

export const REPORT_FORMATS: Record<ReportFormat, { label: string }> = {
  pdf: { label: "PDF" },
  xlsx: { label: "Excel" },
  csv: { label: "CSV" },
};

/** Rango máximo permitido por reporte (evita consultas desmedidas). */
export const MAX_RANGE_DAYS = 366;

export function isReportType(value: unknown): value is ReportType {
  return typeof value === "string" && value in REPORT_TYPES;
}

export function isReportFormat(value: unknown): value is ReportFormat {
  return typeof value === "string" && value in REPORT_FORMATS;
}

/** Valida "YYYY-MM-DD" y que sea una fecha real del calendario (rechaza 2026-02-30). */
export function isDateStr(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Días calendario entre dos "YYYY-MM-DD" (to - from). */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) /
      86_400_000,
  );
}

/** Valida un rango: fechas reales, `from <= to` y dentro de MAX_RANGE_DAYS. */
export function validateRange(from: unknown, to: unknown): string | null {
  if (!isDateStr(from) || !isDateStr(to)) return "Las fechas deben tener el formato AAAA-MM-DD.";
  const days = daysBetween(from, to);
  if (days < 0) return "La fecha 'desde' no puede ser posterior a 'hasta'.";
  if (days >= MAX_RANGE_DAYS) return `El rango no puede superar ${MAX_RANGE_DAYS} días.`;
  return null;
}

/** Nombre de archivo de descarga: reporte-<tipo>-<desde>_<hasta>.<ext>. */
export function reportFileName(type: ReportType, range: ReportRange, extension: string): string {
  return `reporte-${type}-${range.from}_${range.to}.${extension}`;
}

/** Montos y cantidades se alinean a la derecha; texto y fechas, a la izquierda. */
export function isNumericColumn(type: ReportColumnType): boolean {
  return type === "money" || type === "number";
}
