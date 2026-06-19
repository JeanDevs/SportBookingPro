import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp, DEMO_ADMIN } from './app.js';

describe('API app-deporte', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
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

  describe('POST /auth/login', () => {
    it('devuelve token y usuario con credenciales válidas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: DEMO_ADMIN.email, password: DEMO_ADMIN.password },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.token).toBe('demo-admin-token');
      expect(body.user.role).toBe('ADMIN');
      // El password nunca debe viajar en la respuesta.
      expect(body.user.password).toBeUndefined();
    });

    it('devuelve 401 con password incorrecto', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: DEMO_ADMIN.email, password: 'wrong' },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json().message).toBe('Credenciales inválidas.');
    });

    it('devuelve 401 cuando faltan credenciales', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {},
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
