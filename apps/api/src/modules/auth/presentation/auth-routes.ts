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

  const messageSchema = {
    type: 'object',
    required: ['message'],
    properties: { message: { type: 'string' } },
  } as const;

  /**
   * GET /auth/me — ruta canónica "¿mi token es válido y quién soy?".
   * Protegida por el preHandler de autenticación.
   */
  app.get(
    '/auth/me',
    {
      preHandler: authenticate,
      schema: {
        tags: ['Autenticación'],
        summary: 'Perfil del usuario autenticado',
        description:
          'Valida el token de Supabase y devuelve el perfil del propietario leído de `public.users`.',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        response: {
          200: {
            type: 'object',
            required: ['id', 'email', 'fullName', 'role'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              fullName: { type: 'string', nullable: true },
              role: { type: 'string', example: 'OWNER' },
            },
          },
          401: { description: 'Token ausente, inválido o vencido.', ...messageSchema },
          404: { description: 'El usuario no tiene perfil de propietario.', ...messageSchema },
        },
      },
    },
    async (request, reply) => {
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
    },
  );
}
