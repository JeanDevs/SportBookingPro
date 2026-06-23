export type ClassValue = string | number | false | null | undefined;

/**
 * Combinador minimalista de clases (sin dependencias). Filtra valores falsy y
 * une con espacios. Para conflictos de utilidades, el último gana por orden.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
