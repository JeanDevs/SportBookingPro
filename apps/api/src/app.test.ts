import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';

describe('API app-deporte', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // El cliente Supabase server-side se construye con estas envs (fail-fast).
    // Valores dummy: no hacemos llamadas reales a Supabase en estos tests; las
    // rutas rechazan antes de tocar la red cuando no hay token.
    process.env.SUPABASE_URL ??= 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('responde 200 y reporta el servicio', async () => {
      const res = await app.inject({ method: 'GET', url: '/health' });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.ok).toBe(true);
      expect(body.service).toBe('app-deporte-api');
      expect(typeof body.timestamp).toBe('string');
    });
  });

  describe('GET /auth/me', () => {
    it('devuelve 401 cuando no se envía token', async () => {
      const res = await app.inject({ method: 'GET', url: '/auth/me' });

      expect(res.statusCode).toBe(401);
      expect(res.json().message).toBe('No autenticado.');
    });

    it('devuelve 401 cuando el header Authorization no es Bearer', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/auth/me',
        headers: { authorization: 'Basic abc123' },
      });

      expect(res.statusCode).toBe(401);
      // Nunca se filtran detalles internos del rechazo.
      expect(res.json().message).toBe('No autenticado.');
    });
  });

  describe('Swagger / OpenAPI', () => {
    it('sirve la UI en /docs', async () => {
      const res = await app.inject({ method: 'GET', url: '/docs' });
      // swagger-ui redirige /docs → /docs/ y sirve el HTML en la ruta con barra.
      const ui = res.statusCode === 302 ? await app.inject({ method: 'GET', url: '/docs/' }) : res;
      expect(ui.statusCode).toBe(200);
      expect(ui.headers['content-type']).toContain('text/html');
    });

    it('documenta las rutas Fastify y los endpoints de la app web', async () => {
      const res = await app.inject({ method: 'GET', url: '/docs/json' });
      expect(res.statusCode).toBe(200);
      const spec = res.json();
      expect(spec.openapi).toBe('3.0.3');
      expect(spec.info.title).toBe('SportBook Pro API');
      expect(Object.keys(spec.paths)).toEqual(
        expect.arrayContaining(['/health', '/auth/me', '/panel/reportes/exportar', '/auth/callback']),
      );
      expect(spec.paths['/auth/me'].get.security).toEqual([{ bearerAuth: [] }, { cookieAuth: [] }]);
      expect(spec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
      const exportParams = spec.paths['/panel/reportes/exportar'].get.parameters.map((p: { name: string }) => p.name);
      expect(exportParams).toEqual(['tipo', 'formato', 'desde', 'hasta']);
    });
  });
});
