-- Aviso por Telegram cuando la venta de una rifa se abre.
--
-- Cada minuto, una tarea programada (pg_cron) llama a la Edge Function
-- `notify-sales-open`. La función pide a `claim_products_to_notify()` los
-- productos cuya venta ya está abierta y que todavía no se han anunciado, y
-- manda a Telegram la imagen con nombre, descripción, precio del boleto y
-- boletos disponibles. Cada producto se anuncia una sola vez por apertura.

-- 1. Marca de cuándo se anunció la apertura de la venta.
alter table public.products
  add column if not exists sales_notified_at timestamptz;

-- 2. Si el admin cambia el día u hora de inicio, la nueva apertura se vuelve
--    a anunciar. Cambiar solo el fin no repite el aviso.
create or replace function public.reset_sales_notification()
returns trigger
language plpgsql
as $$
begin
  if new.raffle_starts_on is distinct from old.raffle_starts_on
     or new.raffle_start_time is distinct from old.raffle_start_time then
    new.sales_notified_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists products_reset_sales_notification on public.products;
create trigger products_reset_sales_notification
  before update on public.products
  for each row
  execute function public.reset_sales_notification();

-- 3. Toma los productos por anunciar y los marca en la misma operación, para
--    que dos ejecuciones simultáneas no manden el aviso dos veces.
create or replace function public.claim_products_to_notify()
returns table (
  id uuid,
  name text,
  description text,
  image_url text,
  ticket_price numeric,
  available_tickets integer,
  sales_ends_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with claimed as (
    update public.products p
    set sales_notified_at = now()
    where p.active
      and p.sales_notified_at is null
      and public.raffle_is_visible(p.raffle_starts_on, p.raffle_ends_on)
      and public.raffle_sales_open(p.raffle_starts_on, p.raffle_ends_on, p.raffle_start_time, p.raffle_end_time)
    returning p.*
  )
  select
    c.id,
    c.name,
    c.description,
    c.image_url,
    round(c.price * 0.07, 2),
    greatest(
      public.product_total_tickets(c.price)
        - coalesce((select sum(t.quantity) from public.tickets t where t.product_id = c.id), 0),
      0
    )::integer,
    case when c.raffle_ends_on is not null
      then public.raffle_sales_ends_at(c.raffle_ends_on, c.raffle_end_time)
    end
  from claimed c
$$;

-- Si Telegram falla, la función libera el producto para reintentar.
create or replace function public.release_product_notification(p_product_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products set sales_notified_at = null where id = p_product_id
$$;

-- Solo la Edge Function (service role) puede usarlas.
revoke all on function public.claim_products_to_notify() from public, anon, authenticated;
revoke all on function public.release_product_notification(uuid) from public, anon, authenticated;
grant execute on function public.claim_products_to_notify() to service_role;
grant execute on function public.release_product_notification(uuid) to service_role;

-- 4. Tarea programada: cada minuto llama a la Edge Function.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('notify-sales-open')
where exists (select 1 from cron.job where jobname = 'notify-sales-open');

select cron.schedule(
  'notify-sales-open',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://ehpgatbfqvdrwjpueeqg.supabase.co/functions/v1/notify-sales-open',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
  $$
);
