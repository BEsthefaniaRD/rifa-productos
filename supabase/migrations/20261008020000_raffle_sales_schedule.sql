-- Fechas y horario de venta de cada rifa.
--
-- El admin elige las fechas de la rifa y, por separado, la hora de inicio y
-- de fin de la venta. Las horas no tienen valores por defecto: las da el admin.
--   * Fechas (raffle_starts_on / raffle_ends_on): el usuario ve el producto
--     del día de inicio al día de fin.
--   * Hora de inicio (raffle_start_time): la compra se habilita el día de
--     inicio a esa hora. Sin hora de inicio, el usuario ve el producto pero
--     no puede comprar.
--   * Hora de fin (raffle_end_time): la compra se cierra el día de fin a esa
--     hora. Sin hora de fin, cierra al terminar ese día.
--   * Producto sin fechas: sin límite, como antes.
-- Todas las fechas y horas son de México.

-- 1. Columnas nuevas: fechas y horas por separado.
alter table public.products
  add column if not exists raffle_starts_on date,
  add column if not exists raffle_ends_on date,
  add column if not exists raffle_start_time time,
  add column if not exists raffle_end_time time;

-- 2. Pasar los datos de las columnas de fecha y hora juntas, si los hay.
update public.products
set
  raffle_starts_on = (raffle_starts_at at time zone 'America/Mexico_City')::date,
  raffle_start_time = (raffle_starts_at at time zone 'America/Mexico_City')::time,
  raffle_ends_on = (raffle_ends_at at time zone 'America/Mexico_City')::date,
  raffle_end_time = (raffle_ends_at at time zone 'America/Mexico_City')::time
where raffle_starts_at is not null or raffle_ends_at is not null;

alter table public.products
  drop constraint if exists products_raffle_times_check,
  drop column if exists raffle_starts_at,
  drop column if exists raffle_ends_at;

-- 3. Reglas: el fin no puede ser antes del inicio.
alter table public.products
  drop constraint if exists products_raffle_schedule_check;

alter table public.products
  add constraint products_raffle_schedule_check
  check (
    raffle_starts_on is null
    or raffle_ends_on is null
    or raffle_ends_on > raffle_starts_on
    or (
      raffle_ends_on = raffle_starts_on
      and (raffle_start_time is null or raffle_end_time is null or raffle_end_time > raffle_start_time)
    )
  );

-- 4. Momento en que abre y cierra la venta (null = sin hora de inicio / sin fin).
drop function if exists public.raffle_is_open(timestamptz, timestamptz);

create or replace function public.raffle_sales_starts_at(p_starts_on date, p_start_time time)
returns timestamptz
language sql
immutable
as $$
  select (p_starts_on + p_start_time) at time zone 'America/Mexico_City'
$$;

create or replace function public.raffle_sales_ends_at(p_ends_on date, p_end_time time)
returns timestamptz
language sql
immutable
as $$
  select (p_ends_on + coalesce(p_end_time, time '23:59:59')) at time zone 'America/Mexico_City'
$$;

-- 5. ¿El usuario ve el producto? Del día de inicio al día de fin.
create or replace function public.raffle_is_visible(p_starts_on date, p_ends_on date)
returns boolean
language sql
stable
as $$
  select (p_starts_on is null or p_starts_on <= (now() at time zone 'America/Mexico_City')::date)
     and (p_ends_on is null or p_ends_on >= (now() at time zone 'America/Mexico_City')::date)
$$;

-- 6. ¿Se pueden comprar boletos en este momento?
create or replace function public.raffle_sales_open(
  p_starts_on date,
  p_ends_on date,
  p_start_time time,
  p_end_time time
)
returns boolean
language sql
stable
as $$
  select case
    -- Sin fechas: sin límite.
    when p_starts_on is null and p_ends_on is null then true
    -- Con fechas pero sin hora de inicio: el admin aún no abre la venta.
    when p_start_time is null then false
    else public.raffle_sales_starts_at(p_starts_on, p_start_time) <= now()
      and (p_ends_on is null or public.raffle_sales_ends_at(p_ends_on, p_end_time) >= now())
  end
$$;

-- 7. Productos para el usuario: visibles en sus fechas, con el estado de la
--    venta para habilitar o bloquear el botón de compra.
drop function if exists public.get_available_products();

create function public.get_available_products()
returns table (
  id uuid,
  name text,
  description text,
  image_url text,
  ticket_price numeric,
  available_tickets integer,
  sales_open boolean,
  sales_starts_at timestamptz,
  sales_ends_at timestamptz
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
    )::integer,
    public.raffle_sales_open(p.raffle_starts_on, p.raffle_ends_on, p.raffle_start_time, p.raffle_end_time),
    public.raffle_sales_starts_at(p.raffle_starts_on, p.raffle_start_time),
    case when p.raffle_ends_on is not null
      then public.raffle_sales_ends_at(p.raffle_ends_on, p.raffle_end_time)
    end
  from public.products p
  where p.active
    and public.raffle_is_visible(p.raffle_starts_on, p.raffle_ends_on)
  order by p.created_at desc
$$;

revoke all on function public.get_available_products() from public, anon;
grant execute on function public.get_available_products() to authenticated;

-- 8. Solo se apartan boletos con la venta abierta.
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
    and public.raffle_sales_open(p.raffle_starts_on, p.raffle_ends_on, p.raffle_start_time, p.raffle_end_time)
  for update;

  if not found then
    raise exception 'La venta de boletos de este producto no está abierta.';
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
