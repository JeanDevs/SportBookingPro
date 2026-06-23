"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInCustomer } from "@/services/customer-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, Field, Input, Alert } from "@/components/ui";

function nextTarget(): string {
  if (typeof window === "undefined") return "/cuenta";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/cuenta";
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await signInCustomer(email, password);
      if (res.error) return setError(res.error);
      router.push(nextTarget());
      router.refresh();
    });
  };

  return (
    <AuthShell
      heroTitle="Vuelve a la cancha."
      heroSubtitle="Inicia sesión para reservar y seguir tus partidos."
      title="Ingresa a tu cuenta"
      footer={
        <>
          ¿Primera vez?{" "}
          <Link href="/registro" className="font-semibold text-lime-300 hover:text-lime-200">
            Crea tu cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Correo">
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
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
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
