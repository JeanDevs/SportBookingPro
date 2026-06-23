# IMPLEMENTATION_ROADMAP.md

# Objetivo

Este documento define el orden oficial de implementación de APP DEPORTE.

Codex debe implementar únicamente la fase actual.

No debe avanzar automáticamente a fases futuras.

Cada fase debe completarse, validarse y aprobarse antes de continuar.

---

# Estado 2.0 (2026-06-23, rama `develop`)

La evolución **2.0** (ADR-003) implementó, además del rediseño total dark premium y el **portal
público de clientes**, las fases que quedaban como prototipo:

- **FASE 6 — Reservas:** IMPLEMENTADA. Crear (multi-hora, intervalos 30 min), cancelar, cobrar;
  anti-solapamiento por constraint GiST; disponibilidad por trigger. Panel `/panel/reservas` + RPC
  `create_customer_booking` para el cliente.
- **FASE 7 — Pagos:** IMPLEMENTADA. Registrar/validar/rechazar adelanto y saldo (CASH/YAPE/PLIN);
  validar adelanto confirma la reserva. Panel `/panel/pagos` + comprobante del cliente (Storage).
- **FASE 8 — Dashboard:** IMPLEMENTADA. Métricas reales (hoy/semana/ingresos mes/horas/por validar).
- **NUEVO — Portal de cliente:** marketplace `/`, reserva `/c/[slug]`, cuenta `/cuenta`. Vía RPCs
  `SECURITY DEFINER` (no toca la RLS del dueño).

Verificado: typecheck 0 err · build 19 rutas · 38 tests. Pendiente: E2E con stack local + push a
remoto (ver `docs/RUNBOOK_2.0.md`). FASES 9–15 siguen pendientes según lo de abajo.

---

# Regla Principal

Antes de implementar cualquier funcionalidad:

1. Leer AGENTS.md
2. Leer PROJECT_CONTEXT.md
3. Leer PRODUCT_REQUIREMENTS.md
4. Leer SYSTEM_ARCHITECTURE.md
5. Leer LEARNING_PATH.md

---

# FASE 0

## Análisis

Objetivo:

Comprender completamente el proyecto.

Entregables:

* Lista de módulos.
* Lista de entidades.
* Lista de relaciones.
* Lista de casos de uso.
* Orden recomendado de implementación.

No generar código.

---

# FASE 1

## Estructura Base

Objetivo:

Crear el esqueleto del proyecto.

Entregables:

Frontend:

* Next.js
* TypeScript
* Tailwind
* Shadcn

Backend:

* Fastify
* TypeScript

Supabase:

* Configuración inicial

Generar únicamente:

* Carpetas
* Configuración
* Archivos base

No implementar lógica de negocio.

---

# FASE 2

## Modelo de Datos

Objetivo:

Diseñar la base de datos.

Entregables:

Tablas:

* users
* fields
* customers
* reservations
* payments

Generar:

* SQL
* Migraciones
* Relaciones
* Índices
* RLS Policies

Validar:

* Multi-tenant
* owner_id

---

# FASE 3

## Autenticación

Estado: COMPLETADA (2026-06-19). E2E verificado con Supabase real.

Implementación final (reemplaza el prototipo demo `admin`/`admin123`):

- [x] Registro, Login, Logout y Recuperación de contraseña vía Supabase Auth.
- [x] Arquitectura `@supabase/ssr` con sesión SOLO en cookies httpOnly (cero localStorage) — ver D-002.
- [x] Provisión automática de `public.users` por trigger `handle_new_user` (migración `20260619000100`).
- [x] Middleware protege todas las rutas de negocio; redirige a `/login` sin sesión.
- [x] E2E real: signup → confirmación de email → login → dashboard → logout → reset password.

Objetivo:

Permitir acceso seguro.

Entregables:

* Registro
* Login
* Logout
* Recuperación de contraseña

Utilizar:

* Supabase Auth

No implementar otros módulos.

---

# FASE 4

## Gestión de Canchas

Estado: IMPLEMENTADA (2026-06-19). Verificación E2E en navegador pendiente (deuda; ver `context.md`).

Decisiones (Jean): un complejo por propietario; onboarding manual (gate) + tour guiado
(driver.js); soft delete vía enum `fields.status` (`INACTIVE`); acceso por Server Actions + RLS.

- [x] Crear cancha (nombre, tipo, tarifa).
- [x] Editar cancha.
- [x] Desactivar cancha (status `INACTIVE`; también `MAINTENANCE`).
- [x] Listar canchas (SSR aislado por RLS).
- [x] Gate de onboarding: crear complejo antes de acceder + tour de bienvenida.
- [ ] Verificación E2E en navegador + RLS entre dos propietarios.

Objetivo:

Permitir administrar canchas.

Entregables:

CRUD completo:

* Crear cancha
* Editar cancha
* Desactivar cancha
* Listar canchas

---

# FASE 5

## Gestión de Clientes

Objetivo:

Permitir administrar clientes.

Entregables:

CRUD completo:

* Crear cliente
* Editar cliente
* Eliminar cliente
* Buscar cliente

---

# FASE 6

## Gestión de Reservas

Objetivo:

Implementar núcleo del negocio.

Entregables:

* Crear reserva
* Editar reserva
* Cancelar reserva
* Consultar disponibilidad

Regla crítica:

El sistema debe impedir reservas duplicadas.

---

# FASE 7

## Gestión de Pagos

Objetivo:

Asociar pagos a reservas.

Entregables:

* Registrar pago
* Consultar pagos
* Marcar reservas pagadas

Métodos:

* CASH
* YAPE
* PLIN

---

# FASE 8

## Dashboard

Objetivo:

Visualizar operación.

Métricas mínimas:

* Reservas hoy
* Reservas semana
* Ingresos mes
* Horas ocupadas
* Horas libres

---

# FASE 9

## Testing

Objetivo:

Validar MVP.

Generar:

* Unit Tests
* Integration Tests

Validar:

* Multi-tenant
* Reservas
* Pagos
* Auth

---

# FASE 10

## Hardening

Objetivo:

Preparar para primeros clientes.

Validar:

* Seguridad
* Performance
* Logs
* Manejo de errores
* Auditoría

---

# FASE 11

## WhatsApp

No implementar hasta que el MVP esté validado.

Funcionalidades futuras:

* Recordatorios
* Confirmaciones
* Reservas por chat

---

# FASE 12

## IA

No implementar hasta disponer de usuarios reales.

Posibles agentes:

* Reservas
* Atención al cliente
* Cobros

---

# FASE 13

## Peñas Deportivas

Expansión posterior.

Módulos:

* Teams
* Members
* Fees

---

# FASE 14

## Rankings

Expansión posterior.

Módulos:

* Goals
* Assists
* MVP
* History

---

# FASE 15

## Computer Vision

Última fase.

Requiere:

* Datos reales
* Usuarios activos
* Cámaras
* Dataset propio

