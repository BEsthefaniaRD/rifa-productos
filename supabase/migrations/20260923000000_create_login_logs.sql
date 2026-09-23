-- Registro de inicios de sesión. Solo la Edge Function `send-login-telegram`
-- escribe aquí (con service role, que ignora RLS); los admins pueden leer.

create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  status text not null default 'success',
  telegram_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists login_logs_created_at_idx
  on public.login_logs (created_at desc);

alter table public.login_logs enable row level security;

-- Sin políticas de insert/update/delete: desde el frontend nadie puede
-- escribir ni falsificar registros.
drop policy if exists "Admins pueden ver login_logs" on public.login_logs;
create policy "Admins pueden ver login_logs"
  on public.login_logs
  for select
  to authenticated
  using (public.is_admin());
