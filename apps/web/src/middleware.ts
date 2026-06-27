import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Middleware de 3 zonas (ADR-003):
 *  - PÚBLICO  : `/`, `/c/*`, callbacks y páginas de auth (sin sesión).
 *  - CLIENTE  : `/cuenta*` exige sesión con `account_type=customer`.
 *  - DUEÑO    : `/panel*` exige `account_type=owner` + gate de complejo.
 * La sesión vive SOLO en cookies httpOnly. El tipo de cuenta se lee del JWT
 * (`user_metadata.account_type`), sin query extra.
 */

const OWNER_AUTH_PAGES = [
  '/panel/ingresar',
  '/panel/registro',
  '/panel/recuperar',
  '/panel/actualizar-clave',
];
const CUSTOMER_AUTH_PAGES = ['/ingresar', '/registro', '/recuperar', '/actualizar-clave'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // No coloques lógica entre createServerClient y getUser (refresca el token).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const accountType = (user?.user_metadata?.account_type as string | undefined) ?? 'owner';

  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = '';
    const res = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie);
    }
    return res;
  };

  // ----- Zona DUEÑO -----
  if (pathname === '/panel' || pathname.startsWith('/panel/')) {
    if (OWNER_AUTH_PAGES.includes(pathname)) {
      if (user && accountType === 'owner') return redirectTo('/panel');
      return supabaseResponse;
    }
    if (!user) return redirectTo('/panel/ingresar');
    if (accountType !== 'owner') return redirectTo('/');

    const isOnboarding = pathname === '/panel/onboarding';
    const { data: facility } = await supabase
      .from('facilities')
      .select('id')
      .limit(1)
      .maybeSingle();
    const hasFacility = Boolean(facility);
    if (!hasFacility && !isOnboarding) return redirectTo('/panel/onboarding');
    if (hasFacility && isOnboarding) return redirectTo('/panel');
    return supabaseResponse;
  }

  // ----- Zona CLIENTE -----
  if (pathname === '/cuenta' || pathname.startsWith('/cuenta/')) {
    if (!user) return redirectTo('/ingresar');
    // B-4: un no-cliente (dueño o sesión sin tipo) va al sitio público, NUNCA al
    // panel del dueño. Antes el rebote a /panel depositaba a clientes recién
    // registrados en el panel admin del primer complejo.
    if (accountType !== 'customer') return redirectTo('/');
    return supabaseResponse;
  }

  // Páginas de auth del cliente: si ya hay cliente logueado, va a su cuenta.
  if (CUSTOMER_AUTH_PAGES.includes(pathname) && user && accountType === 'customer') {
    return redirectTo('/cuenta');
  }

  // PÚBLICO (`/`, `/c/*`, `/auth/callback`, resto) — pasa.
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
