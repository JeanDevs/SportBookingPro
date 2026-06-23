-- ============================================================================
-- APP DEPORTE 2.0 — Seed de demo (solo entorno LOCAL; corre en `supabase db reset`).
-- Crea 2 cuentas, un complejo PUBLICADO con canchas, horarios y reservas para que
-- la demo (panel del dueño + portal del cliente) tenga datos desde el minuto cero.
--
-- Credenciales demo:
--   Dueño:   owner@demo.com    / demo1234   → /panel
--   Cliente: cliente@demo.com  / demo1234   → /
--
-- Si tu versión del CLI rechaza el insert en auth.* (cambió el esquema), omite
-- este seed y crea las cuentas desde la propia app (signup) — el flujo es completo.
-- ============================================================================

-- ---- Cuentas de auth (el trigger handle_new_user crea los espejos) ----
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'owner@demo.com',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jean Owner","account_type":"owner"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'cliente@demo.com',
    crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Carla Cliente","account_type":"customer","phone":"999111222"}',
    now(), now()
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) values
  (
    gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"owner@demo.com"}',
    'email', '11111111-1111-1111-1111-111111111111', now(), now(), now()
  ),
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"cliente@demo.com"}',
    'email', '22222222-2222-2222-2222-222222222222', now(), now(), now()
  )
on conflict do nothing;

-- ---- Complejo publicado ----
insert into public.facilities (
  id, owner_id, name, slug, phone, address, district, description,
  is_published, status, deposit_percentage
) values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Complejo La Bombonera', 'la-bombonera', '999888777',
  'Av. del Deporte 123', 'Miraflores',
  'Canchas de grass sintético iluminadas, vestuarios y estacionamiento. A 5 min del parque Kennedy.',
  true, 'ACTIVE', 30.00
) on conflict (id) do nothing;

-- ---- Canchas ----
insert into public.fields (id, owner_id, facility_id, name, type, price_per_hour, status) values
  ('44444444-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Cancha 1 (Grass)', 'FUTBOL_7', 120, 'ACTIVE'),
  ('44444444-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Cancha 2 (Loza)', 'FUTBOL_5', 90, 'ACTIVE'),
  ('44444444-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Cancha Vóley', 'VOLEY', 70, 'ACTIVE')
on conflict (id) do nothing;

-- ---- Disponibilidad: todos los días 06:00–23:00 para cada cancha ----
insert into public.field_availability_rules (owner_id, field_id, day_of_week, start_time, end_time)
select
  '11111111-1111-1111-1111-111111111111',
  f.id,
  d.dow,
  time '06:00',
  time '23:00'
from public.fields f
cross join generate_series(0, 6) as d(dow)
where f.facility_id = '33333333-3333-3333-3333-333333333333'
on conflict do nothing;

-- ---- Precio peak (18:00–23:00) para la Cancha 1 ----
insert into public.field_pricing_rules (owner_id, field_id, day_of_week, start_time, end_time, price_per_hour)
select
  '11111111-1111-1111-1111-111111111111',
  '44444444-0000-0000-0000-000000000001',
  d.dow, time '18:00', time '23:00', 150
from generate_series(0, 6) as d(dow)
on conflict do nothing;

-- ---- Cliente en el CRM del dueño (vinculado a la cuenta del cliente) ----
insert into public.customers (id, owner_id, name, phone, email, customer_account_id, is_active) values
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Carla Cliente', '999111222', 'cliente@demo.com', '22222222-2222-2222-2222-222222222222', true)
on conflict (id) do nothing;

-- ---- Reserva de HOY 19:00–21:00 (Cancha 1), CONFIRMADA con adelanto validado ----
insert into public.reservations (
  id, owner_id, facility_id, field_id, customer_id, status,
  start_at, end_at, applied_price_per_hour, total_amount, deposit_required_amount
) values (
  '66666666-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
  '44444444-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'CONFIRMED',
  ((current_date)::timestamp + interval '19 hours') at time zone 'America/Lima',
  ((current_date)::timestamp + interval '21 hours') at time zone 'America/Lima',
  120, 240, 72
) on conflict (id) do nothing;

insert into public.payments (owner_id, reservation_id, kind, method, status, amount, validated_by, validated_at) values
  ('11111111-1111-1111-1111-111111111111', '66666666-0000-0000-0000-000000000001', 'DEPOSIT', 'YAPE', 'VALIDATED', 72, '11111111-1111-1111-1111-111111111111', now())
on conflict do nothing;

-- ---- Reserva de MAÑANA 20:00–21:00 (Cancha 2), esperando validación de adelanto ----
insert into public.reservations (
  id, owner_id, facility_id, field_id, customer_id, status,
  start_at, end_at, applied_price_per_hour, total_amount, deposit_required_amount
) values (
  '66666666-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
  '44444444-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'AWAITING_DEPOSIT',
  ((current_date + 1)::timestamp + interval '20 hours') at time zone 'America/Lima',
  ((current_date + 1)::timestamp + interval '21 hours') at time zone 'America/Lima',
  90, 90, 27
) on conflict (id) do nothing;

insert into public.payments (owner_id, reservation_id, kind, method, status, amount, proof_url) values
  ('11111111-1111-1111-1111-111111111111', '66666666-0000-0000-0000-000000000002', 'DEPOSIT', 'YAPE', 'PENDING_VALIDATION', 27, 'https://placehold.co/400x600/png?text=Yape+S/27')
on conflict do nothing;
