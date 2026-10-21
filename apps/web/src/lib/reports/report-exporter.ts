/**
 * Patrón STRATEGY: cada formato de archivo es una estrategia intercambiable que
 * implementa `ReportExporter`. El controlador (route handler) no sabe cómo se
 * arma un PDF o un XLSX: pide la estrategia a `ExporterFactory` y llama a
 * `export(data)`. Agregar un formato nuevo = una clase nueva, sin tocar el resto.
 */
import type { ReportData, ReportFormat } from "./types";

export interface ReportExporter {
  readonly format: ReportFormat;
  /** MIME para el header `Content-Type` de la descarga. */
  readonly contentType: string;
  /** Extensión del archivo, sin punto. */
  readonly extension: string;
  /** Binario (PDF/XLSX) o texto (CSV). */
  export(data: ReportData): Promise<Uint8Array | string>;
}

/** Marca "producida por" que llevan los archivos exportados. */
export const REPORT_BRAND = "SportBook Pro";
