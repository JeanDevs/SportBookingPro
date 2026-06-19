import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { getSupabaseAdmin } from './shared/infrastructure/supabase.js';
import { registerAuthRoutes } from './modules/auth/presentation/auth-routes.js';

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

  // Fail-fast: si faltan las envs de Supabase, fallamos al construir la app
  // con un mensaje claro (en vez de fallar silenciosamente en runtime).
  const supabase = getSupabaseAdmin();

  app.get('/health', async () => ({
    ok: true,
    service: 'app-deporte-api',
    timestamp: new Date().toISOString(),
  }));

  await registerAuthRoutes(app, supabase);

  return app;
}
