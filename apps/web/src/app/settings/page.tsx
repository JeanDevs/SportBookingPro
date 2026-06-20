'use client';

import { useState } from 'react';
import { Save, Building2, Clock, CreditCard, Bell, Shield } from 'lucide-react';

const sections = ['Complejo', 'Horarios', 'Pagos', 'Notificaciones', 'Seguridad'] as const;
type Section = typeof sections[number];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('Complejo');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white border-r border-gray-200 px-6 py-8 sticky top-0 h-screen">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">⚽ APP DEPORTE</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">La Bombonera</h1>
          </div>
          <nav className="space-y-2">
            {[
              { label: "Dashboard", href: "/", icon: '📊' },
              { label: "Reservas", href: "/reservas", icon: '📅' },
              { label: "Canchas", href: "/fields", icon: '🎾' },
              { label: "Clientes", href: "/customers", icon: '👥' },
              { label: "Pagos", href: "/payments", icon: '💳' },
              { label: "Configuración", href: "/settings", icon: '⚙️', active: true }
            ].map(({ label, href, icon, active }) => (
              <a
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  active ? "bg-brand-100 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
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
                <p className="text-sm text-gray-500">Administración</p>
                <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 ${
                  saved ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                <Save size={16} />
                {saved ? '¡Guardado!' : 'Guardar cambios'}
              </button>
            </div>
          </header>

          <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
              {/* Nav de secciones */}
              <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3 h-fit sticky top-24">
                {sections.map(section => {
                  const icons: Record<Section, React.ReactNode> = {
                    Complejo: <Building2 size={16} />,
                    Horarios: <Clock size={16} />,
                    Pagos: <CreditCard size={16} />,
                    Notificaciones: <Bell size={16} />,
                    Seguridad: <Shield size={16} />
                  };
                  return (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all text-left ${
                        activeSection === section
                          ? 'bg-brand-100 text-brand-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {icons[section]}
                      {section}
                    </button>
                  );
                })}
              </div>

              {/* Contenido de sección */}
              <div className="space-y-6">
                {activeSection === 'Complejo' && (
                  <>
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-6">Datos del complejo</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del complejo</label>
                          <input
                            type="text"
                            defaultValue="La Bombonera"
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dirección</label>
                          <input
                            type="text"
                            defaultValue="Av. Deportiva 456, Lima"
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                            <input
                              type="tel"
                              defaultValue="01 234 5678"
                              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                            <input
                              type="tel"
                              defaultValue="999 123 456"
                              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zona horaria</label>
                          <select className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
                            <option>America/Lima (UTC-5)</option>
                            <option>America/Bogota (UTC-5)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 'Horarios' && (
                  <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Horarios de operación</h3>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apertura</label>
                          <input type="time" defaultValue="07:00" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cierre</label>
                          <input type="time" defaultValue="23:00" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Granularidad de reservas</label>
                        <div className="flex gap-3">
                          {[15, 30, 60].map(min => (
                            <button
                              key={min}
                              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold border transition-all ${
                                min === 30
                                  ? 'bg-brand-600 text-white border-brand-600'
                                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {min} min
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Días hábiles</label>
                        <div className="flex gap-2 flex-wrap">
                          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                            <button
                              key={day}
                              className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-all ${
                                i < 6 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Pagos' && (
                  <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Métodos de pago</h3>
                    <div className="space-y-4">
                      {[
                        { name: "Yape", detail: "Número: 999 123 456", enabled: true, color: "bg-purple-100 text-purple-700" },
                        { name: "Plin", detail: "Número: 999 123 456", enabled: true, color: "bg-sky-100 text-sky-700" },
                        { name: "Efectivo", detail: "Sin configuración adicional", enabled: true, color: "bg-green-100 text-green-700" },
                        { name: "Transferencia bancaria", detail: "BCP Cta. 123-456-789", enabled: false, color: "bg-brand-100 text-brand-700" }
                      ].map(({ name, detail, enabled, color }) => (
                        <div key={name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{name}</span>
                            <p className="text-sm text-gray-600">{detail}</p>
                          </div>
                          <div className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors duration-200 ${enabled ? 'bg-brand-600' : 'bg-gray-300'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${enabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">% mínimo de adelanto</label>
                        <div className="flex items-center gap-3">
                          <input type="number" defaultValue={30} min={0} max={100} className="w-24 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-brand-500" />
                          <span className="text-sm text-gray-600">% del total para confirmar reserva</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Notificaciones' && (
                  <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Notificaciones</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Alerta de reserva próxima (60 min antes)", enabled: true },
                        { label: "Recordatorio de cobro pendiente", enabled: true },
                        { label: "Nueva reserva creada", enabled: false },
                        { label: "Reserva cancelada", enabled: true },
                        { label: "Resumen diario de operaciones", enabled: true }
                      ].map(({ label, enabled }) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-gray-700">{label}</span>
                          <div className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors ${enabled ? 'bg-brand-600' : 'bg-gray-300'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${enabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'Seguridad' && (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-6">Cambiar contraseña</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña actual</label>
                          <input type="password" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nueva contraseña</label>
                          <input type="password" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar nueva contraseña</label>
                          <input type="password" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
                        </div>
                        <button className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 text-sm font-semibold transition-all hover:scale-105">
                          Actualizar contraseña
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-red-50 border border-red-200 shadow-sm p-6">
                      <h3 className="font-bold text-red-700 text-lg mb-2">Zona peligrosa</h3>
                      <p className="text-sm text-gray-600 mb-4">Estas acciones son irreversibles.</p>
                      <button className="rounded-lg border border-red-300 bg-white text-red-700 hover:bg-red-100 px-4 py-2.5 text-sm font-semibold transition-all">
                        Cerrar todas las sesiones activas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
