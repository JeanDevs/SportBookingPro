/**
 * Vocabulario de dominio compartido por panel y portal: etiquetas, tonos y
 * metadatos legibles para los enums de la base de datos. Fuente única de verdad
 * para que un estado se vea igual en todas las pantallas.
 */
import type { BadgeTone } from "../components/ui/badge";

export type FieldType =
  | "FUTBOL_5"
  | "FUTBOL_6"
  | "FUTBOL_7"
  | "FUTBOL_8"
  | "FUTBOL_11"
  | "VOLEY"
  | "TENNIS"
  | "OTHER";

export type ReservationStatus =
  | "INTENT_CREATED"
  | "AWAITING_DEPOSIT"
  | "PARTIALLY_PAID"
  | "CONFIRMED"
  | "PAID"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentStatus =
  | "PENDING_VALIDATION"
  | "VALIDATED"
  | "REJECTED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "YAPE" | "PLIN";

export const FIELD_TYPE_META: Record<FieldType, { label: string; emoji: string }> = {
  FUTBOL_5: { label: "Fútbol 5", emoji: "⚽" },
  FUTBOL_6: { label: "Fútbol 6", emoji: "⚽" },
  FUTBOL_7: { label: "Fútbol 7", emoji: "⚽" },
  FUTBOL_8: { label: "Fútbol 8", emoji: "⚽" },
  FUTBOL_11: { label: "Fútbol 11", emoji: "⚽" },
  VOLEY: { label: "Vóley", emoji: "🏐" },
  TENNIS: { label: "Tenis", emoji: "🎾" },
  OTHER: { label: "Otro", emoji: "🏟️" },
};

export function fieldTypeMeta(type: FieldType) {
  return FIELD_TYPE_META[type] ?? FIELD_TYPE_META.OTHER;
}

export const RESERVATION_STATUS_META: Record<
  ReservationStatus,
  { label: string; tone: BadgeTone }
> = {
  INTENT_CREATED: { label: "Intención", tone: "ink" },
  AWAITING_DEPOSIT: { label: "Esperando adelanto", tone: "amber" },
  PARTIALLY_PAID: { label: "Adelanto pagado", tone: "sky" },
  CONFIRMED: { label: "Confirmada", tone: "lime" },
  PAID: { label: "Pagada", tone: "emerald" },
  COMPLETED: { label: "Completada", tone: "emerald" },
  CANCELLED: { label: "Cancelada", tone: "red" },
  EXPIRED: { label: "Expirada", tone: "ink" },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; tone: BadgeTone }
> = {
  PENDING_VALIDATION: { label: "Por validar", tone: "amber" },
  VALIDATED: { label: "Validado", tone: "emerald" },
  REJECTED: { label: "Rechazado", tone: "red" },
  CANCELLED: { label: "Cancelado", tone: "ink" },
};

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string; emoji: string }
> = {
  CASH: { label: "Efectivo", emoji: "💵" },
  YAPE: { label: "Yape", emoji: "📱" },
  PLIN: { label: "Plin", emoji: "📲" },
};

/** Domingo=0 … Sábado=6, alineado con `extract(dow)` de Postgres. */
export const WEEKDAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

export const WEEKDAYS_SHORT_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

/** Mensajes legibles para los errores que lanzan las RPC SECURITY DEFINER. */
export const RPC_ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Inicia sesión para continuar.",
  NOT_A_CUSTOMER: "Tu cuenta no es de cliente.",
  FIELD_UNAVAILABLE: "La cancha ya no está disponible.",
  FACILITY_UNAVAILABLE: "El complejo ya no está disponible.",
  SLOT_TAKEN: "Ese horario acaba de ser reservado. Elige otro.",
  SLOT_IN_PAST: "Ese horario ya pasó. Elige uno futuro.",
  INVALID_RANGE: "El rango de horas no es válido.",
  RESERVATION_NOT_FOUND: "No encontramos la reserva.",
  FORBIDDEN: "No puedes operar sobre esta reserva.",
  INVALID_STATE: "La reserva no admite esta acción.",
  PROOF_ALREADY_SUBMITTED: "Ya enviaste un comprobante para esta reserva.",
};

export function humanizeRpcError(message: string | undefined | null): string {
  if (!message) return "Ocurrió un error. Inténtalo de nuevo.";
  for (const [code, text] of Object.entries(RPC_ERROR_MESSAGES)) {
    if (message.includes(code)) return text;
  }
  return "Ocurrió un error. Inténtalo de nuevo.";
}
