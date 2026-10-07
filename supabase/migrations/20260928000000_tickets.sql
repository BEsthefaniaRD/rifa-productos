-- Boletos apartados por los usuarios.
--
-- Cada producto tiene un total de boletos = los necesarios para cubrir el 100%
-- de la ganancia objetivo (precio x 2), vendidos a 7% del precio cada uno.
-- Debe coincidir con getBreakEvenTickets en src/utils/pricing.ts.
-- Los usuarios no insertan en `tickets` directamente: usan `reserve_tickets()`,
-- que valida la disponibilidad dentro de un bloqueo sobre el producto.

-- 1. Total de boletos de un producto.
create or replace function public.product_total_tickets(p_price numeric)
returns integer
language sql
immutable
as $$
  select case
    when round(p_price * 0.07, 2) <= 0 then 0
    else ceil(round(p_price * 2, 2) / round(p_price * 0.07, 2))::integer
  end
$$;

-- 2. Tabla de boletos apartados.
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists tickets_product_id_idx on public.tickets (product_id);
create index if not exists tickets_user_id_idx on public.tickets (user_id);

alter table public.tickets enable row level security;

-- Sin políticas de insert/update/delete: solo se escribe vía reserve_tickets().
drop policy if exists "Usuarios ven sus boletos" on public.tickets;
create policy "Usuarios ven sus boletos"
  on public.tickets
  for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- 3. Productos disponibles, ahora con los boletos que quedan.
--    Cambia el tipo de retorno, por eso hay que borrarla antes.
drop function if exists public.get_available_products();

create function public.get_available_products()
returns table (
  id uuid,
  name text,
  description text,
  image_url text,
  ticket_price numeric,
  available_tickets integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.description,
    p.image_url,
    round(p.price * 0.07, 2),
    greatest(
      public.product_total_tickets(p.price)
        - coalesce((select sum(t.quantity) from public.tickets t where t.product_id = p.id), 0),
      0
    )::integer
  from public.products p
  where p.active
  order by p.created_at desc
$$;

revoke all on function public.get_available_products() from public, anon;
grant execute on function public.get_available_products() to authenticated;

-- 4. Apartar boletos. Devuelve los boletos que quedan disponibles.
create or replace function public.reserve_tickets(p_product_id uuid, p_quantity integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price numeric;
  v_available integer;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero.';
  end if;

  -- Bloquea el producto para que dos compras simultáneas no se pasen del total.
  select p.price into v_price
  from public.products p
  where p.id = p_product_id and p.active
  for update;

  if not found then
    raise exception 'El producto no está disponible.';
  end if;

  select public.product_total_tickets(v_price)
    - coalesce(sum(t.quantity), 0)
  into v_available
  from public.tickets t
  where t.product_id = p_product_id;

  if p_quantity > v_available then
    raise exception 'Solo quedan % boletos disponibles.', greatest(v_available, 0);
  end if;

  insert into public.tickets (product_id, user_id, quantity)
  values (p_product_id, auth.uid(), p_quantity);

  return v_available - p_quantity;
end;
$$;

revoke all on function public.reserve_tickets(uuid, integer) from public, anon;
grant execute on function public.reserve_tickets(uuid, integer) to authenticated;

-- 5. Que la API (PostgREST) vea de inmediato la tabla y funciones nuevas.
notify pgrst, 'reload schema';
