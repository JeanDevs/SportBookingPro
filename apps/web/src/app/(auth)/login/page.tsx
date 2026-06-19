"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '../../../services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('No se pudo iniciar sesion.');
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
          <h2 className="mt-2 text-3xl font-bold">Iniciar sesion</h2>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-[#4b5565]">Email</span>
              <input
                className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                placeholder="tucorreo@ejemplo.com"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#4b5565]">Password</span>
              <input
                className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                placeholder="Tu contraseña"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? <p className="rounded-md bg-[#fff1f1] px-3 py-2 text-sm text-[#9f2d2d]">{error}</p> : null}

            <button
              className="w-full rounded-md bg-[#143d2c] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link className="font-semibold text-[#143d2c] hover:underline" href="/forgot-password">
              Olvide mi contraseña
            </Link>
            <Link className="font-semibold text-[#143d2c] hover:underline" href="/signup">
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
