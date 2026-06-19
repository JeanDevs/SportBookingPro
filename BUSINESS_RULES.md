# BUSINESS_RULES.md

# Objetivo

Definir las reglas de negocio oficiales de APP DEPORTE.

Este documento es la fuente de verdad para:

* Diseño de entidades.
* Diseño de base de datos.
* Casos de uso.
* Validaciones.
* Automatizaciones.
* Integraciones futuras.

Toda implementación debe respetar estas reglas.

---

# Principios del Negocio

APP DEPORTE ayuda a complejos deportivos a:

* Incrementar ocupación.
* Reducir cancelaciones.
* Gestionar reservas.
* Gestionar pagos.
* Centralizar clientes.

El MVP está enfocado en reservas de canchas deportivas.

Las peñas deportivas, rankings e IA son módulos posteriores.

---

# Modelo Organizacional

## Regla BR-001

Un usuario propietario puede administrar uno o más complejos deportivos.

```text
User
  └── Facility
```

---

## Regla BR-002

Un complejo deportivo puede tener una o más canchas.

```text
Facility
  └── Field
```

---

## Regla BR-003

Toda cancha pertenece a un único complejo deportivo.

---

# Disponibilidad de Canchas

## Regla BR-010

Cada cancha tiene horarios configurables.

Ejemplo:

```text
08:00 - 23:00
```

---

## Regla BR-011

Los horarios disponibles deben definirse por cancha.

---

## Regla BR-012

Una cancha no puede recibir reservas fuera de su horario configurado.

---

# Reservas

## Regla BR-020

Toda reserva inicia como una intención de reserva.

Estado inicial:

```text
INTENT_CREATED
```

---

## Regla BR-021

Una intención de reserva bloquea temporalmente el horario solicitado.

Duración del bloqueo:

```text
5 minutos
```

Valor configurable por complejo deportivo.

---

## Regla BR-022

Durante el bloqueo ningún otro cliente puede reservar el mismo horario.

---

## Regla BR-023

Si el tiempo de bloqueo expira sin pago válido:

Estado:

```text
EXPIRED
```

El horario queda disponible nuevamente.

---

## Regla BR-024

Un cliente puede solicitar ser notificado si un horario vuelve a estar disponible.

Funcionalidad prevista para V2.

---

## Regla BR-025

Una reserva puede abarcar múltiples horas.

Ejemplo:

```text
20:00 - 22:00
```

---

## Regla BR-026

El sistema debe impedir solapamientos de horarios.

Ejemplo inválido:

```text
Reserva A
20:00 - 22:00

Reserva B
21:00 - 23:00
```

---

# Estados de Reserva

## Regla BR-030

Estados válidos:

```text
INTENT_CREATED

AWAITING_DEPOSIT

PARTIALLY_PAID

CONFIRMED

PAID

COMPLETED

CANCELLED

EXPIRED
```

---

## Regla BR-031

Las transiciones deben registrarse en historial.

---

# Pagos

## Regla BR-040

Toda reserva requiere adelanto.

---

## Regla BR-041

El porcentaje de adelanto es configurable por complejo deportivo.

Valor inicial sugerido:

```text
30%
```

---

## Regla BR-042

Una reserva puede tener hasta dos pagos.

Pago 1:

```text
Adelanto
```

Pago 2:

```text
Saldo restante
```

---

## Regla BR-043

El adelanto debe ser validado antes de confirmar la reserva.

---

## Regla BR-044

En el MVP la validación del pago es manual.

Proceso:

```text
Cliente
↓
Sube comprobante
↓
Administrador valida
↓
Reserva confirmada
```

---

## Regla BR-045

La validación automática mediante webhook es una funcionalidad futura.

---

## Regla BR-046

Reservas de larga duración pueden requerir pago total anticipado.

El plazo será configurable por complejo deportivo.

Ejemplo:

```text
24 horas antes del evento
```

---

# Clientes

## Regla BR-050

Todo cliente debe estar asociado a una reserva.

---

## Regla BR-051

Un cliente puede tener múltiples reservas.

---

## Regla BR-052

El historial de reservas del cliente debe mantenerse.

---

# Precios

## Regla BR-060

Una cancha puede tener distintos precios según horario.

Ejemplo:

```text
08:00 - 18:00
S/80

18:00 - 23:00
S/100
```

---

## Regla BR-061

El precio final se calcula según el horario reservado.

---

## Regla BR-062

El precio aplicado debe almacenarse en la reserva.

Aunque el precio de la cancha cambie posteriormente.

---

# Monetización APP DEPORTE

## Regla BR-070

APP DEPORTE opera bajo modelo Freemium.

---

## Regla BR-071

Los límites del plan gratuito son configurables.

---

## Regla BR-072

Los planes de pago habilitan funcionalidades adicionales.

---

## Regla BR-073

APP DEPORTE puede cobrar comisión por pagos procesados dentro de la plataforma.

Valor inicial:

```text
5%
```

---

# Auditoría

## Regla BR-080

Toda acción crítica debe quedar registrada.

Ejemplos:

* Reserva creada.
* Reserva cancelada.
* Pago registrado.
* Pago validado.
* Cambio de estado.

---

# Configuración por Complejo Deportivo

## Regla BR-090

Cada complejo deportivo puede configurar:

* Porcentaje de adelanto.
* Tiempo de expiración de intención.
* Horarios operativos.
* Reglas de pago total anticipado.
* Precios por horario.

---

# Funcionalidades Futuras

## V2

* Lista de espera.
* Notificaciones automáticas.
* WhatsApp.
* Webhooks de pago.

## V3

* IA para reservas.
* Predicción de ocupación.
* Recomendaciones automáticas.

## V4

* Peñas deportivas.
* Rankings.
* Estadísticas.
* Torneos.
