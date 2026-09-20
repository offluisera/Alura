-- 20240101000011_rls_profiles_insert.sql

-- Garante que o usuário tem permissão para inserir o próprio perfil caso o fluxo de criação não tenha sido automático.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );
