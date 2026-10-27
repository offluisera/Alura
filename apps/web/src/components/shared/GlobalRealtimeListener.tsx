import { useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useNotification } from '../../contexts/NotificationContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { SpotifyService } from '../../lib/services/SpotifyService'
import { SoundService } from '../../lib/services/SoundService'

export function GlobalRealtimeListener({ user, profile }: { user: any, profile: any }) {
  const { notifyMessage, refreshUnreadDMs, showToast } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const locationRef = useRef(location)

  useEffect(() => {
    locationRef.current = location
  }, [location])

  // Polling em tempo real do Spotify (2.5s) com sincronização imediata ao trocar de música
  useEffect(() => {
    if (!user?.id) return

    let isChecking = false
    let lastTrackKey = ''

    const checkSpotifyNow = async () => {
      if (isChecking) return
      const token = await SpotifyService.getValidToken()
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

          // Do not notify for system call status messages
          if (newMessage.content?.startsWith('[call:')) return

          // Verify if we are part of the DM channel
          const { data: channel, error: channelError } = await supabase
            .from('dm_channels')
            .select('*')
            .eq('id', newMessage.dm_channel_id)
            .single()

          if (channelError || !channel) return

          const isParticipant = channel.user_1_id === user.id || channel.user_2_id === user.id
          if (!isParticipant) return

          // Verifica se o usuário atual está lendo ativamente a conversa com este remetente
          const currentPath = locationRef.current.pathname
          const isCurrentlyInConversation = 
            currentPath === `/messages/${newMessage.user_id}` ||
            currentPath.startsWith(`/messages/${newMessage.user_id}/`)

          if (isCurrentlyInConversation) {
            // Marca imediatamente como lida no Supabase para não marcar badge
            await supabase
              .from('direct_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id)

            await refreshUnreadDMs()
            return // Não dispara notificação toast nem som
          }

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

    // Listener Realtime para novos pedidos de amizade recebidos
    const friendshipSubscription = supabase
      .channel('public:friendships_global_listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friendships'
        },
        async (payload) => {
          const newFriendship = payload.new
          // Apenas notifica se o usuário atual for o destinatário e o status for pendente
          if (newFriendship.user_id_2 !== user.id || newFriendship.status !== 'pending') return

          // Respeita modo Não Perturbe (DND)
          if (profile?.status === 'dnd') return

          const senderId = newFriendship.user_id_1
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, display_name, avatar_url')
            .eq('id', senderId)
            .single()

          const senderName = sender?.display_name || sender?.full_name || sender?.username || "Novo usuário"
          const senderHandle = sender?.username ? `@${sender.username}` : ""
          const fullTitle = `Novo pedido de amizade!`
          const fullBody = `${senderName} ${senderHandle ? `(${senderHandle})` : ''} enviou uma solicitação de amizade.`

          // 1. Toca som de notificação
          try {
            SoundService.play('messageReceived')
          } catch (e) {}

          // 2. Notificação Push Desktop (Electron IPC ou Web Notifications API)
          const win = window as any
          if (typeof win !== 'undefined' && win.require) {
            try {
              const { ipcRenderer } = win.require('electron')
              ipcRenderer.send('show-custom-notification', {
                title: fullTitle,
                message: fullBody,
                avatar_url: sender?.avatar_url || '/icon.ico'
              })
            } catch (err) {
              console.warn('Falha ao emitir notificação Electron de amizade', err)
            }
          } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            const notif = new Notification(fullTitle, {
              body: fullBody,
              icon: sender?.avatar_url || '/icon.ico',
              silent: true
            })
            notif.onclick = () => {
              window.focus()
              navigate('/requests')
            }
          }

          // 3. Exibe Toast elegante no app
          showToast({
            type: 'info',
            title: fullTitle,
            message: fullBody
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageSubscription)
      supabase.removeChannel(friendshipSubscription)
    }
  }, [user, profile, notifyMessage, navigate, refreshUnreadDMs, showToast])

  return null
}
