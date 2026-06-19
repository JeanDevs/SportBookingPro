# SYSTEM_ARCHITECTURE.md

# Objetivo Arquitectónico

APP DEPORTE debe construirse como una plataforma SaaS multi-tenant enfocada inicialmente en propietarios de canchas deportivas.

La arquitectura debe permitir:

* Gestión de canchas.
* Gestión de clientes.
* Gestión de reservas.
* Gestión de pagos.
* Dashboard operativo.

Posteriormente podrá evolucionar hacia:

* WhatsApp.
* Agentes IA.
* Peñas deportivas.
* Rankings.
* Torneos.
* Computer Vision.

La arquitectura debe permitir crecimiento modular sin afectar funcionalidades existentes.

---

# Arquitectura General

```text
┌─────────────────────┐
│      Frontend       │
│ Next.js + React     │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────┐
│       API           │
│ Fastify + TS        │
└──────────┬──────────┘
           │

 ┌─────────┼──────────────┐
 ▼         ▼              ▼

Auth    Reservations   Customers

           ▼
      Supabase
```

---

# Stack Técnico

## Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* Shadcn UI

## Backend

* Node.js
* TypeScript
* Fastify

## Base de Datos

* Supabase PostgreSQL

## Autenticación

* Supabase Auth

Proveedores futuros:

* Google Login
* Microsoft Login

## Storage

* Supabase Storage

## Realtime

* Supabase Realtime

---

# Principios Arquitectónicos

Aplicar:

* Clean Architecture
* SOLID
* Repository Pattern

Separar claramente:

```text
Presentation
Application
Domain
Infrastructure
```

---

# Principios de Diseño

Pensar siempre en:

## Entidades

Qué existe dentro del negocio.

## Relaciones

Cómo se conectan las entidades.

## Casos de Uso

Qué quiere lograr el usuario.

## Estados

Cómo evoluciona una entidad.

## Multi-Tenant

Cómo se separan los datos entre clientes.

---

# Módulos del MVP

## Auth

Responsabilidades:

* Registro
* Login
* Logout
* Recuperación de contraseña

---

## Users

Responsabilidades:

* Gestión de propietarios
* Perfil
* Configuración básica

---

## Fields

Responsabilidades:

* Crear cancha
* Editar cancha
* Activar cancha
* Desactivar cancha

---

## Customers

Responsabilidades:

* Crear cliente
* Editar cliente
* Consultar historial

---

## Reservations

Responsabilidades:

* Crear reserva
* Modificar reserva
* Cancelar reserva
* Consultar disponibilidad

---

## Payments

Responsabilidades:

* Registrar pagos
* Consultar pagos
* Controlar estado de cobro

---

## Dashboard

Responsabilidades:

* Mostrar métricas operativas
* Mostrar ocupación
* Mostrar ingresos

---

# Entidades Principales

## User

Representa al propietario.

Campos:

* id
* email
* full_name
* role
* created_at

---

## Field

Representa una cancha.

Campos:

* id
* owner_id
* name
* type
* price_per_hour
* status
* created_at

---

## Customer

Representa un cliente.

Campos:

* id
* owner_id
* name
* phone
* notes
* created_at

---

## Reservation

Representa una reserva.

Campos:

* id
* owner_id
* field_id
* customer_id
* date
* start_time
* end_time
* status
* created_at

Estados:

* PENDING
* CONFIRMED
* PAID
* COMPLETED
* CANCELLED

---

## Payment

Representa un pago.

Campos:

* id
* owner_id
* reservation_id
* amount
* method
* status
* created_at

Métodos iniciales:

* CASH
* YAPE
* PLIN

---

# Relaciones

```text
User
 │
 ├── Fields
 ├── Customers
 ├── Reservations
 └── Payments

Field
 │
 └── Reservations

Customer
 │
 └── Reservations

Reservation
 │
 └── Payment
```

---

# Multi-Tenant

Todas las entidades de negocio deben contener:

```text
owner_id
```

Esto garantiza aislamiento entre propietarios.

Ningún propietario puede acceder a datos pertenecientes a otro propietario.

La implementación debe apoyarse en:

* Supabase Auth
* Row Level Security (RLS)

---

# Arquitectura de Carpetas

Backend

```text
src/

├── modules
│
├── auth
├── users
├── fields
├── customers
├── reservations
├── payments
│
├── shared
├── database
│
└── main.ts
```

Frontend

```text
src/

├── app
├── components
├── hooks
├── services
├── types
└── lib
```

---

# Eventos Futuros

No implementar todavía.

Diseñar considerando futuros eventos:

```text
reservation.created

reservation.cancelled

payment.completed
```

Estos eventos permitirán:

* WhatsApp
* Notificaciones
* Agentes IA
* Automatizaciones

---

# Escalabilidad

Priorizar:

* Modularidad
* Mantenibilidad
* Seguridad
* Multi-tenancy

Evitar:

* Dependencias innecesarias
* Acoplamiento fuerte entre módulos
* Lógica de negocio dentro de controladores

La arquitectura debe permitir evolucionar hacia decenas o cientos de propietarios sin rediseños mayores.
