create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create extension if not exists citext;

create type public.app_role as enum ('OWNER', 'ADMIN');
create type public.subscription_plan as enum ('FREE', 'PRO', 'BUSINESS');
create type public.facility_status as enum ('ACTIVE', 'INACTIVE');
create type public.field_type as enum (
  'FUTBOL_5',
  'FUTBOL_6',
  'FUTBOL_7',
  'FUTBOL_8',
  'FUTBOL_11',
  'VOLEY',
  'TENNIS',
  'OTHER'
);
create type public.field_status as enum ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
create type public.reservation_status as enum (
  'INTENT_CREATED',
  'AWAITING_DEPOSIT',
  'PARTIALLY_PAID',
  'CONFIRMED',
  'PAID',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED'
);
create type public.payment_method as enum ('CASH', 'YAPE', 'PLIN');
create type public.payment_kind as enum ('DEPOSIT', 'BALANCE');
create type public.payment_status as enum (
  'PENDING_VALIDATION',
  'VALIDATED',
  'REJECTED',
  'CANCELLED'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text not null,
  role public.app_role not null default 'OWNER',
  subscription_plan public.subscription_plan not null default 'FREE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text,
  address text,
  timezone text not null default 'America/Lima',
  status public.facility_status not null default 'ACTIVE',
  deposit_percentage numeric(5,2) not null default 30.00,
  reservation_intent_hold_minutes integer not null default 5,
  full_payment_required_hours_before integer not null default 24,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facilities_deposit_percentage_check check (deposit_percentage >= 0 and deposit_percentage <= 100),
  constraint facilities_hold_minutes_check check (reservation_intent_hold_minutes between 1 and 120),
  constraint facilities_full_payment_hours_check check (full_payment_required_hours_before >= 0),
  constraint facilities_timezone_check check (timezone = 'America/Lima'),
  constraint facilities_owner_name_unique unique (owner_id, name),
  constraint facilities_id_owner_unique unique (id, owner_id)
);

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  facility_id uuid not null,
  name text not null,
  type public.field_type not null,
  price_per_hour numeric(12,2) not null,
  status public.field_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fields_price_per_hour_check check (price_per_hour >= 0),
  constraint fields_owner_facility_fk foreign key (facility_id, owner_id)
    references public.facilities(id, owner_id) on delete cascade,
  constraint fields_owner_id_unique unique (id, owner_id),
  constraint fields_facility_name_unique unique (facility_id, name)
);

create table public.field_availability_rules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  field_id uuid not null,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint field_availability_day_check check (day_of_week between 0 and 6),
  constraint field_availability_time_check check (start_time < end_time),
  constraint field_availability_field_fk foreign key (field_id, owner_id)
    references public.fields(id, owner_id) on delete cascade,
  constraint field_availability_unique unique (field_id, day_of_week, start_time, end_time)
);

create table public.field_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  field_id uuid not null,
  day_of_week smallint not null,
  start_time time not null,
  end_time time not null,
  price_per_hour numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint field_pricing_day_check check (day_of_week between 0 and 6),
  constraint field_pricing_time_check check (start_time < end_time),
  constraint field_pricing_price_check check (price_per_hour >= 0),
  constraint field_pricing_field_fk foreign key (field_id, owner_id)
    references public.fields(id, owner_id) on delete cascade,
  constraint field_pricing_unique unique (field_id, day_of_week, start_time, end_time)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_owner_id_unique unique (id, owner_id)
);

