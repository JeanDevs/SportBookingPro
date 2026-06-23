# ADR-003: APP DEPORTE 2.0 — Marketplace de dos lados + rediseño dark premium

**Status:** Accepted
**Date:** 2026-06-23
**Deciders:** Jean (arquitecto/owner del producto)
**Supersedes (parcial):** D-002 (acceso por Server Actions + RLS) — se mantiene para el panel del dueño; se **extiende** con una superficie pública para clientes finales.

---

## Contexto

APP DEPORTE v1 es un panel de administración **mono-audiencia** para dueños de complejos
deportivos: auth ✓, gestión de canchas ✓ y clientes ✓ están implementados; reservas, pagos y
dashboard existían solo como **prototipos estáticos** (botones sin handler). Todo el aislamiento
multi-tenant se apoya en RLS con la cláusula `owner_id = auth.uid()`.

La v2.0 pedida por Jean exige:

1. **Completar** el núcleo del negocio del dueño: reservas reales (multi-hora, anti-solapamiento,
   separación de horas), pagos (adelanto + saldo, validación manual) y dashboard en vivo.
2. **Añadir un portal público de clientes finales**: el jugador descubre complejos, ve
   disponibilidad por cancha y hora, se registra, reserva y sube su comprobante de adelanto.
3. **Rediseño total** con una identidad **dark premium / energética** (verde-lima eléctrico).
4. **MVP listo para mostrar a clientes reales** (el "cliente real" que compra el SaaS = el dueño).

**Fuerzas en juego (regla suprema del harness, en orden):** reducir complejidad · reducir contexto ·
aumentar verificabilidad · aumentar reutilización · aumentar mantenibilidad. La RLS multi-tenant es
el activo de seguridad más crítico: un error expone datos entre dueños.

**Restricciones de esta entrega (decididas por Jean):** correr **solo local** (stack Supabase local
vía Docker); **no aplicar nada en remoto** (Supabase prod ni Vercel) — se dejan migraciones + scripts
+ runbook listos. Mercado: Perú (Lima, `America/Lima`, soles `PEN`, métodos CASH/YAPE/PLIN).

---

## Decisión

Construir la v2.0 como **una sola app Next.js con dos audiencias separadas por route-group**, donde
el **dueño** mantiene acceso directo a tablas vía RLS y el **cliente final** opera contra una
**superficie acotada de funciones `SECURITY DEFINER`** (RPCs). El esquema v1 (excelente: máquina de
estados de reserva, constraint GiST anti-solapamiento, trigger de disponibilidad, RLS por dueño) se
**conserva intacto** y se **extiende** de forma aditiva.

### 1. Identidad de cuentas: una `auth.users`, dos perfiles

- `user_metadata.account_type ∈ {'owner','customer'}`, fijado en el signup. Backward-compat:
  `null` ⇒ `owner` (el único usuario existente es dueño).
- El trigger `handle_new_user` **enruta** el espejo: `owner` → `public.users` (como hoy);
  `customer` → nueva tabla `public.customer_accounts (id = auth.users.id)`.
- El **middleware** decide por `account_type` leído del JWT (sin query a BD): `/panel/*` exige
  `owner`; `/cuenta/*` exige `customer`; el resto es público.

### 2. Lado dueño — sin cambios de patrón

Server Actions `'use server'` → Supabase server client (cookies httpOnly) → RLS `owner_id =
auth.uid()`. Se completan reservas/pagos/dashboard sobre las tablas y triggers que ya existen.

### 3. Lado cliente — superficie `SECURITY DEFINER` (no se afloja la RLS del dueño)

En lugar de escribir políticas RLS de cliente sobre 7 tablas (complejo y peligroso), el cliente usa
un puñado de funciones `SECURITY DEFINER` con `search_path` fijo que validan `auth.uid()` y exponen
**solo datos curados**:

| Función (RPC) | Para qué | Lectura/Escritura |
|---|---|---|
| `public_facilities()` | Catálogo de complejos publicados | R (anónimo OK) |
| `public_facility(slug)` | Detalle + canchas de un complejo | R (anónimo OK) |
| `public_field_slots(field_id, date)` | Slots de 30 min libres = disponibilidad − reservas activas | R (anónimo OK) |
| `create_customer_booking(field_id, start_at, end_at)` | Crea reserva del cliente (precio + adelanto calculados; estado `AWAITING_DEPOSIT`; `expires_at`) | W (customer) |
| `submit_customer_payment_proof(reservation_id, method, proof_url)` | Registra el adelanto `PENDING_VALIDATION` | W (customer) |
| `my_customer_bookings()` | Reservas del cliente autenticado | R (customer) |

Soporte de datos (aditivo): `facilities.slug` + `facilities.is_published`; `customers.customer_account_id`
(FK nullable que enlaza el registro CRM del dueño con la cuenta global del cliente). El bucket de
Storage `payment-proofs` guarda comprobantes (lectura del dueño dueño-scoped; escritura del cliente
en su carpeta `uid/`).

**Por qué SECURITY DEFINER y no RLS de cliente:** la regla suprema pide *reducir complejidad* y
*aumentar verificabilidad*. Una superficie de 6 funciones auditables es muchísimo más fácil de
razonar y testear que ~18 políticas RLS nuevas que conviven con las del dueño y podrían filtrar
datos. La integridad concurrente (doble reserva) la garantiza el **constraint de exclusión GiST**
que ya existe — `create_customer_booking` simplemente hace el INSERT y deja que la BD rechace
solapamientos atómicamente.

