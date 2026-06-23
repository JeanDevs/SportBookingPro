"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, Search, Users } from "lucide-react";
import { Button, Modal, Field, Input, Textarea, EmptyState, Alert, Badge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/panel/page-header";
import {
  createCustomer,
  updateCustomer,
  setCustomerActive,
  type Customer,
} from "@/services/customers";
import { initials } from "@/lib/format";

interface FormState {
  name: string;
  phone: string;
  notes: string;
}
const EMPTY: FormState = { name: "", phone: "", notes: "" };

export function ClientesView({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? "").toLowerCase().includes(q),
    );
  }, [customers, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone ?? "", notes: c.notes ?? "" });
    setError("");
    setOpen(true);
  };

  const submit = () => {
    setError("");
    if (!form.name.trim()) return setError("El nombre es obligatorio.");
    startTransition(async () => {
      const res = editing
        ? await updateCustomer(editing.id, { name: form.name, phone: form.phone, notes: form.notes })
        : await createCustomer({ name: form.name, phone: form.phone, notes: form.notes });
      if (res.error) return setError(res.error);
      setOpen(false);
      router.refresh();
    });
  };

  const archive = (c: Customer) =>
    startTransition(async () => {
      await setCustomerActive(c.id, false);
      router.refresh();
    });

  return (
    <>
      <PageHeader
        eyebrow="Tu cartera"
        title="Clientes"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} /> Nuevo cliente
          </Button>
        }
      />
      <PageBody>
        <div className="relative mb-5 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por nombre o teléfono…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? "Sin resultados" : "Aún no tienes clientes"}
            description={
              query ? "Prueba con otro nombre o teléfono." : "Registra clientes para asignarlos a reservas."
            }
            action={
              !query ? (
                <Button onClick={openCreate}>
                  <Plus size={16} /> Nuevo cliente
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink-700/70">
            <table className="w-full text-sm">
              <thead className="bg-ink-850 text-left text-xs uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Teléfono</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Notas</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="bg-ink-900/40 hover:bg-ink-850/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-700 text-xs font-bold text-lime-300">
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-50">{c.name}</p>
                          {!c.isActive ? (
                            <Badge tone="ink" className="mt-0.5">
                              Archivado
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-300 sm:table-cell">{c.phone ?? "—"}</td>
                    <td className="hidden max-w-xs px-4 py-3 md:table-cell">
                      <span className="line-clamp-1 text-ink-400">{c.notes ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(c)} disabled={isPending}>
                          <Pencil size={14} />
                        </Button>
                        {c.isActive ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => archive(c)}
                            disabled={isPending}
                            title="Archivar"
                          >
                            <Archive size={14} />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageBody>

      <Modal
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title={editing ? "Editar cliente" : "Nuevo cliente"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? "Guardando…" : editing ? "Guardar" : "Crear"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nombre">
            <Input
              placeholder="Ej. Carlos Mendoza"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <Input
              type="tel"
              placeholder="Ej. 999 888 777"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Notas">
            <Textarea
              placeholder="Preferencias, equipo, etc."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          {error ? <Alert>{error}</Alert> : null}
        </div>
      </Modal>
    </>
  );
}
