import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cliente Supabase para server components, server actions y route handlers.
 *
 * Usa `createServerClient` de `@supabase/ssr` con el store de cookies de
 * `next/headers`. La sesion vive SOLO en cookies httpOnly: jamas se expone al
 * bundle del cliente. Cumple la regla de seguridad innegociable.
 *
 * En server components puros (sin posibilidad de escribir cookies) el `set`
 * puede lanzar; lo ignoramos porque el middleware ya refresca la sesion.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component: ignorar. El middleware refresca
          // la sesion en cada request, asi que no se pierden cookies.
        }
      },
    },
  });
}
