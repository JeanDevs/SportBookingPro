'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Search, Edit, Archive, Plus, User } from 'lucide-react';
import {
  createCustomer,
  updateCustomer,
  setCustomerActive,
  type Customer,
} from '../../services/customers';
import { signOut } from '../../services/auth';

interface CustomersViewProps {
  customers: Customer[];
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

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase() || '?';
}

interface FormState {
  name: string;
  phone: string;
  notes: string;
}

const EMPTY_FORM: FormState = { name: '', phone: '', notes: '' };

export function CustomersView({ customers, facilityName }: CustomersViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        (customer.phone ?? '').toLowerCase().includes(term),
    );
  }, [customers, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone ?? '',
      notes: customer.notes ?? '',
    });
    setError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isPending) return;
    setFormOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateCustomer(editing.id, {
            name: form.name,
            phone: form.phone,
            notes: form.notes,
          })
        : await createCustomer({ name: form.name, phone: form.phone, notes: form.notes });

      if (result.error) {
        setError(result.error);
        return;
      }
      setFormOpen(false);
      router.refresh();
    });
  };

  const archive = (customer: Customer) => {
    startTransition(async () => {
      const result = await setCustomerActive(customer.id, false);
      if (!result.error) {
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white border-r border-gray-200 px-6 py-8 sticky top-0 h-screen">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
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
                  href === '/customers'
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
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

        {/* Main Content */}
        <section className="flex flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gestión de clientes</p>
                <h2 className="text-xl font-bold text-gray-900">Clientes</h2>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
              >
                <Plus size={16} /> Nuevo cliente
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 p-8">
            {/* Buscador */}
            <div className="relative mb-6">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por nombre o teléfono..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500"
              />
            </div>

            {customers.length === 0 ? (
              <div className="mx-auto mt-12 max-w-md rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="text-5xl">👥</div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">Aún no tienes clientes</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Registra tu primer cliente para asociarlo a reservas.
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                >
                  <Plus size={16} /> Crear primer cliente
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold text-gray-600">Cliente</th>
                      <th className="hidden px-6 py-3 text-left font-semibold text-gray-600 md:table-cell">
                        Teléfono
                      </th>
                      <th className="hidden px-6 py-3 text-left font-semibold text-gray-600 lg:table-cell">
                        Notas
                      </th>
                      <th className="px-6 py-3 text-right font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((customer, idx) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-blue-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
                                AVATAR_COLORS[idx % AVATAR_COLORS.length]
                              }`}
                            >
                              {initials(customer.name)}
                            </div>
                            <p className="font-semibold text-gray-900">{customer.name}</p>
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 text-gray-700 md:table-cell">
                          {customer.phone ?? <span className="text-gray-400">—</span>}
                        </td>
                        <td className="hidden max-w-xs truncate px-6 py-4 text-gray-500 lg:table-cell">
                          {customer.notes ?? <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(customer)}
                              disabled={isPending}
                              className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100 disabled:opacity-50"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => archive(customer)}
                              disabled={isPending}
                              title="Archivar cliente"
                              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-200 disabled:opacity-50"
                            >
                              <Archive size={14} /> Archivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                          <User size={20} className="mx-auto mb-2 text-gray-400" />
                          Sin resultados para “{search}”.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal crear/editar */}
      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900">
              {editing ? 'Editar cliente' : 'Nuevo cliente'}
            </h3>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Nombre</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="Ej. Carlos Mendoza"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Teléfono (opcional)</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="Ej. 999 111 222"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Notas (opcional)</span>
                <textarea
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  placeholder="Preferencias, observaciones..."
                  rows={3}
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                />
              </label>

              {error ? (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isPending}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-70"
                >
                  {isPending ? 'Guardando...' : editing ? 'Guardar' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
