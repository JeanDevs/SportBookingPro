'use server';

import { createClient } from '../lib/supabase/server';
import { addHoursISO, limaWallClockToISO } from '../lib/format';
import type { FieldType, PaymentStatus, ReservationStatus } from '../lib/domain';

/**
 * Reservas del lado DUEÑO. Acceso directo a la tabla `reservations` vía RLS
 * (`owner_id = auth.uid()`). El anti-solapamiento lo garantiza el constraint de
 * exclusión GiST; la ventana de atención y la propiedad, el trigger
 * `validate_reservation_business_rules`. Aquí solo orquestamos.
 */

export interface OwnerReservation {
  id: string;
  status: ReservationStatus;
  startAt: string;
  endAt: string;
  totalAmount: number;
  depositRequiredAmount: number;
  fieldId: string;
  fieldName: string;
  fieldType: FieldType | null;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  depositStatus: PaymentStatus | null;
}

const RES_COLUMNS =
  'id, status, start_at, end_at, total_amount, deposit_required_amount, field_id, customer_id';

interface ResRow {
  id: string;
  status: ReservationStatus;
  start_at: string;
  end_at: string;
  total_amount: number | string;
  deposit_required_amount: number | string;
  field_id: string;
  customer_id: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Enriquecemos las reservas con cancha, cliente y estado del adelanto en TS
 * (evita el embedding de PostgREST con FKs compuestas). */
async function enrich(
  supabase: SupabaseServerClient,
  rows: ResRow[],
): Promise<OwnerReservation[]> {
  if (rows.length === 0) return [];

  const fieldIds = [...new Set(rows.map((r) => r.field_id))];
  const customerIds = [...new Set(rows.map((r) => r.customer_id))];
  const resIds = rows.map((r) => r.id);

  const [fieldsRes, customersRes, paymentsRes] = await Promise.all([
    supabase.from('fields').select('id, name, type').in('id', fieldIds),
    supabase.from('customers').select('id, name, phone').in('id', customerIds),
    supabase
      .from('payments')
      .select('reservation_id, kind, status, created_at')
      .in('reservation_id', resIds),
  ]);

  const fieldMap = new Map(
    (fieldsRes.data ?? []).map((f) => [f.id as string, f as { name: string; type: FieldType }]),
  );
  const customerMap = new Map(
    (customersRes.data ?? []).map((c) => [
      c.id as string,
      c as { name: string; phone: string | null },
    ]),
  );

  const depositByRes = new Map<string, PaymentStatus>();
  for (const p of (paymentsRes.data ?? []) as {
    reservation_id: string;
    kind: string;
    status: PaymentStatus;
  }[]) {
    if (p.kind === 'DEPOSIT' && p.status !== 'REJECTED' && p.status !== 'CANCELLED') {
      depositByRes.set(p.reservation_id, p.status);
    }
  }

  return rows.map((r) => {
    const field = fieldMap.get(r.field_id);
    const customer = customerMap.get(r.customer_id);
    return {
      id: r.id,
      status: r.status,
      startAt: r.start_at,
      endAt: r.end_at,
      totalAmount: Number(r.total_amount),
      depositRequiredAmount: Number(r.deposit_required_amount),
      fieldId: r.field_id,
      fieldName: field?.name ?? 'Cancha',
      fieldType: field?.type ?? null,
      customerId: r.customer_id,
      customerName: customer?.name ?? 'Cliente',
      customerPhone: customer?.phone ?? null,
      depositStatus: depositByRes.get(r.id) ?? null,
    };
  });
}

/** Reservas activas de un día local (YYYY-MM-DD), ordenadas por hora. */
export async function listDayReservations(dateStr: string): Promise<OwnerReservation[]> {
  const supabase = await createClient();
  const startIso = limaWallClockToISO(dateStr, '00:00');
  const endIso = addHoursISO(startIso, 24);

  const { data, error } = await supabase
    .from('reservations')
    .select(RES_COLUMNS)
    .gte('start_at', startIso)
    .lt('start_at', endIso)
    .not('status', 'in', '("CANCELLED","EXPIRED")')
    .order('start_at', { ascending: true });

  if (error || !data) return [];
  return enrich(supabase, data as ResRow[]);
}

/** Próximas reservas (para el dashboard). */
export async function listUpcomingReservations(limit = 6): Promise<OwnerReservation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reservations')
    .select(RES_COLUMNS)
    .gte('end_at', new Date().toISOString())
    .not('status', 'in', '("CANCELLED","EXPIRED")')
    .order('start_at', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return enrich(supabase, data as ResRow[]);
}

export interface CreateReservationInput {
  fieldId: string;
  customerId: string;
  dateStr: string; // YYYY-MM-DD (Lima)
  startTime: string; // HH:MM (Lima)
  hours: number;
  notes?: string;
}

export async function createReservation(
  input: CreateReservationInput,
): Promise<{ error: string | null }> {
  const { fieldId, customerId, dateStr, startTime, hours, notes } = input;
  if (!fieldId || !customerId) return { error: 'Elige cancha y cliente.' };
  if (!Number.isFinite(hours) || hours <= 0) return { error: 'Duración inválida.' };

  const startIso = limaWallClockToISO(dateStr, startTime);
  const endIso = addHoursISO(startIso, hours);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión no válida.' };

  const { data: field } = await supabase
    .from('fields')
    .select('facility_id, price_per_hour, status')
    .eq('id', fieldId)
    .maybeSingle();
  if (!field || field.status !== 'ACTIVE') {
    return { error: 'La cancha no está activa.' };
  }

  const { data: facility } = await supabase
    .from('facilities')
    .select('deposit_percentage')
    .eq('id', field.facility_id)
    .maybeSingle();

  const pricePerHour = Number(field.price_per_hour);
  const total = Math.round(pricePerHour * hours * 100) / 100;
  const depositPct = Number(facility?.deposit_percentage ?? 30);
  const deposit = Math.round((total * depositPct) / 100 * 100) / 100;

  const { error } = await supabase.from('reservations').insert({
    owner_id: user.id,
    facility_id: field.facility_id,
    field_id: fieldId,
    customer_id: customerId,
    status: 'CONFIRMED',
    start_at: startIso,
    end_at: endIso,
    applied_price_per_hour: pricePerHour,
    total_amount: total,
    deposit_required_amount: deposit,
    notes: notes?.trim() || null,
  });

  if (error) {
    if (error.code === '23P01') return { error: 'Ese horario ya está ocupado.' };
    if (error.message?.toLowerCase().includes('availability')) {
      return { error: 'El horario está fuera del horario de atención de la cancha.' };
    }
    if (error.code === '23514') {
      return { error: 'Horario inválido (usa intervalos de 30 min dentro del mismo día).' };
    }
    return { error: 'No se pudo crear la reserva.' };
  }
  return { error: null };
}

export async function cancelReservation(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'CANCELLED', cancelled_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: 'No se pudo cancelar la reserva.' };
  return { error: null };
}
