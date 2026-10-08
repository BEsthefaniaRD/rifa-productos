-- Fecha y hora de inicio y fin de cada rifa.
--
-- Reemplaza las columnas de solo fecha (raffle_starts_on / raffle_ends_on) por
-- fecha y hora (timestamptz). Ambas son opcionales: sin inicio la rifa ya
-- empezó, y sin fin no termina. Fuera de ese rango el usuario no ve el
-- producto ni puede apartar boletos. Se compara contra el momento actual.

-- 1. Columnas nuevas.
alter table public.products
  add column if not exists raffle_starts_at timestamptz,
  add column if not exists raffle_ends_at timestamptz;

-- 2. Pasar las fechas que ya existieran: inicio a las 00:00 y fin a las 23:59
--    de ese día, hora de México.
update public.products
set
  raffle_starts_at = raffle_starts_on::timestamp at time zone 'America/Mexico_City',
  raffle_ends_at = (raffle_ends_on::timestamp + interval '23 hours 59 minutes')
    at time zone 'America/Mexico_City'
where raffle_starts_on is not null or raffle_ends_on is not null;

-- 3. Quitar las columnas de solo fecha.
alter table public.products
  drop constraint if exists products_raffle_dates_check,
  drop column if exists raffle_starts_on,
  drop column if exists raffle_ends_on;

alter table public.products
  drop constraint if exists products_raffle_times_check;

alter table public.products
  add constraint products_raffle_times_check
  check (raffle_ends_at is null or raffle_starts_at is null or raffle_ends_at > raffle_starts_at);

-- 4. ¿La rifa está abierta en este momento?
drop function if exists public.raffle_is_open(date, date);

create or replace function public.raffle_is_open(p_starts_at timestamptz, p_ends_at timestamptz)
returns boolean
language sql
stable
as $$
  select (p_starts_at is null or p_starts_at <= now())
     and (p_ends_at is null or p_ends_at >= now())
$$;

-- 5. El usuario solo ve productos activos y con la rifa abierta.
create or replace function public.get_available_products()
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
    and public.raffle_is_open(p.raffle_starts_at, p.raffle_ends_at)
  order by p.created_at desc
$$;

-- 6. Tampoco se pueden apartar boletos fuera del horario de la rifa.
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
  where p.id = p_product_id
    and p.active
    and public.raffle_is_open(p.raffle_starts_at, p.raffle_ends_at)
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

notify pgrst, 'reload schema';
