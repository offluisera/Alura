-- 000016_avatars_bucket.sql

-- 1. Criar o bucket de storage para os avatares (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true, 
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de RLS para o Storage
-- Permitir que o próprio usuário faça upload (inserção) e update no seu avatar.
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND auth.uid() = owner
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND auth.uid() = owner
    );

-- Permitir que qualquer um veja os avatares
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'avatars'
    );
