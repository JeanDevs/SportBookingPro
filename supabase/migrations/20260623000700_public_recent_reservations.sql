-- Add public RPC function to count recent reservations for trust signals
-- Used in booking view to show "Recently booked" indicator

create or replace function public.public_recent_reservations_count(p_facility_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(res.id)::bigint
  from public.reservations res
  join public.fields fl on fl.id = res.field_id
  where fl.facility_id = p_facility_id
    and res.created_at > now() - interval '48 hours'
    and res.status in ('CONFIRMED', 'PAID', 'COMPLETED');
$$;

grant execute on function public.public_recent_reservations_count(uuid) to anon, authenticated;
