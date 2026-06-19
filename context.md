# context.md — APP DEPORTE

> Fuente de verdad del estado para el Orchestrator del AI Harness.
> Detalle completo en `PROJECT_STATE.md` e `IMPLEMENTATION_ROADMAP.md` — aquí solo lo mínimo.

## Estado actual

- **Fase:** `3-development` (entrando) — scaffold y modelo de datos completos; siguiente módulo: Autenticación
- **Último avance:** Modelo de datos generado localmente (migración `20260611000100_initial_business_schema.sql` + `docs/database/DATA_MODEL.md`). Prototipo UI estático de todas las pantallas MVP. Baseline OWASP creado.
- **Próxima tarea:** Decisión de Jean — (A) retomar validación de FASE 2 en Supabase, o (B) arrancar FASE 3 Autenticación (registro, login, logout, recuperación, perfil en `public.users`, integración Supabase Auth). Antes de ambas: revisar con Jean si los prototipos UI representan la operación real.
- **Bloqueadores:** Validación del modelo de datos en Supabase está **pausada por decisión de Jean**. No avanzar a FASE 3 sin aprobación explícita (ver "Regla de Continuidad" en `PROJECT_STATE.md`).

## Stack / Tecnologías

- Frontend: Next.js + React + TypeScript + Tailwind + Shadcn UI — `apps/web`
- Backend: Node.js + Fastify + TypeScript — `apps/api`
- Compartido: `packages/shared` (tipos y contratos)
- DB/Auth: Supabase (PostgreSQL) — multi-tenant vía RLS por `owner_id`
- Monorepo: pnpm workspaces
- Zona horaria oficial: `America/Lima` · Granularidad de reservas: 30 min

## Contexto mínimo

- **MVP enfocado** en propietarios de canchas deportivas. NO incluye: torneos, rankings, peñas, IA, WhatsApp, Computer Vision (ver "Restricciones Activas" en `PROJECT_STATE.md`).
- **Módulos permitidos:** Auth, Users, Fields, Customers, Reservations, Payments, Dashboard.
- **Entidades principales:** `users`, `facilities`, `fields`, `customers`, `reservations`, `payments` (+ soporte: disponibilidad, pricing, historial de estados, audit logs).
- **Multi-tenancy crítico:** todo dato de negocio se aísla por propietario vía RLS. Un error aquí expone datos entre propietarios — riesgo alto.
- **Anti-solapamiento de reservas** ya resuelto en BD vía constraint de exclusión; falta probar concurrencia.
- Código de `apps/api/src` y `packages/shared/src` es mayormente scaffold (`.gitkeep`). Lo único con lógica real hoy: `apps/api/src/main.ts` (servidor demo con `/health` y `/auth/login` mock).

## Decisiones abiertas (pendientes de Jean)

- Política de reembolsos: no definida.
- Soft delete vs hard delete para clientes/canchas/reservas: sin decisión formal.
- Encoding dañado en algunos documentos fuente: pendiente fase de limpieza.

## Notas del arquitecto (Jean)

- Trabajo part-time — estimaciones realistas, alcance acotado.
- Jean decide arquitectura y aprueba cada cambio de fase. Los agentes no avanzan de fase solos.
