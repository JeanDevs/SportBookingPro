-- ============================================================================
-- APP DEPORTE 2.0 — Marketplace de clientes (aditivo sobre el schema v1)
-- ADR-003. NO altera la RLS del dueño. El lado cliente opera contra funciones
-- SECURITY DEFINER acotadas. Multi-tenant del dueño intacto (owner_id = auth.uid()).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Cuentas de cliente final (espejo de auth.users para account_type=customer)
-- ----------------------------------------------------------------------------
create table if not exists public.customer_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email citext not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists customer_accounts_set_updated_at on public.customer_accounts;
create trigger customer_accounts_set_updated_at
  before update on public.customer_accounts
  for each row execute function public.set_updated_at();

alter table public.customer_accounts enable row level security;

drop policy if exists customer_accounts_select_own on public.customer_accounts;
create policy customer_accounts_select_own
  on public.customer_accounts for select
  using (id = auth.uid());

drop policy if exists customer_accounts_update_own on public.customer_accounts;
create policy customer_accounts_update_own
  on public.customer_accounts for update
  using (id = auth.uid())
  with check (id = auth.uid());
-- INSERT lo hace el trigger handle_new_user (security definer); sin policy de insert.

-- ----------------------------------------------------------------------------
-- 2. Marketplace: complejos publicables con slug + metadatos públicos
-- ----------------------------------------------------------------------------
alter table public.facilities
  add column if not exists slug text,
  add column if not exists is_published boolean not null default false,
  add column if not exists description text,
  add column if not exists district text;

create or replace function public.slugify(p_text text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(p_text,
      'áàäâãéèëêíìïîóòöôõúùüûñ',
      'aaaaaeeeeiiiiooooouuuun')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- Backfill de slug para complejos existentes (para el push a remoto).
update public.facilities
set slug = public.slugify(name) || '-' || left(id::text, 6)
where slug is null;

create unique index if not exists facilities_slug_unique
  on public.facilities(slug) where slug is not null;

-- ----------------------------------------------------------------------------
-- 3. Vinculación CRM ↔ cuenta de cliente
-- ----------------------------------------------------------------------------
alter table public.customers
  add column if not exists customer_account_id uuid references public.customer_accounts(id) on delete set null,
  add column if not exists email citext;

create index if not exists customers_account_idx
  on public.customers(customer_account_id) where customer_account_id is not null;

create unique index if not exists customers_owner_account_unique
  on public.customers(owner_id, customer_account_id) where customer_account_id is not null;

-- ----------------------------------------------------------------------------
-- 4. handle_new_user enruta el espejo según account_type (owner | customer)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text := coalesce(new.raw_user_meta_data->>'account_type', 'owner');
begin
  if v_type = 'customer' then
    insert into public.customer_accounts (id, email, full_name, phone)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      nullif(new.raw_user_meta_data->>'phone', '')
    )
    on conflict (id) do nothing;
  else
    insert into public.users (id, email, full_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Catálogo público (anónimo OK) — solo complejos publicados y activos
-- ----------------------------------------------------------------------------
create or replace function public.public_facilities()
returns table (
  id uuid,
  slug text,
  name text,
  district text,
  address text,
  description text,
  field_count bigint,
  min_price numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select
    f.id, f.slug, f.name, f.district, f.address, f.description,
    count(fl.id) filter (where fl.status = 'ACTIVE'),
    min(fl.price_per_hour) filter (where fl.status = 'ACTIVE')
  from public.facilities f
  left join public.fields fl on fl.facility_id = f.id
  where f.is_published = true and f.status = 'ACTIVE'
  group by f.id, f.slug, f.name, f.district, f.address, f.description
  order by f.name;
$$;

create or replace function public.public_facility(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case when f.id is null then null else jsonb_build_object(
    'id', f.id,
    'slug', f.slug,
    'name', f.name,
    'district', f.district,
    'address', f.address,
    'phone', f.phone,
    'description', f.description,
    'deposit_percentage', f.deposit_percentage,
    'fields', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', fl.id,
        'name', fl.name,
        'type', fl.type,
        'price_per_hour', fl.price_per_hour
      ) order by fl.name)
      from public.fields fl
      where fl.facility_id = f.id and fl.status = 'ACTIVE'
    ), '[]'::jsonb)
  ) end
  from public.facilities f
  where f.slug = p_slug and f.is_published = true and f.status = 'ACTIVE';
