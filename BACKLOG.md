# BACKLOG.md

## Propósito

Este backlog organiza el trabajo del MVP de APP DEPORTE. Según `AGENTS.md`, este archivo tiene prioridad sobre la arquitectura y el contexto cuando exista conflicto.

## MVP Permitido

- Auth.
- Users.
- Fields.
- Customers.
- Reservations.
- Payments.
- Dashboard.

## Fuera del MVP

- Peñas deportivas.
- Rankings.
- Torneos.
- Estadísticas deportivas avanzadas.
- Computer Vision.
- Reconocimiento facial.
- Agentes IA autónomos.
- Marketplace deportivo.

## Épicas Iniciales

### Auth ✅ (Supabase SSR + cookies httpOnly — reemplazó el demo `admin`/`admin123`)

- [x] Registro de propietario y de **cliente** (vía `account_type`).
- [x] Inicio / cierre de sesión.
- [x] Recuperación de contraseña.

### Fields

- Crear cancha.
- Editar cancha.
- Activar o desactivar cancha.
- Listar canchas del propietario.

### Customers

- Registrar cliente.
- Editar cliente.
- Consultar clientes.
- Consultar historial de reservas del cliente.

### Reservations

- Crear reserva.
- Modificar reserva.
- Cancelar reserva.
- Consultar disponibilidad.
- Evitar reservas duplicadas.

### Payments

- Registrar pago.
- Consultar pagos.
- Identificar reservas pendientes de pago.

### Dashboard

- Reservas de hoy.
- Reservas de la semana.
- Ingresos del mes.
- Horas ocupadas.
- Horas disponibles.

---

## 2.0 — Evolución (rama `develop`, ADR-003)

> **Nota de alcance:** Jean dirigió la 2.0 con un **portal público de clientes (marketplace)**.
> Esto **supersede** el ítem "Marketplace deportivo / Fuera del MVP" de arriba para el caso de uso
> reserva de canchas (no para peñas/rankings/torneos, que siguen fuera).

### Núcleo 2.0 ✅ (implementado + verificado en remoto)
- [x] Panel del dueño completo (`/panel/*`): Dashboard real, Reservas (crear/cancelar/cobrar),
      Pagos (validar/rechazar), Canchas, Clientes, Configuración funcional.
- [x] Portal de cliente: marketplace `/`, ficha+reserva `/c/[slug]` (slots 30 min, multi-hora,
      anti-solapamiento), `/cuenta` con subida de comprobante de adelanto.
- [x] Rediseño dark premium (design system propio), middleware de 3 zonas, RPCs SECURITY DEFINER.
- [x] Pase de bugs (B-1/B-2/B-3 + fix FK v1) + pg_cron de auto-expiración.

### Ronda 1 de mejoras (inspirada en ATC) ✅
- [x] **B1** — Banda CTA para dueños (B2B) con fuerza visual en el home.
- [x] **C3** — Sección FAQ + "Confían en nosotros" (prueba social honesta).
- [x] **C1** — Amenities por complejo (catálogo cerrado: techada, estacionamiento, vestuarios,
      duchas, iluminación, cafetín, WiFi, seguridad) → owner las marca y se muestran en tarjeta + ficha.

### Diferido (P2 — decidido con Jean)
- [ ] **A1** — Minibuscador + filtros por Distrito y Deporte en el marketplace (client-side).
- [ ] **A2** — Filtro por disponibilidad fecha/hora (RPC `public_search_availability`). Cuando haya volumen.
- [ ] **B2** — Página `/para-complejos` (funcionalidades + planes; depende de pricing).
- [ ] **C2** — Calificación con estrellas / reseñas (cuando haya reservas COMPLETED; evitar rating falso).
- [ ] **A3** — Server-side + paginación del marketplace (cuando supere ~30–50 complejos).

### Hardening / operación (pendiente)
- [ ] Deploy a Vercel · toggles de Auth (leaked-password, confirmación de email) · URLs firmadas en bucket de comprobantes.

