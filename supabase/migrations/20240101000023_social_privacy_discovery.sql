-- 20240101000023_social_privacy_discovery.sql
-- Adiciona suporte a descoberta por email e telefone, e persistência completa de privacidade

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS discover_by_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS discover_by_phone BOOLEAN DEFAULT false;

-- Tenta preencher coluna email a partir de auth.users caso exista permissão no banco
DO $$
BEGIN
  BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.id = u.id AND p.email IS NULL;
  EXCEPTION WHEN OTHERS THEN
    -- Silenciar caso executado em ambiente sem acesso direto a auth.users
    RAISE NOTICE 'Não foi possível fazer backfill de email direto de auth.users: %', SQLERRM;
  END;
END $$;

-- Índices para otimizar busca no modal de adicionar amigos
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);
