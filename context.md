# context.md — APP DEPORTE

> Fuente de verdad del estado para el Orchestrator del AI Harness.
> Detalle completo en `PROJECT_STATE.md` e `IMPLEMENTATION_ROADMAP.md` — aquí solo lo mínimo.

## Estado actual

- **Fase:** `3-complete` (Auth — E2E verificado con Supabase real 2026-06-19). Arquitectura: ver D-002.
- **Último avance:** FASE 3 Auth 100% COMPLETA ✅. E2E verificado: signup → email de confirmación → login → dashboard → logout → reset password con nueva contraseña. Migración `20260619000100` aplicada en remoto, trigger `handle_new_user` confirmado en `public.users`. Typecheck web+api limpio, api tests 3/3.
- **Próxima tarea (requiere Jean):** FASE 4 — Gestión de Canchas (pendiente aprobación).
- **Bloqueadores / Pendientes de seguridad:** contraseña visible en plaintext en el payload de red (Network tab) al hacer login y reset password — investigar si es GET en lugar de POST, logging indebido, o simplemente Network tab normal (body POST encriptado en tránsito). Resolver antes de producción.

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
