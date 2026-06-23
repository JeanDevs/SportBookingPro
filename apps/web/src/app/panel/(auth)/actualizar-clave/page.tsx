"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/services/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

export default function OwnerUpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    startTransition(async () => {
      const res = await updatePassword(password);
      if (res.error) return setError(res.error);
      router.push("/panel");
      router.refresh();
    });
  };

  return (
    <AuthShell
      heroTitle="Una nueva contraseña."
      heroSubtitle="Elige una contraseña segura para tu panel."
      title="Nueva contraseña"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nueva contraseña" hint="Mínimo 6 caracteres">
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </AuthShell>
  );
}
