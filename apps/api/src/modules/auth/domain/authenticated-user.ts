/**
 * Identidad mínima derivada de un token válido de Supabase.
 *
 * Multi-tenant: cada propietario es su propio tenant, por lo que
 * `ownerId === userId`. Se adjunta a `request.authUser` en rutas protegidas.
 */
export interface AuthenticatedUser {
  userId: string;
  ownerId: string;
  email: string;
}

/**
 * Perfil expuesto por GET /auth/me, leído de `public.users`.
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}
