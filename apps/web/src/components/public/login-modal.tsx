"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { signInCustomer } from "@/services/customer-auth";
import { trackLoginCompleted } from "@/lib/analytics";
import { Modal } from "@/components/ui/modal";
import { Button, Field, Input, Alert } from "@/components/ui";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  facilityName?: string;
}

/**
 * Non-blocking login modal for facility detail page.
 * - Allows email + password login
 * - Can be skipped to continue browsing
 * - Pre-fills facility name in confirmation message
 * - Supports future social login (Google/Gmail)
 */
export function LoginModal({
  open,
  onClose,
  facilityName = "esta cancha",
}: LoginModalProps) {
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
      trackLoginCompleted("email");
      router.refresh();
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inicia sesión"
      description={`Reserva en ${facilityName} en segundos`}
      size="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Correo">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="tu@correo.com"
          />
        </Field>
        <Field label="Contraseña">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder="••••••••"
          />
        </Field>

        {error ? <Alert>{error}</Alert> : null}

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entrando…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Entrar
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            size="lg"
            onClick={onClose}
            disabled={isPending}
          >
            Continuar sin sesión
          </Button>
        </div>

        <p className="text-center text-xs text-ink-400">
          ¿Primera vez?{" "}
          <Link
            href="/registro"
            className="font-semibold text-lime-300 hover:text-lime-200"
          >
            Crea tu cuenta
          </Link>
        </p>
      </form>
    </Modal>
  );
}
