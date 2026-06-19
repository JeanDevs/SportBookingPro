# context.md — APP DEPORTE

> Fuente de verdad del estado para el Orchestrator del AI Harness.
> Detalle completo en `PROJECT_STATE.md` e `IMPLEMENTATION_ROADMAP.md` — aquí solo lo mínimo.

## Estado actual

- **Fase:** `3-development` (Auth — código completo, falta E2E/config con Supabase real). Arquitectura: ver D-002.
- **Último avance:** FASE 3 Auth COMPLETA en código ✅. Implementado por Executors + Verifier: mock retirado; `@supabase/ssr` con sesión en cookies httpOnly (CERO localStorage); backend valida JWT + `GET /auth/me`; trigger `handle_new_user` auto-provisiona `public.users`; páginas login/signup/forgot-password + flujo de reset cerrado (route handler `/callback` con `exchangeCodeForSession` PKCE + página `/update-password` + server action `updatePassword`). Typecheck web+api limpio, api tests 3/3. Evals en `06-evaluations/`.
- **Próxima tarea (requiere Jean — necesita claves/acceso Supabase):** (1) cargar claves Supabase locales y E2E signup→login→dashboard→logout + reset password, (2) aplicar migración `20260619000100_auth_user_provisioning.sql` en Supabase, (3) configurar Redirect URL `${APP_URL}/callback` en el dashboard de Supabase Auth. Luego FASE 4 (Gestión de Canchas).
- **Bloqueadores:** ninguno en código. Lo pendiente requiere claves Supabase reales (no disponibles en este entorno).

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
