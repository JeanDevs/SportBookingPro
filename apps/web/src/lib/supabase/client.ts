import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para componentes cliente ("use client").
 *
 * Usa `createBrowserClient` de `@supabase/ssr`, que sincroniza la sesion con
 * las cookies httpOnly gestionadas por el server. NUNCA persiste tokens en
 * localStorage/sessionStorage: cumple la regla de seguridad innegociable.
 *
 * La `NEXT_PUBLIC_SUPABASE_ANON_KEY` es publica por diseño (protegida por RLS).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.',
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
