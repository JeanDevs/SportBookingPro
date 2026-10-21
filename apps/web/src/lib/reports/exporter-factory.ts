/**
 * Patrón FACTORY: centraliza la creación de la estrategia de exportación según
 * el formato pedido. El controlador solo conoce `ReportExporter`; las clases
 * concretas se registran aquí. Un formato desconocido es un error explícito.
 */
import type { ReportExporter } from "./report-exporter";
import { isReportFormat, type ReportFormat } from "./types";
import { CsvExporter } from "./csv-exporter";
import { ExcelExporter } from "./excel-exporter";
import { PdfExporter } from "./pdf-exporter";

export class UnsupportedFormatError extends Error {
  constructor(format: unknown) {
    super(`Formato de reporte no soportado: ${String(format)}. Usa pdf, xlsx o csv.`);
    this.name = "UnsupportedFormatError";
  }
}

export class ExporterFactory {
  private static readonly registry: Record<ReportFormat, () => ReportExporter> = {
    pdf: () => new PdfExporter(),
    xlsx: () => new ExcelExporter(),
    csv: () => new CsvExporter(),
  };

  static create(format: ReportFormat | string): ReportExporter {
    if (!isReportFormat(format)) throw new UnsupportedFormatError(format);
    return ExporterFactory.registry[format]();
  }

  static supportedFormats(): ReportFormat[] {
    return Object.keys(ExporterFactory.registry) as ReportFormat[];
  }
}

/** Atajo funcional de `ExporterFactory.create`. */
export function createExporter(format: ReportFormat | string): ReportExporter {
  return ExporterFactory.create(format);
}
