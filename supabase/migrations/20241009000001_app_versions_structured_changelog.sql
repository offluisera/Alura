-- ==============================================================================
-- 20241009000001_app_versions_structured_changelog.sql
-- Adiciona suporte a Changelog Estruturado no Auto-Updater e Site
-- ==============================================================================

ALTER TABLE public.app_versions
    ADD COLUMN IF NOT EXISTS tagline TEXT,
    ADD COLUMN IF NOT EXISTS changes JSONB DEFAULT '[]'::jsonb;

-- Recarrega cache PostgREST
NOTIFY pgrst, 'reload schema';
