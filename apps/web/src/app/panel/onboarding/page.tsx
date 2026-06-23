"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFacility } from "@/services/facilities";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

/**
 * Gate de onboarding: primer paso tras el registro del dueño. Hasta crear su
 * complejo, el middleware lo mantiene aquí. Creado el complejo, pasa al panel.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createFacility({ name, phone, address });
      if (res.error) return setError(res.error);
      router.push("/panel");
      router.refresh();
    });
  };

  return (
    <AuthShell
      heroTitle="Configura tu complejo para empezar."
      heroSubtitle="Es el primer paso. Luego registras canchas, defines horarios y recibes reservas."
      title="Crea tu complejo"
      subtitle="Podrás editar estos datos después en Configuración."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre del complejo">
          <Input
            placeholder="Ej. Complejo La Bombonera"
            autoComplete="organization"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Teléfono (opcional)">
          <Input
            type="tel"
            placeholder="Ej. 999 888 777"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label="Dirección (opcional)">
          <Input
            placeholder="Ej. Av. Siempre Viva 123"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Creando…" : "Crear complejo y continuar"}
        </Button>
      </form>
    </AuthShell>
  );
}
