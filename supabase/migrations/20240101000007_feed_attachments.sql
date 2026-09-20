-- 00007_feed_attachments.sql

-- 1. Adiciona suporte a múltiplas mídias no post (Array de JSON)
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Cria o Bucket de Armazenamento de Mídias (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('feed_media', 'feed_media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Habilita Políticas (RLS) para o bucket de mídias (Tabela objects do Storage)
-- Permitir que qualquer pessoa veja/baixe os arquivos públicos do feed
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'feed_media');

-- Permitir que usuários logados enviem (upload) arquivos para o feed
CREATE POLICY "Authenticated Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'feed_media' AND auth.role() = 'authenticated');

-- Permitir que usuários logados deletem APENAS as próprias mídias
CREATE POLICY "Authenticated Deletes" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'feed_media' AND auth.uid() = owner);
