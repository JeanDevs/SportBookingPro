import { describe, it, expect } from 'vitest';
import type { FastifyRequest } from 'fastify';
import { extractAccessToken } from './extract-token.js';

/**
 * `extractAccessToken` es lógica de seguridad pura: decide qué token se valida
 * contra Supabase. Un fallo aquí = autenticación rota o token filtrado, así que
 * cubrimos Bearer, cookies de @supabase/ssr (planas, URL-encoded, base64 y
 * fragmentadas) y los caminos de rechazo.
 */

function makeRequest(headers: { authorization?: string; cookie?: string }): FastifyRequest {
  return { headers } as FastifyRequest;
}

function supabaseCookieValue(payload: object): string {
  // @supabase/ssr serializa la sesión como JSON y la prefija con "base64-".
  const json = JSON.stringify(payload);
  return 'base64-' + Buffer.from(json, 'utf8').toString('base64');
}

describe('extractAccessToken', () => {
  describe('Authorization: Bearer', () => {
    it('extrae el token de un header Bearer válido', () => {
      const req = makeRequest({ authorization: 'Bearer abc.def.ghi' });
      expect(extractAccessToken(req)).toBe('abc.def.ghi');
    });

    it('es case-insensitive en el esquema y recorta espacios', () => {
      const req = makeRequest({ authorization: 'bearer    abc.def.ghi  ' });
      expect(extractAccessToken(req)).toBe('abc.def.ghi');
    });

    it('rechaza un esquema que no es Bearer (p. ej. Basic)', () => {
      const req = makeRequest({ authorization: 'Basic dXNlcjpwYXNz' });
      expect(extractAccessToken(req)).toBeNull();
    });

    it('rechaza un Bearer sin token', () => {
      const req = makeRequest({ authorization: 'Bearer    ' });
      expect(extractAccessToken(req)).toBeNull();
    });

    it('tiene prioridad sobre la cookie cuando ambos están presentes', () => {
      const req = makeRequest({
        authorization: 'Bearer header-token',
        cookie: `sb-ref-auth-token=${supabaseCookieValue({ access_token: 'cookie-token' })}`,
      });
      expect(extractAccessToken(req)).toBe('header-token');
    });
  });

  describe('Cookie de Supabase', () => {
    it('extrae access_token de una cookie base64 simple', () => {
      const value = supabaseCookieValue({ access_token: 'tok-123', token_type: 'bearer' });
      const req = makeRequest({ cookie: `sb-myref-auth-token=${value}` });
      expect(extractAccessToken(req)).toBe('tok-123');
    });

    it('decodifica una cookie URL-encoded', () => {
      const raw = supabaseCookieValue({ access_token: 'tok-url' });
      const req = makeRequest({ cookie: `sb-ref-auth-token=${encodeURIComponent(raw)}` });
      expect(extractAccessToken(req)).toBe('tok-url');
    });

    it('reensambla una cookie fragmentada (.0, .1) en orden', () => {
      const full = supabaseCookieValue({ access_token: 'tok-split' });
      const mid = Math.floor(full.length / 2);
      const part0 = full.slice(0, mid);
      const part1 = full.slice(mid);
      // A propósito en orden inverso para verificar que se ordena por sufijo numérico.
      const req = makeRequest({
        cookie: `sb-ref-auth-token.1=${part1}; sb-ref-auth-token.0=${part0}`,
      });
      expect(extractAccessToken(req)).toBe('tok-split');
    });

    it('convive con otras cookies no relacionadas', () => {
      const value = supabaseCookieValue({ access_token: 'tok-mixed' });
      const req = makeRequest({
        cookie: `theme=dark; sb-ref-auth-token=${value}; other=1`,
      });
      expect(extractAccessToken(req)).toBe('tok-mixed');
    });

    it('devuelve null si el JSON de la cookie no trae access_token', () => {
      const value = supabaseCookieValue({ refresh_token: 'r', token_type: 'bearer' });
      const req = makeRequest({ cookie: `sb-ref-auth-token=${value}` });
      expect(extractAccessToken(req)).toBeNull();
    });

    it('devuelve null si access_token está vacío', () => {
      const value = supabaseCookieValue({ access_token: '' });
      const req = makeRequest({ cookie: `sb-ref-auth-token=${value}` });
      expect(extractAccessToken(req)).toBeNull();
    });

    it('devuelve null ante una cookie de auth malformada', () => {
      const req = makeRequest({ cookie: 'sb-ref-auth-token=base64-not-valid-base64-$$$' });
      expect(extractAccessToken(req)).toBeNull();
    });

    it('ignora cookies que no son de auth de Supabase', () => {
      const req = makeRequest({ cookie: 'session=abc; sb-ref-other=xyz' });
      expect(extractAccessToken(req)).toBeNull();
    });
  });

  describe('sin credenciales', () => {
    it('devuelve null cuando no hay headers', () => {
      expect(extractAccessToken(makeRequest({}))).toBeNull();
    });

    it('devuelve null con un cookie header vacío', () => {
      expect(extractAccessToken(makeRequest({ cookie: '' }))).toBeNull();
    });
  });
});
