"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updatePassword } from '../../../services/auth';

const MIN_PASSWORD_LENGTH = 8;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword(password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError('No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-[#f6f7f9] px-5 py-8 text-[#18212f] lg:grid-cols-[1fr_460px]">
      <section className="hidden items-end rounded-lg bg-[#143d2c] p-8 text-white lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b7d7c6]">
            APP DEPORTE
          </p>
          <h1 className="mt-3 max-w-xl text-5xl font-bold leading-tight">
            Control diario para complejos deportivos.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[#d7eadf]">
            Reservas, clientes, pagos y ocupacion en un solo panel.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-[#d8dee7] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#697586]">
            Acceso propietario
          </p>
          <h2 className="mt-2 text-3xl font-bold">Nueva contraseña</h2>

          {success ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-md bg-[#f0f9f4] px-3 py-2 text-sm text-[#1f7a4d]">
                Contraseña actualizada correctamente.
              </p>
              <button
                className="w-full rounded-md bg-[#143d2c] px-4 py-2.5 font-semibold text-white"
                onClick={() => router.push('/')}
                type="button"
              >
                Ir al panel
              </button>
              <Link
                className="block text-center text-sm font-semibold text-[#143d2c] hover:underline"
                href="/login"
              >
                Volver a iniciar sesion
              </Link>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-[#4b5565]">Nueva contraseña</span>
                <input
                  className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                  placeholder="Tu nueva contraseña"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#4b5565]">Confirmar contraseña</span>
                <input
                  className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                  placeholder="Repite la contraseña"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>

              {error ? (
                <p className="rounded-md bg-[#fff1f1] px-3 py-2 text-sm text-[#9f2d2d]">{error}</p>
              ) : null}

              <button
                className="w-full rounded-md bg-[#143d2c] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Guardando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