create unique index customers_owner_phone_unique
  on public.customers(owner_id, phone)
  where phone is not null;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  facility_id uuid not null,
  field_id uuid not null,
  customer_id uuid not null,
  status public.reservation_status not null default 'INTENT_CREATED',
  start_at timestamptz not null,
  end_at timestamptz not null,
  expires_at timestamptz,
  currency char(3) not null default 'PEN',
  applied_price_per_hour numeric(12,2) not null,
  total_amount numeric(12,2) not null,
  deposit_required_amount numeric(12,2) not null,
  notes text,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_time_order_check check (start_at < end_at),
  constraint reservations_start_granularity_check check (
    extract(minute from (start_at at time zone 'America/Lima')) in (0, 30)
    and extract(second from (start_at at time zone 'America/Lima')) = 0
  ),
  constraint reservations_end_granularity_check check (
    extract(minute from (end_at at time zone 'America/Lima')) in (0, 30)
    and extract(second from (end_at at time zone 'America/Lima')) = 0
  ),
  constraint reservations_same_local_day_check check (
    (start_at at time zone 'America/Lima')::date = (end_at at time zone 'America/Lima')::date
  ),
  constraint reservations_currency_check check (currency = 'PEN'),
  constraint reservations_amounts_check check (
    applied_price_per_hour >= 0
    and total_amount >= 0
    and deposit_required_amount >= 0
    and deposit_required_amount <= total_amount
  ),
  constraint reservations_owner_facility_fk foreign key (facility_id, owner_id)
    references public.facilities(id, owner_id),
  constraint reservations_owner_field_fk foreign key (field_id, owner_id)
    references public.fields(id, owner_id),
  constraint reservations_owner_customer_fk foreign key (customer_id, owner_id)
    references public.customers(id, owner_id),
  constraint reservations_owner_id_unique unique (id, owner_id),
  constraint reservations_no_field_overlap exclude using gist (
    field_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  )
  where (status not in ('CANCELLED', 'EXPIRED'))
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  reservation_id uuid not null,
  kind public.payment_kind not null,
  method public.payment_method not null,
  status public.payment_status not null default 'PENDING_VALIDATION',
  amount numeric(12,2) not null,
  proof_url text,
  app_processed boolean not null default false,
  app_commission_rate numeric(5,2) not null default 0.00,
  app_commission_amount numeric(12,2) generated always as (
    case
      when app_processed then round(amount * app_commission_rate / 100.0, 2)
      else 0
    end
  ) stored,
  validated_by uuid references public.users(id),
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_check check (amount > 0),
  constraint payments_commission_rate_check check (app_commission_rate >= 0 and app_commission_rate <= 100),
  constraint payments_owner_reservation_fk foreign key (reservation_id, owner_id)
    references public.reservations(id, owner_id) on delete cascade
);

create unique index payments_one_active_payment_per_kind
  on public.payments(reservation_id, kind)
  where status not in ('REJECTED', 'CANCELLED');

