'use client';

import { ArrowLeft, Edit, Calendar, DollarSign, Users } from 'lucide-react';
import { useState } from 'react';

const fieldsData = [
  { id: 1, name: "Futbol 7", capacity: 14, type: "Futbol", status: "Activa", price: "S/ 120/h", image: "⚽", reservations: 8 },
  { id: 2, name: "Voley", capacity: 12, type: "Voleibol", status: "Activa", price: "S/ 100/h", image: "🏐", reservations: 5 },
  { id: 3, name: "Tenis 1", capacity: 4, type: "Tenis", status: "Mantenimiento", price: "S/ 80/h", image: "🎾", reservations: 0 },
  { id: 4, name: "Basquet", capacity: 10, type: "Básquet", status: "Activa", price: "S/ 110/h", image: "🏀", reservations: 6 },
  { id: 5, name: "Futsal", capacity: 10, type: "Futsal", status: "Activa", price: "S/ 100/h", image: "⚽", reservations: 4 },
  { id: 6, name: "Tenis 2", capacity: 4, type: "Tenis", status: "Activa", price: "S/ 80/h", image: "🎾", reservations: 3 }
];

export default function FieldsPage() {
  const [selectedField, setSelectedField] = useState<typeof fieldsData[0] | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <style>{`
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
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out;
        }
      `}</style>
      
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white text-gray-900 shadow-lg border-r border-gray-200 px-6 py-8 sticky top-0 h-screen">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              ⚽ APP DEPORTE
            </p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">La Bombonera</h1>
          </div>
          <nav className="space-y-2">
            {[
              { label: "Dashboard", href: "/", active: false, icon: '📊' },
              { label: "Reservas", href: "/reservas", active: false, icon: '📅' },
              { label: "Canchas", href: "/fields", active: true, icon: '🎾' },
              { label: "Clientes", href: "/customers", active: false, icon: '👥' },
              { label: "Pagos", href: "/payments", active: false, icon: '💳' },
              { label: "Configuración", href: "/settings", active: false, icon: '⚙️' }
            ].map(({ label, href, active, icon }) => (
              <a
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {icon} {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gestión de instalaciones</p>
                <h2 className="text-xl font-bold text-gray-900">Canchas Deportivas</h2>
              </div>
              <button className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                + Nueva Cancha
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8 max-w-7xl mx-auto w-full">
            {!selectedField ? (
              <>
                {/* Grid de Canchas */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {fieldsData.map((field, idx) => (
                    <div
                      key={field.id}
                      className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer"
                      style={{ animation: `slideInUp 0.6s ease-out ${0.1 + idx * 0.1}s backwards` }}
                      onClick={() => setSelectedField(field)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{field.image}</div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          field.status === 'Activa' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {field.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {field.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{field.type}</p>
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Users size={16} /> Capacidad: {field.capacity} personas
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign size={16} /> Tarifa: {field.price}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} /> {field.reservations} reservas hoy
                        </p>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button className="flex-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                          <Edit size={16} /> Editar
                        </button>
                        <button className="flex-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95">
                          Detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Detalle de Cancha
              <div className="animate-slide-in-up">
                <button
                  onClick={() => setSelectedField(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition-colors"
                >
                  <ArrowLeft size={20} /> Volver
                </button>
                
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Información Principal */}
                  <div className="lg:col-span-2 rounded-xl bg-white p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="text-6xl">{selectedField.image}</div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">{selectedField.name}</h1>
                        <p className="text-gray-600 mt-2">{selectedField.type}</p>
                        <div className="flex gap-3 mt-4">
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            selectedField.status === 'Activa' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {selectedField.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Capacidad</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedField.capacity} personas</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Tarifa por hora</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedField.price}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Reservas de hoy</h2>
                      <div className="space-y-3">
                        {[
                          { time: "08:00", duration: "1h", customer: "Carlos Mendoza", status: "Confirmada" },
                          { time: "10:00", duration: "1.5h", customer: "Equipo Las Bravas", status: "Confirmada" },
                          { time: "12:00", duration: "1h", customer: "Mariana Ruiz", status: "Adelanto" }
                        ].map((res, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-semibold text-gray-900">{res.time} - {res.duration}</p>
                              <p className="text-sm text-gray-600">{res.customer}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              res.status === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {res.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-4">Acciones</h3>
                      <div className="space-y-2">
                        <button className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95">
                          Editar información
                        </button>
                        <button className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95">
                          Ver calendario
                        </button>
                        <button className="w-full rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 font-semibold transition-all duration-300 hover:scale-105 active:scale-95">
                          Cambiar tarifa
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-6 shadow-sm border border-amber-200">
                      <h3 className="font-bold text-gray-900 mb-3">Estadísticas</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ocupación hoy:</span>
                          <span className="font-semibold text-gray-900">65%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ingresos hoy:</span>
                          <span className="font-semibold text-green-600">S/ 580</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Disponible:</span>
                          <span className="font-semibold text-blue-600">5 horas</span>
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
