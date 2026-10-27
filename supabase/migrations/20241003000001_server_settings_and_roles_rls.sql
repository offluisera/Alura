-- ==============================================================================
-- 20241003000001_server_settings_and_roles_rls.sql
-- Políticas RLS, permissões expandidas, bans e gestão de cargos para a Alura
-- ==============================================================================

-- 1. ADICIONAR PERMISSÕES EXPANDIDAS EM ROLE_PERMISSIONS
ALTER TABLE public.role_permissions
    ADD COLUMN IF NOT EXISTS mute_members BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deafen_members BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS move_members BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mention_everyone BOOLEAN DEFAULT FALSE;

-- 2. TABELA DE BANIMENTOS DO SERVIDOR (SERVER BANS)
CREATE TABLE IF NOT EXISTS public.server_bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    banned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(server_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_server_bans_server ON public.server_bans(server_id);
CREATE INDEX IF NOT EXISTS idx_server_bans_user ON public.server_bans(user_id);

ALTER TABLE public.server_bans ENABLE ROW LEVEL SECURITY;

-- 3. FUNÇÃO AUXILIAR: VERIFICA SE O USUÁRIO TEM DETERMINADA PERMISSÃO NO SERVIDOR
CREATE OR REPLACE FUNCTION public.has_server_permission(srv_id UUID, perm_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_owner BOOLEAN;
    has_perm BOOLEAN;
BEGIN
    -- Proprietário sempre tem todas as permissões
    SELECT (owner_id = auth.uid()) INTO is_owner FROM public.servers WHERE id = srv_id;
    IF is_owner IS TRUE THEN
        RETURN TRUE;
    END IF;

    -- Verifica nos cargos atribuídos ao usuário neste servidor
    EXECUTE format('
        SELECT EXISTS (
            SELECT 1 
            FROM public.member_roles mr
            JOIN public.role_permissions rp ON rp.role_id = mr.role_id
            WHERE mr.server_id = $1 
              AND mr.user_id = auth.uid()
              AND rp.%I = TRUE
        )', perm_name)
    INTO has_perm
    USING srv_id;

    RETURN COALESCE(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. POLÍTICAS RLS PARA SPACES
DROP POLICY IF EXISTS "Spaces visiveis para membros" ON public.spaces;
CREATE POLICY "Spaces visiveis para membros" ON public.spaces
    FOR SELECT USING (public.is_server_member(server_id));

DROP POLICY IF EXISTS "Gestores podem criar spaces" ON public.spaces;
CREATE POLICY "Gestores podem criar spaces" ON public.spaces
    FOR INSERT WITH CHECK (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_rooms')
    );

DROP POLICY IF EXISTS "Gestores podem atualizar spaces" ON public.spaces;
CREATE POLICY "Gestores podem atualizar spaces" ON public.spaces
    FOR UPDATE USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_rooms')
    );

DROP POLICY IF EXISTS "Gestores podem excluir spaces" ON public.spaces;
CREATE POLICY "Gestores podem excluir spaces" ON public.spaces
    FOR DELETE USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_rooms')
    );

-- 5. POLÍTICAS RLS PARA ROOMS (CANAIS)
DROP POLICY IF EXISTS "Gestores podem criar rooms" ON public.rooms;
CREATE POLICY "Gestores podem criar rooms" ON public.rooms
    FOR INSERT WITH CHECK (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_rooms')
    );

DROP POLICY IF EXISTS "Gestores podem atualizar rooms" ON public.rooms;
CREATE POLICY "Gestores podem atualizar rooms" ON public.rooms
    FOR UPDATE USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_rooms')
    );

DROP POLICY IF EXISTS "Gestores podem excluir rooms" ON public.rooms;
CREATE POLICY "Gestores podem excluir rooms" ON public.rooms
    FOR DELETE USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_rooms')
    );

-- 6. POLÍTICAS RLS PARA ROLES E ROLE_PERMISSIONS
DROP POLICY IF EXISTS "Roles visiveis para membros" ON public.roles;
CREATE POLICY "Roles visiveis para membros" ON public.roles
    FOR SELECT USING (public.is_server_member(server_id));

DROP POLICY IF EXISTS "Gestores podem gerenciar roles" ON public.roles;
CREATE POLICY "Gestores podem gerenciar roles" ON public.roles
    FOR ALL USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_roles')
    );

DROP POLICY IF EXISTS "Role permissions visiveis para membros" ON public.role_permissions;
CREATE POLICY "Role permissions visiveis para membros" ON public.role_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND public.is_server_member(r.server_id)
        )
    );

DROP POLICY IF EXISTS "Gestores podem gerenciar role_permissions" ON public.role_permissions;
CREATE POLICY "Gestores podem gerenciar role_permissions" ON public.role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.id = role_permissions.role_id
              AND (public.is_server_owner(r.server_id) OR public.has_server_permission(r.server_id, 'manage_roles'))
        )
    );

-- 7. POLÍTICAS RLS PARA MEMBER_ROLES
DROP POLICY IF EXISTS "Member roles visiveis para membros" ON public.member_roles;
CREATE POLICY "Member roles visiveis para membros" ON public.member_roles
    FOR SELECT USING (public.is_server_member(server_id));

DROP POLICY IF EXISTS "Gestores podem atribuir roles" ON public.member_roles;
CREATE POLICY "Gestores podem atribuir roles" ON public.member_roles
    FOR ALL USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'manage_roles')
    );

-- 8. POLÍTICAS RLS PARA SERVER_BANS
DROP POLICY IF EXISTS "Bans visiveis para gestores de membros" ON public.server_bans;
CREATE POLICY "Bans visiveis para gestores de membros" ON public.server_bans
    FOR SELECT USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'ban_member')
    );

DROP POLICY IF EXISTS "Gestores podem aplicar bans" ON public.server_bans;
CREATE POLICY "Gestores podem aplicar bans" ON public.server_bans
    FOR INSERT WITH CHECK (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'ban_member')
    );

DROP POLICY IF EXISTS "Gestores podem remover bans" ON public.server_bans;
CREATE POLICY "Gestores podem remover bans" ON public.server_bans
    FOR DELETE USING (
        public.is_server_owner(server_id) OR public.has_server_permission(server_id, 'ban_member')
    );

-- 9. POLÍTICAS RLS PARA MESSAGE_REACTIONS
DROP POLICY IF EXISTS "Reacoes visiveis para membros da sala" ON public.message_reactions;
CREATE POLICY "Reacoes visiveis para membros da sala" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.rooms r ON r.id = m.room_id
            WHERE m.id = message_reactions.message_id
              AND public.is_server_member(r.server_id)
        )
    );

DROP POLICY IF EXISTS "Usuarios podem reagir" ON public.message_reactions;
CREATE POLICY "Usuarios podem reagir" ON public.message_reactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.rooms r ON r.id = m.room_id
            WHERE m.id = message_id
              AND public.is_server_member(r.server_id)
        )
    );

DROP POLICY IF EXISTS "Usuarios podem remover propria reacao" ON public.message_reactions;
CREATE POLICY "Usuarios podem remover propria reacao" ON public.message_reactions
    FOR DELETE USING (auth.uid() = user_id);
