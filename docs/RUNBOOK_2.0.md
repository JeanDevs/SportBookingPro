# RUNBOOK — APP DEPORTE 2.0

Guía operativa de la evolución 2.0 (marketplace de clientes + panel del dueño, rediseño dark
premium). Rama: **`develop`**. Arquitectura: ver [ADR-003](adr/ADR-003-app-deporte-2.0.md).

> **Estado de esta entrega (decisión de Jean: "todo preparado, nada aplicado"):**
> Nada se aplicó en remoto. Migraciones, seed, código y este runbook quedan listos. El único
> bloqueador para correr local fue el **engine de Docker** (Docker Desktop estaba abierto pero su
> distro WSL `docker-desktop` no levantó sin interacción). En cuanto Docker responda, los 2
> comandos del paso 1 dejan la demo corriendo.

---

## 0. Lo que ya está verificado (sin DB)

- `pnpm --filter @app-deporte/web typecheck` → **0 errores** (strict, exactOptional, noUncheckedIndexedAccess).
- `pnpm --filter @app-deporte/web build` → **19 rutas + middleware** compilan; páginas estáticas prerenderizadas.
- Tests: **38 verdes** (web 20 + api 18), incluye la lógica crítica de horarios/zonas (`limaWallClockToISO`, `maxConsecutiveSlots`, `humanizeRpcError`).
- `pnpm --filter @app-deporte/web dev` → server responde **HTTP 200** en todas las rutas.

Pendiente (necesita el stack local): E2E en navegador con datos reales (paso 1).

---

## 1. Correr local (objetivo de esta entrega)

Requisitos: Docker Desktop **corriendo** (engine activo — el ícono en verde), Node ≥ 20, pnpm 9.

```bash
# 1) Levanta el stack Supabase local + aplica migraciones + corre el seed de demo
cd "C:/Users/JeanTS/Documents/PROYECTOS_APPS/APP DEPORTE"
npx supabase start          # primera vez descarga imágenes (varios minutos)
npx supabase db reset       # aplica las 4 migraciones + supabase/seed.sql (datos demo)

# 2) Arranca la web (ya apunta a local vía apps/web/.env.local)
pnpm --filter @app-deporte/web dev
# → http://localhost:3000
```

Si `supabase status` muestra un **anon key** distinto al de `apps/web/.env.local`, cópialo allí
(`NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`).

### Credenciales demo (las crea el seed)
| Rol | Entrada | Usuario | Clave |
|---|---|---|---|
| Dueño | http://localhost:3000/panel | `owner@demo.com` | `demo1234` |
| Cliente | http://localhost:3000/ | `cliente@demo.com` | `demo1234` |

### Checklist E2E (la "demo para clientes")
**Cliente (sitio público):**
1. `/` → ves "Complejo La Bombonera" en el marketplace → entra.
2. Elige cancha → día → hora (slots de 30 min, los ocupados salen tachados).
3. "Inicia sesión para reservar" → entra como `cliente@demo.com` → vuelve y **Reservar**.
4. En `/cuenta` la reserva sale "Esperando adelanto" → **Enviar adelanto** → sube una imagen → queda "Por validar".

**Dueño (panel):**
5. `/panel` (login `owner@demo.com`) → dashboard con la reserva de hoy + ingresos del mes.
6. `/panel/pagos` → el adelanto del cliente aparece **Por validar** → **Validar** → la reserva pasa a Confirmada.
7. `/panel/reservas` → calendario por día, crear reserva manual, cobrar, cancelar.
8. `/panel/configuracion` → publica/oculta el complejo, % de adelanto, **horarios** por cancha (de aquí salen los slots).

> Multi-tenant: crea un segundo dueño (signup en `/panel/registro`) y confirma que NO ve las
> canchas/clientes/reservas del primero (RLS por `owner_id`).

---

## 2. Aplicar el esquema 2.0 en **remoto** (cuando decidas)

La 2.0 añade UNA migración aditiva: `supabase/migrations/20260623000100_v2_customer_marketplace.sql`
(tabla `customer_accounts`, `facilities.slug/is_published`, `customers.customer_account_id`, RPCs
`SECURITY DEFINER`, bucket `payment-proofs`, routing de `handle_new_user`). **No** altera la RLS del dueño.

```bash
# Vincula (una vez) y empuja SOLO la migración nueva (el seed NO se aplica en remoto)
npx supabase link --project-ref mudrcioyideyfcuphlvn
npx supabase db push
```

Después, en remoto:
- Auth → Email: si quieres confirmación de correo, déjala activa (local la tiene apagada para iterar).
- Comprueba advisors: `npx supabase` o el MCP `get_advisors` (security/perf) tras el push.
- Endurecer Storage `payment-proofs` (hoy lectura pública para el MVP): firmar URLs / scoping por `uid/`.

---

## 3. Deploy a **Vercel** (web)

`apps/api` (Fastify) **no** se despliega: el front no lo consume (todo va por Server Actions/RPCs).
Solo se despliega `apps/web` (Next.js).

```bash
cd apps/web
npx vercel link          # crea el proyecto (team: jtrindadpros-projects)
npx vercel               # preview
npx vercel --prod        # producción
```

Variables de entorno en Vercel (Production + Preview):
```
NEXT_PUBLIC_SUPABASE_URL       = https://mudrcioyideyfcuphlvn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = (anon del proyecto remoto — ver .env.local.remote.bak)
NEXT_PUBLIC_APP_URL            = https://<tu-dominio-vercel>
SUPABASE_URL                   = https://mudrcioyideyfcuphlvn.supabase.co
SUPABASE_SERVICE_ROLE_KEY      = (service_role del proyecto remoto)
```
Monorepo: en el proyecto Vercel, **Root Directory = `apps/web`**, Framework = Next.js. Si pide build
command, `next build`; install, `pnpm install` (desde la raíz del repo, Vercel detecta el workspace).

Tras desplegar, en Supabase remoto añade la URL de Vercel a Auth → URL Configuration (Site URL +
redirect `…/auth/callback`).

---

## 4. Referencia de entornos

| Archivo | Para qué |
|---|---|
| `apps/web/.env.local` | LOCAL (apunta a `127.0.0.1:54321`, claves demo del CLI). |
| `apps/web/.env.local.remote.bak` | Respaldo del remoto previo (para volver a apuntar a prod). |
| `apps/web/.env.example` | Plantilla. |

Para volver a apuntar la web al **remoto** sin desplegar: copia los valores de `.env.local.remote.bak`
a `.env.local` (recordando que el esquema 2.0 debe estar pusheado, paso 2).

---

## 5. Troubleshooting

- **`supabase start` no levanta** → abre Docker Desktop y espera a que el engine quede en verde
  (la distro `docker-desktop` debe estar *Running*, no *Stopped*). Reintenta.
- **El marketplace sale vacío** → el complejo demo no quedó publicado o el seed no corrió: `npx supabase db reset`.
- **No aparecen slots** → la cancha no tiene horarios ese día → `/panel/configuracion` → Horarios.
- **"Ese horario acaba de ser reservado"** → el constraint GiST evitó un choque (esperado).
- **anon key inválida** → cópiala de `npx supabase status` a `apps/web/.env.local`.
