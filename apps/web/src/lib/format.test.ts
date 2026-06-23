import { describe, it, expect } from "vitest";
import {
  limaWallClockToISO,
  addHoursISO,
  hoursBetween,
  formatPEN,
  initials,
} from "./format";

describe("limaWallClockToISO", () => {
  it("convierte reloj local de Lima (UTC-5) a UTC", () => {
    // 20:00 en Lima = 01:00 UTC del día siguiente
    expect(limaWallClockToISO("2026-06-25", "20:00")).toBe("2026-06-26T01:00:00.000Z");
  });
  it("medianoche local", () => {
    expect(limaWallClockToISO("2026-06-25", "00:00")).toBe("2026-06-25T05:00:00.000Z");
  });
});

describe("addHoursISO / hoursBetween", () => {
  it("suma horas fraccionarias", () => {
    const start = "2026-06-26T01:00:00.000Z";
    expect(addHoursISO(start, 1.5)).toBe("2026-06-26T02:30:00.000Z");
  });
  it("calcula la duración en horas", () => {
    expect(hoursBetween("2026-06-26T01:00:00.000Z", "2026-06-26T03:00:00.000Z")).toBe(2);
  });
});

describe("formatPEN", () => {
  it("formatea soles con símbolo S/", () => {
    const out = formatPEN(120).replace(/\s/g, " ");
    expect(out).toContain("S/");
    expect(out).toContain("120.00");
  });
});

describe("initials", () => {
  it("toma hasta dos iniciales", () => {
    expect(initials("Carlos Mendoza")).toBe("CM");
    expect(initials("Ana")).toBe("A");
    expect(initials("  juan  perez  ")).toBe("JP");
  });
});
