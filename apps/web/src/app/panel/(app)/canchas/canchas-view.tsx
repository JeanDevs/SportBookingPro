"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Power, Wrench, Goal } from "lucide-react";
import {
  Button,
  Modal,
  Field,
  Input,
  Select,
  Badge,
  EmptyState,
  Alert,
  Card,
} from "@/components/ui";
import { PageHeader, PageBody } from "@/components/panel/page-header";
import {
  createField,
  updateField,
  setFieldStatus,
  type Field as CourtField,
  type FieldType,
  type FieldStatus,
} from "@/services/fields";
import { formatPEN } from "@/lib/format";
import { FIELD_TYPE_META, fieldTypeMeta } from "@/lib/domain";
import type { BadgeTone } from "@/components/ui/badge";

const STATUS_META: Record<FieldStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Activa", tone: "lime" },
  INACTIVE: { label: "Inactiva", tone: "ink" },
  MAINTENANCE: { label: "Mantenimiento", tone: "amber" },
};

interface FormState {
  name: string;
  type: FieldType;
  pricePerHour: string;
}

const EMPTY: FormState = { name: "", type: "FUTBOL_7", pricePerHour: "" };

export function CanchasView({ fields }: { fields: CourtField[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourtField | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setOpen(true);
  };
  const openEdit = (f: CourtField) => {
    setEditing(f);
    setForm({ name: f.name, type: f.type, pricePerHour: String(f.pricePerHour) });
    setError("");
    setOpen(true);
  };

  const submit = () => {
    setError("");
    const price = Number(form.pricePerHour);
    if (!form.name.trim()) return setError("El nombre es obligatorio.");
    if (!Number.isFinite(price) || price < 0) return setError("Tarifa inválida.");
    startTransition(async () => {
      const res = editing
        ? await updateField(editing.id, { name: form.name, type: form.type, pricePerHour: price })
        : await createField({ name: form.name, type: form.type, pricePerHour: price });
      if (res.error) return setError(res.error);
      setOpen(false);
      router.refresh();
    });
  };

  const changeStatus = (f: CourtField, status: FieldStatus) =>
    startTransition(async () => {
      await setFieldStatus(f.id, status);
      router.refresh();
    });

  return (
    <>
      <PageHeader
        eyebrow="Instalaciones"
        title="Canchas"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} /> Nueva cancha
          </Button>
        }
      />
      <PageBody>
        {fields.length === 0 ? (
          <EmptyState
            icon={Goal}
            title="Aún no tienes canchas"
            description="Crea tu primera cancha para empezar a recibir reservas."
            action={
              <Button onClick={openCreate}>
                <Plus size={16} /> Crear cancha
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => {
              const meta = fieldTypeMeta(f.type);
              const badge = STATUS_META[f.status];
              return (
                <Card key={f.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{meta.emoji}</span>
                    <Badge tone={badge.tone} dot>
                      {badge.label}
                    </Badge>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink-50">{f.name}</h3>
                  <p className="text-sm text-ink-400">{meta.label}</p>
                  <p className="mt-2 font-semibold text-lime-300">{formatPEN(f.pricePerHour)} / hora</p>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-800 pt-4">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(f)} disabled={isPending}>
                      <Pencil size={14} /> Editar
                    </Button>
                    {f.status === "ACTIVE" ? (
                      <Button size="sm" variant="ghost" onClick={() => changeStatus(f, "INACTIVE")} disabled={isPending}>
                        <Power size={14} /> Desactivar
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => changeStatus(f, "ACTIVE")} disabled={isPending}>
                        <Power size={14} /> Activar
                      </Button>
                    )}
                    {f.status !== "MAINTENANCE" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus(f, "MAINTENANCE")}
                        disabled={isPending}
                        title="Marcar en mantenimiento"
                      >
                        <Wrench size={14} />
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageBody>

      <Modal
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title={editing ? "Editar cancha" : "Nueva cancha"}
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
              placeholder="Ej. Cancha 1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as FieldType })}
            >
              {(Object.keys(FIELD_TYPE_META) as FieldType[]).map((t) => (
                <option key={t} value={t}>
                  {FIELD_TYPE_META[t].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tarifa por hora (S/)">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 120"
              value={form.pricePerHour}
              onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
            />
          </Field>
          {error ? <Alert>{error}</Alert> : null}
        </div>
      </Modal>
    </>
  );
}
