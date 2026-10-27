-- ==============================================================================
-- 20241002000001_servers_hub_and_pins.sql
-- Adiciona campos de descoberta, tags, categorias, verificação e sistema de fixação
-- ==============================================================================

-- 1. ATUALIZAÇÃO DA TABELA SERVERS
ALTER TABLE public.servers
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral',
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS online_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Índices otimizados para busca e ordenação
CREATE INDEX IF NOT EXISTS idx_servers_member_count ON public.servers(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_servers_category ON public.servers(category);
CREATE INDEX IF NOT EXISTS idx_servers_is_public ON public.servers(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_servers_tags ON public.servers USING GIN(tags);

-- 2. TABELA DE SERVIDORES FIXADOS (PIN SYSTEM NA SIDEBAR)
CREATE TABLE IF NOT EXISTS public.user_pinned_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    pinned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, server_id)
);

CREATE INDEX IF NOT EXISTS idx_user_pinned_servers_user ON public.user_pinned_servers(user_id, position ASC);

-- Políticas de Segurança RLS
ALTER TABLE public.user_pinned_servers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem visualizar e gerenciar seus servidores fixados" ON public.user_pinned_servers;
CREATE POLICY "Usuários podem visualizar e gerenciar seus servidores fixados"
    ON public.user_pinned_servers
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. TRIGGER AUTOMÁTICA DE CONTAGEM DE MEMBROS
CREATE OR REPLACE FUNCTION public.update_server_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.servers
        SET member_count = (SELECT COUNT(*) FROM public.server_members WHERE server_id = NEW.server_id),
            updated_at = NOW()
        WHERE id = NEW.server_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.servers
        SET member_count = (SELECT COUNT(*) FROM public.server_members WHERE server_id = OLD.server_id),
            updated_at = NOW()
        WHERE id = OLD.server_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_server_member_count ON public.server_members;
CREATE TRIGGER trigger_update_server_member_count
AFTER INSERT OR DELETE ON public.server_members
FOR EACH ROW EXECUTE FUNCTION public.update_server_member_count();

-- 4. SEEDS OFICIAIS DE COMUNIDADES ALURA
DO $$
DECLARE
    admin_user_id UUID;
    srv_dev_id UUID := '11111111-1111-4111-a111-111111111111';
    srv_games_id UUID := '22222222-2222-4222-a222-222222222222';
    srv_design_id UUID := '33333333-3333-4333-a333-333333333333';
    srv_tech_id UUID := '44444444-4444-4444-a444-444444444444';
BEGIN
    SELECT id INTO admin_user_id FROM public.profiles LIMIT 1;
    IF admin_user_id IS NOT NULL THEN
        -- Servidor 1: Alura Dev
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_dev_id,
            'Alura Dev',
            'Comunidade oficial de desenvolvedores da Alura. Troque ideias sobre TypeScript, Elixir, React, arquitetura e novos projetos.',
            'Tecnologia',
            ARRAY['desenvolvimento', 'react', 'elixir', 'typescript', 'programação'],
            TRUE, TRUE, 12480, 842, TRUE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;

        -- Servidor 2: Gaming Zone
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_games_id,
            'Gaming Zone',
            'O ponto de encontro para jogadores da comunidade. Campeonatos, transmissões ao vivo, canais de voz e grupos de jogo.',
            'Jogos',
            ARRAY['jogos', 'multiplayer', 'stream', 'gameplay', 'discord-free'],
            TRUE, TRUE, 8920, 560, TRUE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;

        -- Servidor 3: Design & UI/UX
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_design_id,
            'Design & UI/UX',
            'Espaço dedicado para entusiastas de design de produtos, design systems, tipografia, Figma e direção de arte.',
            'Criatividade',
            ARRAY['design', 'ui', 'ux', 'figma', 'motion'],
            TRUE, TRUE, 6340, 412, FALSE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;

        -- Servidor 4: Tech & Inovação
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_tech_id,
            'Tech & Inovação',
            'Discussões sobre inteligência artificial, hardware, open-source, novos gadgets e futuro da tecnologia.',
            'Tecnologia',
            ARRAY['ia', 'hardware', 'opensource', 'futuro'],
            FALSE, TRUE, 4120, 289, FALSE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
