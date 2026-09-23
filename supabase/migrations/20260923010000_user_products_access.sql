-- Acceso de usuarios normales a productos.
--
-- Los usuarios normales NO leen la tabla `products` (que incluye el precio real).
-- En su lugar llaman a `get_available_products()`, que devuelve solo lo que
-- necesitan ver: datos del producto y precio del boleto, de productos activos.

-- 1. Función para usuarios: solo columnas necesarias.
--    security definer: corre con permisos del dueño, así no hace falta que el
--    usuario tenga acceso de lectura a `products`.
--    El 7% debe coincidir con TICKET_PRICE_RATE en src/utils/pricing.ts.
create or replace function public.get_available_products()
returns table (
  id uuid,
  name text,
  description text,
  image_url text,
  ticket_price numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.description, p.image_url, round(p.price * 0.07, 2)
  from public.products p
  where p.active
  order by p.created_at desc
$$;

revoke all on function public.get_available_products() from public, anon;
grant execute on function public.get_available_products() to authenticated;

-- 2. La tabla `products` solo puede leerla un admin.
--    Se eliminan las políticas SELECT actuales (hoy permiten leer sin sesión)
--    y se crea una solo para admins. Las políticas de insert/update no se tocan.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'products' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.products', pol.policyname);
  end loop;
end $$;

create policy "Admins pueden ver products"
  on public.products
  for select
  to authenticated
  using (public.is_admin());
