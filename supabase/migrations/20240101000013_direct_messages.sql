-- 000013_direct_messages.sql

-- 1. Tabela DM_CHANNELS
-- Representa um "chat" 1-para-1 entre duas pessoas.
CREATE TABLE public.dm_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Força que não existam DMs duplicados entre a mesma dupla de usuários
    UNIQUE (user_1_id, user_2_id)
);

-- 2. Tabela DIRECT_MESSAGES
-- As mensagens reais enviadas dentro daquele DM_CHANNEL.
CREATE TABLE public.direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dm_channel_id UUID NOT NULL REFERENCES public.dm_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.dm_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas para DM_CHANNELS
-- Usuário só pode VER canais de DM nos quais ele faz parte
CREATE POLICY "Users can view their own dm channels" ON public.dm_channels
    FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Usuário só pode INSERIR canais onde ele é o user_1_id ou user_2_id
CREATE POLICY "Users can create dm channels for themselves" ON public.dm_channels
    FOR INSERT WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- 5. Criar Políticas para DIRECT_MESSAGES
-- Para VER mensagens, o usuário deve ser participante do dm_channel correspondente
CREATE POLICY "Users can view messages in their dm channels" ON public.direct_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dm_channels c
            WHERE c.id = dm_channel_id 
              AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
        )
    );

-- Para ENVIAR mensagens, o usuário deve ser dono da mensagem e estar no canal
CREATE POLICY "Users can send messages to their dm channels" ON public.direct_messages
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.dm_channels c
            WHERE c.id = dm_channel_id 
              AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
        )
    );
