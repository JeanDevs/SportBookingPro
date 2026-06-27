# Blueprint de Módulos — Procesos, Casos de Uso y Brechas

**Versión:** 1.0 · **Fecha:** 2026-06-27 · **Owner:** Jean
**Norte de negocio (decidido):** conseguir **más clientes B2B** = más **dueños de complejos**
que se registran, **publican** y reciben su **primera reserva**.

Este documento modela cada proceso de los módulos que hoy existen en la página, define sus
casos de uso, sus estados y las brechas (funcionales y de seguridad) que separan el estado
actual del objetivo. Es la base del plan de ejecución por fases (sección final).

> **Cómo leerlo.** Cada módulo tiene: *Propósito · Actores · Entidades y estados · Casos de uso
> (UC-XXX) · Proceso · Brechas*. Las brechas están priorizadas con etiqueta
> `[P0]` (bloquea el objetivo), `[P1]` (alto impacto), `[P2]` (mejora).

---

## 0. El embudo que importa (norte B2B)

```text
Landing (/)  ──►  OwnerCta  ──►  /panel/registro  ──►  confirmación email
   │                                                        │
   └────────────────────────────────────────────────►  /panel/ingresar
                                                            │
                                              middleware (gate de complejo)
                                                            │
                                                 /panel/onboarding (3 pasos)
                                                            │
                                ┌───────────────────────────┴───────────────────────────┐
                                ▼                                                         ▼
                   Complejo creado (is_published=false)                         (estado actual: aquí muere)
                                │
                 [FALTA] configurar disponibilidad por cancha
                                │
                 [FALTA] publicar el complejo (is_published=true)
                                │
                                ▼
                   Complejo VISIBLE y RESERVABLE en el marketplace
                                │
                                ▼
                        Primera reserva  ──►  el dueño percibe valor  ──►  retención / pago
```

**Hallazgo central.** El producto ya sabe registrar dueños y crear complejos, pero el dueño
termina el onboarding con un complejo **invisible y no reservable**: `facilities.is_published`
nace en `false` y las canchas nuevas no tienen `field_availability_rules`, por lo que
`public_field_slots` devuelve **cero slots**. El paso que convierte un alta en ingresos —
*publicar con horarios* — hoy es un camino disperso, opcional y fácil de no completar. **Esa es
la fuga #1 del objetivo "más clientes".**

### Estados de activación del dueño (modelo nuevo propuesto)

| Estado | Definición | Visible en marketplace | Puede recibir reservas |
|---|---|---|---|
| `REGISTERED` | Cuenta creada, sin complejo | No | No |
| `FACILITY_CREATED` | Complejo creado, sin canchas/horarios | No | No |
| `BOOKABLE_READY` | ≥1 cancha activa **con disponibilidad** | No (aún sin publicar) | No |
| `PUBLISHED` | `is_published=true` + `BOOKABLE_READY` | **Sí** | **Sí** |
| `ACTIVATED` | Recibió su primera reserva | Sí | Sí |

El objetivo de toda la app B2B es mover dueños a `PUBLISHED` y luego a `ACTIVATED`.

---

## 1. Auth (Dueño y Cliente)

**Propósito.** Acceso seguro y enrutamiento por tipo de cuenta (`account_type` ∈ {owner, customer}).
**Actores.** Dueño (B2B), Cliente final (B2C), Anónimo.
**Entidades.** `auth.users` (Supabase) → espejo `public.users` (owner) o `public.customer_accounts`
(customer) vía trigger `handle_new_user`. Sesión **solo** en cookies httpOnly (`@supabase/ssr`).

**Casos de uso.**
- UC-AUTH-01 — Registro de dueño (`signUp`, `account_type=owner`).
- UC-AUTH-02 — Registro de cliente (`signUpCustomer`, `account_type=customer`).
- UC-AUTH-03 — Login dueño / cliente.
- UC-AUTH-04 — Logout.
- UC-AUTH-05 — Recuperar contraseña (email → `/auth/callback` → actualizar clave).
- UC-AUTH-06 — Enrutamiento por zona (middleware: público / `/cuenta` / `/panel`).

**Proceso (registro dueño).** Form → `signUp` → trigger crea `public.users` → email de
confirmación (si está ON) → login → middleware → gate de complejo → onboarding.

**Brechas.**
- `[P1]` **B-001 — Auth inestable en móvil.** Server Actions devuelven siempre HTTP 200; los
  errores se comunican solo por contenido. El reset de contraseña depende de `NEXT_PUBLIC_APP_URL`
  / `site_url` correctos. Conviene migrar los endpoints de auth a **Route Handlers** para devolver
  401/409/422 y un estado consistente en móvil. (Archivos: `services/auth.ts`,
  `services/customer-auth.ts`, páginas `ingresar/registro/recuperar`.)
