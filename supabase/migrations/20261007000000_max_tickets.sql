-- Máximo de boletos por rifa.
--
-- Antes el total de boletos a la venta era el mínimo para cubrir la ganancia
-- del 100% (precio x 2 = 29 boletos de 7%). Ahora se pueden vender boletos
-- extra hasta recaudar 2.5 veces el precio (36 boletos), para que el boleto
-- no resulte un pago excesivo frente al valor del premio.
-- Debe coincidir con getMaxTickets en src/utils/pricing.ts.
--
-- get_available_products() y reserve_tickets() ya usan esta función, así que
-- con reemplazarla los boletos disponibles y el límite al apartar se actualizan.
create or replace function public.product_total_tickets(p_price numeric)
returns integer
language sql
immutable
as $$
  select case
    when round(p_price * 0.07, 2) <= 0 then 0
    else ceil(round(p_price * 2.5, 2) / round(p_price * 0.07, 2))::integer
  end
$$;

notify pgrst, 'reload schema';
