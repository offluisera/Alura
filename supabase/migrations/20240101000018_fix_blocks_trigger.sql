-- 000018_fix_blocks_trigger.sql

CREATE OR REPLACE FUNCTION public.check_message_block()
RETURNS trigger AS $$
DECLARE
  is_blocked BOOLEAN;
  other_user_id UUID;
BEGIN
  -- Discover the other user in the DM channel
  SELECT CASE 
           WHEN user_1_id = NEW.user_id THEN user_2_id 
           ELSE user_1_id 
         END
  INTO other_user_id
  FROM public.dm_channels
  WHERE id = NEW.dm_channel_id;

  -- Check if a block exists between the sender and the other user
  SELECT EXISTS (
    SELECT 1 FROM public.blocks 
    WHERE (blocker_id = NEW.user_id AND blocked_id = other_user_id)
       OR (blocker_id = other_user_id AND blocked_id = NEW.user_id)
  ) INTO is_blocked;

  IF is_blocked THEN
    RAISE EXCEPTION 'Não é possível enviar mensagens. Um bloqueio está ativo entre os usuários.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
