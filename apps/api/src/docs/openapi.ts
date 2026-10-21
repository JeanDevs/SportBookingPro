import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { webPaths } from './web-endpoints.js';

/**
 * Swagger / OpenAPI 3.0 de SportBook Pro.
 *
 * - Las rutas de Fastify se documentan solas a partir de su `schema` (fuente de
 *   verdad en código; no hay un YAML que se desactualice).
 * - Los endpoints de la app web (exportar reportes, callback de auth) se fusionan
 *   desde `web-endpoints.ts` para que el contrato sea uno solo.
 *
 * UI en `/docs` · JSON en `/docs/json` · YAML en `/docs/yaml`.
 * En producción queda apagado salvo `ENABLE_DOCS=true`.
 */
export function docsEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV !== 'production' || env.ENABLE_DOCS === 'true';
}

export async function registerDocs(app: FastifyInstance): Promise<void> {
  if (!docsEnabled()) return;

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'SportBook Pro API',
        version: '0.1.0',
        description:
          'API y endpoints HTTP de SportBook Pro: plataforma SaaS para la gestión de canchas ' +
          'deportivas (reservas, pagos y reportes).\n\n' +
          '**Autenticación:** Supabase Auth. La API Fastify acepta `Authorization: Bearer <access_token>` ' +
          'o la cookie de sesión `sb-<ref>-auth-token`; la app web usa únicamente la cookie httpOnly.',
      },
      servers: [{ url: 'http://localhost:3002', description: 'API Fastify (local)' }],
      tags: [
        { name: 'Sistema', description: 'Estado del servicio.' },
        { name: 'Autenticación', description: 'Sesión y perfil del usuario.' },
        { name: 'Reportes', description: 'Reportes exportables (PDF, Excel, CSV).' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Access token de Supabase Auth.',
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'sb-<ref>-auth-token',
            description: 'Cookie httpOnly de sesión que escribe `@supabase/ssr`.',
          },
        },
      },
    },
    // Fusiona los endpoints de Next.js al documento generado desde las rutas Fastify.
    transformObject: (documentObject) => {
      if (!('openapiObject' in documentObject)) return documentObject.swaggerObject;
      const { openapiObject } = documentObject;
      return {
        ...openapiObject,
        paths: { ...openapiObject.paths, ...(webPaths as unknown as typeof openapiObject.paths) },
      };
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });
}
