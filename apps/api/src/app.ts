import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getSupabaseAdmin } from './shared/infrastructure/supabase.js';
import { registerAuthRoutes } from './modules/auth/presentation/auth-routes.js';
import { registerDocs } from './docs/openapi.js';

/**
 * Construye la instancia de Fastify con sus rutas y plugins, sin ponerla a escuchar.
 * Separar la construcción del `listen()` permite testear con `app.inject()` sin abrir un puerto.
 *
 * Auth: el login/signup/logout lo hace el frontend directo contra Supabase. Aquí
 * el backend SOLO valida el JWT de Supabase y expone el perfil del usuario.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });

  // Swagger debe registrarse antes de las rutas para poder documentarlas.
  await registerDocs(app);

  // Fail-fast: si faltan las envs de Supabase, fallamos al construir la app
  // con un mensaje claro (en vez de fallar silenciosamente en runtime).
  const supabase = getSupabaseAdmin();

  app.get(
    '/health',
    {
      schema: {
        tags: ['Sistema'],
        summary: 'Estado del servicio',
        description: 'Responde 200 si la API está arriba. No requiere autenticación.',
        response: {
          200: {
            type: 'object',
            required: ['ok', 'service', 'timestamp'],
            properties: {
              ok: { type: 'boolean', example: true },
              service: { type: 'string', example: 'app-deporte-api' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async () => ({
      ok: true,
      service: 'app-deporte-api',
      timestamp: new Date().toISOString(),
    }),
  );

  await registerAuthRoutes(app, supabase);

  return app;
}
