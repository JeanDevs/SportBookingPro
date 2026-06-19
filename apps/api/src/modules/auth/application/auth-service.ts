import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticatedUser, UserProfile } from '../domain/authenticated-user.js';

/**
 * Valida la forma de la fila devuelta por `public.users` antes de confiar en
 * ella. No confiamos ciegamente en la fuente de datos externa.
 */
const userRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string().nullable(),
  role: z.string(),
});

/**
 * Servicio de autenticación de la capa de aplicación.
 *
 * Encapsula la interacción con Supabase para validar tokens y leer perfiles.
 * No filtra detalles internos hacia arriba: ante token inválido devuelve `null`.
 */
export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Valida el access token contra Supabase Auth.
   * Devuelve la identidad mínima si es válido; `null` si es inválido/expirado.
   */
  async verifyToken(accessToken: string): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user || !data.user.email) {
      return null;
    }

    const userId = data.user.id;

    return {
      userId,
      ownerId: userId, // cada propietario es su propio tenant
      email: data.user.email,
    };
  }

  /**
   * Lee el perfil desde `public.users`. Devuelve `null` si no existe fila.
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const parsed = userRowSchema.safeParse(data);
    if (!parsed.success) {
      return null;
    }

    const row = parsed.data;

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
    };
  }
}
