import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

export const DEMO_ADMIN = {
  id: 'admin-1',
  email: 'admin',
  password: 'admin123',
  fullName: 'Administrador APP DEPORTE',
  role: 'ADMIN' as const,
};

/**
 * Construye la instancia de Fastify con sus rutas y plugins, sin ponerla a escuchar.
 * Separar la construcción del `listen()` permite testear con `app.inject()` sin abrir un puerto.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true });

  app.get('/health', async () => ({
    ok: true,
    service: 'app-deporte-api',
    timestamp: new Date().toISOString(),
  }));

  app.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email?: string; password?: string };

    if (email !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
      return reply.code(401).send({
        message: 'Credenciales inválidas.',
      });
    }

    return {
      token: 'demo-admin-token',
      user: {
        id: DEMO_ADMIN.id,
        email: DEMO_ADMIN.email,
        fullName: DEMO_ADMIN.fullName,
        role: DEMO_ADMIN.role,
      },
    };
  });

  return app;
}
