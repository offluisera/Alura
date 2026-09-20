-- 00005_feed_edit.sql

-- Adiciona a política de UPDATE na tabela feed_posts 
-- Para permitir que o dono da postagem a edite
CREATE POLICY "Usuarios podem editar seus proprios posts" ON public.feed_posts
    FOR UPDATE USING (auth.uid() = user_id);
