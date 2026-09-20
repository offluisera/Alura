-- 00003_rls_functions.sql

-- FUNÇÕES AUXILIARES DE SEGURANÇA
-- Verifica se o usuário atual é membro de um servidor
CREATE OR REPLACE FUNCTION public.is_server_member(server_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.server_members 
    WHERE server_id = server_uuid 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se usuário é owner
CREATE OR REPLACE FUNCTION public.is_server_owner(server_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.servers 
    WHERE id = server_uuid 
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ATIVAÇÃO DE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS

-- Profiles
CREATE POLICY "Profiles are visible to everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Servers
CREATE POLICY "Servers are visible to everyone" ON public.servers FOR SELECT USING (true);
CREATE POLICY "Owners can update servers" ON public.servers FOR UPDATE USING (public.is_server_owner(id));
CREATE POLICY "Authenticated users can create servers" ON public.servers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Server Members
CREATE POLICY "Server members are visible to everyone" ON public.server_members FOR SELECT USING (true);
CREATE POLICY "Users can join servers" ON public.server_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can remove members" ON public.server_members FOR DELETE USING (public.is_server_owner(server_id));
CREATE POLICY "Users can leave servers" ON public.server_members FOR DELETE USING (auth.uid() = user_id);

-- Rooms
CREATE POLICY "Rooms visible to server members" ON public.rooms FOR SELECT USING (public.is_server_member(server_id));
-- (Políticas de CRUD para rooms e roles dependem de permissões detalhadas que podem ser checadas em DB Functions similares ao `is_server_owner`)

-- Messages
CREATE POLICY "Messages visible to room members" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = messages.room_id AND public.is_server_member(r.server_id)
  )
);
CREATE POLICY "Users can insert messages in their rooms" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = room_id AND public.is_server_member(r.server_id)
  )
);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);


-- TRIGGERS
-- Trigger para criar perfil automaticamente no login/signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para adicionar owner como membro na criação do servidor
CREATE OR REPLACE FUNCTION public.handle_new_server()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.server_members (server_id, user_id)
  VALUES (new.id, new.owner_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_server_created
  AFTER INSERT ON public.servers
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_server();
