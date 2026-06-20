-- Soft delete de clientes (FASE 5). Archivar en vez de borrar para preservar el
-- historial: reservations.customer_id y payments cuelgan del cliente via FK, asi
-- que un borrado fisico romperia o perderia datos. `is_active = false` oculta al
-- cliente de la lista activa sin destruir nada; es reversible (restaurar).
--
-- No requiere policy nueva: archivar/restaurar es un UPDATE, ya cubierto por la
-- policy `customers_update_own` (owner_id = auth.uid()).

alter table public.customers
  add column if not exists is_active boolean not null default true;

-- Indice parcial para listar rapido los clientes activos de cada propietario,
-- que es la consulta por defecto de la pantalla de Clientes.
create index if not exists customers_owner_active_idx
  on public.customers(owner_id)
  where is_active = true;

-- Rollback
-- drop index if exists customers_owner_active_idx;
-- alter table public.customers drop column if exists is_active;
