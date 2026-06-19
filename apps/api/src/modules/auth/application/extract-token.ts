import type { FastifyRequest } from 'fastify';

/**
 * Extrae el access token de Supabase desde la request.
 *
 * Acepta dos orígenes (el frontend usa @supabase/ssr; el token viaja en cookie
 * httpOnly, pero también soportamos el header Bearer para clientes/SSR):
 *  1. `Authorization: Bearer <token>` (prioridad).
 *  2. Cookie de sesión de Supabase. @supabase/ssr persiste la sesión en una
 *     cookie cuyo nombre sigue el patrón `sb-<ref>-auth-token`. El valor es un
 *     JSON (a veces fragmentado en `.0`, `.1`, ...) que contiene `access_token`.
 *
 * No loguea ni expone el token. Devuelve `null` si no encuentra ninguno.
 */
export function extractAccessToken(request: FastifyRequest): string | null {
  const fromHeader = extractFromAuthorizationHeader(request.headers.authorization);
  if (fromHeader) {
    return fromHeader;
  }

  return extractFromCookies(request.headers.cookie);
}

function extractFromAuthorizationHeader(header: string | undefined): string | null {
  if (!header) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match || !match[1]) {
    return null;
  }
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

function extractFromCookies(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookieHeader(cookieHeader);

  // Reúne posibles fragmentos: `sb-<ref>-auth-token`, `.0`, `.1`, ...
  const authCookieEntries = Object.entries(cookies)
    .filter(([name]) => /^sb-.*-auth-token(\.\d+)?$/.test(name))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

  if (authCookieEntries.length === 0) {
    return null;
  }

  const rawValue = authCookieEntries.map(([, value]) => value).join('');

  return parseAccessTokenFromCookieValue(rawValue);
}

function parseAccessTokenFromCookieValue(rawValue: string): string | null {
  let decoded = rawValue;
  try {
    decoded = decodeURIComponent(rawValue);
  } catch {
    // Si no es URL-encoded, usamos el valor tal cual.
    decoded = rawValue;
  }

  // @supabase/ssr puede prefijar el JSON con "base64-".
  if (decoded.startsWith('base64-')) {
    try {
      decoded = Buffer.from(decoded.slice('base64-'.length), 'base64').toString('utf8');
    } catch {
      return null;
    }
  }

  try {
    const parsed: unknown = JSON.parse(decoded);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'access_token' in parsed &&
      typeof (parsed as { access_token: unknown }).access_token === 'string'
    ) {
      const token = (parsed as { access_token: string }).access_token;
      return token.length > 0 ? token : null;
    }
  } catch {
    return null;
  }

  return null;
}

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) {
      continue;
    }
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name.length > 0) {
      result[name] = value;
    }
  }
  return result;
}
