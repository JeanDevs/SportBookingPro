"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "@/services/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

export default function CustomerRecoverPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await resetPassword(email);
      if (res.error) return setError(res.error);
      setSent(true);
    });
  };

  return (
    <AuthShell
      heroTitle="Recupera tu acceso."
      heroSubtitle="Te enviaremos un enlace para crear una nueva contraseña."
      title="Recuperar contraseña"
      footer={
        <Link href="/ingresar" className="font-semibold text-lime-300 hover:text-lime-200">
          ← Volver a iniciar sesión
        </Link>
      }
    >
      {sent ? (
        <Alert tone="lime">
          Si el correo existe, te enviamos un enlace para restablecer tu contraseña. Revisa tu
          bandeja.
        </Alert>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Correo">
            <Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