- `[P1]` **B-4 — Registro de cliente cae en el panel del dueño.** `middleware.ts:53` usa
  `account_type ?? 'owner'` y `:92` rebota a `/panel` a cualquier no-cliente en `/cuenta`; además
  `signUpCustomer` no cierra una sesión previa. Un cliente nuevo puede terminar en el panel admin.
  (Afecta sobre todo B2C, pero es un defecto de corrección/seguridad transversal.)
- `[P2]` Anti-enumeración ya implementado (no se revela si el email existe) — **OK**, mantener.
- `[P2]` Activar en Supabase: *leaked password protection* y política de confirmación de email
  coherente con la UX.

---

## 2. Owner Onboarding & Facility (complejo)

**Propósito.** Llevar al dueño desde "cuenta creada" hasta "complejo publicado y reservable".
**Actores.** Dueño.
**Entidades.** `facilities` (un complejo por dueño en el MVP): `name, phone, address, district,
description, slug, is_published, deposit_percentage, reservation_intent_hold_minutes, amenities,
status`. RLS `owner_id = auth.uid()`.

**Casos de uso.**
- UC-FAC-01 — Crear complejo (paso 1 del wizard).
- UC-FAC-02 — Agregar primera cancha (paso 2, salteable).
- UC-FAC-03 — Editar datos del complejo (Configuración).
- UC-FAC-04 — **Publicar / despublicar** complejo (`is_published`).
- UC-FAC-05 — Marcar amenities (catálogo cerrado) → confianza en marketplace.

**Proceso actual.** `/panel/onboarding` (3 pasos): crear complejo → agregar cancha → checklist
estático "qué sigue". El middleware solo exige que **exista** un complejo para salir del gate.

**Brechas.**
- `[P0]` **El onboarding no lleva a `PUBLISHED`.** Termina en un checklist que solo *menciona*
  configurar horarios y publicar, sin ejecutarlos. El complejo queda `is_published=false` y sin
  disponibilidad ⇒ invisible y sin slots. **Fuga #1 del objetivo.**
  *Dirección:* convertir el paso 3 en accionable — fijar disponibilidad de la 1ª cancha (plantilla
  rápida, p. ej. L–D 08:00–23:00) y un botón **"Publicar mi complejo"** que valide precondiciones.
- `[P0]` **Cancha nueva = 0 disponibilidad = 0 slots.** Crear cancha no crea
  `field_availability_rules`. Aunque se publique, no es reservable. *Dirección:* ofrecer horario por
  defecto al crear la cancha o exigirlo antes de publicar.
- `[P1]` **Sin "estado de activación" visible.** El dueño no sabe que le falta publicar. *Dirección:*
  banner/checklist de go-live persistente en el Dashboard hasta llegar a `PUBLISHED`/`ACTIVATED`.
- `[P2]` El wizard permite saltar la cancha (paso 2) y caer en un panel sin nada que publicar.

---

## 3. Fields (Canchas)

**Propósito.** Administrar las canchas (unidades de ingreso) del complejo.
**Actores.** Dueño.
**Entidades.** `fields`: `name, type (FieldType), price_per_hour, status (ACTIVE|INACTIVE|MAINTENANCE)`.
Soft-delete por `status`. RLS `owner_id`.

**Casos de uso.**
- UC-FLD-01 — Crear cancha.
- UC-FLD-02 — Editar cancha (nombre, tipo, tarifa base).
- UC-FLD-03 — Activar / desactivar / mantenimiento.
- UC-FLD-04 — Listar canchas (SSR aislado por RLS).
- UC-FLD-05 — Definir **disponibilidad semanal** por cancha (ver módulo 4).
- UC-FLD-06 — Definir **precios por horario** (`field_pricing_rules`, ver módulo 4).

**Brechas.**
- `[P1]` La disponibilidad/precios por horario existen en BD y servicio, pero la **creación de
  cancha no enlaza** con configurar su horario → queda no reservable (ver módulo 2 / 4).
- `[P2]` `MAINTENANCE` está en el enum pero conviene confirmar su UX en panel.

---

## 4. Disponibilidad y Precios

**Propósito.** Definir cuándo se puede reservar cada cancha y a qué precio según la franja.
**Entidades.** `field_availability_rules (day_of_week, start_time, end_time, is_active)`;
`field_pricing_rules (day_of_week, start_time, end_time, price_per_hour, is_active)`.

