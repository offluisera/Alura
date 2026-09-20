-- 000015_direct_messages_read_status.sql

-- Adiciona a coluna is_read para mensagens diretas, a fim de controlar os contadores de não lidas
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Atualizar RLS para permitir que o usuário atualize as mensagens lidas
-- Já existe uma policy para UPDATE em direct_messages, vamos apenas garantir que exista
DROP POLICY IF EXISTS "Usuários podem atualizar mensagens do próprio DM" ON public.direct_messages;

CREATE POLICY "Usuários podem atualizar mensagens do próprio DM" ON public.direct_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.dm_channels c
            WHERE c.id = direct_messages.dm_channel_id
            AND (c.user_1_id = auth.uid() OR c.user_2_id = auth.uid())
        )
    );
