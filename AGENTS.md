# AGENTS.md

## Propósito

APP DEPORTE es un SaaS enfocado inicialmente en propietarios de canchas deportivas.

El objetivo actual es construir un MVP que permita:

* Gestionar canchas
* Gestionar clientes
* Gestionar reservas
* Gestionar pagos básicos
* Visualizar métricas operativas

El objetivo NO es construir todavía:

* Rankings
* Torneos
* IA
* Computer Vision
* Estadísticas avanzadas

Estas funcionalidades pertenecen a fases posteriores.

---

# Fuentes de verdad

Antes de realizar cambios revisar:

* PROJECT_CONTEXT.md
* SYSTEM_ARCHITECTURE.md
* LEARNING_PATH.md
* BACKLOG.md

Si existe conflicto:

BACKLOG > SYSTEM_ARCHITECTURE > PROJECT_CONTEXT

---

# Filosofía de desarrollo

Priorizar siempre:

Negocio → Arquitectura → Código

No implementar funcionalidades que no aporten valor al MVP.

Evitar sobreingeniería.

Diseñar para evolución futura, pero construir únicamente lo necesario para validar el negocio.

---

# Stack oficial

Frontend

* Next.js
* React
* TypeScript
* Tailwind
* Shadcn UI

Backend

* Node.js
* TypeScript
* Fastify

Base de datos

* Supabase PostgreSQL

Autenticación

* Supabase Auth

Storage

* Supabase Storage

Realtime

* Supabase Realtime

---

# Principios arquitectónicos

Aplicar:

* Clean Architecture
* SOLID
* Repository Pattern

Pensar siempre en:

* Entidades
* Relaciones
* Casos de uso
* Estados
* Multi-tenant

---

# Calidad de código

* Evitar código duplicado.
* Evitar dependencias innecesarias.
* Utilizar TypeScript estricto.
* Utilizar validación de entrada.
* Mantener separación clara de responsabilidades.

---

# Multi-Tenant

Toda entidad de negocio debe diseñarse considerando múltiples propietarios.

Un propietario nunca debe acceder a datos de otro propietario.

La seguridad de aislamiento es prioritaria.

---

# MVP Actual

Módulos permitidos:

* Auth
* Users
* Fields
* Customers
* Reservations
* Payments
* Dashboard

Cualquier módulo fuera de esta lista debe justificarse antes de implementarse.
