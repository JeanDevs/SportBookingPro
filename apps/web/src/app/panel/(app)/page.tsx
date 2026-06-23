import Link from "next/link";
import { CalendarDays, Wallet, Clock4, Goal, Plus, ArrowUpRight } from "lucide-react";
import { getDashboardData } from "@/services/dashboard";
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
  buttonClasses,
} from "@/components/ui";
import { PageHeader, PageBody } from "@/components/panel/page-header";
import { formatPEN, formatLimaDateLong, formatLimaRange } from "@/lib/format";
import { RESERVATION_STATUS_META, fieldTypeMeta } from "@/lib/domain";

export default async function DashboardPage() {
  const d = await getDashboardData();

  return (
    <>
      <PageHeader
        eyebrow={formatLimaDateLong(new Date())}
        title="Resumen de hoy"
        actions={
          <Link href="/panel/reservas" className={buttonClasses({ size: "sm" })}>
            <Plus size={16} /> Nueva reserva
          </Link>
        }
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Reservas hoy"
            value={String(d.reservationsToday)}
            icon={CalendarDays}
            hint={`${d.hoursBookedToday.toFixed(1)} h reservadas`}
            accent
          />
          <StatCard label="Reservas semana" value={String(d.reservationsWeek)} icon={Clock4} />
          <StatCard
            label="Ingresos del mes"
            value={formatPEN(d.revenueMonth)}
            icon={Wallet}
            hint="Pagos validados"
          />
          <StatCard label="Canchas activas" value={String(d.activeFields)} icon={Goal} />
        </div>

        {d.pendingPayments > 0 ? (
          <Link
            href="/panel/pagos"
            className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 transition hover:border-amber-500/50"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300">
                <Wallet size={18} />
              </span>
              <div>
                <p className="font-semibold text-amber-100">
                  {d.pendingPayments} {d.pendingPayments === 1 ? "adelanto" : "adelantos"} por validar
                </p>
                <p className="text-sm text-amber-200/70">
                  Confirma los comprobantes para asegurar las reservas.
                </p>
              </div>
            </div>
            <ArrowUpRight className="text-amber-300" size={20} />
          </Link>
        ) : null}

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de hoy</CardTitle>
              <Link
                href="/panel/reservas"
                className="text-sm font-semibold text-lime-300 hover:text-lime-200"
              >
                Ver calendario
              </Link>
            </CardHeader>
            <CardContent>
              {d.todayReservations.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Sin reservas para hoy"
                  description="Cuando entren reservas (tuyas o desde el sitio público) aparecerán aquí."
                />
              ) : (
                <ul className="divide-y divide-ink-800">
                  {d.todayReservations.map((r) => {
                    const meta = RESERVATION_STATUS_META[r.status];
                    const type = r.fieldType ? fieldTypeMeta(r.fieldType) : null;
                    return (
                      <li key={r.id} className="flex items-center gap-4 py-3">
                        <div className="w-28 shrink-0 font-display text-sm font-semibold text-ink-100">
                          {formatLimaRange(r.startAt, r.endAt)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink-50">
                            {type ? `${type.emoji} ` : ""}
                            {r.fieldName}
                          </p>
                          <p className="truncate text-sm text-ink-400">{r.customerName}</p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="font-semibold text-ink-100">{formatPEN(r.totalAmount)}</p>
                        </div>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
