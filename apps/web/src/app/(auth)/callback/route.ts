import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

/**
 * Route handler de callback de autenticacion (flujo PKCE de `@supabase/ssr`).
 *
 * Lee `?code=` de la URL e intercambia el codigo por una sesion, fijandola en
 * cookies httpOnly via el server client. Cumple la regla de seguridad: ningun
 * token vive en el bundle del cliente ni en storage del navegador.
 *
 * Soporta `?next=` para el destino tras el intercambio (p. ej. /update-password
 * en recuperacion de contraseña). Por defecto redirige a `/`. Si falta `code` o
 * el intercambio falla, redirige a `/login?error=auth` sin filtrar detalles.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');

  // Solo aceptamos rutas internas relativas para evitar open-redirects.
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
