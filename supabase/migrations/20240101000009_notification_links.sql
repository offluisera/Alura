-- 00009_notification_links.sql

-- Adicionar coluna 'link' para permitir redirecionamento dinâmico
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- 1. Trigger de Curtida
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
DECLARE
    post_owner UUID;
    liker_name TEXT;
BEGIN
    SELECT user_id INTO post_owner FROM public.feed_posts WHERE id = NEW.post_id;
    SELECT display_name INTO liker_name FROM public.profiles WHERE id = NEW.user_id;

    IF post_owner != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (post_owner, 'like', liker_name || ' curtiu sua publicação.', '/app/post/' || NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger de Comentário
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_owner UUID;
    commenter_name TEXT;
BEGIN
    SELECT user_id INTO post_owner FROM public.feed_posts WHERE id = NEW.post_id;
    SELECT display_name INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;

    IF post_owner != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (post_owner, 'comment', commenter_name || ' comentou na sua publicação.', '/app/post/' || NEW.post_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger de Pedido de Amizade
CREATE OR REPLACE FUNCTION public.handle_new_friend_request()
RETURNS TRIGGER AS $$
DECLARE
    requester_name TEXT;
BEGIN
    IF NEW.status = 'pending' THEN
        SELECT display_name INTO requester_name FROM public.profiles WHERE id = NEW.user_id_1;
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (NEW.user_id_2, 'friend_request', requester_name || ' enviou uma solicitação de amizade.', '/app/amigos');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger de Post de Amigo
CREATE OR REPLACE FUNCTION public.handle_new_friend_post()
RETURNS TRIGGER AS $$
DECLARE
    poster_name TEXT;
    friend RECORD;
BEGIN
    SELECT display_name INTO poster_name FROM public.profiles WHERE id = NEW.user_id;

    FOR friend IN 
        SELECT user_id_1 as f_id FROM public.friendships WHERE user_id_2 = NEW.user_id AND status = 'accepted'
        UNION
        SELECT user_id_2 as f_id FROM public.friendships WHERE user_id_1 = NEW.user_id AND status = 'accepted'
    LOOP
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (friend.f_id, 'friend_post', poster_name || ' fez uma nova publicação.', '/app/post/' || NEW.id);
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
