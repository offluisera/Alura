import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { SpotifyService } from '../../lib/services/SpotifyService'

export function GlobalRealtimeListener({ user, profile }: { user: any, profile: any }) {
  const { notifyMessage, refreshUnreadDMs } = useNotification()
  const navigate = useNavigate()

  // Polling em tempo real do Spotify (2.5s) com sincronização imediata ao trocar de música
  useEffect(() => {
    if (!user?.id) return

    let isChecking = false
    let lastTrackKey = ''

    const checkSpotifyNow = async () => {
      if (isChecking) return
      const token = SpotifyService.getStoredToken()
      if (!token) return

      isChecking = true
      try {
        const track = await SpotifyService.fetchCurrentlyPlaying(token)
        const currentTrackKey = track && track.isPlaying 
          ? `${track.trackName}::${track.artistName}::${track.isPlaying}`
          : 'stopped'

        // Sincroniza imediatamente com o Supabase quando a música troca ou pausa/despausa
        if (currentTrackKey !== lastTrackKey) {
          lastTrackKey = currentTrackKey
          const showOnProfile = profile?.show_spotify_activity !== false
          await SpotifyService.saveActivity(user.id, track && track.isPlaying ? track : null, showOnProfile)
        }
      } catch (err) {
        // Silenciar erros de rede passageiros
      } finally {
        isChecking = false
      }
    }

    // Checagem imediata ao montar
    checkSpotifyNow()

    // Polling rápido a cada 2.5s para detectar troca de música sem delay
    const interval = setInterval(checkSpotifyNow, 2500)

    // Checagem instantânea ao focar na janela do app ou trocar de aba
    const handleFocus = () => checkSpotifyNow()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkSpotifyNow()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user?.id, profile?.show_spotify_activity])

  useEffect(() => {
    if (!user || !profile) return

    const messageSubscription = supabase
      .channel('public:direct_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        async (payload) => {
          const newMessage = payload.new

          // Do not notify if the current user sent the message
          if (newMessage.user_id === user.id) return

          // Verify if we are part of the DM channel
          const { data: channel, error: channelError } = await supabase
            .from('dm_channels')
            .select('*')
            .eq('id', newMessage.dm_channel_id)
            .single()

          if (channelError || !channel) return

          const isParticipant = channel.user_1_id === user.id || channel.user_2_id === user.id
          if (!isParticipant) return

          // Refresh unread counts
          await refreshUnreadDMs()

          // Only notify if current user profile is not 'dnd'
          if (profile.status === 'dnd') return

          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', newMessage.user_id)
            .single()

          if (sender) {
            const timeStr = new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            
            notifyMessage({
              username: sender.username,
              avatar_url: sender.avatar_url,
              message: newMessage.content,
              time: timeStr,
              onClick: () => {
                navigate(`/messages/${newMessage.user_id}`)
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageSubscription)
    }
  }, [user, profile, notifyMessage, navigate])

  return null
}
