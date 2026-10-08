-- Actualización en tiempo real de las vistas de productos.
--
-- Cuando cambia un producto (admin) o se apartan boletos (usuario), la base de
-- datos manda una señal por Supabase Realtime (broadcast) al canal
-- `products-changes`. Las páginas del admin y del usuario la escuchan y vuelven
-- a pedir su lista, así no hace falta refrescar.
--
-- La señal no lleva datos de productos (ni el precio real): solo avisa que algo
-- cambió, y cada vista vuelve a consultar lo que su rol tiene permitido ver.

create or replace function public.broadcast_products_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform realtime.send(
    jsonb_build_object('table', tg_table_name),
    'changed',
    'products-changes',
    false -- canal público: la señal no contiene datos sensibles
  );
  return null;
end;
$$;

-- Una señal por operación (no por fila), para no saturar el canal.
drop trigger if exists products_broadcast_changes on public.products;
create trigger products_broadcast_changes
  after insert or update or delete on public.products
  for each statement
  execute function public.broadcast_products_changed();

drop trigger if exists tickets_broadcast_changes on public.tickets;
create trigger tickets_broadcast_changes
  after insert or update or delete on public.tickets
  for each statement
  execute function public.broadcast_products_changed();
