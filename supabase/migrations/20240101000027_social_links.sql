-- 20240101000027_social_links.sql
-- Adiciona suporte a conexões sociais personalizadas no perfil

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.social_links IS 'Links sociais e perfis conectados (github, discord, twitch, youtube, steam, etc)';
