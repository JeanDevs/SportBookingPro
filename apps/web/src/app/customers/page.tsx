'use client';

import { useState } from 'react';
import { Search, Phone, Mail, Calendar, ChevronRight, ArrowLeft, TrendingUp } from 'lucide-react';

const customersData = [
  { id: 1, name: "Carlos Mendoza", phone: "999 111 222", email: "carlos@email.com", visits: 18, totalSpent: "S/ 2,160", lastVisit: "Hoy", status: "Frecuente", avatar: "CM" },
  { id: 2, name: "Equipo Las Bravas", phone: "999 333 444", email: "bravas@email.com", visits: 12, totalSpent: "S/ 1,080", lastVisit: "Ayer", status: "Frecuente", avatar: "LB" },
  { id: 3, name: "Mariana Ruiz", phone: "999 555 666", email: "mariana@email.com", visits: 7, totalSpent: "S/ 560", lastVisit: "3 días", status: "Regular", avatar: "MR" },
  { id: 4, name: "Barrio Norte FC", phone: "999 777 888", email: "bnorte@email.com", visits: 22, totalSpent: "S/ 2,640", lastVisit: "Hoy", status: "VIP", avatar: "BN" },
  { id: 5, name: "Diego Vargas", phone: "999 000 111", email: "diego@email.com", visits: 3, totalSpent: "S/ 240", lastVisit: "1 semana", status: "Nuevo", avatar: "DV" },
  { id: 6, name: "Rosa Quispe", phone: "999 222 333", email: "rosa@email.com", visits: 9, totalSpent: "S/ 720", lastVisit: "2 días", status: "Regular", avatar: "RQ" }
];

const statusColors: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-700",
  Frecuente: "bg-blue-100 text-blue-700",
  Regular: "bg-gray-100 text-gray-700",
  Nuevo: "bg-green-100 text-green-700"
};

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-orange-500", "bg-pink-500", "bg-cyan-500"
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof customersData[0] | null>(null);

  const filtered = customersData.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

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
              { label: "Clientes", href: "/customers", icon: '👥', active: true },
              { label: "Pagos", href: "/payments", icon: '💳' },
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
                <p className="text-sm text-gray-500">Gestión de clientes</p>
                <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
              </div>
              <button className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95">
                + Nuevo cliente
              </button>
            </div>
          </header>

          <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
            {!selected ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total clientes", value: "48", icon: "👥", color: "text-blue-600" },
                    { label: "Activos este mes", value: "31", icon: "✅", color: "text-green-600" },
                    { label: "Clientes VIP", value: "6", icon: "⭐", color: "text-amber-600" },
                    { label: "Nuevos este mes", value: "4", icon: "🆕", color: "text-purple-600" }
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                      <p className="text-xl mt-1">{icon}</p>
                    </div>
                  ))}
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o teléfono..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Table */}
                <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left font-semibold text-gray-600">Cliente</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Contacto</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Visitas</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Total gastado</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-600">Estado</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((customer, idx) => (
                        <tr
                          key={customer.id}
                          className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer group"
                          onClick={() => setSelected(customer)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}>
                                {customer.avatar}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 group-hover:text-blue-600">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.lastVisit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-gray-700">{customer.phone}</p>
                            <p className="text-xs text-gray-400">{customer.email}</p>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell font-semibold text-gray-900">{customer.visits}</td>
                          <td className="px-6 py-4 hidden lg:table-cell font-semibold text-green-600">{customer.totalSpent}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[customer.status]}`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Detalle cliente */
              <div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:text-blue-700"
                >
                  <ArrowLeft size={20} /> Volver
                </button>

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-xl bg-white p-8 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-5 mb-8">
                        <div className={`w-16 h-16 rounded-full ${avatarColors[selected.id % avatarColors.length]} flex items-center justify-center text-white text-xl font-bold`}>
                          {selected.avatar}
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">{selected.name}</h1>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[selected.status]}`}>
                            {selected.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Phone size={18} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="font-semibold">{selected.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Mail size={18} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-semibold">{selected.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <Calendar size={18} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Última visita</p>
                            <p className="font-semibold">{selected.lastVisit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <TrendingUp size={18} className="text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">Total gastado</p>
                            <p className="font-semibold text-green-600">{selected.totalSpent}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Historial de reservas */}
                    <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
                      <h2 className="font-bold text-gray-900 mb-4">Últimas reservas</h2>
                      <div className="space-y-3">
                        {[
                          { field: "Futbol 7", date: "Hoy 08:00", amount: "S/ 120", status: "Confirmada" },
                          { field: "Voley", date: "Ayer 10:30", amount: "S/ 90", status: "Completada" },
                          { field: "Futbol 7", date: "5 jun 18:00", amount: "S/ 120", status: "Completada" }
                        ].map((res, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                            <div>
                              <p className="font-semibold text-gray-900">{res.field}</p>
                              <p className="text-xs text-gray-500">{res.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{res.amount}</p>
                              <span className={`text-xs font-semibold ${res.status === 'Confirmada' ? 'text-blue-600' : 'text-green-600'}`}>
                                {res.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white p-6 border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4">Acciones</h3>
                      <div className="space-y-2">
                        <button className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-semibold transition-all hover:scale-105">
                          Nueva reserva
                        </button>
                        <button className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 text-sm font-semibold transition-all hover:scale-105">
                          Editar datos
                        </button>
                        <button className="w-full rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 py-3 text-sm font-semibold transition-all hover:scale-105">
                          Bloquear cliente
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-6 border border-blue-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-3">Resumen</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Visitas totales:</span>
                          <span className="font-bold">{selected.visits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gasto total:</span>
                          <span className="font-bold text-green-600">{selected.totalSpent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gasto promedio:</span>
                          <span className="font-bold">S/ {Math.round(parseInt(selected.totalSpent.replace(/\D/g, '')) / selected.visits)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
