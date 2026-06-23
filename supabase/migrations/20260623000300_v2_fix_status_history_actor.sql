-- ============================================================================
-- APP DEPORTE 2.0 — Fix: historial de estados con actor cliente
-- BUG (detectado en E2E contra Postgres real): record_reservation_status_history
-- escribía changed_by = auth.uid() con FK a public.users (staff). Cuando un
-- CLIENTE crea la reserva, su auth.uid() está en customer_accounts, NO en users,
-- → violación de FK y la reserva del cliente fallaba. Solución: changed_by = null
-- cuando el actor no es un usuario staff. De paso fijamos search_path (advisor).
-- ============================================================================

create or replace function public.record_reservation_status_history()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  -- changed_by referencia public.users (staff). Si el actor es un cliente
  -- (customer_accounts) o anónimo, se registra null: el historial conserva la
  -- transición sin un usuario staff responsable.
  if v_actor is not null and not exists (select 1 from public.users u where u.id = v_actor) then
    v_actor := null;
  end if;

  if tg_op = 'INSERT' then
    insert into public.reservation_status_history (owner_id, reservation_id, old_status, new_status, changed_by)
    values (new.owner_id, new.id, null, new.status, v_actor);
  elsif old.status is distinct from new.status then
    insert into public.reservation_status_history (owner_id, reservation_id, old_status, new_status, changed_by)
    values (new.owner_id, new.id, old.status, new.status, v_actor);
  end if;

  return new;
end;
$$;

-- Advisor cleanup: search_path fijo en el trigger de updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
