-- ==============================================================================
-- 20241008000001_user_achievements.sql
-- Sistema de Conquistas da Comunidade Alura & Permissão de Atualização Admin
-- ==============================================================================

-- 1. ADICIONA COLUNA DE CONQUISTAS (ARRAY DE IDS DE CONQUISTAS)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}'::TEXT[];

CREATE INDEX IF NOT EXISTS idx_profiles_achievements ON public.profiles USING GIN (achievements);

-- 2. POLÍTICA DE UPDATE PARA STAFF / ADMINS ATUALIZAREM PERFIS
-- Permite que administradores e moderadores gerenciem perfis (cargos, banimento, conquistas)
DROP POLICY IF EXISTS "Staff can update any profile" ON public.profiles;
CREATE POLICY "Staff can update any profile"
    ON public.profiles FOR UPDATE
    USING (
        (SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR (SELECT username FROM public.profiles WHERE id = auth.uid()) IN ('luisera', 'adminalura')
    );

-- 3. FUNÇÃO AUXILIAR SECURITY DEFINER PARA ATRIBUIR CONQUISTAS A UM USUÁRIO
CREATE OR REPLACE FUNCTION public.admin_set_user_achievements(
    p_target_user_id UUID,
    p_achievements TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_is_admin BOOLEAN;
    v_updated_user RECORD;
BEGIN
    -- Verifica se quem está chamando é staff ou admin
    SELECT (is_staff = TRUE OR role = 'admin' OR username IN ('luisera', 'adminalura'))
    INTO v_caller_is_admin
    FROM public.profiles
    WHERE id = auth.uid();

    IF v_caller_is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Acesso negado: apenas administradores podem gerenciar conquistas de usuários.';
    END IF;

    UPDATE public.profiles
    SET achievements = p_achievements,
        updated_at = NOW()
    WHERE id = p_target_user_id
    RETURNING id, username, display_name, achievements INTO v_updated_user;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário não encontrado.';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_updated_user.id,
        'username', v_updated_user.username,
        'achievements', v_updated_user.achievements
    );
END;
$$;
