# PRODUCT_REQUIREMENTS.md

# APP DEPORTE

## Propósito

APP DEPORTE es una plataforma SaaS enfocada inicialmente en propietarios de canchas deportivas.

El objetivo del MVP es resolver el problema de gestión de reservas, clientes y operación diaria de una cancha deportiva.

El éxito del MVP se medirá por la capacidad de que un propietario gestione completamente sus reservas desde la plataforma.

---

# Problema

Actualmente muchos propietarios de canchas gestionan su negocio mediante:

* WhatsApp
* Llamadas
* Excel
* Cuadernos
* Notas manuales

Esto genera:

* Reservas duplicadas
* Pérdida de clientes
* Mala organización
* Falta de métricas
* Poco control financiero
* Procesos manuales

---

# Objetivo del MVP

Permitir que un propietario pueda:

1. Registrar sus canchas.
2. Gestionar clientes.
3. Registrar reservas.
4. Visualizar disponibilidad.
5. Gestionar pagos básicos.
6. Consultar métricas operativas simples.

---

# Usuarios Objetivo

## Propietario de Cancha

Cliente principal del sistema.

Responsable de:

* Administrar canchas.
* Gestionar reservas.
* Gestionar clientes.
* Consultar ingresos.

---

## Administrador

Responsable de operar la plataforma.

Funciones:

* Gestionar usuarios.
* Gestionar propietarios.
* Resolver incidencias.

---

# Requisitos Funcionales

## Autenticación

### Como propietario

Quiero registrarme para acceder al sistema.

### Como propietario

Quiero iniciar sesión para gestionar mi negocio.

### Como propietario

Quiero recuperar mi contraseña para no perder acceso.

---

## Gestión de Canchas

### Como propietario

Quiero registrar una cancha para poder administrarla.

### Como propietario

Quiero editar una cancha para mantener actualizada su información.

### Como propietario

Quiero activar o desactivar una cancha para controlar su disponibilidad.

---

Información mínima:

* Nombre
* Tipo de cancha
* Precio por hora
* Estado

---

## Gestión de Clientes

### Como propietario

Quiero registrar clientes para tener historial de reservas.

### Como propietario

Quiero consultar clientes registrados.

### Como propietario

Quiero editar datos de clientes.

---

Información mínima:

* Nombre
* Teléfono
* Observaciones

---

## Gestión de Reservas

### Como propietario

Quiero registrar una reserva para bloquear un horario.

### Como propietario

Quiero visualizar horarios ocupados.

### Como propietario

Quiero cancelar una reserva.

### Como propietario

Quiero modificar una reserva.

---

Información mínima:

* Cliente
* Cancha
* Fecha
* Hora inicio
* Hora fin
* Estado

---

# Estados de Reserva

Las reservas deben soportar:

```text
PENDING
CONFIRMED
PAID
COMPLETED
CANCELLED
```

---

## Gestión de Pagos

### Como propietario

Quiero registrar un pago asociado a una reserva.

### Como propietario

Quiero consultar pagos realizados.

### Como propietario

Quiero identificar reservas pendientes de pago.

---

Información mínima:

* Reserva
* Monto
* Método
* Estado

---

Métodos iniciales:

* Efectivo
* Yape
* Plin

---

## Dashboard

### Como propietario

Quiero visualizar métricas operativas básicas.

Métricas mínimas:

* Reservas de hoy
* Reservas de la semana
* Ingresos del mes
* Horas ocupadas
* Horas disponibles

---

# Requisitos No Funcionales

## Arquitectura

* Modular
* Escalable
* Multi-tenant

---

## Seguridad

* Autenticación segura
* Aislamiento de datos por propietario
* Protección de información sensible

---

## Rendimiento

* Respuesta inferior a 500 ms para operaciones comunes
* Preparado para crecimiento progresivo

---

## Mantenibilidad

* Código tipado con TypeScript
* Validaciones robustas
* Separación clara de responsabilidades

---

# Fuera del MVP

No implementar todavía:

* Peñas deportivas
* Rankings
* Torneos
* Estadísticas deportivas
* Computer Vision
* Reconocimiento facial
* Agentes IA autónomos
* Marketplace deportivo

---

# Roadmap Posterior

## Fase 2

* Reservas online por clientes
* Confirmaciones automáticas
* Pagos integrados

## Fase 3

* WhatsApp
* Agente IA para reservas

## Fase 4

* Gestión de peñas
* Gestión de jugadores

## Fase 5

* Rankings
* Estadísticas deportivas

## Fase 6

* Computer Vision
* Detección automática de jugadores

---

# Criterios de Aceptación

El MVP será considerado exitoso cuando:

* Un propietario pueda crear una cuenta.
* Un propietario pueda registrar canchas.
* Un propietario pueda registrar clientes.
* Un propietario pueda crear reservas.
* El sistema impida reservas duplicadas.
* El propietario pueda registrar pagos.
* El propietario pueda visualizar métricas básicas.
* Los datos de un propietario no sean visibles para otros propietarios.
