# FASE 2 — Guía de Validación de Schema

> 📋 Validación de las 5 tareas de FASE 2 en Supabase

## 🚀 Instrucciones

### Opción A: Supabase Remoto (Recomendado para testing rápido)

1. **Accede a [supabase.com](https://supabase.com)**
   - Crea un proyecto nuevo o usa uno existente
   - Anota la URL del Proyecto y la API Key

2. **Abre SQL Editor**
   - Dashboard → SQL Editor → Nueva Query

3. **Aplica la migración**
   ```
   1. Copia todo el contenido de: supabase/migrations/20260611000100_initial_business_schema.sql
   2. Pégalo en SQL Editor
   3. Ejecuta (Ctrl+Enter o botón Run)
   4. Espera a que complete (confirmarás "Success")
   ```

4. **Valida las 5 tareas**
   ```
   1. Copia todo el contenido de: supabase/validation_tasks_1_to_5.sql
   2. Pégalo en SQL Editor
   3. Ejecuta (Ctrl+Enter o botón Run)
   4. Lee el output en la sección "Messages" abajo
   ```

**Resultado esperado:**
```
===================================================================
RESUMEN: FASE 2 - VALIDACIÓN COMPLETA
===================================================================

✅ TAREA 1/5: Migración aplicada correctamente
✅ TAREA 2/5: Multi-Tenancy (RLS) implementado
✅ TAREA 3/5: Anti-solapamiento (GIST) validado
✅ TAREA 4/5: Granularidad 30 minutos confirmada
✅ TAREA 5/5: Triggers funcionando correctamente

ESTADO: ✅ FASE 2 COMPLETADA Y VALIDADA
```

---

### Opción B: Supabase Local (Docker + WSL)

**Requisitos:**
- Docker Desktop instalado
- WSL 2 habilitado
- Supabase CLI instalado (`npm install -g supabase` o `brew install supabase`)

**Pasos:**

```bash
cd C:\Users\JeanTS\Documents\PROYECTOS_APPS\APP\ DEPORTE

# 1. Inicia Supabase localmente
supabase start

# 2. Verifica que está corriendo
# Deberías ver:
#   API URL: http://localhost:54321
#   GraphQL URL: http://localhost:54321/graphql/v1
#   DB URL: postgresql://postgres:postgres@localhost:54322/postgres
#   Studio: http://localhost:54323

# 3. Abre Studio en el navegador
#    http://localhost:54323

# 4. En Studio → SQL Editor, pega y ejecuta:
#    - supabase/migrations/20260611000100_initial_business_schema.sql
#    - supabase/validation_tasks_1_to_5.sql

# 5. Detén Supabase cuando termines
supabase stop
```

---

## 📊 Qué Se Valida

### ✅ TAREA 1: Migración
- 9 tablas principales creadas
- 3 extensiones PostgreSQL habilitadas (pgcrypto, btree_gist, citext)
- 8 tipos ENUM definidos

### ✅ TAREA 2: Multi-Tenancy (RLS)
- RLS habilitado en todas las tablas
- Políticas SELECT/INSERT/UPDATE restringen a `owner_id = auth.uid()`
- Aislamiento de datos entre propietarios garantizado

### ✅ TAREA 3: Anti-Solapamiento
- Constraint GIST en tabla `reservations`
- Impide reservas que se solapan en el mismo campo
- Excluye automáticamente CANCELLED y EXPIRED

### ✅ TAREA 4: Granularidad 30 Minutos
- `start_at` y `end_at` forzados a :00 o :30 minutos
- Segundos siempre en :00
- Validado en zona horaria America/Lima

### ✅ TAREA 5: Triggers
- 8 triggers `set_updated_at` (uno por tabla)
- 2 triggers de validación y historial de estado
- Transacciones atómicas

---

## ⚠️ Notas Importantes

### RLS (Multi-Tenancy)
- RLS se aplica basado en `auth.uid()` (usuario autenticado)
- Para **pruebas de integración**, necesitarás:
  - Crear usuarios vía `supabase auth create-user`
  - O usar el panel de Admin en Studio
  - Luego insertar datos y verificar que solo ves los de tu `owner_id`

### Triggers
- Los triggers se ejecutan automáticamente en cada INSERT/UPDATE
- Para validar `updated_at`, inserta un registro, espera 1 segundo, luego actualiza
- El `updated_at` debe cambiar automáticamente

### Próximos Pasos
Después de que valides FASE 2 ✅:

**FASE 3 — Autenticación:**
- Implementar Supabase Auth (registro, login, logout)
- Crear perfil de usuario en `public.users`
- Integrar con Next.js (`@supabase/auth-helpers-nextjs`)

---

## 🔍 Troubleshooting

| Problema | Solución |
|---|---|
| "Error: extensions already exist" | Ya aplicaste la migración. Borra la base y reintenta, o usa otro proyecto. |
| "RLS policy not found" | Asegúrate que ejecutaste el archivo de migración **completo** (no solo parte). |
| "Cannot execute trigger" | Normal si no hay usuario autenticado. Studio lo maneja automáticamente. |
| Docker no inicia | Verifica que WSL 2 está activado: `wsl --list --verbose` |

---

## ✅ Checklist de Validación

Cuando termines de ejecutar ambos archivos SQL:

- [ ] ✅ TAREA 1/5 completada (migración)
- [ ] ✅ TAREA 2/5 completada (multi-tenancy)
- [ ] ✅ TAREA 3/5 completada (anti-solapamiento)
- [ ] ✅ TAREA 4/5 completada (granularidad)
- [ ] ✅ TAREA 5/5 completada (triggers)
- [ ] Documentar resultado en `context.md`
- [ ] Aprobar FASE 3 (Autenticación)

---

**Documento actualizado:** 2026-06-19  
**FASE:** 2-schema-validation  
**Estado:** Listo para ejecutar
