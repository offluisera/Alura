-- Migração para suporte a 2FA (Autenticação em Duas Etapas) no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_enrolled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS backup_codes TEXT[] DEFAULT '{}';

-- Comentários explicativos
COMMENT ON COLUMN public.profiles.two_factor_enabled IS 'Indica se a autenticação em duas etapas (2FA / TOTP) está ativa para a conta';
COMMENT ON COLUMN public.profiles.mfa_enrolled_at IS 'Data/hora em que o usuário habilitou o 2FA';
COMMENT ON COLUMN public.profiles.backup_codes IS 'Códigos de recuperação de emergência de 2FA';
