'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Search, Download } from 'lucide-react';

const paymentsData = [
  { id: "P001", customer: "Carlos Mendoza", field: "Futbol 7", date: "Hoy 08:00", method: "Yape", amount: "S/ 120", type: "Completo", status: "Validado", avatar: "CM" },
  { id: "P002", customer: "Equipo Las Bravas", field: "Voley", date: "Hoy 10:30", method: "Plin", amount: "S/ 45", type: "Adelanto", status: "Pendiente", avatar: "LB" },
  { id: "P003", customer: "Barrio Norte FC", field: "Futbol 7", date: "Hoy 18:00", method: "Efectivo", amount: "S/ 240", type: "Completo", status: "Pendiente", avatar: "BN" },
  { id: "P004", customer: "Mariana Ruiz", field: "Tenis 1", date: "Ayer 19:00", method: "Transferencia", amount: "S/ 80", type: "Completo", status: "Validado", avatar: "MR" },
  { id: "P005", customer: "Diego Vargas", field: "Basquet", date: "Ayer 14:00", method: "Yape", amount: "S/ 60", type: "Adelanto", status: "Validado", avatar: "DV" },
  { id: "P006", customer: "Rosa Quispe", field: "Futsal", date: "5 jun 16:00", method: "Efectivo", amount: "S/ 100", type: "Completo", status: "Validado", avatar: "RQ" }
];

const methodColors: Record<string, string> = {
  Yape: "bg-purple-100 text-purple-700",
  Plin: "bg-sky-100 text-sky-700",
  Efectivo: "bg-green-100 text-green-700",
  Transferencia: "bg-blue-100 text-blue-700"
};

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-orange-500", "bg-pink-500", "bg-cyan-500"
];

export default function PaymentsPage() {
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'validado'>('todos');
  const [search, setSearch] = useState('');

  const filtered = paymentsData.filter(p => {
    const matchStatus = filter === 'todos' || p.status.toLowerCase() === filter;
    const matchSearch = p.customer.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    return matchStatus && matchSearch;
  });

  const pending = paymentsData.filter(p => p.status === 'Pendiente');
  const totalPending = pending.reduce((sum, p) => sum + parseInt(p.amount.replace(/\D/g, '')), 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white border-r border-gray-200 px-6 py-8 sticky top-0 h-screen">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">⚽ APP DEPORTE</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">La Bombonera</h1>
          </div>
          <nav className="space-y-2">
            {[
              { label: "Dashboard", href: "/", icon: '📊' },
              { label: "Reservas", href: "/reservas", icon: '📅' },
              { label: "Canchas", href: "/fields", icon: '🎾' },
              { label: "Clientes", href: "/customers", icon: '👥' },
              { label: "Pagos", href: "/payments", icon: '💳', active: true },
              { label: "Configuración", href: "/settings", icon: '⚙️' }
            ].map(({ label, href, icon, active }) => (
              <a
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  active ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {icon} {label}
              </a>
            ))}
          </nav>
        </aside>

        <section className="flex flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Control de ingresos</p>
                <h2 className="text-xl font-bold text-gray-900">Pagos</h2>
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                <Download size={16} /> Exportar
              </button>
            </div>
          </header>

          <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
            {/* Resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Ingresos hoy</p>
                <p className="text-2xl font-bold text-green-600 mt-1">S/ 485</p>
                <p className="text-xs text-gray-500 mt-1">4 pagos</p>
              </div>
              <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Ingresos mes</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">S/ 7,840</p>
                <p className="text-xs text-gray-500 mt-1">72% cobrado</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-5 border border-amber-200 shadow-sm">
                <p className="text-sm text-gray-500">Pendiente validar</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">S/ {totalPending}</p>
                <p className="text-xs text-gray-500 mt-1">{pending.length} adelantos</p>
              </div>
              <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-500">Método más usado</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">Yape</p>
                <p className="text-xs text-gray-500 mt-1">48% de pagos</p>
              </div>
            </div>

            {/* Adelantos pendientes */}
            {pending.length > 0 && (
              <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600" />
                  Adelantos pendientes de validar
                </h3>
                <div className="flex flex-wrap gap-3">
                  {pending.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-amber-200 shadow-sm">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{p.customer}</p>
                        <p className="text-xs text-gray-500">{p.method} · {p.amount}</p>
                      </div>
                      <button className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105">
                        Validar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                {(['todos', 'pendiente', 'validado'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                      filter === f
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla de pagos */}
            <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Cliente</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Cancha</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Fecha</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Método</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Monto</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment, idx) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{payment.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}>
                            {payment.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{payment.customer}</p>
                            <p className="text-xs text-gray-400">{payment.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-gray-700">{payment.field}</td>
                      <td className="px-6 py-4 hidden lg:table-cell text-gray-500">{payment.date}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${methodColors[payment.method]}`}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{payment.amount}</td>
                      <td className="px-6 py-4">
                        {payment.status === 'Validado' ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                            <CheckCircle size={14} /> Validado
                          </span>
                        ) : (
                          <button className="flex items-center gap-1 text-amber-600 font-semibold text-xs hover:text-amber-700 bg-amber-50 px-2 py-1 rounded-md transition-all hover:bg-amber-100">
                            <Clock size={14} /> Validar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen por método */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { method: "Yape", amount: "S/ 180", count: 2, color: "bg-purple-100 text-purple-700 border-purple-200" },
                { method: "Plin", amount: "S/ 45", count: 1, color: "bg-sky-100 text-sky-700 border-sky-200" },
                { method: "Efectivo", amount: "S/ 340", count: 2, color: "bg-green-100 text-green-700 border-green-200" },
                { method: "Transferencia", amount: "S/ 80", count: 1, color: "bg-blue-100 text-blue-700 border-blue-200" }
              ].map(({ method, amount, count, color }) => (
                <div key={method} className={`rounded-xl p-4 border ${color}`}>
                  <p className="font-bold">{method}</p>
                  <p className="text-lg font-bold mt-1">{amount}</p>
                  <p className="text-xs mt-1 opacity-70">{count} pago{count !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
