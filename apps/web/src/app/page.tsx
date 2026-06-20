'use client';

import { Calendar, Users, DollarSign, Zap, Menu, Bell, LogOut, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { signOut } from '../services/auth';
import { getMyFacility } from '../services/facilities';
import { OnboardingTour } from './onboarding-tour';

const reservations = [
  {
    time: "08:00",
    field: "Cancha Futbol 7",
    customer: "Carlos Mendoza",
    status: "Confirmada",
    amount: "S/ 120",
    statusColor: "bg-green-100 text-green-800",
    statusBg: "from-green-400 to-green-500"
  },
  {
    time: "10:30",
    field: "Cancha Voley",
    customer: "Equipo Las Bravas",
    status: "Adelanto",
    amount: "S/ 45",
    statusColor: "bg-brand-100 text-brand-800",
    statusBg: "from-brand-400 to-brand-500"
  },
  {
    time: "19:00",
    field: "Cancha Tenis 1",
    customer: "Mariana Ruiz",
    status: "Pendiente",
    amount: "S/ 80",
    statusColor: "bg-yellow-100 text-yellow-800",
    statusBg: "from-yellow-400 to-yellow-500"
  }
];

const fields = [
  { name: "Futbol 7", status: "Activa", occupancy: 76 },
  { name: "Voley", status: "Activa", occupancy: 54 },
  { name: "Tenis 1", status: "Mantenimiento", occupancy: 0 }
];

const stats = [
  {
    label: "Reservas hoy",
    value: "18",
    detail: "+4 vs ayer",
    icon: Calendar,
    color: "from-brand-500 to-brand-600"
  },
  {
    label: "Ingresos mes",
    value: "S/ 7,840",
    detail: "72% cobrado",
    icon: DollarSign,
    color: "from-green-500 to-green-600"
  },
  {
    label: "Horas ocupadas",
    value: "43",
    detail: "65% ocupacion",
    icon: Zap,
    color: "from-amber-500 to-amber-600"
  },
  {
    label: "Pendiente validar",
    value: "S/ 360",
    detail: "5 adelantos",
    icon: Users,
    color: "from-slate-500 to-slate-600"
  }
];

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [facilityName, setFacilityName] = useState('Mi complejo');

  useEffect(() => {
    // Nombre real del complejo (server action; RLS lo limita al del propietario).
    let active = true;
    getMyFacility().then((facility) => {
      if (active && facility) {
        setFacilityName(facility.name);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getUpcomingReservationAlert = () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const reservation of reservations) {
      const [rawHours, rawMinutes] = reservation.time.split(':');
      const hours = Number(rawHours);
      const minutes = Number(rawMinutes);

      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
      }

      const reservationMinutes = hours * 60 + minutes;
      const diffMinutes = reservationMinutes - nowMinutes;

      if (diffMinutes > 0 && diffMinutes <= 60) {
        return {
          reservation,
          minutesUntil: diffMinutes,
          isUrgent: diffMinutes <= 30
        };
      }
    }
    return null;
  };

  const upcomingAlert = getUpcomingReservationAlert();

  return (
    <main className="min-h-screen bg-gray-50">
      <OnboardingTour />
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out;
        }
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .stat-card {
          animation: slideInUp 0.6s ease-out backwards;
        }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        .reservation-item {
          animation: slideInLeft 0.6s ease-out backwards;
        }
        .reservation-item:nth-child(1) { animation-delay: 0.5s; }
        .reservation-item:nth-child(2) { animation-delay: 0.6s; }
        .reservation-item:nth-child(3) { animation-delay: 0.7s; }
      `}</style>
      <div className={`grid min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'lg:grid-cols-[280px_1fr]' : 'lg:grid-cols-[80px_1fr]'
      }`}>
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 transform bg-white text-gray-900 shadow-lg transition-all duration-300 lg:relative lg:transform-none border-r border-gray-200 ${
          sidebarOpen
            ? 'w-80 translate-x-0 lg:translate-x-0 px-6 py-8 lg:px-6 lg:py-8'
            : 'w-80 -translate-x-full lg:translate-x-0 lg:w-20 lg:px-3 lg:py-6'
        } animate-slide-in-left`}>
          <div className="mb-10 animate-fade-in flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                    ⚽ APP DEPORTE
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-gray-900">{facilityName}</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
                  title="Colapsar"
                >
                  ←
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 w-full justify-center"
                title="Expandir"
              >
                →
              </button>
            )}
          </div>

          {sidebarOpen && (
            <nav data-tour="sidebar" className="space-y-2 animate-fade-in block" style={{ animationDelay: '0.2s' }}>
              {[
                { label: "Dashboard", href: "/", active: true, icon: '📊' },
                { label: "Reservas", href: "/reservas", active: false, icon: '📅' },
                { label: "Canchas", href: "/fields", active: false, icon: '🎾' },
                { label: "Clientes", href: "/customers", active: false, icon: '👥' },
                { label: "Pagos", href: "/payments", active: false, icon: '💳' },
                { label: "Configuración", href: "/settings", active: false, icon: '⚙️' }
              ].map(({ label, href, active, icon }) => (
                <a
                  key={label}
                  href={href}
                  data-tour={label === 'Canchas' ? 'nav-canchas' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-300 group ${
                    active
                      ? "bg-brand-100 text-brand-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="transition-transform text-base">{icon}</span>
                  <span>{label}</span>
                </a>
              ))}
            </nav>
          )}
          {!sidebarOpen && (
            <nav className="hidden lg:flex lg:flex-col space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {[
                { label: "Dashboard", href: "/", active: true, icon: '📊' },
                { label: "Reservas", href: "/reservas", active: false, icon: '📅' },
                { label: "Canchas", href: "/fields", active: false, icon: '🎾' },
                { label: "Clientes", href: "/customers", active: false, icon: '👥' },
                { label: "Pagos", href: "/payments", active: false, icon: '💳' },
                { label: "Configuración", href: "/settings", active: false, icon: '⚙️' }
              ].map(({ label, href, active, icon }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  className={`flex items-center gap-3 rounded-lg lg:px-2 lg:py-3 lg:text-xs lg:justify-center transition-all duration-300 group ${
                    active
                      ? "bg-brand-100 text-brand-700 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="transition-transform text-base lg:scale-125">{icon}</span>
                </a>
              ))}
            </nav>
          )}

          {sidebarOpen && (
            <div className="absolute bottom-8 left-6 right-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                }}
                className="flex items-center gap-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-300 hover:scale-105 active:scale-95 w-full px-4 py-3 text-sm"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          )}
          {!sidebarOpen && (
            <div className="hidden lg:flex absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                }}
                className="flex items-center gap-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-300 hover:scale-105 active:scale-95 p-3"
                title="Salir"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <section className="flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm animate-slide-in-right">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 lg:hidden"
                >
                  <Menu size={24} className="text-gray-700" />
                </button>
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} • {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900">Operación de hoy</h2>
                  {upcomingAlert && (
                    <p className={`mt-1 text-xs font-semibold ${upcomingAlert.isUrgent ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}>
                      ⚡ Reserva en {upcomingAlert.minutesUntil}min: {upcomingAlert.reservation.field}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-lg p-2 hover:bg-gray-100 transition-all duration-300 relative group hover:scale-110 active:scale-95">
                  <Bell size={20} className="text-gray-600 group-hover:text-brand-600 transition-colors" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <button className="hidden sm:inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-300 hover:scale-105 active:scale-95">
                  <a href="/reservas">Ver calendario</a>
                </button>
                <button data-tour="nueva-reserva" className="rounded-lg bg-brand-600 hover:bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                  Nueva reserva
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full">
            {/* Stats Grid */}
            <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map(({ label, value, detail, icon: Icon, color }) => (
                <div
                  key={label}
                  className={`stat-card relative overflow-hidden rounded-xl bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 group cursor-pointer`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-r ${color} opacity-20 -translate-y-1/2 translate-x-1/2 blur-xl`} />
                  </div>
                  <div className={`absolute right-0 top-0 h-20 w-20 rounded-full bg-gradient-to-r ${color} opacity-5 -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-10`} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{label}</p>
                      <div className={`rounded-lg bg-gradient-to-r ${color} p-2.5 text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{value}</p>
                    <p className="mt-2 text-xs font-semibold text-gray-500 group-hover:text-gray-700 transition-colors flex items-center gap-1">
                      <TrendingUp size={14} className={`${value.includes('+') ? 'text-green-600' : 'text-gray-400'}`} />
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Reservations */}
              <div className="lg:col-span-2 rounded-xl bg-white p-7 shadow-sm border border-gray-200 animate-slide-in-left" style={{ animationDelay: '0.5s' }}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Próximas reservas</h3>
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 animate-pulse-subtle">
                    ⏱️ 30 min
                  </span>
                </div>
                <div className="space-y-4">
                  {reservations.map((reservation, idx) => (
                    <div
                      key={`${reservation.time}-${reservation.field}`}
                      className={`reservation-item flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-brand-50 hover:border-brand-300 transition-all duration-300 hover:scale-102 hover:shadow-md group cursor-pointer`}
                      style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`rounded-lg bg-brand-600 px-3 py-2 text-center font-bold text-white group-hover:shadow-lg group-hover:shadow-brand-600/50 transition-all`}>
                          <p className="text-sm">{reservation.time}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{reservation.field}</p>
                          <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{reservation.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          reservation.status === 'Confirmada' ? 'bg-green-100 text-green-700' :
                          reservation.status === 'Adelanto' ? 'bg-brand-100 text-brand-700' :
                          'bg-amber-100 text-amber-700'
                        } transition-all shadow-sm`}>
                          {reservation.status === 'Confirmada' && <CheckCircle size={14} className="inline mr-1" />}
                          {reservation.status === 'Adelanto' && <Clock size={14} className="inline mr-1" />}
                          {reservation.status}
                        </span>
                        <p className="font-bold text-gray-900 w-16 text-right group-hover:text-brand-600 transition-colors">{reservation.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields Status */}
              <div className="rounded-xl bg-white p-7 shadow-sm border border-gray-200 animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
                <h3 className="mb-6 text-lg font-bold text-gray-900">Estado de canchas</h3>
                <div className="space-y-6">
                  {fields.map((field, idx) => (
                    <div key={field.name} className="group cursor-pointer">
                      <div className="mb-3 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{field.name}</p>
                          <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">{field.status}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{field.occupancy}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200 shadow-sm group-hover:shadow-md group-hover:shadow-gray-300 transition-all">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            field.occupancy > 70
                              ? 'bg-red-500 shadow-md shadow-red-400'
                              : field.occupancy > 40
                              ? 'bg-amber-500 shadow-md shadow-amber-400'
                              : 'bg-green-500 shadow-md shadow-green-400'
                          } group-hover:scale-y-125`}
                          style={{ width: `${field.occupancy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Validation */}
            <div className="mt-8 rounded-xl bg-amber-50 p-7 shadow-sm border border-amber-200 hover:border-amber-300 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    ⚠️ Pagos pendientes de validar
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Adelantos que necesitan confirmación antes de liberar la cancha.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { text: "Yape: S/ 180", color: "bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300" },
                    { text: "Plin: S/ 120", color: "bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300" },
                    { text: "Efectivo: S/ 60", color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300" }
                  ].map(({ text, color }, idx) => (
                    <span
                      key={text}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${color}`}
                      style={{ animation: `slideInUp 0.6s ease-out ${0.7 + idx * 0.1}s backwards` }}
                    >
                      {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
