# context.md — APP DEPORTE

> Fuente de verdad del estado para el Orchestrator del AI Harness.
> Detalle completo en `PROJECT_STATE.md` e `IMPLEMENTATION_ROADMAP.md` — aquí solo lo mínimo.

## Estado actual

- **Fase:** `4-development` (Gestión de Canchas — aprobada y planificada 2026-06-19). Arquitectura: ver D-002.
- **Último avance:** FASE 4 subt. 2 y 3 implementadas (typecheck web limpio). (2) Capa de servicios: `services/facilities.ts` (getMyFacility, createFacility, updateFacility) + `services/fields.ts` (listFields, createField, updateField, setFieldStatus). (3) Gate de onboarding: `middleware.ts` redirige a `/onboarding` a todo propietario autenticado sin complejo, y desde `/onboarding` al panel si ya lo tiene + página `app/onboarding/page.tsx`.
- **Próxima tarea:** FASE 4 subt. 4 (CRUD UI de canchas en `/fields`, reemplazar data hardcoded) y subt. 5 (tour driver.js). Subt. 6: E2E + verificación RLS al cierre.
- **Bloqueadores:** Ninguno. (Cerrado: la "contraseña en payload" NO era bug — `signIn`/`updatePassword` son Next.js Server Actions `'use server'`; el POST que se ve en Network es el body de la Server Action hacia el servidor Next, no un fetch del cliente a Supabase. Viaja sobre TLS en prod; el servidor no loguea credenciales. Sin código que corregir.)

### Decisiones FASE 4 (Jean, 2026-06-19)
- **Complejo (facility):** un solo complejo por propietario en el MVP (sin selector de complejo).
- **Provisión del complejo:** onboarding manual — gate al primer ingreso sin complejo que obliga a crearlo antes de acceder a Canchas. Además, tour guiado de la UI.
- **Librería de tour:** `driver.js` (MIT, ~5kb, sin fricción SSR). Flag de "tour visto" NO en localStorage (regla de seguridad) → persistir en DB.
- **Soft delete de canchas:** vía enum `fields.status` (`ACTIVE`/`INACTIVE`/`MAINTENANCE`); "desactivar" = `INACTIVE`. No existe boolean `is_active` en el schema.
- **Acceso a datos:** Server Actions `'use server'` directo a Supabase (consistente con FASE 3); RLS por `owner_id` ya protege facilities/fields. Fastify se reserva para lógica compleja (reservas/pagos).

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
- `apps/api/src`: módulo `auth` completo (domain/application/infrastructure/presentation) + cliente service-role Supabase en `shared/infrastructure`. Mock `/auth/login` retirado. `packages/shared/src` sigue como scaffold (`.gitkeep`).

## Decisiones abiertas (pendientes de Jean)

- Política de reembolsos: no definida.
- Soft delete vs hard delete para clientes/canchas/reservas: sin decisión formal.
- Encoding dañado en algunos documentos fuente: pendiente fase de limpieza.

## Notas del arquitecto (Jean)

- Trabajo part-time — estimaciones realistas, alcance acotado.
- Jean decide arquitectura y aprueba cada cambio de fase. Los agentes no avanzan de fase solos.
