-- ============================================================================
-- APP DEPORTE 2.0 — Endurecimiento de seguridad (advisors de Supabase tras la 2.0)
-- Corrige los hallazgos introducidos por 20260623000100:
--   - El grant por defecto a PUBLIC dejaba las RPC de escritura y el trigger
--     handle_new_user invocables por `anon`. Revocamos y dejamos solo lo intencional.
--   - `slugify` sin search_path fijo.
--   - Bucket payment-proofs con policy de SELECT amplia (permitía listar archivos).
-- ============================================================================

-- search_path fijo en slugify (no es SECURITY DEFINER, pero el linter lo pide).
create or replace function public.slugify(p_text text)
returns text language sql immutable set search_path = public as $$
  select trim(both '-' from regexp_replace(
    lower(translate(p_text,
      'áàäâãéèëêíìïîóòöôõúùüûñ',
      'aaaaaeeeeiiiiooooouuuun')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- handle_new_user es función de TRIGGER: no debe exponerse como RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- RPC de ESCRITURA del cliente: solo usuarios autenticados (quitar PUBLIC/anon).
revoke all on function public.create_customer_booking(uuid, timestamptz, timestamptz, text) from public, anon;
revoke all on function public.submit_customer_payment_proof(uuid, public.payment_method, text) from public, anon;
revoke all on function public.my_customer_bookings() from public, anon;
grant execute on function public.create_customer_booking(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.submit_customer_payment_proof(uuid, public.payment_method, text) to authenticated;
grant execute on function public.my_customer_bookings() to authenticated;

-- RPC de LECTURA pública: anon + authenticated (sin el grant genérico a PUBLIC).
revoke all on function public.public_facilities() from public;
revoke all on function public.public_facility(text) from public;
revoke all on function public.public_field_slots(uuid, date) from public;
grant execute on function public.public_facilities() to anon, authenticated;
grant execute on function public.public_facility(text) to anon, authenticated;
grant execute on function public.public_field_slots(uuid, date) to anon, authenticated;

-- Storage: el bucket sigue público (URLs de objeto siguen funcionando) pero
-- quitamos la policy de SELECT amplia que permitía LISTAR todos los comprobantes.
drop policy if exists "proofs_public_read" on storage.objects;
