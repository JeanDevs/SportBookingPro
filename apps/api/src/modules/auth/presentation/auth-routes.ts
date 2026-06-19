import type { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from '../application/auth-service.js';
import { createAuthenticate } from './authenticate.js';

/**
 * Registra las rutas del módulo auth.
 *
 * El backend NO hace login/signup/logout (eso es client ↔ Supabase). Solo
 * valida el JWT y expone el perfil del usuario autenticado.
 */
export async function registerAuthRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
): Promise<void> {
  const authService = new AuthService(supabase);
  const authenticate = createAuthenticate(authService);

  /**
   * GET /auth/me — ruta canónica "¿mi token es válido y quién soy?".
   * Protegida por el preHandler de autenticación.
   */
  app.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    // `authUser` está garantizado por el preHandler (si llegamos aquí es válido).
    const authUser = request.authUser;
    if (!authUser) {
      return reply.code(401).send({ message: 'No autenticado.' });
    }

    const profile = await authService.getProfile(authUser.userId);

    if (!profile) {
      return reply.code(404).send({ message: 'Perfil no encontrado.' });
    }

    return profile;
  });
}
