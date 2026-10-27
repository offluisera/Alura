-- ==============================================================================
-- 20241010000001_admin_feed_moderation.sql
-- Moderação de Publicações no Feed por Administradores e Moderadores
-- ==============================================================================

-- 1. Política de DELETE para moderadores e administradores
DROP POLICY IF EXISTS "Admins e moderadores podem apagar qualquer post" ON public.feed_posts;
CREATE POLICY "Admins e moderadores podem apagar qualquer post" ON public.feed_posts
    FOR DELETE USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (
                profiles.is_staff = true 
                OR profiles.role IN ('admin', 'moderator')
                OR profiles.username IN ('luisera', 'adminalura')
            )
        )
    );

-- 2. Função RPC segura com SECURITY DEFINER para exclusão administrativa direta
CREATE OR REPLACE FUNCTION public.admin_delete_feed_post(target_post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    caller_role TEXT;
    caller_is_staff BOOLEAN;
    caller_username TEXT;
BEGIN
    -- Busca dados do autor da chamada
    SELECT role, is_staff, username 
    INTO caller_role, caller_is_staff, caller_username
    FROM public.profiles
    WHERE id = auth.uid();

    -- Verifica permissão administrativa
    IF caller_is_staff = TRUE OR caller_role IN ('admin', 'moderator') OR caller_username IN ('luisera', 'adminalura') THEN
        -- Exclui anexos, likes e comentários associados se não cascateados
        DELETE FROM public.feed_likes WHERE post_id = target_post_id;
        DELETE FROM public.feed_comments WHERE post_id = target_post_id;
        DELETE FROM public.feed_posts WHERE id = target_post_id;
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Acesso negado: apenas moderadores e administradores podem apagar publicações de terceiros.';
    END IF;
END;
$$;
