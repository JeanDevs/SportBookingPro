/**
 * Utilidades de formato y de zona horaria. APP DEPORTE opera en `America/Lima`,
 * que NO tiene horario de verano: el offset es siempre UTC-05:00. Eso permite
 * construir timestamps locales de forma determinista sin librerías de fechas.
 */

export const LIMA_TZ = "America/Lima";
export const LIMA_OFFSET = "-05:00";

const penFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatPEN(amount: number): string {
  return penFormatter.format(amount).replace("PEN", "S/").trim();
}

function limaParts(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((p) => p.type === type)?.value ?? "";
}

function asDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** "20:00" (hora local de Lima). */
export function formatLimaTime(value: string | Date): string {
  const p = limaParts(asDate(value));
  return `${part(p, "hour")}:${part(p, "minute")}`;
}

/** "20:00 – 22:00". */
export function formatLimaRange(start: string | Date, end: string | Date): string {
  return `${formatLimaTime(start)} – ${formatLimaTime(end)}`;
}

/** "lun 23 jun". */
export function formatLimaDate(value: string | Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(asDate(value));
}

/** "lunes 23 de junio de 2026". */
export function formatLimaDateLong(value: string | Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(asDate(value));
}

/** "YYYY-MM-DD" en hora de Lima (para defaults de <input type=date>). */
export function limaDateInput(value: string | Date = new Date()): string {
  const p = limaParts(asDate(value));
  return `${part(p, "year")}-${part(p, "month")}-${part(p, "day")}`;
}

/**
 * Convierte un reloj de pared local de Lima (fecha "YYYY-MM-DD" + hora "HH:MM")
 * a un ISO timestamptz (UTC). Como Lima es UTC-05:00 fijo, basta anexar el offset.
 */
export function limaWallClockToISO(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00${LIMA_OFFSET}`).toISOString();
}

/** Suma horas (puede ser fraccionaria) a un ISO y devuelve ISO. */
export function addHoursISO(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString();
}

/** Diferencia en horas entre dos ISO. */
export function hoursBetween(startIso: string, endIso: string): number {
  return (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
