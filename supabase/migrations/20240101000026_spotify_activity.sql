-- Migração para integração com Spotify e status de música em tempo real
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS spotify_activity JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS show_spotify_activity BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.profiles.spotify_connected IS 'Indica se a conta do Spotify está conectada ao perfil Alura';
COMMENT ON COLUMN public.profiles.spotify_activity IS 'Dados da música em reprodução no Spotify (track_name, artist_name, album_name, album_art, progress_ms, duration_ms, track_url, is_playing)';
COMMENT ON COLUMN public.profiles.show_spotify_activity IS 'Permite que amigos e membros vejam a música tocando no perfil';