**Casos de uso.**
- UC-AVL-01 — Fijar ventanas semanales por cancha (`setFieldAvailability`, borra+inserta).
- UC-AVL-02 — Consultar disponibilidad (deriva los slots de 30 min del portal).
- UC-PRC-01 — Precio por franja (override de la tarifa base; se *congela* en la reserva).

**Proceso.** El portal (`public_field_slots`) genera slots de 30 min cruzando las ventanas
activas con las reservas no canceladas/expiradas; el precio aplicado se resuelve por franja y se
guarda en la reserva (BR-062).

**Brechas.**
- `[P0]` **Sin ventanas ⇒ sin slots.** Es el cuello de botella físico de la activación. Cubierto
  por las acciones propuestas en módulo 2.
- `[P2]` La UI de precios por horario debe ser tan simple como la de disponibilidad (plantillas).

---

## 5. Customers (CRM del dueño)

**Propósito.** Centralizar los clientes del complejo y su historial.
**Entidades.** `customers`: `name, phone, email, notes, is_active, customer_account_id`
(vínculo opcional a una cuenta de cliente del marketplace). RLS `owner_id`. Único por
`(owner_id, customer_account_id)`.

**Casos de uso.**
- UC-CUS-01 — Crear cliente manual.
- UC-CUS-02 — Editar cliente.
- UC-CUS-03 — Buscar / filtrar.
- UC-CUS-04 — Ver historial de reservas.
- UC-CUS-05 — Alta automática del cliente al reservar desde el portal (lo hace
  `create_customer_booking`, idempotente por cuenta).

**Brechas.**
- `[P2]` Política de borrado: hoy soft-delete (`is_active`). Confirmar y documentar (no hard delete
  por integridad del historial).

---

## 6. Reservations (núcleo)

**Propósito.** Crear y gestionar reservas sin solapamientos, con ciclo de vida y pagos.
**Entidades.** `reservations`: `field_id, customer_id, start_at, end_at, status,
applied_price_per_hour, total_amount, deposit_required_amount, expires_at`. Anti-solapamiento por
constraint de exclusión GiST (`tstzrange && tstzrange`). Trigger valida ventana y propiedad.

**Estados (BR-030).**
```text
INTENT_CREATED ─► AWAITING_DEPOSIT ─► PARTIALLY_PAID ─► CONFIRMED ─► PAID ─► COMPLETED
        └────────────► EXPIRED            └───────────────► CANCELLED
```

**Casos de uso.**
- UC-RES-01 — Dueño crea reserva directa (panel) → nace `CONFIRMED`.
- UC-RES-02 — Cliente crea intención (portal, `create_customer_booking`) → `AWAITING_DEPOSIT`
  con `expires_at = now()+hold`.
- UC-RES-03 — Cancelar reserva (dueño).
- UC-RES-04 — Expiración automática del hold (pg_cron) libera el horario.
- UC-RES-05 — Consultar disponibilidad / reservas del día / próximas.

**Brechas.**
- `[P1]` `cancelReservation` no valida estado de origen (se puede "cancelar" una `COMPLETED`).
  *Dirección:* acotar transiciones válidas.
- `[P2]` No hay modificar/reprogramar reserva (solo crear/cancelar). Backlog.
- `[P2]` Reembolsos: política no definida (BR pendiente).

---

## 7. Payments

**Propósito.** Cobrar adelanto y saldo; validar manualmente confirma/paga la reserva.
**Entidades.** `payments`: `reservation_id, kind (DEPOSIT|BALANCE), method (CASH|YAPE|PLIN),
status (PENDING_VALIDATION|VALIDATED|REJECTED|CANCELLED), amount, proof_url`. RLS `owner_id`.

**Casos de uso.**
- UC-PAY-01 — Cliente envía comprobante de adelanto (`submit_customer_payment_proof`) → congela
  `expires_at`.
- UC-PAY-02 — Dueño valida adelanto → reserva `CONFIRMED` (BR-043).
- UC-PAY-03 — Dueño rechaza adelanto → re-arma el hold (o expira y libera).
- UC-PAY-04 — Dueño registra pago en caja (efectivo) → `VALIDATED` inmediato.
- UC-PAY-05 — Validar saldo → reserva `PAID`.

**Brechas.**
- `[P1]` **Comprobantes en bucket público.** `payment-proofs` es `public=true`; quitaron la policy
  de *listar*, pero las URLs de objeto siguen siendo accesibles si se conocen. *Dirección:* URLs
  firmadas + scoping por carpeta `uid/` (hardening pendiente declarado).
- `[P2]` Comprobante vía WhatsApp (backlog 2.4) en vez de subida de archivo.

