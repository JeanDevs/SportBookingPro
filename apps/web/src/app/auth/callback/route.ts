import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

/**
 * Callback de autenticación (flujo PKCE de `@supabase/ssr`). Intercambia `?code=`
 * por una sesión en cookies httpOnly. Soporta `?next=` (destino interno). El
 * destino decide la zona de error: panel del dueño vs. portal del cliente.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/';
  const errorPath = next.startsWith('/panel')
    ? '/panel/ingresar?error=auth'
    : '/ingresar?error=auth';

  if (!code) {
    return NextResponse.redirect(`${origin}${errorPath}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}${errorPath}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
