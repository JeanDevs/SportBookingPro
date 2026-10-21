import { jsPDF } from "jspdf";
import { autoTable, type CellInput } from "jspdf-autotable";
import { REPORT_BRAND, type ReportExporter } from "./report-exporter";
import { isNumericColumn, type ReportColumnType, type ReportData, type ReportRow } from "./types";
import { formatCell, formatGeneratedAt } from "./format-cell";

const LIME: [number, number, number] = [163, 230, 53]; // lime-400 (acento de marca)
const SLATE: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];
const TOTALS_FILL: [number, number, number] = [236, 252, 203];

/**
 * Estrategia PDF con jsPDF + jspdf-autotable: título, subtítulo con el período,
 * sello de generación, tabla paginada (encabezado repetido en cada hoja), fila de
 * totales al final y pie con la marca y "Página X de N". Usa las fuentes estándar
 * (Helvetica, Latin-1): cubren tildes, ñ y "°", sin incrustar fuentes.
 */
export class PdfExporter implements ReportExporter {
  readonly format = "pdf" as const;
  readonly contentType = "application/pdf";
  readonly extension = "pdf";

  async export(data: ReportData): Promise<Uint8Array> {
    // Más de 5 columnas no entran cómodas en vertical.
    const orientation = data.columns.length > 5 ? "landscape" : "portrait";
    const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    doc.setProperties({ title: data.title, subject: data.subtitle, creator: REPORT_BRAND });

    // Cabecera: barra de acento, título, subtítulo y fecha de generación.
    doc.setFillColor(...LIME);
    doc.rect(margin, 12, 18, 1.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...SLATE);
    doc.text(data.title, margin, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(data.subtitle, margin, 28);
    doc.setFontSize(8);
    doc.text(`Generado el ${formatGeneratedAt(data.generatedAt)} (hora de Lima)`, margin, 33);

    const align = (type: ReportColumnType) => (isNumericColumn(type) ? "right" : "left");
    const toCells = (row: ReportRow): CellInput[] =>
      data.columns.map((c) => formatCell(row[c.key] ?? null, c.type));

    autoTable(doc, {
      startY: 38,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [data.columns.map((c) => ({ content: c.label, styles: { halign: align(c.type) } }))],
      body: data.rows.length
        ? data.rows.map(toCells)
        : [[{ content: "Sin datos para el período seleccionado.", colSpan: data.columns.length }]],
      // `columnStyles` no alcanza al pie: la alineación va en cada celda.
      foot: data.totals
        ? [
            data.columns.map((c) => ({
              content: formatCell(data.totals?.[c.key] ?? null, c.type),
              styles: { halign: align(c.type) },
            })),
          ]
        : [],
      showFoot: "lastPage",
      theme: "striped",
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2, textColor: SLATE },
      headStyles: { fillColor: SLATE, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: TOTALS_FILL, textColor: SLATE, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: Object.fromEntries(
        data.columns.map((c, i) => [i, { halign: align(c.type) }]),
      ),
    });

    // Pie en todas las páginas (después de la tabla, para conocer el total de hojas).
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`${REPORT_BRAND} · ${data.title}`, margin, pageHeight - 7);
      doc.text(`Página ${i} de ${pages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
    }

    return new Uint8Array(doc.output("arraybuffer"));
  }
}
