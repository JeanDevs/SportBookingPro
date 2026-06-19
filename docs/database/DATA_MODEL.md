# DATA_MODEL.md

# Modelo de Datos Inicial

Este documento resume las decisiones de FASE 2 para APP DEPORTE.

## Decisiones Confirmadas

* `users.id` usa el mismo UUID que `auth.users.id` de Supabase.
* La zona horaria oficial es `America/Lima`.
* La granularidad mínima de reservas es de 30 minutos.
* Se crea `facilities` desde FASE 2 porque `BUSINESS_RULES.md` define complejos deportivos como entidad central.
* Una reserva cancelada o expirada libera el horario.
* Una reserva puede tener adelanto y saldo.
* Los tipos iniciales de cancha incluyen fútbol, vóley y tenis.
* Los estados de cancha son `ACTIVE`, `INACTIVE` y `MAINTENANCE`.

## Tablas Principales

* `users`: perfil operativo del usuario autenticado en Supabase.
* `facilities`: complejos deportivos administrados por un propietario.
* `fields`: canchas pertenecientes a un complejo deportivo.
* `customers`: clientes del propietario.
* `reservations`: reservas con estado, precio aplicado y reglas de disponibilidad.
* `payments`: pagos manuales asociados a reservas.

## Tablas de Soporte

* `field_availability_rules`: horarios disponibles por cancha.
* `field_pricing_rules`: precios por horario y día.
* `reservation_status_history`: historial de cambios de estado.
* `audit_logs`: base para registrar acciones críticas.

## Reglas Críticas en Base de Datos

* Todas las entidades de negocio usan `owner_id`.
* RLS limita lectura y escritura a `owner_id = auth.uid()`.
* Las reservas no pueden solaparse por cancha mientras no estén `CANCELLED` o `EXPIRED`.
* Las reservas deben comenzar y terminar en intervalos de 30 minutos.
* Las reservas deben ocurrir dentro de la disponibilidad configurada para la cancha.
* Los pagos están limitados a dos tipos por reserva: `DEPOSIT` y `BALANCE`.
* Los pagos pueden quedar pendientes de validación manual.
* El precio aplicado se guarda en la reserva para preservar historial aunque cambien precios futuros.

## Monetización Preparada

El modelo incluye `subscription_plan` en `users` y datos de comisión por pago para soportar:

* Plan Free.
* Plan Pro.
* Plan Business.
* Comisión por pagos procesados dentro de la plataforma.

Los límites comerciales no se aplican todavía en base de datos; se implementarán cuando el flujo de negocio correspondiente esté activo.