---

## 8. Dashboard

**Propósito.** Mostrar la operación y, sobre todo, **empujar al dueño al siguiente paso de
activación**.
**Casos de uso.**
- UC-DSH-01 — Métricas: reservas hoy/semana, ingresos del mes, horas ocupadas/libres, por validar.
- UC-DSH-02 — Próximas reservas y estado de canchas.

**Brechas.**
- `[P0/P1]` **No hay nudge de activación.** Para el objetivo B2B, el Dashboard de un dueño no
  publicado debería liderar con un **checklist de go-live** ("agrega horarios → publica") en vez de
  métricas en cero. Es la palanca de retención temprana más barata.

---

## 9. Marketplace y Portal de Cliente (B2C, habilita el valor B2B)

**Propósito.** Donde los jugadores encuentran y reservan; es lo que hace que el complejo del dueño
**genere ingresos** (y por tanto el dueño se quede). Aunque el norte es B2B, este portal es el
"producto" que el dueño compra.
**Casos de uso.**
- UC-MKT-01 — Listar complejos publicados (`public_facilities`, anon OK).
- UC-MKT-02 — Ficha del complejo + canchas (`public_facility`).
- UC-MKT-03 — Ver slots y reservar (`public_field_slots` + `create_customer_booking`).
- UC-MKT-04 — Cuenta del cliente: mis reservas, enviar comprobante (`my_customer_bookings`).

**Brechas.**
- `[P2]` Filtros por distrito/deporte y por disponibilidad (backlog A1/A2) — cuando haya volumen.
- `[P2]` Reseñas/estrellas reales tras `COMPLETED` (evitar rating falso).

---

## 10. Seguridad transversal (estado y pendientes)

**Sólido hoy:** RLS por `owner_id` en todas las tablas de negocio; RPCs `SECURITY DEFINER` con
`search_path` fijo y **grants explícitos** (anon solo lectura pública; escritura solo
`authenticated`); `handle_new_user` revocado como RPC; anti-solapamiento y validación en BD;
sesión solo en cookies httpOnly; anti-enumeración en registro.

**Pendiente (hardening):**
- `[P1]` URLs firmadas para `payment-proofs` (hoy bucket público).
- `[P1]` Endpoints de auth con códigos HTTP correctos (Route Handlers) — liga con B-001.
- `[P2]` Toggles de Supabase Auth: leaked-password + confirmación de email.
- `[P2]` Tabla de `audit_logs` poblada en acciones críticas (BR-080) — verificar cobertura.

---

## 11. Plan de ejecución por fases (mapeado al objetivo "más dueños")

> Orden por impacto en el embudo B2B: primero **cerrar la fuga de activación** (que el dueño
> llegue a `PUBLISHED`/`ACTIVATED`), luego **seguridad/robustez**, luego **captación tope de
> embudo**. Cada fase entra con typecheck + tests verdes.

### Fase A — Activación del dueño `[P0]` (mayor ROI hacia el objetivo)
1. Onboarding paso 3 **accionable**: fijar disponibilidad de la 1ª cancha con plantilla rápida +
   botón **"Publicar mi complejo"** con validación de precondiciones (≥1 cancha activa con horario).
2. Crear cancha aplica (u ofrece) **disponibilidad por defecto** para que sea reservable.
3. **Checklist de go-live** persistente en el Dashboard hasta `PUBLISHED` (y aviso de "primera
   reserva" al llegar a `ACTIVATED`).
4. Modelar explícitamente el **estado de activación** (derivado) para gobernar nudges y gating.

### Fase B — Robustez y seguridad funcional `[P1]`
5. B-4: corregir default de `account_type` y rebote de `/cuenta` en `middleware.ts`; `signUpCustomer`
   cierra sesión previa.
6. B-001: migrar auth a Route Handlers (status codes correctos, estable en móvil).
7. URLs firmadas para comprobantes (`payment-proofs`).
8. `cancelReservation` con transiciones válidas.

### Fase C — Captación tope de embudo B2B `[P2]`
9. Página `/para-complejos` (valor + planes) enlazada desde `OwnerCta`.
10. Programa de referidos de dueños (backlog 4.2).
11. Analítica de conversión por etapa del embudo (tabla de eventos + dashboard admin).

### Fase D — Calidad continua
12. Tests de los flujos nuevos (activación, middleware) + verificación E2E.

---

**Decisión solicitada:** aprobar este blueprint y arrancar por la **Fase A** (la que más mueve la
aguja del objetivo). Cada fase se entrega y valida antes de pasar a la siguiente.
</content>
</invoke>
