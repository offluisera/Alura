-- 000012_friendships_policies.sql

-- Adiciona a política de UPDATE para aceitar solicitações de amizade
CREATE POLICY "Users can update friendships they are part of" ON public.friendships
    FOR UPDATE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Adiciona a política de DELETE para remover amizades ou cancelar solicitações
CREATE POLICY "Users can delete friendships they are part of" ON public.friendships
    FOR DELETE USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
