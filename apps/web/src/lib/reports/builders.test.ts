import { describe, it, expect } from "vitest";
import {
  buildCustomersReport,
  buildIncomeReport,
  buildReservationsReport,
  type ReservationRecord,
} from "./builders";
import { currentMonthRange, parseExportQuery, parsePageQuery } from "./query";
import { validateRange } from "./types";

const ctx = {
  range: { from: "2026-10-01", to: "2026-10-31" },
  facilityName: "Cochachi Club",
  generatedAt: "2026-10-20T19:30:00.000Z",
};

const res = (over: Partial<ReservationRecord>): ReservationRecord => ({
  startAt: "2026-10-10T01:00:00.000Z",
  endAt: "2026-10-10T02:00:00.000Z",
  status: "PAID",
  totalAmount: 100,
  depositAmount: 30,
  fieldName: "Cancha 1 Grass",
  customerId: "c1",
  customerName: "Ana",
  customerPhone: "987654321",
  ...over,
});

describe("buildReservationsReport", () => {
  it("ordena por inicio, muestra horario de Lima y excluye canceladas de los totales", () => {
    const report = buildReservationsReport(
      [
        res({ startAt: "2026-10-12T00:00:00.000Z", endAt: "2026-10-12T02:00:00.000Z" }),
        res({ status: "CANCELLED", totalAmount: 500 }),
        res({ startAt: "2026-10-05T23:00:00.000Z", endAt: "2026-10-06T00:30:00.000Z" }),
      ],
      ctx,
    );
    expect(report.subtitle).toBe("Cochachi Club · Período del 01/10/2026 al 31/10/2026");
    expect(report.rows.map((r) => r.horario)).toEqual(["18:00 - 19:30", "20:00 - 21:00", "19:00 - 21:00"]);
    expect(report.rows[1]?.estado).toBe("Cancelada");
    expect(report.totals).toMatchObject({ total: 200, adelanto: 60 });
  });
});

describe("buildIncomeReport", () => {
  it("agrupa por cancha, separa adelantos/saldos y suma un total general", () => {
    const report = buildIncomeReport(
      [
        { fieldName: "Multicancha A", kind: "DEPOSIT", amount: 24 },
        { fieldName: "Cancha 1 Grass", kind: "DEPOSIT", amount: 36 },
        { fieldName: "Cancha 1 Grass", kind: "BALANCE", amount: 84.1 },
      ],
      ctx,
    );
    expect(report.rows).toEqual([
      { cancha: "Cancha 1 Grass", pagos: 2, adelantos: 36, saldos: 84.1, total: 120.1 },
      { cancha: "Multicancha A", pagos: 1, adelantos: 24, saldos: 0, total: 24 },
    ]);
    expect(report.totals).toEqual({
      cancha: "TOTAL GENERAL",
      pagos: 3,
      adelantos: 60,
      saldos: 84.1,
      total: 144.1,
    });
  });
});

describe("buildCustomersReport", () => {
  it("cuenta solo reservas efectivas y ordena por frecuencia y monto", () => {
    const report = buildCustomersReport(
      [
        res({ customerId: "c1", customerName: "Ana", totalAmount: 100 }),
        res({ customerId: "c2", customerName: "Beto", totalAmount: 90 }),
        res({ customerId: "c2", customerName: "Beto", totalAmount: 90, startAt: "2026-10-20T01:00:00.000Z" }),
        res({ customerId: "c3", customerName: "Caro", status: "CANCELLED" }),
      ],
      ctx,
    );
    expect(report.rows.map((r) => [r.cliente, r.reservas, r.monto, r.ultima])).toEqual([
      ["Beto", 2, 180, "2026-10-19"],
      ["Ana", 1, 100, "2026-10-09"],
    ]);
    expect(report.totals).toMatchObject({ reservas: 3, monto: 280 });
  });
});

describe("parámetros de reporte", () => {
  it("valida rangos", () => {
    expect(validateRange("2026-10-01", "2026-10-31")).toBeNull();
    expect(validateRange("2026-10-31", "2026-10-01")).toMatch(/posterior/);
    expect(validateRange("2026-02-30", "2026-03-01")).toMatch(/formato/);
    expect(validateRange("2025-01-01", "2026-10-01")).toMatch(/366/);
  });

  it("parseExportQuery exige tipo, formato y rango válidos", () => {
    expect(parseExportQuery({ tipo: "ingresos", formato: "xlsx", desde: "2026-10-01", hasta: "2026-10-31" })).toEqual({
      ok: true,
      type: "ingresos",
      format: "xlsx",
      range: { from: "2026-10-01", to: "2026-10-31" },
    });
    expect(parseExportQuery({ tipo: "ventas", formato: "pdf", desde: "2026-10-01", hasta: "2026-10-31" }).ok).toBe(false);
    expect(parseExportQuery({ tipo: "reservas", formato: "doc", desde: "2026-10-01", hasta: "2026-10-31" }).ok).toBe(false);
    expect(parseExportQuery({ tipo: "reservas", formato: "pdf" }).ok).toBe(false);
  });

  it("parsePageQuery cae al mes actual sin parámetros", () => {
    const parsed = parsePageQuery({});
    expect(parsed.type).toBe("reservas");
    expect(parsed.range).toEqual(currentMonthRange());
  });

  it("currentMonthRange cubre el mes completo", () => {
    expect(currentMonthRange("2026-10-20")).toEqual({ from: "2026-10-01", to: "2026-10-31" });
    expect(currentMonthRange("2028-02-10")).toEqual({ from: "2028-02-01", to: "2028-02-29" });
  });
});
