"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Clock, Building2, ExternalLink } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Field,
  Label,
  Input,
  Textarea,
  Select,
  Alert,
  Badge,
} from "@/components/ui";
import { PageHeader, PageBody } from "@/components/panel/page-header";
import {
  updateFacilitySettings,
  setFieldAvailability,
  publishFacility,
  unpublishFacility,
  type FacilitySettings,
  type FieldAvailability,
} from "@/services/settings";
import { WEEKDAYS_ES, fieldTypeMeta, AMENITIES, AMENITY_KEYS } from "@/lib/domain";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Lun … Dom

interface DayRow {
  dayOfWeek: number;
  open: boolean;
  start: string;
  end: string;
}

function buildWeek(av: FieldAvailability | undefined): DayRow[] {
  return WEEK_ORDER.map((dow) => {
    const win = av?.windows.find((w) => w.dayOfWeek === dow);
    return {
      dayOfWeek: dow,
      open: Boolean(win),
      start: win?.startTime ?? "08:00",
      end: win?.endTime ?? "23:00",
    };
  });
}

export function ConfiguracionView({
  settings,
  availability,
}: {
  settings: FacilitySettings;
  availability: FieldAvailability[];
}) {
  const router = useRouter();

  return (
    <>
      <PageHeader eyebrow="Ajustes" title="Configuración" />
      <PageBody>
        <div className="grid gap-6 lg:grid-cols-2">
          <GeneralForm settings={settings} onSaved={() => router.refresh()} />
          <PublishCard settings={settings} onSaved={() => router.refresh()} />
        </div>
        <div className="mt-6">
          <AvailabilityCard availability={availability} onSaved={() => router.refresh()} />
        </div>
      </PageBody>
    </>
  );
}

