'use client';

import { useState } from 'react';
import { LogOut, Plus, CalendarDays } from 'lucide-react';
import { signOut } from '../../services/auth';

interface ReservasViewProps {
  facilityName: string;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'Reservas', href: '/reservas', icon: '📅' },
  { label: 'Canchas', href: '/fields', icon: '🎾' },
  { label: 'Clientes', href: '/customers', icon: '👥' },
  { label: 'Pagos', href: '/payments', icon: '💳' },
  { label: 'Configuración', href: '/settings', icon: '⚙️' },
];

// --- Datos de muestra (prototipo). La lógica real de reservas es FASE 6. ---
const HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00',
];

const FIELDS = ['Fútbol 7', 'Vóley', 'Tenis 1'];

interface SampleReservation {
  id: string;
  field: string;
  start: string;
  end: string;
  customer: string;
  status: 'CONFIRMED' | 'PARTIALLY_PAID' | 'AWAITING_DEPOSIT' | 'INTENT_CREATED';
  payment: string;
  amount: string;
}

const RESERVATIONS: SampleReservation[] = [
  { id: 'r1', field: 'Fútbol 7', start: '08:00', end: '09:30', customer: 'Carlos Mendoza', status: 'CONFIRMED', payment: 'Adelanto validado', amount: 'S/ 120' },
  { id: 'r2', field: 'Vóley', start: '10:30', end: '12:00', customer: 'Equipo Las Bravas', status: 'PARTIALLY_PAID', payment: 'Saldo pendiente', amount: 'S/ 90' },
  { id: 'r3', field: 'Fútbol 7', start: '18:00', end: '20:00', customer: 'Barrio Norte FC', status: 'AWAITING_DEPOSIT', payment: 'Esperando adelanto', amount: 'S/ 240' },
  { id: 'r4', field: 'Tenis 1', start: '19:00', end: '20:30', customer: 'Mariana Ruiz', status: 'INTENT_CREATED', payment: 'Bloqueo temporal', amount: 'S/ 80' },
];

const STATUS_STYLES: Record<SampleReservation['status'], string> = {
  CONFIRMED: 'border-green-300 bg-green-50 text-green-800',
  PARTIALLY_PAID: 'border-amber-300 bg-amber-50 text-amber-800',
  AWAITING_DEPOSIT: 'border-purple-300 bg-purple-50 text-purple-800',
  INTENT_CREATED: 'border-slate-300 bg-slate-50 text-slate-700',
};

const STATUS_LABEL: Record<SampleReservation['status'], string> = {
  CONFIRMED: 'Confirmada',
  PARTIALLY_PAID: 'Pago parcial',
  AWAITING_DEPOSIT: 'Esperando adelanto',
  INTENT_CREATED: 'Bloqueo temporal',
};

function getReservation(field: string, hour: string): SampleReservation | undefined {
  return RESERVATIONS.find((r) => r.field === field && r.start === hour);
}

function getSpan(start: string, end: string): number {
  const startIndex = HOURS.indexOf(start);
  const endIndex = HOURS.indexOf(end);
  if (startIndex === -1 || endIndex === -1) {
    return 1;
  }
  return Math.max(endIndex - startIndex, 1);
}

