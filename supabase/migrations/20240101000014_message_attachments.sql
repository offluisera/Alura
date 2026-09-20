-- 000014_message_attachments.sql

-- 1. Adicionar coluna attachments à tabela de mensagens
ALTER TABLE public.direct_messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Criar o bucket de storage para os anexos do chat
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de RLS para o Storage
-- Permitir que qualquer usuário autenticado faça upload (inserção)
CREATE POLICY "Users can upload chat attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat_attachments' AND auth.uid() = owner
    );

-- Permitir que qualquer um leia os arquivos do bucket (já que é publico)
CREATE POLICY "Anyone can view chat attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'chat_attachments'
    );
