-- ==============================================================================
-- 20241006000001_server_delete_policy.sql
-- Permite que o proprietário do servidor possa exclui-lo permanentemente
-- ==============================================================================

DROP POLICY IF EXISTS "Owners can delete servers" ON public.servers;
CREATE POLICY "Owners can delete servers"
ON public.servers
FOR DELETE
TO authenticated
USING (public.is_server_owner(id) OR owner_id = auth.uid());
