-- ============================================================================
-- APP DEPORTE 2.0 — Consistencia de expiración de reservas (bugs B-1 y B-3)
-- B-1: una intención AWAITING_DEPOSIT vencida la trata public_field_slots como
--      libre, pero el constraint GiST (excluye solo CANCELLED/EXPIRED) la sigue
--      contando → el slot se ve disponible pero la reserva choca (SLOT_TAKEN).
--      Fix: barrer intenciones vencidas de la cancha antes de insertar, y
--      ofrecer expire_stale_intents() para un sweep periódico (cron).
-- B-3: create_customer_booking no rechazaba horarios en el pasado. Fix: guardas.
-- ============================================================================

-- Sweep reutilizable: marca EXPIRED toda intención cuyo hold ya venció.
-- Pensado para un cron (pg_cron o ruta cron). No se expone a anon/authenticated.
create or replace function public.expire_stale_intents()
returns integer
language sql
security definer
set search_path = public
as $$
  with upd as (
    update public.reservations
    set status = 'EXPIRED'
    where status in ('INTENT_CREATED', 'AWAITING_DEPOSIT')
      and expires_at is not null
      and expires_at <= now()
    returning 1
  )
  select count(*)::int from upd;
$$;
revoke all on function public.expire_stale_intents() from public, anon, authenticated;

create or replace function public.create_customer_booking(
  p_field_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_acct record;
  v_field record;
  v_facility record;
  v_customer_id uuid;
  v_price numeric;
  v_hours numeric;
  v_total numeric;
  v_deposit numeric;
  v_res_id uuid;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_start_at >= p_end_at then raise exception 'INVALID_RANGE'; end if;
  if p_start_at <= now() then raise exception 'SLOT_IN_PAST'; end if;

  select * into v_acct from public.customer_accounts where id = v_uid;
  if v_acct.id is null then raise exception 'NOT_A_CUSTOMER'; end if;

  select fl.id, fl.owner_id, fl.facility_id, fl.price_per_hour, fl.status
  into v_field from public.fields fl where fl.id = p_field_id;
  if v_field.id is null or v_field.status <> 'ACTIVE' then raise exception 'FIELD_UNAVAILABLE'; end if;

  select fa.id, fa.deposit_percentage, fa.reservation_intent_hold_minutes, fa.is_published, fa.status
  into v_facility from public.facilities fa where fa.id = v_field.facility_id;
  if v_facility.id is null or v_facility.is_published <> true or v_facility.status <> 'ACTIVE' then
    raise exception 'FACILITY_UNAVAILABLE';
  end if;

  -- B-1: liberar intenciones vencidas de esta cancha para que el GiST coincida
  -- con lo que public_field_slots muestra como disponible.
  update public.reservations
  set status = 'EXPIRED'
  where field_id = p_field_id
    and status in ('INTENT_CREATED', 'AWAITING_DEPOSIT')
    and expires_at is not null
    and expires_at <= now();

  select c.id into v_customer_id
  from public.customers c
  where c.owner_id = v_field.owner_id and c.customer_account_id = v_uid
  limit 1;

  if v_customer_id is null then
    insert into public.customers (owner_id, name, phone, email, customer_account_id, is_active)
    values (v_field.owner_id, v_acct.full_name, v_acct.phone, v_acct.email, v_uid, true)
    returning id into v_customer_id;
  end if;

  v_price := coalesce((
    select pr.price_per_hour from public.field_pricing_rules pr
    where pr.field_id = p_field_id
      and pr.day_of_week = extract(dow from (p_start_at at time zone 'America/Lima'))::smallint
      and pr.is_active = true
      and pr.start_time <= (p_start_at at time zone 'America/Lima')::time
      and pr.end_time >= (p_end_at at time zone 'America/Lima')::time
    order by pr.start_time desc
    limit 1
  ), v_field.price_per_hour);

  v_hours := extract(epoch from (p_end_at - p_start_at)) / 3600.0;
  v_total := round(v_price * v_hours, 2);
  v_deposit := round(v_total * v_facility.deposit_percentage / 100.0, 2);

  insert into public.reservations (
    owner_id, facility_id, field_id, customer_id, status,
    start_at, end_at, expires_at,
    applied_price_per_hour, total_amount, deposit_required_amount, notes
  ) values (
    v_field.owner_id, v_field.facility_id, p_field_id, v_customer_id, 'AWAITING_DEPOSIT',
    p_start_at, p_end_at, now() + make_interval(mins => v_facility.reservation_intent_hold_minutes),
    v_price, v_total, v_deposit, p_notes
  ) returning id into v_res_id;

  return v_res_id;
exception
  when exclusion_violation then raise exception 'SLOT_TAKEN';
end;
$$;
