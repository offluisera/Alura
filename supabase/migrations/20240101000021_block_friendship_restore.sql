-- 000021_block_friendship_restore.sql

-- 1. Adiciona flag na tabela blocks para lembrar se eram amigos antes do bloqueio
ALTER TABLE public.blocks ADD COLUMN IF NOT EXISTS was_friend BOOLEAN DEFAULT false;

-- 2. Atualiza a trigger de bloqueio para rodar ANTES do insert e gravar se eram amigos
DROP TRIGGER IF EXISTS on_block_delete_friendship ON public.blocks;

CREATE OR REPLACE FUNCTION public.handle_block_friendship()
RETURNS trigger AS $$
DECLARE
    is_friend BOOLEAN;
BEGIN
    -- Verifica se existe uma amizade aceita entre os dois
    SELECT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted' AND (
            (user_id_1 = NEW.blocker_id AND user_id_2 = NEW.blocked_id) OR
            (user_id_1 = NEW.blocked_id AND user_id_2 = NEW.blocker_id)
        )
    ) INTO is_friend;

    -- Salva na flag da tabela de blocks
    NEW.was_friend := is_friend;

    -- Deleta a amizade existente para evitar contato
    DELETE FROM public.friendships
    WHERE (user_id_1 = NEW.blocker_id AND user_id_2 = NEW.blocked_id)
       OR (user_id_1 = NEW.blocked_id AND user_id_2 = NEW.blocker_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_block_delete_friendship
  BEFORE INSERT ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_block_friendship();

-- 3. Cria a trigger de desbloqueio para restaurar a amizade se a flag for verdadeira
CREATE OR REPLACE FUNCTION public.handle_unblock_friendship()
RETURNS trigger AS $$
BEGIN
    IF OLD.was_friend THEN
        -- Tenta reinserir a amizade como 'accepted'
        -- Para evitar problemas de ordem nos IDs (user_id_1, user_id_2), inserimos a ordem original do block
        -- Se falhar por constraint unique/pk, ignoramos.
        BEGIN
            INSERT INTO public.friendships (user_id_1, user_id_2, status)
            VALUES (OLD.blocker_id, OLD.blocked_id, 'accepted')
            ON CONFLICT (user_id_1, user_id_2) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar conflitos caso já exista
        END;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_unblock_restore_friendship ON public.blocks;
CREATE TRIGGER on_unblock_restore_friendship
  AFTER DELETE ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_unblock_friendship();
