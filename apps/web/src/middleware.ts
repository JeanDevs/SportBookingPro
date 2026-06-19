import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Rutas publicas de autenticacion (no requieren sesion).
 */
const PUBLIC_AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/callback',
  '/update-password',
];

/**
 * Ruta del gate de onboarding: requiere sesion pero NO requiere complejo (es
 * justo donde el propietario lo crea). Se excluye del chequeo de complejo para
 * no entrar en un bucle de redireccion.
 */
const ONBOARDING_ROUTE = '/onboarding';

/**
 * Refresca la sesion en cada request (patron oficial de `@supabase/ssr`) y
 * protege las rutas de negocio. Si no hay usuario autenticado, redirige a
 * `/login`. La sesion vive SOLO en cookies httpOnly.
 */
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

  // IMPORTANTE: getUser() refresca el token si hace falta y revalida la sesion.
  // No coloques logica entre createServerClient y getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!user && !isPublicAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Gate de onboarding: un propietario autenticado sin complejo no puede usar
  // las rutas de negocio (no existe cancha/reserva/pago sin un complejo). Se
  // comprueba dentro de las rutas privadas, no en las publicas de auth, para
  // evitar una query innecesaria en /login, /signup, etc. RLS hace que la query
  // solo pueda ver el complejo propio.
  if (user && !isPublicAuthRoute) {
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

    const { data: facility } = await supabase
      .from('facilities')
      .select('id')
      .limit(1)
      .maybeSingle();
    const hasFacility = Boolean(facility);

    if (!hasFacility && !isOnboardingRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = ONBOARDING_ROUTE;
      return NextResponse.redirect(redirectUrl);
    }

    if (hasFacility && isOnboardingRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  /**
   * Protege todo excepto assets estaticos y favicon. Las rutas de negocio
   * (/, /reservas, /fields, /customers, /payments, /settings, /dashboard)
   * quedan cubiertas; las rutas de /login, /signup y /forgot-password se
   * dejan pasar dentro del middleware.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
