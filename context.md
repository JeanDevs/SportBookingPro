# context.md — APP DEPORTE

> Fuente de verdad del estado para el Orchestrator del AI Harness.
> Detalle completo en `PROJECT_STATE.md` e `IMPLEMENTATION_ROADMAP.md` — aquí solo lo mínimo.

## Estado actual

- **Fase:** `2.0-development` en rama **`develop`** (rediseño total + portal de clientes). Arquitectura: ver **ADR-003** (`docs/adr/ADR-003-app-deporte-2.0.md`). Runbook: `docs/RUNBOOK_2.0.md`.
- **Último avance (2026-06-23, evolución 2.0):** Marketplace de dos lados + rediseño "dark premium / energético".
  - **Portal de cliente (NUEVO):** landing/marketplace `/`, ficha+reserva `/c/[slug]` (slots de 30 min, multi-hora, anti-solapamiento), auth de cliente (`/ingresar`,`/registro`), `/cuenta` con subida de comprobante de adelanto. Acceso vía RPCs `SECURITY DEFINER` (no toca la RLS del dueño).
  - **Panel del dueño (COMPLETADO + redISEÑADO) en `/panel/*`:** dashboard real (métricas hoy/semana/mes/ocupación), reservas (calendario por día, crear/cancelar/cobrar), pagos (validar/rechazar adelantos), canchas y clientes restilados, configuración funcional (publicar complejo, % adelanto, **horarios** por cancha).
  - **Design system propio** en `components/ui` (tokens dark `ink`/`lime`, Sora+Inter, Button/Card/Badge/Input/Modal/StatCard…). Middleware de **3 zonas** (público/cliente/dueño) por `account_type` en el JWT.
  - **Verificado sin DB:** typecheck 0 errores · `next build` 19 rutas · **38 tests** (web 20 + api 18) · dev server 200 en todas las rutas.
- **Próxima tarea:** Levantar el **stack Supabase local** (Docker) y correr el E2E del runbook (`supabase start && db reset && pnpm dev` → checklist de `docs/RUNBOOK_2.0.md` §1). Luego: push del esquema 2.0 a remoto (§2) y deploy a Vercel (§3) cuando Jean lo decida.
- **Bloqueadores:**
  - **(D-003) Migración 2.0 NO aplicada:** `supabase/migrations/20260623000100_v2_customer_marketplace.sql` (customer_accounts, slug/is_published, customer_account_id, RPCs, bucket payment-proofs, routing de handle_new_user) está **solo en archivo** — no pusheada a remoto por decisión de Jean ("nada aplicado"). Tratar como NO hecha en remoto. Aplicar local con `supabase db reset`; remoto con `supabase db push` (runbook §2).
  - **Docker engine no levantó** en la sesión (Docker Desktop abierto pero distro WSL `docker-desktop` *Stopped*). Necesita que Jean abra Docker y espere el engine en verde para correr local.

### Rediseño UI + consistencia (2026-06-19)
- **Dashboard:** muestra el nombre real del complejo (`getMyFacility`) en vez de "La Bombonera" hardcodeado. Eliminada variable muerta `animateStats`.
- **Reservas reestructurada:** ahora `page.tsx` (server, carga complejo) + `reservas-view.tsx` (client) con el sidebar estándar del resto de la app (azul→brand, iconos, botón **Salir** que faltaba) + vistas Día/Semana y panel de reserva. Datos de muestra (lógica real = FASE 6).
- **Tema "Pitch Green" (vía `/theme-factory`, custom):** identidad deportiva verde que unifica auth (ya verde) con el resto (antes azul). Escala `brand` en `tailwind.config.ts`; tipografía Inter (cuerpo) + Sora (títulos) con `next/font`; `globals.css` actualizado. Reemplazado `blue-*`→`brand-*` en las 6 pantallas de la app (0 azules residuales).
- **Verificación:** typecheck + `next build` OK (15/15), 26 tests verdes, dev server sano en `localhost:3000`.

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
