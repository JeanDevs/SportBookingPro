-- Provisiona automaticamente la fila espejo en public.users cuando Supabase Auth
-- crea un usuario en auth.users. De public.users.id cuelga todo el aislamiento
-- multi-tenant (owner_id), por lo que el espejo debe existir o las RLS rompen.

-- security definer: el trigger se dispara dentro del contexto del schema auth,
-- pero necesita insertar en public.users. security definer hace que la funcion
-- corra con los privilegios de su owner (rol con acceso a public), no del rol
-- que ejecuta el insert en auth.users. set search_path = public evita ataques
-- de search_path en funciones security definer.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Rollback
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
