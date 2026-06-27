"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/services/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await signIn(email, password);
      if (res.error) return setError(res.error);
      router.push("/panel");
      router.refresh();
    });
  };

  return (
    <AuthShell
      heroTitle="Tu complejo, bajo control."
      heroSubtitle="Reservas, pagos y clientes en un panel hecho para llenar tus canchas."
      title="Entra a tu panel"
      subtitle="Gestiona tu complejo deportivo."
      footer={
        <>
          ¿Aún no tienes cuenta?{" "}
          <Link href="/panel/registro" className="font-semibold text-lime-300 hover:text-lime-200">
            Crea tu complejo
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Correo">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Contraseña">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="text-right">
          <Link href="/panel/recuperar" className="text-sm font-medium text-lime-300 hover:text-lime-200">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
