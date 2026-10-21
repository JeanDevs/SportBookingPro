import type { ReportExporter } from "./report-exporter";
import type { ReportCellValue, ReportColumn, ReportData } from "./types";
import { toLimaDateStr, isDateLike } from "./format-cell";

/** Byte Order Mark UTF-8: sin él, Excel abre el CSV como ANSI y rompe las tildes. */
export const UTF8_BOM = "﻿";

/**
 * Anti "CSV injection": los nombres los escriben los propios clientes, y una
 * celda que empieza con = + - @ Excel la evalúa como fórmula. Se antepone `'`
 * salvo a valores puramente numéricos/telefónicos ("+51 987 654 321"), inocuos.
 */
export function neutralizeFormula(value: string): string {
  if (/^[=+\-@\t\r]/.test(value) && !/^[+-]?[\d\s().-]+$/.test(value)) return `'${value}`;
  return value;
}

/**
 * Estrategia CSV (RFC 4180). Decisiones:
 *  - Separador `,` por defecto: es el estándar y en es-PE el decimal es el punto,
 *    así que no choca con los montos. Se puede pasar `;` al constructor si el
 *    Excel del usuario usa ese separador de listas (para Excel, mejor el .xlsx).
 *  - Montos como número plano con 2 decimales y sin "S/" (dato reutilizable); la
 *    moneda va en el encabezado: "Monto total (S/)".
 *  - Fechas como AAAA-MM-DD (ISO, ordenable y sin ambigüedad dd/mm vs mm/dd).
 *  - Fin de línea CRLF, como pide la RFC y espera Excel.
 * Solo exporta datos tabulares: título y subtítulo no van en el CSV.
 */
export class CsvExporter implements ReportExporter {
  readonly format = "csv" as const;
  readonly contentType = "text/csv; charset=utf-8";
  readonly extension = "csv";

  constructor(private readonly delimiter: "," | ";" = ",") {}

  async export(data: ReportData): Promise<string> {
    const header = data.columns.map((c) => this.escape(this.headerLabel(c)));
    const lines = [header.join(this.delimiter)];
    for (const row of data.rows) lines.push(this.line(data.columns, row));
    if (data.totals) lines.push(this.line(data.columns, data.totals));
    return UTF8_BOM + lines.join("\r\n") + "\r\n";
  }

  private headerLabel(column: ReportColumn): string {
    return column.type === "money" ? `${column.label} (S/)` : column.label;
  }

  private line(columns: ReportColumn[], row: Record<string, ReportCellValue>): string {
    return columns.map((c) => this.escape(this.cell(row[c.key] ?? null, c))).join(this.delimiter);
  }

  private cell(value: ReportCellValue, column: ReportColumn): string {
    if (value === null) return "";
    if (typeof value === "number") return column.type === "money" ? value.toFixed(2) : String(value);
    if (column.type === "date" && isDateLike(value)) return toLimaDateStr(value);
    return neutralizeFormula(value);
  }

  /** Entrecomilla si hay separador, comillas o saltos de línea; duplica las comillas. */
  escape(value: string): string {
    if (value.includes(this.delimiter) || /["\r\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