create table public.reservation_status_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  reservation_id uuid not null,
  old_status public.reservation_status,
  new_status public.reservation_status not null,
  changed_by uuid references public.users(id),
  changed_at timestamptz not null default now(),
  notes text,
  constraint reservation_history_owner_reservation_fk foreign key (reservation_id, owner_id)
    references public.reservations(id, owner_id) on delete cascade
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  actor_user_id uuid references public.users(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index facilities_owner_id_idx on public.facilities(owner_id);
create index fields_owner_facility_idx on public.fields(owner_id, facility_id);
create index field_availability_field_day_idx on public.field_availability_rules(field_id, day_of_week);
create index field_pricing_field_day_idx on public.field_pricing_rules(field_id, day_of_week);
create index customers_owner_name_idx on public.customers(owner_id, name);
create index reservations_owner_start_idx on public.reservations(owner_id, start_at);
create index reservations_field_start_idx on public.reservations(field_id, start_at);
create index reservations_customer_idx on public.reservations(owner_id, customer_id);
create index reservations_status_idx on public.reservations(owner_id, status);
create index payments_owner_reservation_idx on public.payments(owner_id, reservation_id);
create index payments_status_idx on public.payments(owner_id, status);
create index reservation_history_reservation_idx on public.reservation_status_history(reservation_id, changed_at);
create index audit_logs_owner_created_idx on public.audit_logs(owner_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_reservation_business_rules()
returns trigger
language plpgsql
as $$
declare
  field_record record;
  customer_record record;
  facility_record record;
  local_day smallint;
  local_start time;
  local_end time;
begin
  select id, owner_id, facility_id, status
  into field_record
  from public.fields
  where id = new.field_id;

  if field_record.id is null then
    raise exception 'Field does not exist.';
  end if;

  if field_record.owner_id <> new.owner_id or field_record.facility_id <> new.facility_id then
    raise exception 'Reservation field does not belong to the requested owner/facility.';
  end if;

  if field_record.status <> 'ACTIVE' and new.status not in ('CANCELLED', 'EXPIRED') then
    raise exception 'Only active fields can receive active reservations.';
  end if;

  select id, owner_id, timezone
  into facility_record
  from public.facilities
  where id = new.facility_id;

  if facility_record.id is null or facility_record.owner_id <> new.owner_id then
    raise exception 'Reservation facility does not belong to the requested owner.';
  end if;

  select id, owner_id
  into customer_record
  from public.customers
  where id = new.customer_id;

  if customer_record.id is null or customer_record.owner_id <> new.owner_id then
    raise exception 'Reservation customer does not belong to the requested owner.';
  end if;

  local_day = extract(dow from (new.start_at at time zone facility_record.timezone));
  local_start = (new.start_at at time zone facility_record.timezone)::time;
  local_end = (new.end_at at time zone facility_record.timezone)::time;

  if new.status not in ('CANCELLED', 'EXPIRED') and not exists (
    select 1
    from public.field_availability_rules availability
    where availability.owner_id = new.owner_id
      and availability.field_id = new.field_id
      and availability.day_of_week = local_day
      and availability.is_active = true
      and availability.start_time <= local_start
      and availability.end_time >= local_end
  ) then
    raise exception 'Reservation is outside the configured field availability.';
  end if;

  return new;
end;
$$;

create or replace function public.record_reservation_status_history()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.reservation_status_history (
      owner_id,
      reservation_id,
      old_status,
      new_status,
      changed_by
    )
    values (
      new.owner_id,
      new.id,
      null,
      new.status,
      auth.uid()
    );
  elsif old.status is distinct from new.status then
    insert into public.reservation_status_history (
      owner_id,
      reservation_id,
      old_status,
      new_status,
      changed_by
    )
    values (
      new.owner_id,
      new.id,
      old.status,
      new.status,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger facilities_set_updated_at
before update on public.facilities
for each row execute function public.set_updated_at();

create trigger fields_set_updated_at
before update on public.fields
for each row execute function public.set_updated_at();

create trigger field_availability_set_updated_at
before update on public.field_availability_rules
for each row execute function public.set_updated_at();

create trigger field_pricing_set_updated_at
before update on public.field_pricing_rules
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger reservations_set_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger reservations_validate_business_rules
before insert or update on public.reservations
for each row execute function public.validate_reservation_business_rules();

create trigger reservations_record_status_history
after insert or update of status on public.reservations
for each row execute function public.record_reservation_status_history();

alter table public.users enable row level security;
alter table public.facilities enable row level security;
alter table public.fields enable row level security;
alter table public.field_availability_rules enable row level security;
alter table public.field_pricing_rules enable row level security;
alter table public.customers enable row level security;
alter table public.reservations enable row level security;
alter table public.payments enable row level security;
alter table public.reservation_status_history enable row level security;
alter table public.audit_logs enable row level security;

create policy users_select_own
  on public.users for select
  using (id = auth.uid());

create policy users_insert_own
  on public.users for insert
  with check (id = auth.uid());

create policy users_update_own
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy facilities_select_own
  on public.facilities for select
  using (owner_id = auth.uid());

create policy facilities_insert_own
  on public.facilities for insert
  with check (owner_id = auth.uid());

create policy facilities_update_own
  on public.facilities for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy fields_select_own
  on public.fields for select
  using (owner_id = auth.uid());

create policy fields_insert_own
  on public.fields for insert
  with check (owner_id = auth.uid());

create policy fields_update_own
  on public.fields for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy field_availability_select_own
  on public.field_availability_rules for select
  using (owner_id = auth.uid());

create policy field_availability_insert_own
  on public.field_availability_rules for insert
  with check (owner_id = auth.uid());

create policy field_availability_update_own
  on public.field_availability_rules for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy field_pricing_select_own
  on public.field_pricing_rules for select
  using (owner_id = auth.uid());

create policy field_pricing_insert_own
  on public.field_pricing_rules for insert
  with check (owner_id = auth.uid());

create policy field_pricing_update_own
  on public.field_pricing_rules for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy customers_select_own
  on public.customers for select
  using (owner_id = auth.uid());

create policy customers_insert_own
  on public.customers for insert
  with check (owner_id = auth.uid());

create policy customers_update_own
  on public.customers for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy reservations_select_own
  on public.reservations for select
  using (owner_id = auth.uid());

create policy reservations_insert_own
  on public.reservations for insert
  with check (owner_id = auth.uid());

create policy reservations_update_own
  on public.reservations for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy payments_select_own
  on public.payments for select
  using (owner_id = auth.uid());

create policy payments_insert_own
  on public.payments for insert
  with check (owner_id = auth.uid());

create policy payments_update_own
  on public.payments for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy reservation_history_select_own
  on public.reservation_status_history for select
  using (owner_id = auth.uid());

create policy reservation_history_insert_own
  on public.reservation_status_history for insert
  with check (owner_id = auth.uid());

create policy audit_logs_select_own
  on public.audit_logs for select
  using (owner_id = auth.uid());

create policy audit_logs_insert_own
  on public.audit_logs for insert
  with check (owner_id = auth.uid());
