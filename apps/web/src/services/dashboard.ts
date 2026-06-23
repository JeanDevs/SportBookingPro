'use server';

import { createClient } from '../lib/supabase/server';
import { limaDateInput, limaWallClockToISO, hoursBetween } from '../lib/format';
import { listDayReservations, type OwnerReservation } from './reservations';

/** Suma/desplaza fechas a nivel de día (string YYYY-MM-DD), sin tocar zona. */
function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface DashboardData {
  reservationsToday: number;
  reservationsWeek: number;
  revenueMonth: number;
  hoursBookedToday: number;
  pendingPayments: number;
  activeFields: number;
  todayReservations: OwnerReservation[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const todayStr = limaDateInput();
  const todayStart = limaWallClockToISO(todayStr, '00:00');
  const tomorrowStart = limaWallClockToISO(shiftDate(todayStr, 1), '00:00');

  // Semana: lunes a domingo de la semana actual (Lima).
  const noon = new Date(`${todayStr}T12:00:00Z`);
  const dow = noon.getUTCDay(); // 0=Dom … 6=Sáb
  const mondayOffset = (dow + 6) % 7;
  const weekStartStr = shiftDate(todayStr, -mondayOffset);
  const weekStart = limaWallClockToISO(weekStartStr, '00:00');
  const weekEnd = limaWallClockToISO(shiftDate(weekStartStr, 7), '00:00');

  // Mes en curso (Lima).
  const monthStartStr = `${todayStr.slice(0, 7)}-01`;
  const monthStart = limaWallClockToISO(monthStartStr, '00:00');
  const nextMonthStr = shiftDate(`${todayStr.slice(0, 7)}-28`, 7).slice(0, 7) + '-01';
  const monthEnd = limaWallClockToISO(nextMonthStr, '00:00');

  const ACTIVE_FILTER = '("CANCELLED","EXPIRED")';

  const [todayCount, weekCount, pendingCount, fieldsCount, monthPayments, todayReservations] =
    await Promise.all([
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('start_at', todayStart)
        .lt('start_at', tomorrowStart)
        .not('status', 'in', ACTIVE_FILTER),
      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .gte('start_at', weekStart)
        .lt('start_at', weekEnd)
        .not('status', 'in', ACTIVE_FILTER),
      supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PENDING_VALIDATION'),
      supabase
        .from('fields')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ACTIVE'),
      supabase
        .from('payments')
        .select('amount')
        .eq('status', 'VALIDATED')
        .gte('validated_at', monthStart)
        .lt('validated_at', monthEnd),
      listDayReservations(todayStr),
    ]);

  const revenueMonth = ((monthPayments.data ?? []) as { amount: number | string }[]).reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );

  const hoursBookedToday = todayReservations.reduce(
    (sum, r) => sum + hoursBetween(r.startAt, r.endAt),
    0,
  );

  return {
    reservationsToday: todayCount.count ?? 0,
    reservationsWeek: weekCount.count ?? 0,
    revenueMonth,
    hoursBookedToday,
    pendingPayments: pendingCount.count ?? 0,
    activeFields: fieldsCount.count ?? 0,
    todayReservations,
  };
}
