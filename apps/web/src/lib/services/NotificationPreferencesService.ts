import { supabase } from '../supabase'
import { SoundService } from './SoundService'

export interface NotificationPreferences {
  desktopNotifications: boolean
  hideMessageContent: boolean
  dndMute: boolean
  inactivityMinutes: number // 0 = imediato, 1, 2, 5
  masterVolume: number // 0 - 100
  allSoundsEnabled: boolean
  sounds: {
    messageReceived: boolean
    mention: boolean
    messageSent: boolean
    incomingCall: boolean
    voiceJoin: boolean
    voiceLeave: boolean
    systemAlerts: boolean
  }
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  desktopNotifications: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
  hideMessageContent: false,
  dndMute: true,
  inactivityMinutes: 0,
  masterVolume: 80,
  allSoundsEnabled: true,
  sounds: {
    messageReceived: true,
    mention: true,
    messageSent: true,
    incomingCall: true,
    voiceJoin: true,
    voiceLeave: true,
    systemAlerts: true
  }
}

export const NotificationPreferencesService = {
  /**
   * Obtém as preferências salvas para o usuário atual
   */
  async getPreferences(userId?: string): Promise<NotificationPreferences> {
    if (!userId) return { ...DEFAULT_NOTIFICATION_PREFS }

    // 1. Tentar ler do Supabase auth user_metadata
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.notification_preferences) {
        const merged: NotificationPreferences = {
          ...DEFAULT_NOTIFICATION_PREFS,
          ...user.user_metadata.notification_preferences,
          sounds: {
            ...DEFAULT_NOTIFICATION_PREFS.sounds,
            ...(user.user_metadata.notification_preferences.sounds || {})
          }
        }
        SoundService.setMasterVolume(merged.masterVolume)
        return merged
      }
    } catch (e) {
      console.warn("NotificationPreferencesService: erro ao obter do Supabase:", e)
    }

    // 2. Fallback para localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`alura_notif_prefs_${userId}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          const merged: NotificationPreferences = {
            ...DEFAULT_NOTIFICATION_PREFS,
            ...parsed,
            sounds: {
              ...DEFAULT_NOTIFICATION_PREFS.sounds,
              ...(parsed.sounds || {})
            }
          }
          SoundService.setMasterVolume(merged.masterVolume)
          return merged
        }
      } catch (e) {
        // Ignorar
      }
    }

    return { ...DEFAULT_NOTIFICATION_PREFS }
  },

  /**
   * Salva as preferências de notificação
   */
  async savePreferences(userId: string, prefs: NotificationPreferences): Promise<void> {
    if (!userId) return

    // Sincronizar o volume no motor de áudio
    SoundService.setMasterVolume(prefs.masterVolume)

    // 1. Salvar no localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`alura_notif_prefs_${userId}`, JSON.stringify(prefs))
      } catch (e) {
        console.warn("Erro ao salvar preferências localmente:", e)
      }
    }

    // 2. Persistir no Auth metadata
    try {
      await supabase.auth.updateUser({
        data: {
          notification_preferences: prefs
        }
      })
    } catch (e) {
      console.warn("Erro ao salvar no Supabase Auth:", e)
    }
  }
}
