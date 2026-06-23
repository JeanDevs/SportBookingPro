'use server';

import { createClient } from '../lib/supabase/server';
import type { PaymentMethod, PaymentStatus } from '../lib/domain';

/**
 * Pagos del lado DUEÑO: registrar, validar y rechazar. Acceso por RLS
 * (`owner_id = auth.uid()`). Validar un adelanto confirma la reserva; validar el
 * saldo la marca como pagada (BR-043).
 */

export type PaymentKind = 'DEPOSIT' | 'BALANCE';

export interface OwnerPayment {
  id: string;
  reservationId: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  proofUrl: string | null;
  createdAt: string;
  fieldName: string;
  customerName: string;
  startAt: string | null;
}

interface PaymentRow {
  id: string;
  reservation_id: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number | string;
  proof_url: string | null;
  created_at: string;
}

export async function listPayments(): Promise<OwnerPayment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('id, reservation_id, kind, method, status, amount, proof_url, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  const rows = data as PaymentRow[];

  const resIds = [...new Set(rows.map((r) => r.reservation_id))];
  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, start_at, field_id, customer_id')
    .in('id', resIds);

  const fieldIds = [...new Set((reservations ?? []).map((r) => r.field_id as string))];
  const customerIds = [...new Set((reservations ?? []).map((r) => r.customer_id as string))];

  const [fieldsRes, customersRes] = await Promise.all([
    supabase.from('fields').select('id, name').in('id', fieldIds),
    supabase.from('customers').select('id, name').in('id', customerIds),
  ]);

  const fieldMap = new Map((fieldsRes.data ?? []).map((f) => [f.id as string, f.name as string]));
  const customerMap = new Map(
    (customersRes.data ?? []).map((c) => [c.id as string, c.name as string]),
  );
  const resMap = new Map(
    (reservations ?? []).map((r) => [
      r.id as string,
      r as { start_at: string; field_id: string; customer_id: string },
    ]),
  );

  return rows.map((p) => {
    const res = resMap.get(p.reservation_id);
    return {
      id: p.id,
      reservationId: p.reservation_id,
      kind: p.kind,
      method: p.method,
      status: p.status,
      amount: Number(p.amount),
      proofUrl: p.proof_url,
      createdAt: p.created_at,
      startAt: res?.start_at ?? null,
      fieldName: res ? (fieldMap.get(res.field_id) ?? 'Cancha') : 'Cancha',
      customerName: res ? (customerMap.get(res.customer_id) ?? 'Cliente') : 'Cliente',
    };
  });
}

async function advanceReservationAfterValidation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  reservationId: string,
  kind: PaymentKind,
): Promise<void> {
  if (kind === 'DEPOSIT') {
    await supabase
      .from('reservations')
      .update({ status: 'CONFIRMED' })
      .eq('id', reservationId)
      .in('status', ['INTENT_CREATED', 'AWAITING_DEPOSIT', 'PARTIALLY_PAID']);
  } else {
    await supabase.from('reservations').update({ status: 'PAID' }).eq('id', reservationId);
  }
}

export async function validatePayment(paymentId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión no válida.' };

  const { data: payment, error: fetchErr } = await supabase
    .from('payments')
    .select('id, reservation_id, kind, status')
    .eq('id', paymentId)
    .maybeSingle();
  if (fetchErr || !payment) return { error: 'No se encontró el pago.' };

  const { error } = await supabase
    .from('payments')
    .update({ status: 'VALIDATED', validated_by: user.id, validated_at: new Date().toISOString() })
    .eq('id', paymentId);
  if (error) return { error: 'No se pudo validar el pago.' };

  await advanceReservationAfterValidation(
    supabase,
    payment.reservation_id as string,
    payment.kind as PaymentKind,
  );
  return { error: null };
}

export async function rejectPayment(paymentId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('payments')
    .update({ status: 'REJECTED' })
    .eq('id', paymentId);
  if (error) return { error: 'No se pudo rechazar el pago.' };
  return { error: null };
}

export interface RegisterPaymentInput {
  reservationId: string;
  kind: PaymentKind;
  method: PaymentMethod;
  amount: number;
}

/** El dueño registra un pago ya recibido (p. ej. efectivo en caja): queda
 * VALIDATED al instante y avanza la reserva. */
export async function registerPayment(
  input: RegisterPaymentInput,
): Promise<{ error: string | null }> {
  const { reservationId, kind, method, amount } = input;
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Monto inválido.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión no válida.' };

  const { error } = await supabase.from('payments').insert({
    owner_id: user.id,
    reservation_id: reservationId,
    kind,
    method,
    status: 'VALIDATED',
    amount,
    validated_by: user.id,
    validated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un pago de ese tipo para la reserva.' };
    return { error: 'No se pudo registrar el pago.' };
  }

  await advanceReservationAfterValidation(supabase, reservationId, kind);
  return { error: null };
}
