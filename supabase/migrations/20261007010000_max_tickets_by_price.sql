-- Máximo de boletos según el precio del producto.
--
-- Reemplaza el tope fijo de 36 boletos por rangos de precio: entre más caro
-- el boleto (7% del precio), menos boletos extra arriba del mínimo de 29.
--   Hasta $10,000          -> 36 boletos
--   $10,000.01 a $25,000   -> 33 boletos
--   Más de $25,000         -> 31 boletos
-- Nunca baja del mínimo para cubrir la ganancia del 100%.
-- Debe coincidir con MAX_TICKETS_BY_PRICE en src/utils/pricing.ts.
create or replace function public.product_total_tickets(p_price numeric)
returns integer
language sql
immutable
as $$
  select case
    when round(p_price * 0.07, 2) <= 0 then 0
    else greatest(
      case
        when p_price <= 10000 then 36
        when p_price <= 25000 then 33
        else 31
      end,
      ceil(round(p_price * 2, 2) / round(p_price * 0.07, 2))::integer
    )
  end
$$;

notify pgrst, 'reload schema';
