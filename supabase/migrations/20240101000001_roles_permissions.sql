-- 00002_roles_permissions.sql

-- ROLES
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    "position" INTEGER DEFAULT 0,
    is_hoisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLE PERMISSIONS (Permissões granulares conforme ROADMAP)
-- Usamos booleanos para facilitar a modelagem inicial e consultas do RLS, 
-- ou um jsonb se preferir escala infinita. Aqui optamos por colunas tipadas.
CREATE TABLE public.role_permissions (
    role_id UUID PRIMARY KEY REFERENCES public.roles(id) ON DELETE CASCADE,
    view_server BOOLEAN DEFAULT TRUE,
    manage_server BOOLEAN DEFAULT FALSE,
    view_room BOOLEAN DEFAULT TRUE,
    send_message BOOLEAN DEFAULT TRUE,
    edit_message BOOLEAN DEFAULT FALSE,
    delete_message BOOLEAN DEFAULT FALSE,
    connect_voice BOOLEAN DEFAULT TRUE,
    speak BOOLEAN DEFAULT TRUE,
    video BOOLEAN DEFAULT TRUE,
    screen_share BOOLEAN DEFAULT TRUE,
    manage_members BOOLEAN DEFAULT FALSE,
    ban_member BOOLEAN DEFAULT FALSE,
    timeout_member BOOLEAN DEFAULT FALSE,
    manage_roles BOOLEAN DEFAULT FALSE,
    manage_rooms BOOLEAN DEFAULT FALSE,
    manage_events BOOLEAN DEFAULT FALSE,
    manage_webhooks BOOLEAN DEFAULT FALSE,
    use_ai BOOLEAN DEFAULT TRUE,
    create_bot BOOLEAN DEFAULT FALSE,
    create_integration BOOLEAN DEFAULT FALSE,
    create_automation BOOLEAN DEFAULT FALSE
);

-- SERVER MEMBERS
CREATE TABLE public.server_members (
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nickname TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (server_id, user_id)
);

-- MEMBER ROLES (Many-to-Many entre Members e Roles)
CREATE TABLE public.member_roles (
    server_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (server_id, user_id, role_id),
    FOREIGN KEY (server_id, user_id) REFERENCES public.server_members(server_id, user_id) ON DELETE CASCADE
);

-- ROOM OVERRIDES (Para permissões específicas de um Room que sobrescrevem as globais)
CREATE TABLE public.room_role_overrides (
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    view_room BOOLEAN,
    send_message BOOLEAN,
    connect_voice BOOLEAN,
    PRIMARY KEY (room_id, role_id)
);
