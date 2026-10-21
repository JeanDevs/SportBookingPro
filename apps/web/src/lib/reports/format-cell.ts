/**
 * Formato legible de celdas de reporte según el tipo de columna. Lo comparten la
 * vista previa del panel y los exportadores de texto (PDF/CSV) para que un valor
 * se vea igual en pantalla y en el archivo. Todo en hora de Lima y soles (PEN).
 */
import { formatPEN, limaDateInput, formatLimaTime } from "../format";
import type { ReportCellValue, ReportColumnType } from "./types";

/** "S/ 1,234.50" con espacio normal (Intl usa NBSP, que algunos visores muestran raro). */
export function formatMoney(amount: number): string {
  return formatPEN(amount).replace(/\s/g, " ");
}

/** "YYYY-MM-DD" del día local de Lima: acepta ya "YYYY-MM-DD" o un ISO timestamptz. */
export function toLimaDateStr(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : limaDateInput(value);
}

/** "20/10/2026" (dd/mm/aaaa, convención peruana). */
export function formatReportDate(value: string): string {
  const [y, m, d] = toLimaDateStr(value).split("-");
  return `${d}/${m}/${y}`;
}

/** "20/10/2026 14:35" (hora de Lima), para el sello de generación. */
export function formatGeneratedAt(iso: string): string {
  return `${formatReportDate(iso)} ${formatLimaTime(iso)}`;
}

/** "del 01/10/2026 al 31/10/2026". */
export function formatRangeLabel(from: string, to: string): string {
  return `del ${formatReportDate(from)} al ${formatReportDate(to)}`;
}

/** ¿El string es una fecha formateable? (las filas de totales usan etiquetas como "TOTAL"). */
export function isDateLike(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/**
 * Texto de una celda. Solo se formatean valores del tipo esperado: un string en
 * una columna de dinero/fecha (p. ej. "TOTAL" en la fila de totales) se deja tal cual.
 */
export function formatCell(value: ReportCellValue, type: ReportColumnType): string {
  if (value === null || value === "") return "";
  if (typeof value === "number") {
    if (type === "money") return formatMoney(value);
    if (type === "number") return new Intl.NumberFormat("es-PE").format(value);
    return String(value);
  }
  if (type === "date" && isDateLike(value)) return formatReportDate(value);
  return value;
}