export function ReservasView({ facilityName }: ReservasViewProps) {
  const [view, setView] = useState<'dia' | 'semana'>('dia');
  const [selectedId, setSelectedId] = useState<string>('r3');

  // RESERVATIONS es un literal no vacío, así que el fallback siempre existe.
  const selected = RESERVATIONS.find((r) => r.id === selectedId) ?? RESERVATIONS[0]!;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar consistente con el resto de la app */}
        <aside className="hidden lg:block bg-white border-r border-gray-200 px-6 py-8 sticky top-0 h-screen">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              ⚽ APP DEPORTE
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{facilityName}</h1>
          </div>
          <nav className="space-y-2">
            {NAV_ITEMS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  href === '/reservas'
                    ? 'bg-brand-100 text-brand-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {icon} {label}
              </a>
            ))}
          </nav>
          <div className="absolute bottom-8 left-6 right-6">
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 transition-all duration-300 hover:bg-red-100"
            >
              <LogOut size={18} /> Salir
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <section className="flex flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-gray-500">Reservas / Calendario</p>
                <h2 className="text-xl font-bold text-gray-900">Agenda del día</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setView('dia')}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                    view === 'dia'
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Día
                </button>
                <button
                  type="button"
                  onClick={() => setView('semana')}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                    view === 'semana'
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Semana
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700"
                >
                  <Plus size={16} /> Nueva reserva
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 p-8">
            {view === 'semana' ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-16 text-center">
                <CalendarDays size={40} className="text-gray-400" />
                <h3 className="mt-4 text-lg font-bold text-gray-900">Vista semanal</h3>
                <p className="mt-2 text-sm text-gray-600">
                  La planificación semanal llegará con el módulo de Reservas (FASE 6).
                </p>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                {/* Grilla de horarios por cancha */}
                <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="grid grid-cols-[80px_repeat(3,minmax(160px,1fr))] border-b border-gray-200 bg-gray-50">
                    <div className="border-r border-gray-200 px-4 py-3 text-sm font-semibold text-gray-500">
                      Hora
                    </div>
                    {FIELDS.map((field) => (
                      <div key={field} className="border-r border-gray-200 px-4 py-3 last:border-r-0">
                        <p className="font-bold text-gray-900">{field}</p>
                        <p className="text-xs text-gray-500">Intervalos de 30 min</p>
                      </div>
                    ))}
                  </div>

                  <div className="max-w-full overflow-x-auto">
                    <div className="grid min-w-[640px] grid-cols-[80px_repeat(3,minmax(160px,1fr))]">
                      <div className="border-r border-gray-200">
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="h-14 border-b border-gray-100 px-4 py-2 text-xs font-semibold text-gray-500"
                          >
                            {hour}
                          </div>
                        ))}
                      </div>

                      {FIELDS.map((field) => (
                        <div key={field} className="relative border-r border-gray-200 last:border-r-0">
                          {HOURS.map((hour) => {
                            const reservation = getReservation(field, hour);
                            return (
                              <div key={`${field}-${hour}`} className="relative h-14 border-b border-gray-100 px-2 py-1">
                                {reservation ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedId(reservation.id)}
                                    className={`absolute inset-x-2 z-10 rounded-lg border p-2 text-left shadow-sm transition-all hover:shadow-md ${
                                      STATUS_STYLES[reservation.status]
                                    } ${selectedId === reservation.id ? 'ring-2 ring-brand-500' : ''}`}
                                    style={{ height: `calc(${getSpan(reservation.start, reservation.end)} * 3.5rem - 0.5rem)` }}
                                  >
                                    <p className="text-xs font-bold">
                                      {reservation.start} - {reservation.end}
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-bold">{reservation.customer}</p>
                                    <p className="mt-0.5 truncate text-xs font-semibold">{reservation.payment}</p>
                                  </button>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Panel lateral de la reserva seleccionada */}
                <aside className="space-y-4">
                  <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Reserva seleccionada
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">{selected.customer}</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Cancha</span>
                        <strong className="text-gray-900">{selected.field}</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Horario</span>
                        <strong className="text-gray-900">{selected.start} - {selected.end}</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Estado</span>
                        <strong className="text-gray-900">{STATUS_LABEL[selected.status]}</strong>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">Monto</span>
                        <strong className="text-gray-900">{selected.amount}</strong>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2">
                      <button type="button" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700">
                        Validar adelanto
                      </button>
                      <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50">
                        Reprogramar
                      </button>
                      <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100">
                        Cancelar reserva
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900">Resumen del día</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        ['Reservas', '18'],
                        ['Bloqueos', '2'],
                        ['Ocupación', '65%'],
                        ['Pendiente', 'S/ 360'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs font-semibold text-gray-500">{label}</p>
                          <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
