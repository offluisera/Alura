-- ==============================================================================
-- 20241004000001_roles_soundboard_and_hoist.sql
-- Adiciona suporte a is_hoisted e use_soundboard nas permissões e roles
-- ==============================================================================

-- 1. Garante que is_hoisted exista na tabela public.roles
ALTER TABLE public.roles 
    ADD COLUMN IF NOT EXISTS is_hoisted BOOLEAN DEFAULT FALSE;

-- 2. Garante que use_soundboard exista na tabela public.role_permissions
ALTER TABLE public.role_permissions 
    ADD COLUMN IF NOT EXISTS use_soundboard BOOLEAN DEFAULT TRUE;

-- 3. Índice para performance na busca de cargos destacados (hoisted)
CREATE INDEX IF NOT EXISTS idx_roles_server_hoisted ON public.roles(server_id, is_hoisted, "position" DESC);
