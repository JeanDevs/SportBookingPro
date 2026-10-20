import ExcelJS from "exceljs";
import { REPORT_BRAND, type ReportExporter } from "./report-exporter";
import { isNumericColumn, type ReportCellValue, type ReportColumn, type ReportData } from "./types";
import { formatCell, formatGeneratedAt, isDateLike, toLimaDateStr } from "./format-cell";

/** Formatos numéricos de Excel (los ve el usuario al abrir el archivo). */
const NUM_FMT: Record<ReportColumn["type"], string | undefined> = {
  money: '"S/" #,##0.00',
  number: "#,##0",
  date: "dd/mm/yyyy",
  text: undefined,
};

const HEADER_FILL = "FF1E293B"; // slate oscuro, legible al imprimir
const TOTALS_FILL = "FFECFCCB"; // lima claro (acento de marca)

/**
 * Estrategia Excel (.xlsx) con exceljs: título y subtítulo combinados, encabezado
 * con estilo y autofiltro, celdas tipadas (moneda S/, fecha, número) para que el
 * usuario pueda sumar/ordenar en Excel, anchos de columna según el contenido y
 * fila de totales resaltada.
 */
export class ExcelExporter implements ReportExporter {
  readonly format = "xlsx" as const;
  readonly contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  readonly extension = "xlsx";

  async export(data: ReportData): Promise<Uint8Array> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = REPORT_BRAND;
    workbook.created = new Date(data.generatedAt);

    const sheet = workbook.addWorksheet("Reporte", {
      pageSetup: { orientation: data.columns.length > 5 ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });
    const lastCol = data.columns.length;

    // Encabezado del documento (filas 1-3) y una fila en blanco.
    const banner = [
      { text: data.title, font: { bold: true, size: 14 } },
      { text: data.subtitle, font: { size: 11, color: { argb: "FF475569" } } },
      {
        text: `Generado el ${formatGeneratedAt(data.generatedAt)} · ${REPORT_BRAND}`,
        font: { size: 9, italic: true, color: { argb: "FF64748B" } },
      },
    ];
    banner.forEach((b, i) => {
      const row = sheet.getRow(i + 1);
      row.getCell(1).value = b.text;
      row.getCell(1).font = b.font;
      sheet.mergeCells(i + 1, 1, i + 1, lastCol);
    });
    const headerRowNumber = banner.length + 2;

    // Encabezado de la tabla.
    const header = sheet.getRow(headerRowNumber);
    data.columns.forEach((col, i) => {
      const cell = header.getCell(i + 1);
      cell.value = col.label;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
      cell.alignment = { vertical: "middle", horizontal: isNumericColumn(col.type) ? "right" : "left" };
    });
    header.height = 20;

    // Filas de datos.
    data.rows.forEach((row, r) => this.writeRow(sheet.getRow(headerRowNumber + 1 + r), data.columns, row));

    // Fila de totales.
    if (data.totals) {
      const totalsRow = sheet.getRow(headerRowNumber + 1 + data.rows.length);
      this.writeRow(totalsRow, data.columns, data.totals);
      totalsRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber > lastCol) return;
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TOTALS_FILL } };
        cell.border = { top: { style: "thin", color: { argb: "FF334155" } } };
      });
    }

    // Anchos según el texto más largo (formateado) de cada columna.
    data.columns.forEach((col, i) => {
      const values = [...data.rows, ...(data.totals ? [data.totals] : [])].map(
        (row) => formatCell(row[col.key] ?? null, col.type).length,
      );
      sheet.getColumn(i + 1).width = Math.min(Math.max(col.label.length, ...values) + 3, 50);
    });

    sheet.views = [{ state: "frozen", ySplit: headerRowNumber }];
    if (data.rows.length > 0) {
      sheet.autoFilter = {
        from: { row: headerRowNumber, column: 1 },
        to: { row: headerRowNumber + data.rows.length, column: lastCol },
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer as ArrayBuffer);
  }

  private writeRow(row: ExcelJS.Row, columns: ReportColumn[], values: Record<string, ReportCellValue>) {
    columns.forEach((col, i) => {
      const cell = row.getCell(i + 1);
      cell.value = this.cellValue(values[col.key] ?? null, col);
      const numFmt = NUM_FMT[col.type];
      if (numFmt && typeof cell.value !== "string") cell.numFmt = numFmt;
      if (isNumericColumn(col.type)) cell.alignment = { horizontal: "right" };
    });
  }

  /** Número/fecha nativos de Excel; las fechas como día local de Lima a medianoche UTC
   * (Excel no maneja zonas: así el día mostrado es siempre el de Lima). */
  private cellValue(value: ReportCellValue, col: ReportColumn): ExcelJS.CellValue {
    if (value === null) return null;
    if (col.type === "date" && typeof value === "string" && isDateLike(value)) {
      const [y, m, d] = toLimaDateStr(value).split("-").map(Number);
      return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
    }
    return value;
  }
}
