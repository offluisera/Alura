-- ==============================================================================
-- 20241005000001_roles_extended_permissions.sql
-- Adiciona suporte a permissões granulares de mensagens, histórico e mídias
-- ==============================================================================

-- 1. Permissões de mensagens e histórico no chat
ALTER TABLE public.role_permissions 
    ADD COLUMN IF NOT EXISTS read_message_history BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS attach_files BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS create_polls BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS send_gifs BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS create_threads BOOLEAN DEFAULT TRUE;