### 4. Rutas

```
PÚBLICO (sin sesión)         CLIENTE (account_type=customer)   DUEÑO (account_type=owner)
/                landing+    /cuenta        mis reservas        /panel            dashboard
/c/[slug]        reservar    /ingresar /registro (cliente)     /panel/reservas   calendario
/c/[slug]/checkout           /recuperar                        /panel/canchas
                                                               /panel/clientes
                                                               /panel/pagos
                                                               /panel/configuracion
                                                               /panel/onboarding (gate)
                                                               /panel/ingresar /registro (dueño)
```

### 5. Diseño — dark premium / energético

Design system propio (no se instala una librería pesada): tokens en `tailwind.config.ts` (lienzo
casi-negro `ink`, primario verde-lima eléctrico `lime`, superficies elevadas, bordes sutiles, foco
de alto contraste), tipografía Sora (display) + Inter (cuerpo), y **primitivas reutilizables** en
`components/ui` (`Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `StatCard`, `Sidebar`…).
Se reemplazan las pantallas claras hand-rolled.

---

## Opciones consideradas (eje crítico: cómo dejar reservar al cliente final)

### Opción A: Funciones `SECURITY DEFINER` (ELEGIDA)
| Dimensión | Evaluación |
|-----------|------------|
| Complejidad | **Baja** — 6 funciones vs. ~18 políticas RLS nuevas |
| Seguridad | **Alta** — la RLS del dueño no se toca; superficie chica y auditable |
| Verificabilidad | **Alta** — cada RPC se testea como unidad |
| Reutilización | Alta — misma RPC sirve a anónimo y a cliente logueado |

**Pros:** no afloja el activo de seguridad; integridad concurrente delegada al GiST existente; fácil de auditar.
**Cons:** lógica de negocio en PL/pgSQL (hay que testearla en BD); `SECURITY DEFINER` exige `search_path` fijo y cuidado.

### Opción B: Políticas RLS de cliente sobre las tablas del dueño
| Dimensión | Evaluación |
|-----------|------------|
| Complejidad | Alta — políticas que conviven y compiten con las del dueño |
| Seguridad | **Riesgosa** — una policy mal escrita filtra reservas/clientes entre complejos |
| Verificabilidad | Baja — matriz de policies difícil de cubrir |

**Pros:** "todo es RLS", sin RPCs. **Cons:** justo el patrón de fallo que el proyecto teme (fuga multi-tenant); rechazada.

### Opción C: Backend Fastify (apps/api) como API del cliente
**Pros:** lógica en TS, testeable con el stack del front. **Cons:** hoy el front **no consume** Fastify (todo Server Actions); introducir un segundo runtime + despliegue contradice *reducir complejidad* para un MVP local. Se reserva Fastify para integraciones futuras (webhooks de pago, WhatsApp).

### Eje diseño: librería UI (Shadcn/MUI) vs. design system propio
Shadcn nunca llegó a instalarse (era aspiracional). Para una identidad **dark premium** muy
específica, un set chico de primitivas propias da más control visual con menos peso/fricción que
adoptar e re-tematizar una librería. **Elegido: design system propio** sobre Tailwind.

---

## Trade-off Analysis

- **Seguridad vs. velocidad:** las RPCs `SECURITY DEFINER` cuestan más PL/pgSQL hoy, pero evitan el
  riesgo multi-tenant y dan una frontera de pruebas clara. Es el trade-off correcto para datos de
  negocio aislados por dueño.
- **Reestructurar rutas (`/panel/*`) vs. dejarlas en raíz:** mover el panel libera `/` para el
  marketplace público (lo que impresiona en la demo). El costo es churn de rutas + middleware; se
  asume porque es un "rediseño total" y deja una topología 2-lados limpia.
- **Local-only:** correr contra stack Supabase local cumple "nada en remoto" y permite verificar
  E2E de verdad. El costo es depender de Docker; se mitiga dejando el runbook de push a remoto.

## Consequences

**Más fácil:** demo de doble cara (cliente reserva → dueño valida); completar reservas/pagos
reutilizando triggers/constraints existentes; testear el lado cliente como 6 unidades.
**Más difícil:** dos flujos de auth (dueño/cliente) y un middleware con 3 zonas; lógica en PL/pgSQL
que exige tests de BD; el panel cambia de raíz a `/panel`.
**A revisitar:** webhooks de pago reales (hoy validación manual); política de reembolsos (abierta);
multi-complejo por dueño (hoy uno); Storage RLS endurecida; mover a Vercel + Supabase remoto.

## Action Items

1. [ ] Migración aditiva v2: `customer_accounts`, `facilities.slug/is_published`,
   `customers.customer_account_id`, RPCs `SECURITY DEFINER`, bucket `payment-proofs`,
   `handle_new_user` enruta por `account_type`.
2. [ ] Design system dark premium (tokens + primitivas `components/ui`).
3. [ ] Panel `/panel/*`: dashboard real, reservas (crear/cancelar), pagos (validar), settings
   funcional, restyle canchas/clientes; middleware de 3 zonas.
4. [ ] Portal cliente: landing/marketplace `/`, `/c/[slug]` con slots + reserva, auth cliente, `/cuenta`.
5. [ ] Verificación E2E sobre stack local (migraciones aplicadas localmente + seed); typecheck + build + tests.
6. [ ] Runbook de push a Supabase remoto + deploy a Vercel (no ejecutado en esta entrega).
