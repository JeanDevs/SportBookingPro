/**
 * Lógica pura de slots de reserva (testeable sin DB).
 * Un slot es una franja de 30 min con marca de disponibilidad.
 */
export interface SlotLike {
  start: string;
  end: string;
  available: boolean;
}

/**
 * Cuántos slots disponibles y CONTIGUOS hay a partir de `startIdx`.
 * Contiguo = el fin de un slot coincide con el inicio del siguiente (sin huecos,
 * p. ej. entre dos ventanas de atención).
 */
export function maxConsecutiveSlots(slots: SlotLike[], startIdx: number): number {
  let count = 0;
  for (let i = startIdx; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot || !slot.available) break;
    if (i > startIdx) {
      const prev = slots[i - 1];
      if (!prev || prev.end !== slot.start) break;
    }
    count++;
  }
  return count;
}
