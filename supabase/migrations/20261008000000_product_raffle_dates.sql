-- Fechas en las que la rifa de cada producto está disponible.
--
-- El admin elige desde / hasta en su tabla de productos. Ambas fechas son
-- inclusivas y opcionales: sin fecha de inicio la rifa ya empezó, y sin fecha
-- de fin no termina. Fuera de ese rango el usuario no ve el producto ni puede
-- apartar boletos. Las fechas se comparan con el día de hoy en México.

-- 1. Columnas nuevas.
alter table public.products
  add column if not exists raffle_starts_on date,
  add column if not exists raffle_ends_on date;

alter table public.products
  drop constraint if exists products_raffle_dates_check;

alter table public.products
  add constraint products_raffle_dates_check
  check (raffle_ends_on is null or raffle_starts_on is null or raffle_ends_on >= raffle_starts_on);

-- 2. ¿La rifa está dentro de sus fechas hoy?
create or replace function public.raffle_is_open(p_starts_on date, p_ends_on date)
returns boolean
language sql
stable
as $$
  select (p_starts_on is null or p_starts_on <= (now() at time zone 'America/Mexico_City')::date)
     and (p_ends_on is null or p_ends_on >= (now() at time zone 'America/Mexico_City')::date)
$$;

-- 3. El usuario solo ve productos activos y dentro de sus fechas.
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
    and public.raffle_is_open(p.raffle_starts_on, p.raffle_ends_on)
  order by p.created_at desc
$$;

-- 4. Tampoco se pueden apartar boletos fuera de las fechas.
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
    and public.raffle_is_open(p.raffle_starts_on, p.raffle_ends_on)
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
