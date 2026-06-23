-- Add public RPC function to count recent reservations for trust signals
-- Used in booking view to show "Recently booked" indicator

create or replace function public.public_recent_reservations_count(p_facility_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(br.id)::bigint
  from public.bookings br
  join public.fields fl on fl.id = br.field_id
  where fl.facility_id = p_facility_id
    and br.created_at > now() - interval '48 hours'
    and br.status in ('CONFIRMED', 'PAID', 'IN_USE');
$$;

grant execute on function public.public_recent_reservations_count(uuid) to anon, authenticated;
