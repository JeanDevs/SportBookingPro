# APP DEPORTE

APP DEPORTE es un SaaS multi-tenant enfocado inicialmente en propietarios de canchas deportivas.

El MVP debe resolver la gestión diaria de:

- Canchas.
- Clientes.
- Reservas.
- Pagos básicos.
- Métricas operativas.

## Estructura

```text
apps/
  web/      Frontend Next.js
  api/      API Fastify
packages/
  shared/   Tipos y contratos compartidos
supabase/   Configuración, migraciones y políticas
docs/       Decisiones y documentación técnica
```

## Fuentes de Verdad

- `AGENTS.md`
- `PROJECT_CONTEXT.md`
- `PRODUCT_REQUIREMENTS.md`
- `SYSTEM_ARCHITECTURE.md`
- `BACKLOG.md`
- `LEARNING_PATH.md`

## Estado

Estructura base del proyecto. No contiene lógica de negocio implementada.

