import { describe, it, expect } from "vitest";
import { maxConsecutiveSlots, type SlotLike } from "./slots";

function slot(start: string, end: string, available = true): SlotLike {
  return { start, end, available };
}

describe("maxConsecutiveSlots", () => {
  const a = slot("2026-06-26T01:00:00.000Z", "2026-06-26T01:30:00.000Z");
  const b = slot("2026-06-26T01:30:00.000Z", "2026-06-26T02:00:00.000Z");
  const c = slot("2026-06-26T02:00:00.000Z", "2026-06-26T02:30:00.000Z");

  it("cuenta slots contiguos y disponibles", () => {
    expect(maxConsecutiveSlots([a, b, c], 0)).toBe(3);
    expect(maxConsecutiveSlots([a, b, c], 1)).toBe(2);
  });

  it("se detiene en un slot no disponible", () => {
    const blocked = { ...b, available: false };
    expect(maxConsecutiveSlots([a, blocked, c], 0)).toBe(1);
  });

  it("se detiene ante un hueco temporal (no contiguo)", () => {
    const gap = slot("2026-06-26T03:00:00.000Z", "2026-06-26T03:30:00.000Z");
    expect(maxConsecutiveSlots([a, b, gap], 0)).toBe(2);
  });

  it("devuelve 0 si el slot inicial no está disponible", () => {
    expect(maxConsecutiveSlots([{ ...a, available: false }], 0)).toBe(0);
  });
});
