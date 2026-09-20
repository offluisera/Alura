-- ============================================================================
-- ALURA — call_signals migration
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

create table if not exists public.call_signals (
  id            uuid primary key default gen_random_uuid(),
  call_id       uuid not null,
  from_user_id  uuid references public.profiles(id) on delete cascade,
  to_user_id    uuid references public.profiles(id) on delete cascade,
  type          text not null check (type in ('offer','answer','ice_candidate','call_end','call_reject','call_busy')),
  payload       jsonb not null default '{}',
  created_at    timestamptz default now()
);

-- Índices para lookup eficiente
create index if not exists call_signals_call_id_idx on public.call_signals(call_id);
create index if not exists call_signals_to_user_idx on public.call_signals(to_user_id, created_at);

-- Limpeza automática de sinais antigos (> 5 minutos)
-- Execute periodicamente ou crie uma pg_cron job
-- DELETE FROM public.call_signals WHERE created_at < now() - interval '5 minutes';

-- RLS: apenas participantes da chamada podem ver/inserir seus sinais
alter table public.call_signals enable row level security;

create policy "call_signals_select"
  on public.call_signals for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "call_signals_insert"
  on public.call_signals for insert
  with check (auth.uid() = from_user_id);

-- Garante que o Realtime do Supabase envie todos os dados para filtros RLS
alter table public.call_signals replica identity full;

-- Habilita Realtime para a tabela diretamente via SQL (dispensa configuração manual no painel)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_signals'
  ) then
    alter publication supabase_realtime add table public.call_signals;
  end if;
end $$;
