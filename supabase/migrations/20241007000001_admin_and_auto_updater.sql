-- ==============================================================================
-- 20241007000001_admin_and_auto_updater.sql
-- Painel Administrativo da Alura & Sistema de Auto-Update do .exe Desktop
-- ==============================================================================

-- 1. EXTENSÃO DA TABELA PROFILES (ADMIN / STAFF / MODERAÇÃO)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS is_staff BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user', -- 'admin', 'moderator', 'support', 'user'
    ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ban_reason TEXT,
    ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON public.profiles(is_staff) WHERE is_staff = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);

-- 2. EXTENSÃO DA TABELA SERVERS (MODERAÇÃO E SUSPENSÃO)
ALTER TABLE public.servers
    ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ban_reason TEXT,
    ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_servers_is_banned ON public.servers(is_banned);

-- 3. TABELA DE VERSÕES DO APP (.EXE AUTO-UPDATE)
CREATE TABLE IF NOT EXISTS public.app_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    release_notes TEXT,
    download_url TEXT NOT NULL,
    sha256 TEXT,
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode consultar versões ativas" ON public.app_versions;
CREATE POLICY "Qualquer um pode consultar versões ativas"
    ON public.app_versions FOR SELECT
    USING (is_active = TRUE OR (SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

DROP POLICY IF EXISTS "Apenas staff pode gerenciar versões" ON public.app_versions;
CREATE POLICY "Apenas staff pode gerenciar versões"
    ON public.app_versions FOR ALL
    USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE)
    WITH CHECK ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

-- Insere versão inicial padrão 1.0.0
INSERT INTO public.app_versions (version, title, release_notes, download_url, is_mandatory, is_active)
VALUES (
    '1.0.0',
    'Versão Inicial de Lançamento',
    'Primeira versão da plataforma Alura com suporte a comunidades, chamadas de voz e compartilhamento de tela.',
    'https://alura.net.br/downloads/setup_alura.exe',
    FALSE,
    TRUE
)
ON CONFLICT (version) DO NOTHING;

-- 4. TABELA DE MÉTRICAS GLOBAIS DA PLATAFORMA
CREATE TABLE IF NOT EXISTS public.platform_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE UNIQUE DEFAULT CURRENT_DATE,
    peak_concurrent_users INTEGER DEFAULT 1,
    total_signups INTEGER DEFAULT 0,
    total_servers INTEGER DEFAULT 0,
    total_voice_connections INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff pode visualizar metricas" ON public.platform_metrics;
CREATE POLICY "Staff pode visualizar metricas"
    ON public.platform_metrics FOR ALL
    USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

-- Insere métrica inicial
INSERT INTO public.platform_metrics (metric_date, peak_concurrent_users, total_signups, total_servers)
VALUES (CURRENT_DATE, 12, (SELECT COUNT(*) FROM public.profiles), (SELECT COUNT(*) FROM public.servers))
ON CONFLICT (metric_date) DO NOTHING;

-- 5. FUNÇÃO SECURITY DEFINER: DASHBOARD STATS
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_users BIGINT;
    v_banned_users BIGINT;
    v_staff_users BIGINT;
    v_total_servers BIGINT;
    v_banned_servers BIGINT;
    v_total_messages BIGINT;
    v_peak_users INT;
    v_online_users BIGINT;
    v_new_users_today BIGINT;
    v_new_servers_today BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM public.profiles;
    SELECT COUNT(*) INTO v_banned_users FROM public.profiles WHERE is_banned = TRUE;
    SELECT COUNT(*) INTO v_staff_users FROM public.profiles WHERE is_staff = TRUE OR role = 'admin';
    
    SELECT COUNT(*) INTO v_total_servers FROM public.servers;
    SELECT COUNT(*) INTO v_banned_servers FROM public.servers WHERE is_banned = TRUE;
    
    SELECT COUNT(*) INTO v_total_messages FROM public.messages;
    
    SELECT COALESCE(MAX(peak_concurrent_users), 1) INTO v_peak_users FROM public.platform_metrics;
    SELECT COUNT(*) INTO v_online_users FROM public.profiles WHERE status IS NOT NULL AND status != 'offline';
    
    SELECT COUNT(*) INTO v_new_users_today FROM public.profiles WHERE created_at >= CURRENT_DATE;
    SELECT COUNT(*) INTO v_new_servers_today FROM public.servers WHERE created_at >= CURRENT_DATE;
    
    IF v_online_users > v_peak_users THEN
        v_peak_users := v_online_users;
        INSERT INTO public.platform_metrics (metric_date, peak_concurrent_users)
        VALUES (CURRENT_DATE, v_online_users)
        ON CONFLICT (metric_date) DO UPDATE
        SET peak_concurrent_users = GREATEST(platform_metrics.peak_concurrent_users, EXCLUDED.peak_concurrent_users);
    END IF;

    RETURN json_build_object(
        'total_users', v_total_users,
        'banned_users', v_banned_users,
        'staff_users', v_staff_users,
        'total_servers', v_total_servers,
        'banned_servers', v_banned_servers,
        'total_messages', v_total_messages,
        'peak_concurrent_users', v_peak_users,
        'online_users', v_online_users,
        'new_users_today', v_new_users_today,
        'new_servers_today', v_new_servers_today
    );
END;
$$;

-- 6. FUNÇÃO SECURITY DEFINER: REGISTRAR PICO DE USUÁRIOS
CREATE OR REPLACE FUNCTION public.record_online_peak(p_count INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.platform_metrics (metric_date, peak_concurrent_users, updated_at)
    VALUES (CURRENT_DATE, p_count, NOW())
    ON CONFLICT (metric_date) DO UPDATE
    SET peak_concurrent_users = GREATEST(platform_metrics.peak_concurrent_users, EXCLUDED.peak_concurrent_users),
        updated_at = NOW();
END;
$$;

-- 7. ATRIBUI CARGO DE ADMIN / STAFF AOS USUÁRIOS PRINCIPAIS
UPDATE public.profiles
SET is_staff = TRUE, role = 'admin'
WHERE username IN ('luisera', 'adminalura')
   OR id IN ('3d493b7a-3b7d-4050-9be4-859c406cb968', '45f0afd7-8a54-47cc-baac-d6a4eebd9e98');
