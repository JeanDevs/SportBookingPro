/**
 * Endpoints HTTP que atiende la app web (Next.js) y que no pasan por Fastify.
 * Se fusionan al documento OpenAPI de la API para tener un único contrato del
 * proyecto. Fuente de verdad en código:
 *  - GET /panel/reportes/exportar → apps/web/src/app/panel/(app)/reportes/exportar/route.ts
 *  - GET /auth/callback           → apps/web/src/app/auth/callback/route.ts
 *
 * El resto de la web usa Server Actions (RPC interno de Next.js) y no es una API
 * pública, por eso no se documenta aquí.
 */

const WEB_SERVER = [{ url: 'http://localhost:3000', description: 'App web Next.js (local)' }];

const errorBody = {
  type: 'object',
  required: ['error'],
  properties: { error: { type: 'string', example: 'Inicia sesión para exportar reportes.' } },
} as const;

const exportParam = (
  name: string,
  description: string,
  schema: Record<string, unknown>,
) => ({ name, in: 'query', required: true, description, schema });

export const webPaths = {
  '/panel/reportes/exportar': {
    servers: WEB_SERVER,
    get: {
      tags: ['Reportes'],
      summary: 'Exportar un reporte a PDF, Excel o CSV',
      description:
        'Genera el reporte del complejo del propietario autenticado y lo devuelve como descarga. ' +
        'Los datos se filtran por RLS (`owner_id = auth.uid()`). El formato se resuelve con ' +
        '`ExporterFactory` (patrón Strategy + Factory). Rango máximo: 366 días.',
      operationId: 'exportarReporte',
      security: [{ cookieAuth: [] }],
      parameters: [
        exportParam('tipo', 'Tipo de reporte.', {
          type: 'string',
          enum: ['reservas', 'ingresos', 'clientes'],
        }),
        exportParam('formato', 'Formato de salida.', {
          type: 'string',
          enum: ['pdf', 'xlsx', 'csv'],
        }),
        exportParam('desde', 'Fecha inicial (hora de Lima), inclusive.', {
          type: 'string',
          format: 'date',
          example: '2026-10-01',
        }),
        exportParam('hasta', 'Fecha final (hora de Lima), inclusive.', {
          type: 'string',
          format: 'date',
          example: '2026-10-31',
        }),
      ],
      responses: {
        '200': {
          description:
            'Archivo del reporte. `Content-Disposition: attachment; filename="reporte-<tipo>-<desde>_<hasta>.<ext>"`.',
          headers: {
            'Content-Disposition': {
              schema: {
                type: 'string',
                example: 'attachment; filename="reporte-ingresos-2026-10-01_2026-10-31.pdf"',
              },
            },
          },
          content: {
            'application/pdf': { schema: { type: 'string', format: 'binary' } },
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
            'text/csv': { schema: { type: 'string', format: 'binary' } },
          },
        },
        '400': {
          description: 'Parámetros inválidos (tipo, formato o rango de fechas).',
          content: { 'application/json': { schema: errorBody } },
        },
        '401': {
          description: 'Sin sesión.',
          content: { 'application/json': { schema: errorBody } },
        },
        '403': {
          description: 'La cuenta es de cliente; solo el dueño exporta reportes.',
          content: { 'application/json': { schema: errorBody } },
        },
        '500': {
          description: 'Falló la generación del archivo.',
          content: { 'application/json': { schema: errorBody } },
        },
      },
    },
  },
  '/auth/callback': {
    servers: WEB_SERVER,
    get: {
      tags: ['Autenticación'],
      summary: 'Callback de autenticación (PKCE)',
      description:
        'Intercambia el `code` que envía Supabase (confirmación de correo o recuperación de contraseña) ' +
        'por una sesión en cookies httpOnly y redirige a `next`. Si falla, redirige a la pantalla de ' +
        'ingreso con `?error=auth`.',
      operationId: 'authCallback',
      parameters: [
        {
          name: 'code',
          in: 'query',
          required: true,
          description: 'Código PKCE emitido por Supabase Auth.',
          schema: { type: 'string' },
        },
        {
          name: 'next',
          in: 'query',
          required: false,
          description: 'Ruta interna de destino (debe empezar con `/`). Por defecto `/`.',
          schema: { type: 'string', example: '/panel/actualizar-clave' },
        },
      ],
      responses: {
        '307': {
          description:
            'Redirección: a `next` si el intercambio fue exitoso; a `/panel/ingresar?error=auth` o `/ingresar?error=auth` si no.',
          headers: { Location: { schema: { type: 'string' } } },
        },
      },
    },
  },
} as const;
