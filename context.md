# context.md — APP DEPORTE

> Fuente de verdad del estado para el Orchestrator del AI Harness.
> Detalle completo en `PROJECT_STATE.md` e `IMPLEMENTATION_ROADMAP.md` — aquí solo lo mínimo.

## Estado actual

- **Fase:** `5-development` (Gestión de Clientes — aprobada 2026-06-19). Arquitectura: ver D-002.
- **Último avance:** FASE 5 (Gestión de Clientes) **implementada en código** (typecheck + `next build` OK, 16 rutas). Decisión Jean: soft delete vía `is_active`. Creados: migración `20260619000200_customers_soft_delete.sql`, `services/customers.ts` (listCustomers/createCustomer/updateCustomer/setCustomerActive), UI `customers/page.tsx` (server) + `customers-view.tsx` (tabla real, búsqueda nombre/teléfono, modal crear/editar, archivar). Se quitaron campos inexistentes del prototipo (email/visits/totalSpent/status VIP). FASE 4 implementada previamente (subt. 2–5).
- **Próxima tarea:** Aplicar migración `20260619000200` en remoto (`supabase db push` — requiere autorización de Jean; puede pedir desbloqueo de IP + `SUPABASE_DB_PASSWORD`, como en FASE 3). Sin ella, `listCustomers` no devuelve datos (columna `is_active` ausente). Luego verificación E2E de clientes.
- **Bloqueadores:** Migración de FASE 5 pendiente de aplicar en remoto (bloquea la prueba funcional de Clientes, no el resto del código).

### Auditoría QA + tests (2026-06-19)
- **Corregido:** enlaces rotos `#` en el sidebar de `/reservas` (Canchas/Clientes/Pagos/Configuración) → rutas reales. Eliminado `page_backup.tsx` (código muerto, dashboard viejo con los mismos enlaces rotos).
- **Tests añadidos (26 en total, todos verdes):** API `extract-token.test.ts` (15 — parsing de Bearer/cookies Supabase, seguridad de auth) + Web vitest configurado con `validators.test.ts` (8). Validaciones puras extraídas a `services/validators.ts` (DRY, testeable). Typecheck + build web OK.
- **Hallazgos NO corregidos (prototipos de FASES 6–8, requieren aprobación):** botones sin handler en `/reservas`, `/payments`, `/settings` (ej. "Validar adelanto", "Exportar", el "Guardar" de settings es un `setTimeout` simulado, toggles estáticos); nombre del complejo "La Bombonera" hardcodeado en los sidebars de dashboard/reservas/payments/settings (debería usar el nombre real como ya hacen `/fields` y `/customers`). El API Fastify no se consume desde el front (todo va por Server Actions) — es por diseño, no un bug.
- **Deuda de verificación (pendiente, no bloquea FASE 5):** FASE 4 subt. 6 — E2E en navegador (signup→gate→complejo→tour→CRUD cancha) + prueba RLS entre dos propietarios. Jean decidió dejarlo pendiente y avanzar. Retomar antes de deploy (FASE de hardening). El código de FASE 4 compila y construye; falta la validación funcional en navegador.

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
