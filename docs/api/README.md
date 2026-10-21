# API · Swagger / OpenAPI

Contrato OpenAPI 3.0 de SportBook Pro.

| Qué | Dónde |
|---|---|
| Swagger UI (local) | `http://localhost:3002/docs` |
| Contrato en JSON / YAML | `http://localhost:3002/docs/json` · `/docs/yaml` |
| Copia versionada | [`openapi.json`](./openapi.json) (importable en Postman / Insomnia) |

## Cómo se genera
- Las rutas de la API Fastify (`/health`, `/auth/me`) se documentan solas desde su `schema`
  en `apps/api/src`. No hay YAML manual que se desactualice.
- Los endpoints de la app web (`/panel/reportes/exportar`, `/auth/callback`) están en
  `apps/api/src/docs/web-endpoints.ts` y se fusionan al mismo documento.
- Las Server Actions de Next.js no son una API pública y no se documentan.

## Comandos
```bash
pnpm --filter @app-deporte/api dev          # levanta la API (requiere apps/api/.env.local)
pnpm --filter @app-deporte/api docs:export  # regenera docs/api/openapi.json
```

En producción la UI queda apagada salvo `ENABLE_DOCS=true`.
