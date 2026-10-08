-- Los productos sin fechas de rifa ya no aparecen para el usuario.
--
-- Antes, un producto sin fechas se mostraba y se vendía sin límite. Ahora el
-- usuario solo ve un producto cuando el admin le asignó fechas y hoy está
-- dentro de ellas; sin fechas tampoco se pueden apartar boletos.
-- get_available_products() y reserve_tickets() ya usan estas funciones.

create or replace function public.raffle_is_visible(p_starts_on date, p_ends_on date)
returns boolean
language sql
stable
as $$
  select p_starts_on is not null
     and p_starts_on <= (now() at time zone 'America/Mexico_City')::date
     and (p_ends_on is null or p_ends_on >= (now() at time zone 'America/Mexico_City')::date)
$$;

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
    -- Sin fechas o sin hora de inicio: la venta no está abierta.
    when p_starts_on is null or p_start_time is null then false
    else public.raffle_sales_starts_at(p_starts_on, p_start_time) <= now()
      and (p_ends_on is null or public.raffle_sales_ends_at(p_ends_on, p_end_time) >= now())
  end
$$;

notify pgrst, 'reload schema';
