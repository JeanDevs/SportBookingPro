/**
 * Lectura y validación de los parámetros de reporte que llegan por URL
 * (`?tipo=&formato=&desde=&hasta=`). La comparten la página `/panel/reportes`
 * (con defaults amables) y el route handler de exportación (estricto → 400).
 */
import { limaDateInput } from "../format";
import {
  isReportFormat,
  isReportType,
  validateRange,
  type ReportFormat,
  type ReportRange,
  type ReportType,
} from "./types";

export type ReportQueryResult =
  | { ok: true; type: ReportType; format: ReportFormat; range: ReportRange }
  | { ok: false; error: string };

type Params = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Mes en curso de Lima, del día 1 al último día del mes. */
export function currentMonthRange(today: string = limaDateInput()): ReportRange {
  const [y, m] = today.split("-").map(Number) as [number, number];
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate(); // día 0 del mes siguiente
  const mm = String(m).padStart(2, "0");
  return { from: `${y}-${mm}-01`, to: `${y}-${mm}-${String(lastDay).padStart(2, "0")}` };
}

/** Validación estricta para el endpoint de exportación: todo obligatorio. */
export function parseExportQuery(params: Params): ReportQueryResult {
  const tipo = first(params.tipo);
  const formato = first(params.formato);
  const desde = first(params.desde);
  const hasta = first(params.hasta);

  if (!isReportType(tipo)) return { ok: false, error: "Parámetro 'tipo' inválido: usa reservas, ingresos o clientes." };
  if (!isReportFormat(formato)) return { ok: false, error: "Parámetro 'formato' inválido: usa pdf, xlsx o csv." };
  const rangeError = validateRange(desde, hasta);
  if (rangeError) return { ok: false, error: rangeError };

  return { ok: true, type: tipo, format: formato, range: { from: desde as string, to: hasta as string } };
}

/** Lectura tolerante para la página: lo ausente o inválido cae al default (reservas, mes actual). */
export function parsePageQuery(params: Params): { type: ReportType; range: ReportRange; error: string | null } {
  const tipo = first(params.tipo);
  const type: ReportType = isReportType(tipo) ? tipo : "reservas";
  const desde = first(params.desde);
  const hasta = first(params.hasta);
  if (desde === undefined && hasta === undefined) return { type, range: currentMonthRange(), error: null };

  const error = validateRange(desde, hasta);
  if (error) return { type, range: currentMonthRange(), error };
  return { type, range: { from: desde as string, to: hasta as string }, error: null };
}
