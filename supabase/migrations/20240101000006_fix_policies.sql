-- 00006_fix_policies.sql

-- Adiciona a política de DELETE (Faltante no banco, por isso não some)
CREATE POLICY "Usuarios podem apagar seus proprios posts" ON public.feed_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Adiciona a política de UPDATE (Faltante no banco, por isso não salva a edição)
CREATE POLICY "Usuarios podem atualizar seus proprios posts" ON public.feed_posts
    FOR UPDATE USING (auth.uid() = user_id);
