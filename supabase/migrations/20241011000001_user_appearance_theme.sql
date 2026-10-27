-- 20241011000001_user_appearance_theme.sql
-- Adiciona persistência de tema, densidade e movimento na tabela public.profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'forest',
ADD COLUMN IF NOT EXISTS chat_density TEXT DEFAULT 'comfortable',
ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.theme IS 'Tema visual ativo do usuário (forest, obsidian, contrast, violet-radiance, midnight-blue, crimson-noir)';
COMMENT ON COLUMN public.profiles.chat_density IS 'Densidade do chat (comfortable ou compact)';
COMMENT ON COLUMN public.profiles.reduced_motion IS 'Se o usuário optou por redução de animações';
