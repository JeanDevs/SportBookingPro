"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFacility } from '../../services/facilities';

/**
 * Gate de onboarding: primer paso obligatorio tras el registro. El propietario
 * crea su complejo aqui; hasta entonces el middleware lo mantiene en esta ruta.
 * Una vez creado, el middleware lo deja pasar al panel.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createFacility({ name, phone, address });
      if (result.error) {
        setError(result.error);
        return;
      }
      // El complejo ya existe: el middleware permitira el acceso al panel.
      // `?tour=1` dispara el tour guiado de bienvenida una sola vez.
      router.push('/?tour=1');
      router.refresh();
    } catch {
      setError('No se pudo crear el complejo.');
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
            Configura tu complejo para empezar.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[#d7eadf]">
            Es el primer paso: luego podras registrar tus canchas, clientes y reservas.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-[#d8dee7] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#697586]">
            Primer paso
          </p>
          <h2 className="mt-2 text-3xl font-bold">Crea tu complejo</h2>
          <p className="mt-2 text-sm text-[#697586]">
            Necesitamos algunos datos basicos. Podras editarlos despues en Configuracion.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-[#4b5565]">Nombre del complejo</span>
              <input
                className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                placeholder="Ej. La Bombonera"
                type="text"
                autoComplete="organization"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#4b5565]">Telefono (opcional)</span>
              <input
                className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                placeholder="Ej. 999 888 777"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#4b5565]">Direccion (opcional)</span>
              <input
                className="mt-2 w-full rounded-md border border-[#c9d2df] px-3 py-2 outline-none focus:border-[#143d2c]"
                placeholder="Ej. Av. Siempre Viva 123"
                type="text"
                autoComplete="street-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
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
              {loading ? 'Creando...' : 'Crear complejo y continuar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
