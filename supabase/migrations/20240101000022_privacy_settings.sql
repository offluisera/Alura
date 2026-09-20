-- 000022_privacy_settings.sql
-- Adiciona preferências de privacidade na tabela public.profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS friend_request_policy TEXT DEFAULT 'everyone',
ADD COLUMN IF NOT EXISTS direct_messages_from_mutual BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS activity_status_visible BOOLEAN DEFAULT true;
