"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpCustomer } from "@/services/customer-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

function nextTarget(): string {
  if (typeof window === "undefined") return "/cuenta";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/cuenta";
}

export default function CustomerSignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    startTransition(async () => {
      const res = await signUpCustomer({ email, password, fullName, phone });
      if (res.error) return setError(res.error);
      router.push(nextTarget());
      router.refresh();
    });
  };

  return (
    <AuthShell
      heroTitle="Juega más, gestiona menos."
      heroSubtitle="Crea tu cuenta para reservar canchas en segundos y guardar tus favoritas."
      title="Crea tu cuenta"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/ingresar" className="font-semibold text-lime-300 hover:text-lime-200">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tu nombre">
          <Input autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Correo">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
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