$$;

-- Slots de 30 min de una cancha en una fecha local: disponibilidad − reservas activas.
create or replace function public.public_field_slots(p_field_id uuid, p_date date)
returns table (
  slot_start timestamptz,
  slot_end timestamptz,
  price_per_hour numeric,
  available boolean
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_tz text := 'America/Lima';
  v_field record;
  v_dow smallint;
begin
  select fl.id, fl.facility_id, fl.price_per_hour, fl.status
  into v_field
  from public.fields fl
  join public.facilities fa on fa.id = fl.facility_id
  where fl.id = p_field_id and fl.status = 'ACTIVE'
    and fa.is_published = true and fa.status = 'ACTIVE';

  if v_field.id is null then
    return;
  end if;

  v_dow := extract(dow from p_date)::smallint;

  return query
  with windows as (
    select r.start_time, r.end_time
    from public.field_availability_rules r
    where r.field_id = p_field_id
      and r.day_of_week = v_dow
      and r.is_active = true
  ),
  raw_slots as (
    select gs as s_local
    from windows w
    cross join lateral generate_series(
      (p_date::timestamp + w.start_time),
      (p_date::timestamp + w.end_time) - interval '30 minutes',
      interval '30 minutes'
    ) as gs
  ),
  resolved as (
    select
      (rs.s_local at time zone v_tz) as s_start,
      ((rs.s_local + interval '30 minutes') at time zone v_tz) as s_end
    from raw_slots rs
  )
  select
    rsv.s_start,
    rsv.s_end,
    coalesce((
      select pr.price_per_hour
      from public.field_pricing_rules pr
      where pr.field_id = p_field_id
        and pr.day_of_week = v_dow
        and pr.is_active = true
        and pr.start_time <= (rsv.s_start at time zone v_tz)::time
        and pr.end_time >= (rsv.s_end at time zone v_tz)::time
      order by pr.start_time desc
      limit 1
    ), v_field.price_per_hour) as price_per_hour,
    (
      rsv.s_start > now()
      and not exists (
        select 1
        from public.reservations rv
        where rv.field_id = p_field_id
          and rv.status not in ('CANCELLED', 'EXPIRED')
          and not (
            rv.status in ('INTENT_CREATED', 'AWAITING_DEPOSIT')
            and rv.expires_at is not null
            and rv.expires_at <= now()
          )
          and tstzrange(rv.start_at, rv.end_at, '[)') && tstzrange(rsv.s_start, rsv.s_end, '[)')
      )
    ) as available
  from resolved rsv
  order by rsv.s_start;
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. Escrituras del cliente (requieren sesión de cliente)
-- ----------------------------------------------------------------------------
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

  select * into v_acct from public.customer_accounts where id = v_uid;
  if v_acct.id is null then raise exception 'NOT_A_CUSTOMER'; end if;

  select fl.id, fl.owner_id, fl.facility_id, fl.price_per_hour, fl.status
  into v_field from public.fields fl where fl.id = p_field_id;
  if v_field.id is null or v_field.status <> 'ACTIVE' then
    raise exception 'FIELD_UNAVAILABLE';
  end if;

  select fa.id, fa.deposit_percentage, fa.reservation_intent_hold_minutes,
         fa.is_published, fa.status
  into v_facility from public.facilities fa where fa.id = v_field.facility_id;
  if v_facility.id is null or v_facility.is_published <> true or v_facility.status <> 'ACTIVE' then
    raise exception 'FACILITY_UNAVAILABLE';
  end if;

  -- Registro CRM del cliente bajo el dueño de la cancha (idempotente por cuenta).
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

create or replace function public.submit_customer_payment_proof(
  p_reservation_id uuid,
  p_method public.payment_method,
  p_proof_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_res record;
  v_owns boolean;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;

  select r.id, r.owner_id, r.deposit_required_amount, r.status, r.customer_id
  into v_res from public.reservations r where r.id = p_reservation_id;
  if v_res.id is null then raise exception 'RESERVATION_NOT_FOUND'; end if;

  select exists (
    select 1 from public.customers c
    where c.id = v_res.customer_id and c.customer_account_id = v_uid
  ) into v_owns;
  if not v_owns then raise exception 'FORBIDDEN'; end if;

  if v_res.status not in ('AWAITING_DEPOSIT', 'INTENT_CREATED', 'PARTIALLY_PAID') then
    raise exception 'INVALID_STATE';
  end if;

  insert into public.payments (owner_id, reservation_id, kind, method, status, amount, proof_url)
  values (v_res.owner_id, p_reservation_id, 'DEPOSIT', p_method, 'PENDING_VALIDATION', v_res.deposit_required_amount, p_proof_url);

  -- Congela la expiración mientras el dueño valida el comprobante.
  update public.reservations
  set expires_at = null
  where id = p_reservation_id and status = 'AWAITING_DEPOSIT';
exception
  when unique_violation then raise exception 'PROOF_ALREADY_SUBMITTED';
end;
$$;

create or replace function public.my_customer_bookings()
returns table (
  id uuid,
  facility_name text,
  facility_slug text,
  field_name text,
  field_type public.field_type,
  status public.reservation_status,
  start_at timestamptz,
  end_at timestamptz,
  total_amount numeric,
  deposit_required_amount numeric,
  deposit_status public.payment_status
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id, fa.name, fa.slug, fl.name, fl.type, r.status, r.start_at, r.end_at,
    r.total_amount, r.deposit_required_amount,
    (
      select p.status from public.payments p
      where p.reservation_id = r.id and p.kind = 'DEPOSIT'
        and p.status not in ('REJECTED', 'CANCELLED')
      order by p.created_at desc limit 1
    )
  from public.reservations r
  join public.customers c on c.id = r.customer_id
  join public.fields fl on fl.id = r.field_id
  join public.facilities fa on fa.id = r.facility_id
  where c.customer_account_id = auth.uid()
  order by r.start_at desc;
$$;

-- ----------------------------------------------------------------------------
-- 7. Grants explícitos de la superficie pública/cliente
-- ----------------------------------------------------------------------------
grant execute on function public.public_facilities() to anon, authenticated;
grant execute on function public.public_facility(text) to anon, authenticated;
grant execute on function public.public_field_slots(uuid, date) to anon, authenticated;
grant execute on function public.create_customer_booking(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.submit_customer_payment_proof(uuid, public.payment_method, text) to authenticated;
grant execute on function public.my_customer_bookings() to authenticated;

-- ----------------------------------------------------------------------------
-- 8. Storage: bucket de comprobantes de pago (MVP: lectura pública, escritura auth)
--    Endurecer en hardening (firmar URLs / scoping por carpeta uid/).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

drop policy if exists "proofs_auth_insert" on storage.objects;
create policy "proofs_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs');

drop policy if exists "proofs_public_read" on storage.objects;
create policy "proofs_public_read"
  on storage.objects for select to public
  using (bucket_id = 'payment-proofs');

-- ============================================================================
-- Rollback (manual):
--   drop function if exists public.my_customer_bookings();
--   drop function if exists public.submit_customer_payment_proof(uuid, public.payment_method, text);
--   drop function if exists public.create_customer_booking(uuid, timestamptz, timestamptz, text);
--   drop function if exists public.public_field_slots(uuid, date);
--   drop function if exists public.public_facility(text);
--   drop function if exists public.public_facilities();
--   drop function if exists public.slugify(text);
--   alter table public.customers drop column if exists customer_account_id, drop column if exists email;
--   alter table public.facilities drop column if exists slug, drop column if exists is_published,
--     drop column if exists description, drop column if exists district;
--   drop table if exists public.customer_accounts;
--   -- restaurar handle_new_user de 20260619000100
-- ============================================================================
