# OWASP_BASELINE.md

# Base de Seguridad para APP DEPORTE

Este documento define el mínimo de seguridad que debe guiar Auth, API, frontend y base de datos.

## Principios

* Aplicar OWASP Top 10 como referencia obligatoria.
* Validar toda entrada en el borde del sistema.
* Usar autenticación y autorización explícitas por recurso.
* Mantener aislamiento multi-tenant por `owner_id` y RLS.
* No confiar en datos enviados por el cliente para decidir permisos.
* Registrar acciones críticas sin exponer secretos.

## OWASP Top 10 Aplicado

### A01 Broken Access Control

* Toda consulta de negocio debe filtrar por propietario.
* RLS debe permanecer habilitado en tablas multi-tenant.
* La API no debe aceptar `owner_id` arbitrario como autoridad.

### A02 Cryptographic Failures

* No almacenar contraseñas propias; usar Supabase Auth.
* No guardar tokens o secretos en logs.
* Usar variables de entorno para claves.

### A03 Injection

* Usar queries parametrizadas o cliente oficial.
* Validar payloads con schemas.
* No concatenar SQL con entrada del usuario.

### A04 Insecure Design

* Modelar reglas críticas en base de datos cuando sea posible.
* Impedir reservas solapadas con constraint, no solo con validación de UI.
* Documentar decisiones que afecten seguridad.

### A05 Security Misconfiguration

* Mantener `.env` fuera de Git.
* Configurar CORS de forma restrictiva.
* Evitar errores con stack traces en producción.

### A06 Vulnerable and Outdated Components

* Revisar dependencias antes de producción.
* Evitar paquetes innecesarios.
* Actualizar librerías críticas de Auth/API.

### A07 Identification and Authentication Failures

* Usar Supabase Auth.
* Aplicar sesiones seguras.
* Preparar recuperación de contraseña sin filtrar existencia de cuentas.

### A08 Software and Data Integrity Failures

* No ejecutar código remoto no confiable.
* Proteger workflows de despliegue.
* Revisar migraciones antes de aplicarlas.

### A09 Security Logging and Monitoring Failures

* Registrar cambios de estado de reservas.
* Registrar pagos validados o rechazados.
* Registrar acciones administrativas críticas.

### A10 Server-Side Request Forgery

* Validar URLs externas antes de integraciones futuras.
* No permitir llamadas arbitrarias a URLs ingresadas por usuarios.

## Reglas para Fases Futuras

* FASE 3 Auth debe incluir manejo seguro de sesiones.
* FASE 4 a FASE 8 deben validar autorización por recurso.
* Toda acción crítica debe dejar rastro auditable.
* Las pruebas deben cubrir accesos cruzados entre propietarios.
