import { describe, it, expect } from "vitest";
import { ExporterFactory, createExporter, UnsupportedFormatError } from "./exporter-factory";
import { CsvExporter, UTF8_BOM, neutralizeFormula } from "./csv-exporter";
import { ExcelExporter } from "./excel-exporter";
import { PdfExporter } from "./pdf-exporter";
import type { ReportData } from "./types";

const sample: ReportData = {
  title: "Reporte de prueba",
  subtitle: "Cochachi Club · Período del 01/10/2026 al 31/10/2026",
  generatedAt: "2026-10-20T19:30:00.000Z",
  columns: [
    { key: "fecha", label: "Fecha", type: "date" },
    { key: "cliente", label: "Cliente", type: "text" },
    { key: "reservas", label: "N° reservas", type: "number" },
    { key: "monto", label: "Monto total", type: "money" },
  ],
  rows: [
    { fecha: "2026-10-05T01:00:00.000Z", cliente: "Peña, José", reservas: 3, monto: 240 },
    { fecha: "2026-10-12", cliente: 'Club "Los Tigres"', reservas: 1, monto: 80.5 },
  ],
  totals: { fecha: "TOTAL", reservas: 4, monto: 320.5 },
};

describe("ExporterFactory", () => {
  it.each([
    ["pdf", PdfExporter, "application/pdf"],
    ["xlsx", ExcelExporter, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    ["csv", CsvExporter, "text/csv; charset=utf-8"],
  ] as const)("crea la estrategia de %s", (format, Klass, contentType) => {
    const exporter = ExporterFactory.create(format);
    expect(exporter).toBeInstanceOf(Klass);
    expect(exporter.format).toBe(format);
    expect(exporter.extension).toBe(format);
    expect(exporter.contentType).toBe(contentType);
  });

  it("createExporter es un atajo equivalente", () => {
    expect(createExporter("csv")).toBeInstanceOf(CsvExporter);
  });

  it("lanza con un formato inválido", () => {
    expect(() => ExporterFactory.create("docx")).toThrow(UnsupportedFormatError);
    expect(() => createExporter("")).toThrow(/no soportado/);
  });

  it("expone los formatos soportados", () => {
    expect(ExporterFactory.supportedFormats().sort()).toEqual(["csv", "pdf", "xlsx"]);
  });
});

describe("CsvExporter", () => {
  it("empieza con BOM UTF-8 y usa CRLF", async () => {
    const csv = await new CsvExporter().export(sample);
    expect(csv.startsWith(UTF8_BOM)).toBe(true);
    expect(csv).toContain("\r\n");
  });

  it("escribe encabezados con la moneda en las columnas de dinero", async () => {
    const csv = await new CsvExporter().export(sample);
    const header = csv.slice(UTF8_BOM.length).split("\r\n")[0];
    expect(header).toBe("Fecha,Cliente,N° reservas,Monto total (S/)");
  });

  it("escapa comas y comillas, fechas ISO de Lima y montos con 2 decimales", async () => {
    const lines = (await new CsvExporter().export(sample)).slice(1).split("\r\n");
    // 01:00 UTC del 5 = 20:00 del 4 en Lima.
    expect(lines[1]).toBe('2026-10-04,"Peña, José",3,240.00');
    expect(lines[2]).toBe('2026-10-12,"Club ""Los Tigres""",1,80.50');
    expect(lines[3]).toBe("TOTAL,,4,320.50");
  });

  it("admite `;` como separador", async () => {
    const csv = await new CsvExporter(";").export(sample);
    const lines = csv.slice(1).split("\r\n");
    expect(lines[0]).toBe("Fecha;Cliente;N° reservas;Monto total (S/)");
    expect(lines[1]).toBe("2026-10-04;Peña, José;3;240.00");
  });

  it("neutraliza fórmulas pero respeta teléfonos", () => {
    expect(neutralizeFormula("=HYPERLINK(\"x\")")).toBe("'=HYPERLINK(\"x\")");
    expect(neutralizeFormula("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(neutralizeFormula("+51 987 654 321")).toBe("+51 987 654 321");
    expect(neutralizeFormula("Ana Pérez")).toBe("Ana Pérez");
  });
});

describe("ExcelExporter", () => {
  it("devuelve un XLSX no vacío (firma ZIP 'PK')", async () => {
    const bytes = await new ExcelExporter().export(sample);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(1000);
    expect(String.fromCharCode(bytes[0]!, bytes[1]!)).toBe("PK");
  });

  it("también exporta un reporte sin filas", async () => {
    const bytes = await new ExcelExporter().export({ ...sample, rows: [] });
    expect(String.fromCharCode(bytes[0]!, bytes[1]!)).toBe("PK");
  });
});

describe("PdfExporter", () => {
  it("devuelve un PDF no vacío (firma '%PDF')", async () => {
    const bytes = await new PdfExporter().export(sample);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(1000);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
  });

  it("también exporta un reporte sin filas", async () => {
    const { totals: _omit, ...withoutTotals } = sample;
    const bytes = await new PdfExporter().export({ ...withoutTotals, rows: [] });
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
  });
});
