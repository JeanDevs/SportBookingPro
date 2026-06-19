# PROJECT_STATE.md

# Estado Actual del Proyecto

Última actualización: 2026-06-11

## Fase Actual

FASE 2: Modelo de Datos.

Estado: generada localmente. Validación en Supabase pausada temporalmente por decisión del usuario.

## Qué Está Terminado

### FASE 0: Análisis

Estado: completada.

Resultado:

* Se revisaron las fuentes principales del proyecto.
* Se identificó que el MVP actual está enfocado en propietarios de canchas deportivas.
* Se confirmó que el producto inicial no es para torneos, rankings, peñas ni IA.
* Se definieron los módulos permitidos del MVP: Auth, Users, Fields, Customers, Reservations, Payments y Dashboard.
* Se identificaron las entidades principales del negocio.
* Se confirmó que todas las entidades de negocio deben considerar aislamiento multi-tenant.

### FASE 1: Estructura Base

Estado: completada.

Resultado:

* Se creó la estructura monorepo.
* Se creó la base de frontend con Next.js, React, TypeScript, Tailwind y Shadcn UI.
* Se creó la base de backend con Node.js, TypeScript y Fastify.
* Se creó la configuración inicial de Supabase.
* Se crearon carpetas, configuración y archivos base.
* No se implementó lógica de negocio de aplicación.

### FASE 2: Modelo de Datos

Estado: generada localmente, pendiente de validación en Supabase.

Archivos creados:

* `supabase/migrations/20260611000100_initial_business_schema.sql`
* `docs/database/DATA_MODEL.md`

Resultado:

* Se definió `users.id` como el mismo UUID de `auth.users.id`.
* Se agregó `facilities` desde FASE 2 para respetar `BUSINESS_RULES.md`.
* Se definieron tablas principales: `users`, `facilities`, `fields`, `customers`, `reservations` y `payments`.
* Se agregaron tablas de soporte: `field_availability_rules`, `field_pricing_rules`, `reservation_status_history` y `audit_logs`.
* Se crearon enums para roles, planes, tipos de cancha, estados de cancha, estados de reserva, métodos de pago y estados de pago.
* Se configuró zona horaria oficial `America/Lima`.
* Se configuró granularidad de reservas de 30 minutos.
* Se agregó prevención de reservas solapadas por cancha mediante constraint de exclusión.
* Se agregó soporte para adelanto y saldo por reserva.
* Se agregó RLS por `owner_id` en las tablas de negocio.
* Se documentaron las decisiones del modelo de datos.

### Prototipo UI Inicial

Estado: completado (todas las pantallas MVP cubiertas).

Resultado:

* Dashboard operativo del propietario con stats, reservas del día y estado de canchas.
* Pantalla de Login estática.
* Pantalla de Reservas con calendario visual por cancha (intervalos 30 min).
* Pantalla de Canchas con grid y detalle por cancha.
* Pantalla de Clientes con tabla, búsqueda, filtros y detalle de cliente.
* Pantalla de Pagos con resumen, validación de adelantos, filtros y tabla.
* Pantalla de Configuración con secciones: Complejo, Horarios, Pagos, Notificaciones, Seguridad.
* Navegación completa entre todas las secciones funcional.
* No se conectó la UI con API, Supabase ni lógica de negocio.

### Seguridad

Estado: baseline creado.

Archivo creado:

* `docs/security/OWASP_BASELINE.md`

Resultado:

* Se estableció OWASP Top 10 como referencia obligatoria.
* Se definieron reglas para Auth, API, RLS, validación de entradas, auditoría y manejo de secretos.
* Se dejó indicado que los casos de uso futuros deben validar autorización por recurso y multi-tenancy.

## Qué Falta

### Validación de FASE 2

Pausada temporalmente:

* Aplicar la migración en Supabase local o remoto.
* Validar que las extensiones `pgcrypto`, `btree_gist` y `citext` estén disponibles.
* Probar creación de usuario, complejo, cancha, disponibilidad, cliente, reserva y pago.
* Probar que RLS impide acceso entre propietarios.
* Probar que el constraint anti-solapamiento impide reservas duplicadas.
* Probar que reservas `CANCELLED` y `EXPIRED` liberan horario.
* Probar que una reserva fuera de disponibilidad no se puede crear.

### Antes de FASE 3

Pendiente:

* Aprobar FASE 2 luego de validarla.
* Decidir si se mantiene `MONETIZATION_MODEL.md.txt` vacío o se elimina manualmente.
* Normalizar encoding de documentos fuente si se desea limpiar caracteres dañados.

### Diseño UI

Completado:

* Todas las pantallas del MVP (Dashboard, Login, Reservas, Canchas, Clientes, Pagos, Configuración) creadas como prototipos estáticos.
* Navegación completa funcional.
* Siguiente paso: revisar con el usuario si los flujos y pantallas representan correctamente la operación real antes de avanzar a FASE 3 (Autenticación).

## Riesgos Encontrados

* Los documentos fuente muestran caracteres dañados en algunas lecturas de terminal; conviene normalizar encoding en una fase de limpieza documental.
* El modelo multi-tenant depende de RLS bien diseñada; un error aquí puede exponer datos entre propietarios.
* La regla de reservas duplicadas ya está cubierta en base de datos, pero debe probarse con casos concurrentes.
* Las reglas de plan Free, Pro y Business están modeladas parcialmente, pero sus límites comerciales se aplicarán en la capa de casos de uso.
* La validación de disponibilidad por cancha depende de que existan reglas en `field_availability_rules`.
* No está definida todavía la política de reembolsos.
* No existe todavía una decisión formal sobre soft delete vs hard delete para clientes, canchas y reservas.

## Próxima Fase Recomendada

Primero revisar la interfaz gráfica inicial.

Después, hay dos rutas posibles:

* Retomar validación de FASE 2 en Supabase.
* Avanzar con prototipos UI estáticos para Reservas, Canchas, Clientes y Pagos.

La siguiente fase formal de implementación sigue siendo:

FASE 3: Autenticación.

Objetivo de FASE 3:

* Registro.
* Login.
* Logout.
* Recuperación de contraseña.
* Creación/uso del perfil en `public.users`.
* Integración con Supabase Auth.

## Restricciones Activas

No implementar todavía:

* CRUD de canchas.
* CRUD de clientes.
* Gestión de reservas desde API/UI.
* Gestión de pagos desde API/UI.
* Dashboard funcional.
* WhatsApp.
* IA.
* Peñas deportivas.
* Rankings.
* Computer Vision.

## Regla de Continuidad

Antes de avanzar a una nueva fase:

1. Verificar `IMPLEMENTATION_ROADMAP.md`.
2. Verificar este archivo.
3. Completar y validar la fase actual.
4. Esperar aprobación explícita del usuario.