function GeneralForm({ settings, onSaved }: { settings: FacilitySettings; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "lime" | "red"; text: string } | null>(null);
  const [name, setName] = useState(settings.name);
  const [phone, setPhone] = useState(settings.phone ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [district, setDistrict] = useState(settings.district ?? "");
  const [description, setDescription] = useState(settings.description ?? "");
  const [deposit, setDeposit] = useState(String(settings.depositPercentage));
  const [hold, setHold] = useState(String(settings.holdMinutes));
  const [amenities, setAmenities] = useState<string[]>(settings.amenities);

  const toggleAmenity = (key: string) =>
    setAmenities((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const save = () => {
    setMsg(null);
    startTransition(async () => {
      const res = await updateFacilitySettings(settings.id, {
        name,
        phone,
        address,
        district,
        description,
        depositPercentage: Number(deposit),
        holdMinutes: Number(hold),
        amenities,
      });
      if (res.error) setMsg({ tone: "red", text: res.error });
      else {
        setMsg({ tone: "lime", text: "Cambios guardados." });
        onSaved();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 size={18} className="text-lime-300" /> Datos del complejo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Distrito">
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Ej. Miraflores" />
          </Field>
        </div>
        <Field label="Dirección">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Descripción (sitio público)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cuéntale a tus clientes qué ofrece tu complejo."
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Adelanto (%)" hint="0 a 100">
            <Input type="number" min="0" max="100" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
          </Field>
          <Field label="Bloqueo (min)" hint="Expira la intención">
            <Input type="number" min="1" max="120" value={hold} onChange={(e) => setHold(e.target.value)} />
          </Field>
        </div>
        <div>
          <Label>Comodidades (se muestran en tu ficha pública)</Label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_KEYS.map((key) => {
              const active = amenities.includes(key);
              const a = AMENITIES[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAmenity(key)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition " +
                    (active
                      ? "border-lime-400/50 bg-lime-400/15 text-lime-200"
                      : "border-ink-700 bg-ink-900/60 text-ink-300 hover:border-ink-600")
                  }
                >
                  <span>{a.emoji}</span> {a.label}
                </button>
              );
            })}
          </div>
        </div>
        {msg ? <Alert tone={msg.tone}>{msg.text}</Alert> : null}
        <div className="flex justify-end">
          <Button onClick={save} disabled={isPending}>
            <Check size={16} /> {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PublishCard({ settings, onSaved }: { settings: FacilitySettings; onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [published, setPublished] = useState(settings.isPublished);
  const [error, setError] = useState("");
  const publicPath = settings.slug ? `/c/${settings.slug}` : null;

  // Publicar pasa por publishFacility, que valida precondiciones (≥1 cancha
  // activa con horario) para no quedar visible sin slots reservables.
  const toggle = () => {
    const next = !published;
    setError("");
    setPublished(next);
    startTransition(async () => {
      const res = next
        ? await publishFacility(settings.id)
        : await unpublishFacility(settings.id);
      if (res.error) {
        setPublished(!next);
        setError(res.error);
      } else {
        onSaved();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe size={18} className="text-lime-300" /> Sitio público
        </CardTitle>
        <Badge tone={published ? "lime" : "ink"} dot>
          {published ? "Publicado" : "Oculto"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-ink-300">
          Cuando publicas tu complejo, aparece en el marketplace y tus clientes pueden reservar
          online y enviar su adelanto.
        </p>
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          className={
            "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition " +
            (published
              ? "border-lime-400/30 bg-lime-400/10"
              : "border-ink-700 bg-ink-900/60 hover:border-ink-600")
          }
        >
          <span className="text-sm font-semibold text-ink-100">
            {published ? "Tu complejo está visible" : "Publicar mi complejo"}
          </span>
          <span
            className={
              "relative h-6 w-11 rounded-full transition " +
              (published ? "bg-lime-400" : "bg-ink-700")
            }
          >
            <span
              className={
                "absolute top-0.5 h-5 w-5 rounded-full bg-ink-950 transition " +
                (published ? "left-[22px]" : "left-0.5")
              }
            />
          </span>
        </button>
        {error ? <Alert>{error}</Alert> : null}
        {publicPath ? (
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            <ExternalLink size={14} /> {publicPath}
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AvailabilityCard({
  availability,
  onSaved,
}: {
  availability: FieldAvailability[];
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [fieldId, setFieldId] = useState(availability[0]?.fieldId ?? "");
  const current = availability.find((a) => a.fieldId === fieldId);
  const [week, setWeek] = useState<DayRow[]>(buildWeek(current));
  const [msg, setMsg] = useState<{ tone: "lime" | "red"; text: string } | null>(null);

  const onPickField = (id: string) => {
    setFieldId(id);
    setWeek(buildWeek(availability.find((a) => a.fieldId === id)));
    setMsg(null);
  };

  const update = (dow: number, patch: Partial<DayRow>) =>
    setWeek((w) => w.map((d) => (d.dayOfWeek === dow ? { ...d, ...patch } : d)));

  const save = () => {
    setMsg(null);
    const windows = week
      .filter((d) => d.open)
      .map((d) => ({ dayOfWeek: d.dayOfWeek, startTime: d.start, endTime: d.end }));
    startTransition(async () => {
      const res = await setFieldAvailability(fieldId, windows);
      if (res.error) setMsg({ tone: "red", text: res.error });
      else {
        setMsg({ tone: "lime", text: "Horario guardado." });
        onSaved();
      }
    });
  };

  if (availability.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-ink-400">
          Crea una cancha activa para configurar sus horarios de atención.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock size={18} className="text-lime-300" /> Horarios de atención
        </CardTitle>
        <div className="w-56">
          <Select value={fieldId} onChange={(e) => onPickField(e.target.value)}>
            {availability.map((a) => (
              <option key={a.fieldId} value={a.fieldId}>
                {fieldTypeMeta(a.fieldType).label} · {a.fieldName}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="mb-2 text-sm text-ink-400">
          Define qué días y en qué franja se puede reservar esta cancha. Los slots de 30 min se
          generan automáticamente.
        </p>
        {week.map((d) => (
          <div
            key={d.dayOfWeek}
            className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/40 px-3 py-2"
          >
            <label className="flex w-32 shrink-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={d.open}
                onChange={(e) => update(d.dayOfWeek, { open: e.target.checked })}
                className="h-4 w-4 accent-lime-400"
              />
              <span className={d.open ? "text-ink-100" : "text-ink-500"}>
                {WEEKDAYS_ES[d.dayOfWeek]}
              </span>
            </label>
            <div className="flex flex-1 items-center gap-2">
              <input
                type="time"
                step={1800}
                value={d.start}
                disabled={!d.open}
                onChange={(e) => update(d.dayOfWeek, { start: e.target.value })}
                className="h-9 flex-1 rounded-lg border border-ink-700 bg-ink-900 px-2 text-sm text-ink-100 outline-none disabled:opacity-40"
              />
              <span className="text-ink-500">→</span>
              <input
                type="time"
                step={1800}
                value={d.end}
                disabled={!d.open}
                onChange={(e) => update(d.dayOfWeek, { end: e.target.value })}
                className="h-9 flex-1 rounded-lg border border-ink-700 bg-ink-900 px-2 text-sm text-ink-100 outline-none disabled:opacity-40"
              />
            </div>
          </div>
        ))}
        {msg ? <Alert tone={msg.tone}>{msg.text}</Alert> : null}
        <div className="flex justify-end pt-2">
          <Button onClick={save} disabled={isPending}>
            <Check size={16} /> {isPending ? "Guardando…" : "Guardar horario"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
