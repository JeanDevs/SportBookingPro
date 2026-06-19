import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import type { AuthenticatedUser } from '../domain/authenticated-user.js';
import type { AuthService } from '../application/auth-service.js';
import { extractAccessToken } from '../application/extract-token.js';

declare module 'fastify' {
  interface FastifyRequest {
    /**
     * Identidad del usuario autenticado. Solo está presente en rutas
     * protegidas por el preHandler `authenticate`.
     */
    authUser?: AuthenticatedUser;
  }
}

/**
 * Construye un preHandler de Fastify que protege rutas.
 *
 * - Extrae el token (Bearer y/o cookie de Supabase).
 * - Lo valida contra Supabase Auth.
 * - 401 con `{ message }` genérico si falta o es inválido (sin filtrar detalles).
 * - Adjunta `request.authUser` tipado si es válido.
 */
export function createAuthenticate(authService: AuthService): preHandlerHookHandler {
  return async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const token = extractAccessToken(request);

    if (!token) {
      await reply.code(401).send({ message: 'No autenticado.' });
      return;
    }

    const authUser = await authService.verifyToken(token);

    if (!authUser) {
      await reply.code(401).send({ message: 'No autenticado.' });
      return;
    }

    request.authUser = authUser;
  };
}
