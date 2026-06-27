"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/services/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

export default function OwnerSignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    startTransition(async () => {
      const res = await signUp({ email, password, fullName });
      if (res.error) return setError(res.error);
      router.push("/panel");
      router.refresh();
    });
  };

  return (
    <AuthShell
      heroTitle="Empieza a llenar tus canchas."
      heroSubtitle="Crea tu complejo en minutos y recibe reservas online desde el primer día."
      title="Crea tu complejo"
      subtitle="Gratis para empezar. Sin tarjeta."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/panel/ingresar" className="font-semibold text-lime-300 hover:text-lime-200">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tu nombre">
          <Input autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Correo">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Contraseña" hint="Mínimo 6 caracteres">
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
          {isPending ? "Creando…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthShell>
  );
}
