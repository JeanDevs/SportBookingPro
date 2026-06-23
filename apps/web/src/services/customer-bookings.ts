'use server';

import { createClient } from '../lib/supabase/server';
import {
  humanizeRpcError,
  type FieldType,
  type PaymentMethod,
  type PaymentStatus,
  type ReservationStatus,
} from '../lib/domain';

/**
 * Acciones del cliente final sobre sus reservas. Todo pasa por funciones
 * SECURITY DEFINER: `create_customer_booking`, `submit_customer_payment_proof`,
 * `my_customer_bookings`. La RLS del dueño no se toca.
 */

export interface CreateBookingInput {
  fieldId: string;
  startIso: string;
  endIso: string;
  notes?: string;
}

export interface CreateBookingResult {
  reservationId: string | null;
  error: string | null;
}

export async function createBooking({
  fieldId,
  startIso,
  endIso,
  notes,
}: CreateBookingInput): Promise<CreateBookingResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_customer_booking', {
    p_field_id: fieldId,
    p_start_at: startIso,
    p_end_at: endIso,
    p_notes: notes?.trim() || null,
  });
  if (error) return { reservationId: null, error: humanizeRpcError(error.message) };
  return { reservationId: String(data), error: null };
}

export interface SubmitProofInput {
  reservationId: string;
  method: PaymentMethod;
  proofUrl: string;
}

export async function submitProof({
  reservationId,
  method,
  proofUrl,
}: SubmitProofInput): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('submit_customer_payment_proof', {
    p_reservation_id: reservationId,
    p_method: method,
    p_proof_url: proofUrl,
  });
  if (error) return { error: humanizeRpcError(error.message) };
  return { error: null };
}

export interface CustomerBooking {
  id: string;
  facilityName: string;
  facilitySlug: string;
  fieldName: string;
  fieldType: FieldType;
  status: ReservationStatus;
  startAt: string;
  endAt: string;
  totalAmount: number;
  depositRequiredAmount: number;
  depositStatus: PaymentStatus | null;
}

export async function getMyBookings(): Promise<CustomerBooking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('my_customer_bookings');
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    facilityName: String(r.facility_name),
    facilitySlug: String(r.facility_slug),
    fieldName: String(r.field_name),
    fieldType: r.field_type as FieldType,
    status: r.status as ReservationStatus,
    startAt: String(r.start_at),
    endAt: String(r.end_at),
    totalAmount: Number(r.total_amount),
    depositRequiredAmount: Number(r.deposit_required_amount),
    depositStatus: (r.deposit_status as PaymentStatus) ?? null,
  }));
}
