'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Edit, Power, Wrench, Plus } from 'lucide-react';
import {
  createField,
  updateField,
  setFieldStatus,
  type Field,
  type FieldType,
  type FieldStatus,
} from '../../services/fields';
import { signOut } from '../../services/auth';

interface FieldsViewProps {
  fields: Field[];
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

const TYPE_OPTIONS: { value: FieldType; label: string; emoji: string }[] = [
  { value: 'FUTBOL_5', label: 'Fútbol 5', emoji: '⚽' },
  { value: 'FUTBOL_6', label: 'Fútbol 6', emoji: '⚽' },
  { value: 'FUTBOL_7', label: 'Fútbol 7', emoji: '⚽' },
  { value: 'FUTBOL_8', label: 'Fútbol 8', emoji: '⚽' },
  { value: 'FUTBOL_11', label: 'Fútbol 11', emoji: '⚽' },
  { value: 'VOLEY', label: 'Vóley', emoji: '🏐' },
  { value: 'TENNIS', label: 'Tenis', emoji: '🎾' },
  { value: 'OTHER', label: 'Otro', emoji: '🏟️' },
];

const STATUS_BADGE: Record<FieldStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Activa', className: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Inactiva', className: 'bg-gray-200 text-gray-600' },
  MAINTENANCE: { label: 'Mantenimiento', className: 'bg-amber-100 text-amber-700' },
};

const FALLBACK_TYPE: { value: FieldType; label: string; emoji: string } = {
  value: 'OTHER',
  label: 'Otro',
  emoji: '🏟️',
};

function typeMeta(type: FieldType) {
  return TYPE_OPTIONS.find((option) => option.value === type) ?? FALLBACK_TYPE;
}

interface FormState {
  name: string;
  type: FieldType;
  pricePerHour: string;
}

const EMPTY_FORM: FormState = { name: '', type: 'FUTBOL_7', pricePerHour: '' };

export function FieldsView({ fields, facilityName }: FieldsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // `editing` distingue alta (null) de edición (Field). `formOpen` controla el modal.
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (field: Field) => {
    setEditing(field);
    setForm({
      name: field.name,
      type: field.type,
      pricePerHour: String(field.pricePerHour),
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

    const price = Number(form.pricePerHour);
    if (!form.name.trim()) {
      setError('El nombre de la cancha es obligatorio.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('La tarifa por hora debe ser un número mayor o igual a 0.');
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updateField(editing.id, {
            name: form.name,
            type: form.type,
            pricePerHour: price,
          })
        : await createField({ name: form.name, type: form.type, pricePerHour: price });

      if (result.error) {
        setError(result.error);
        return;
      }
      setFormOpen(false);
      router.refresh();
    });
  };

  const changeStatus = (field: Field, status: FieldStatus) => {
    startTransition(async () => {
      const result = await setFieldStatus(field.id, status);
      if (!result.error) {
        router.refresh();
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white text-gray-900 shadow-lg border-r border-gray-200 px-6 py-8 sticky top-0 h-screen">
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
                  href === '/fields'
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

        {/* Main Content */}
        <section className="flex flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gestión de instalaciones</p>
                <h2 className="text-xl font-bold text-gray-900">Canchas Deportivas</h2>
              </div>
              <button
                type="button"
                onClick={openCreate}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-700"
              >
                <Plus size={16} /> Nueva Cancha
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 overflow-auto p-8">
            {fields.length === 0 ? (
              <div className="mx-auto mt-16 max-w-md rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <div className="text-5xl">🎾</div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  Aún no tienes canchas
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Crea tu primera cancha para empezar a recibir reservas.
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-700"
                >
                  <Plus size={16} /> Crear primera cancha
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => {
                  const meta = typeMeta(field.type);
                  const badge = STATUS_BADGE[field.status];
                  return (
                    <div
                      key={field.id}
                      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="text-4xl">{meta.emoji}</div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-gray-900">{field.name}</h3>
                      <p className="mb-4 text-sm text-gray-600">{meta.label}</p>
                      <p className="mb-4 text-sm font-semibold text-gray-900">
                        S/ {field.pricePerHour.toFixed(2)} / hora
                      </p>

                      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
                        <button
                          type="button"
                          onClick={() => openEdit(field)}
                          disabled={isPending}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-50 py-2 text-sm font-semibold text-brand-600 transition-all duration-300 hover:bg-brand-100 disabled:opacity-50"
                        >
                          <Edit size={16} /> Editar
                        </button>
                        {field.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(field, 'INACTIVE')}
                            disabled={isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-600 transition-all duration-300 hover:bg-gray-200 disabled:opacity-50"
                          >
                            <Power size={16} /> Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => changeStatus(field, 'ACTIVE')}
                            disabled={isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 py-2 text-sm font-semibold text-green-700 transition-all duration-300 hover:bg-green-100 disabled:opacity-50"
                          >
                            <Power size={16} /> Activar
                          </button>
                        )}
                        {field.status !== 'MAINTENANCE' ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(field, 'MAINTENANCE')}
                            disabled={isPending}
                            title="Marcar en mantenimiento"
                            className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition-all duration-300 hover:bg-amber-100 disabled:opacity-50"
                          >
                            <Wrench size={16} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
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
              {editing ? 'Editar cancha' : 'Nueva cancha'}
            </h3>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Nombre</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-brand-600"
                  placeholder="Ej. Cancha 1"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Tipo</span>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-brand-600"
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value as FieldType })
                  }
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Tarifa por hora (S/)</span>
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-brand-600"
                  placeholder="Ej. 120"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.pricePerHour}
                  onChange={(event) =>
                    setForm({ ...form, pricePerHour: event.target.value })
                  }
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
                  className="flex-1 rounded-md bg-brand-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-brand-700 disabled:opacity-70"
                >
                  {isPending ? 'Guardando...' : editing ? 'Guardar' : 'Crear cancha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
