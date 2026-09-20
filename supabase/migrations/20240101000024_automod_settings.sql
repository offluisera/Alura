-- 20240101000024_automod_settings.sql
-- Adiciona suporte para preferências do Auto-MOD e filtro de conteúdo na tabela profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dm_spam_filter TEXT DEFAULT 'safe',
ADD COLUMN IF NOT EXISTS automod_config JSONB DEFAULT '{"filterProfanity": true, "filterPhishing": true, "filterExplicitMedia": true, "blockedWords": []}'::jsonb;
