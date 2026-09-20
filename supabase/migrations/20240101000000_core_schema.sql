-- 00001_core_schema.sql
-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Global)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    status TEXT DEFAULT 'offline',
    avatar_url TEXT,
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVERS
CREATE TABLE public.servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    banner_url TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SPACES (Agrupamento lógico de salas)
CREATE TABLE public.spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "position" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROOMS (Canais de interação)
CREATE TYPE public.room_type AS ENUM ('text', 'voice', 'video', 'forum', 'announcements', 'media');

CREATE TABLE public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type public.room_type NOT NULL DEFAULT 'text',
    "position" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- THREADS
CREATE TABLE public.threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL UNIQUE REFERENCES public.messages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGE ATTACHMENTS
CREATE TABLE public.message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    file_type TEXT,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGE REACTIONS
CREATE TABLE public.message_reactions (
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id, emoji)
);
