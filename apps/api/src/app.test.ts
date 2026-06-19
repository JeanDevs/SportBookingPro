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
});
