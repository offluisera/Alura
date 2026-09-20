-- 00004_feed_interactions.sql

-- FEED LIKES
CREATE TABLE public.feed_likes (
    post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- FEED COMMENTS
CREATE TABLE public.feed_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- Políticas de Feed Likes
CREATE POLICY "Qualquer um pode ver curtidas" ON public.feed_likes
    FOR SELECT USING (TRUE);

CREATE POLICY "Usuarios podem curtir" ON public.feed_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem descurtir" ON public.feed_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de Feed Comments
CREATE POLICY "Qualquer um pode ler comentarios" ON public.feed_comments
    FOR SELECT USING (TRUE);

CREATE POLICY "Usuarios podem criar seus comentarios" ON public.feed_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios podem apagar seus comentarios" ON public.feed_comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios podem editar seus comentarios" ON public.feed_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- EXTRA: Política para Apagar os Próprios Posts
CREATE POLICY "Usuarios podem apagar seus proprios posts" ON public.feed_posts
    FOR DELETE USING (auth.uid() = user_id);
