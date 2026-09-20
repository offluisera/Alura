-- 000017_user_blocks.sql

-- 1. Create blocks table
CREATE TABLE public.blocks (
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- 2. Enable RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view blocks they are involved in" ON public.blocks
    FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users can create their own blocks" ON public.blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" ON public.blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- 4. Trigger Function: Delete friendship on block
CREATE OR REPLACE FUNCTION public.handle_block_friendship()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.friendships
  WHERE (user_id_1 = NEW.blocker_id AND user_id_2 = NEW.blocked_id)
     OR (user_id_1 = NEW.blocked_id AND user_id_2 = NEW.blocker_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_block_delete_friendship
  AFTER INSERT ON public.blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_block_friendship();

-- 5. Trigger Function: Prevent direct messages between blocked users
CREATE OR REPLACE FUNCTION public.check_message_block()
RETURNS trigger AS $$
DECLARE
  is_blocked BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.blocks 
    WHERE (blocker_id = NEW.user_id AND blocked_id = NEW.receiver_id)
       OR (blocker_id = NEW.receiver_id AND blocked_id = NEW.user_id)
  ) INTO is_blocked;

  IF is_blocked THEN
    RAISE EXCEPTION 'Não é possível enviar mensagens. Um bloqueio está ativo entre os usuários.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_check_block
  BEFORE INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_message_block();
