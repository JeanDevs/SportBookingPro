# IMPLEMENTATION_ROADMAP.md

# Objetivo

Este documento define el orden oficial de implementación de APP DEPORTE.

Codex debe implementar únicamente la fase actual.

No debe avanzar automáticamente a fases futuras.

Cada fase debe completarse, validarse y aprobarse antes de continuar.

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

Estado actual de implementación:

- [x] Endpoint base de login disponible en `/auth/login`.
- [x] Formulario de login conectado al endpoint.
- [x] Credenciales demo: `admin` / `admin123`.

Pendiente para aprobación:

- [ ] Validar flujo completo en UI.
- [ ] Confirmar cierre de sesión y persistencia de sesión.

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

