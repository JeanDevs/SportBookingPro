'use server';

import { createClient } from '../lib/supabase/server';
import { addHoursISO, limaWallClockToISO } from '../lib/format';
import type { ReservationStatus } from '../lib/domain';
import {
  buildCustomersReport,
  buildIncomeReport,
  buildReservationsReport,
  NON_REPORTABLE_STATUSES,
  type IncomePaymentRecord,
  type ReportContext,
  type ReservationRecord,
} from '../lib/reports/builders';
import {
  isReportType,
  validateRange,
  type ReportData,
  type ReportRange,
  type ReportType,
} from '../lib/reports/types';
import { getMyFacility } from './facilities';

/**
 * Servicio de reportes (capa Modelo). Lee reservas/pagos del período con RLS
 * (`owner_id = auth.uid()`: un dueño jamás ve datos de otro) y delega el armado
 * del DTO `ReportData` a los constructores puros de `lib/reports/builders`.
 * El rango es de días locales de Lima, ambos extremos inclusive.
 */

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** PostgREST corta en 1000 filas por request: paginamos con `range`. */
const PAGE_SIZE = 1000;
/** Tope de seguridad (50k filas) para no colgar el request ante datos inesperados. */
const MAX_PAGES = 50;
/** Ids por `.in(...)` para no exceder el largo de URL de PostgREST. */
const IN_CHUNK = 150;

/** [inicio del día `from`, inicio del día siguiente a `to`) en ISO UTC. */
function rangeToISO(range: ReportRange): { startIso: string; endIso: string } {
  return {
    startIso: limaWallClockToISO(range.from, '00:00'),
    endIso: addHoursISO(limaWallClockToISO(range.to, '00:00'), 24), // Lima no tiene DST
  };
}

async function fetchAllPages<T>(
  page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>,
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < MAX_PAGES; i++) {
    const { data, error } = await page(i * PAGE_SIZE, (i + 1) * PAGE_SIZE - 1);
    if (error) throw new Error('No se pudieron leer los datos del reporte.');
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return out;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** `select ... where id in (ids)` partido en lotes. */
async function selectByIds<T>(
  supabase: SupabaseServerClient,
  table: 'fields' | 'customers' | 'reservations',
  columns: string,
  ids: string[],
): Promise<T[]> {
  const unique = [...new Set(ids)];
  const results = await Promise.all(
    chunk(unique, IN_CHUNK).map((batch) => supabase.from(table).select(columns).in('id', batch)),
  );
  if (results.some((r) => r.error)) throw new Error('No se pudieron leer los datos del reporte.');
  return results.flatMap((r) => (r.data ?? []) as T[]);
}

async function reportContext(range: ReportRange): Promise<ReportContext> {
  const facility = await getMyFacility();
  return { range, facilityName: facility?.name ?? null, generatedAt: new Date().toISOString() };
}

interface ReservationRow {
  status: ReservationStatus;
  start_at: string;
  end_at: string;
  total_amount: number | string;
  deposit_required_amount: number | string;
  field_id: string;
  customer_id: string;
}

/** Reservas del período (por `start_at`), sin intenciones ni holds expirados,
 * enriquecidas con nombre de cancha y datos del cliente. */
async function loadReservationRecords(range: ReportRange): Promise<ReservationRecord[]> {
  const supabase = await createClient();
  const { startIso, endIso } = rangeToISO(range);
  const excluded = `(${NON_REPORTABLE_STATUSES.map((s) => `"${s}"`).join(',')})`;

  const rows = await fetchAllPages<ReservationRow>((from, to) =>
    supabase
      .from('reservations')
      .select('status, start_at, end_at, total_amount, deposit_required_amount, field_id, customer_id')
      .gte('start_at', startIso)
      .lt('start_at', endIso)
      .not('status', 'in', excluded)
      .order('start_at', { ascending: true })
      .range(from, to),
  );
  if (rows.length === 0) return [];

  const [fields, customers] = await Promise.all([
    selectByIds<{ id: string; name: string }>(supabase, 'fields', 'id, name', rows.map((r) => r.field_id)),
    selectByIds<{ id: string; name: string; phone: string | null }>(
      supabase,
      'customers',
      'id, name, phone',
      rows.map((r) => r.customer_id),
    ),
  ]);
  const fieldMap = new Map(fields.map((f) => [f.id, f.name]));
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  return rows.map((r) => {
    const customer = customerMap.get(r.customer_id);
    return {
      startAt: r.start_at,
      endAt: r.end_at,
      status: r.status,
      totalAmount: Number(r.total_amount),
      depositAmount: Number(r.deposit_required_amount),
      fieldName: fieldMap.get(r.field_id) ?? 'Cancha',
      customerId: r.customer_id,
      customerName: customer?.name ?? 'Cliente',
      customerPhone: customer?.phone ?? null,
    };
  });
}

/** Pagos VALIDATED cuya validación cae en el período (mismo criterio que el
 * "ingreso del mes" del dashboard), con la cancha de su reserva. */
async function loadIncomeRecords(range: ReportRange): Promise<IncomePaymentRecord[]> {
  const supabase = await createClient();
  const { startIso, endIso } = rangeToISO(range);

  const payments = await fetchAllPages<{
    reservation_id: string;
    kind: 'DEPOSIT' | 'BALANCE';
    amount: number | string;
  }>((from, to) =>
    supabase
      .from('payments')
      .select('reservation_id, kind, amount')
      .eq('status', 'VALIDATED')
      .gte('validated_at', startIso)
      .lt('validated_at', endIso)
      .order('validated_at', { ascending: true })
      .range(from, to),
  );
  if (payments.length === 0) return [];

  const reservations = await selectByIds<{ id: string; field_id: string }>(
    supabase,
    'reservations',
    'id, field_id',
    payments.map((p) => p.reservation_id),
  );
  const fields = await selectByIds<{ id: string; name: string }>(
    supabase,
    'fields',
    'id, name',
    reservations.map((r) => r.field_id),
  );
  const fieldByReservation = new Map(reservations.map((r) => [r.id, r.field_id]));
  const fieldName = new Map(fields.map((f) => [f.id, f.name]));

  return payments.map((p) => ({
    fieldName: fieldName.get(fieldByReservation.get(p.reservation_id) ?? '') ?? 'Cancha',
    kind: p.kind,
    amount: Number(p.amount),
  }));
}

export async function getReservationsReport(range: ReportRange): Promise<ReportData> {
  const [records, ctx] = await Promise.all([loadReservationRecords(range), reportContext(range)]);
  return buildReservationsReport(records, ctx);
}

export async function getIncomeReport(range: ReportRange): Promise<ReportData> {
  const [records, ctx] = await Promise.all([loadIncomeRecords(range), reportContext(range)]);
  return buildIncomeReport(records, ctx);
}

export async function getCustomersReport(range: ReportRange): Promise<ReportData> {
  const [records, ctx] = await Promise.all([loadReservationRecords(range), reportContext(range)]);
  return buildCustomersReport(records, ctx);
}

/** Punto de entrada único que usan la página y el route handler de exportación.
 * Revalida la entrada: al ser 'use server', también es invocable desde el cliente. */
export async function getReport(type: ReportType, range: ReportRange): Promise<ReportData> {
  if (!isReportType(type)) throw new Error('Tipo de reporte inválido.');
  const rangeError = validateRange(range.from, range.to);
  if (rangeError) throw new Error(rangeError);

  switch (type) {
    case 'reservas':
      return getReservationsReport(range);
    case 'ingresos':
      return getIncomeReport(range);
    case 'clientes':
      return getCustomersReport(range);
  }
}
