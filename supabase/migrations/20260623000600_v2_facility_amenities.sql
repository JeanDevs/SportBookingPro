-- ============================================================================
-- APP DEPORTE 2.0 — Comodidades del complejo (indicador de confianza, C1)
-- Catálogo cerrado en TS (lib/domain AMENITIES); aquí solo se guardan los keys.
-- public_facilities() cambia de firma (nueva columna) → drop + create + re-grant.
-- ============================================================================

alter table public.facilities
  add column if not exists amenities text[] not null default '{}';

drop function if exists public.public_facilities();
create function public.public_facilities()
returns table (
  id uuid,
  slug text,
  name text,
  district text,
  address text,
  description text,
  field_count bigint,
  min_price numeric,
  amenities text[]
)
language sql
security definer
set search_path = public
stable
as $$
  select
    f.id, f.slug, f.name, f.district, f.address, f.description,
    count(fl.id) filter (where fl.status = 'ACTIVE'),
    min(fl.price_per_hour) filter (where fl.status = 'ACTIVE'),
    f.amenities
  from public.facilities f
  left join public.fields fl on fl.facility_id = f.id
  where f.is_published = true and f.status = 'ACTIVE'
  group by f.id, f.slug, f.name, f.district, f.address, f.description, f.amenities
  order by f.name;
$$;
revoke all on function public.public_facilities() from public;
grant execute on function public.public_facilities() to anon, authenticated;

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
    'amenities', to_jsonb(f.amenities),
    'fields', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', fl.id, 'name', fl.name, 'type', fl.type, 'price_per_hour', fl.price_per_hour
      ) order by fl.name)
      from public.fields fl
      where fl.facility_id = f.id and fl.status = 'ACTIVE'
    ), '[]'::jsonb)
  ) end
  from public.facilities f
  where f.slug = p_slug and f.is_published = true and f.status = 'ACTIVE';
$$;
