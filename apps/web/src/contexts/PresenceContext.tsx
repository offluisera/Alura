import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export type UserStatusType = 'online' | 'idle' | 'dnd' | 'offline'

interface PresenceContextType {
  onlineUserIds: Set<string>
  isUserOnline: (userId: string) => boolean
  getUserStatus: (profile: any) => UserStatusType
  getStatusColor: (status: UserStatusType) => string
  getStatusBadgeText: (status: UserStatusType) => string
}

const PresenceContext = createContext<PresenceContextType | null>(null)

export function usePresence() {
  const context = useContext(PresenceContext)
  if (!context) {
    return {
      onlineUserIds: new Set<string>(),
      isUserOnline: () => false,
      getUserStatus: () => 'offline' as UserStatusType,
      getStatusColor: () => 'bg-neutral-500',
      getStatusBadgeText: () => 'Offline',
    }
  }
  return context
}

export function PresenceProvider({ children, user, profile }: { children: React.ReactNode; user: any; profile: any }) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user?.id) return

    const presenceChannel = supabase.channel('global_online_users', {
      config: { presence: { key: user.id } },
    })

    const syncPresence = () => {
      const state = presenceChannel.presenceState()
      const newOnlineSet = new Set<string>()

      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.user_id && p.status !== 'offline') {
            newOnlineSet.add(p.user_id)
          }
        })
      })

      // Garante que o próprio usuário sempre faça parte (a menos que esteja invisível)
      if (profile?.status !== 'offline') {
        newOnlineSet.add(user.id)
      }
      setOnlineUserIds(newOnlineSet)
    }

    presenceChannel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          if (profile?.status !== 'offline') {
            await presenceChannel.track({
              user_id: user.id,
              status: profile?.status || 'online',
              online_at: new Date().toISOString(),
            })
          }
        }
      })

    return () => {
      presenceChannel.untrack().catch(() => {})
      supabase.removeChannel(presenceChannel)
    }
  }, [user?.id, profile?.status])

  const isUserOnline = useCallback((userId?: string): boolean => {
    if (!userId) return false
    if (userId === user?.id) return profile?.status !== 'offline'
    return onlineUserIds.has(userId)
  }, [user?.id, profile?.status, onlineUserIds])

  const getUserStatus = useCallback((targetProfileOrId: any, fallbackStatus?: UserStatusType): UserStatusType => {
    if (!targetProfileOrId) return 'offline'

    let targetId: string | undefined
    let rawStatus: string | undefined
    let activityVisible: boolean = true

    if (typeof targetProfileOrId === 'string') {
      targetId = targetProfileOrId
      rawStatus = fallbackStatus
    } else {
      targetId =
        targetProfileOrId.otherUserId ||
        targetProfileOrId.user_id ||
        targetProfileOrId.id ||
        targetProfileOrId.profile?.id
      rawStatus =
        targetProfileOrId.profileStatus ||
        targetProfileOrId.status ||
        targetProfileOrId.profile?.status ||
        fallbackStatus
      activityVisible =
        targetProfileOrId.activity_status_visible !== false &&
        targetProfileOrId.profile?.activity_status_visible !== false
    }

    if (!targetId) return 'offline'
    if (!activityVisible) return 'offline'
    if (rawStatus === 'offline') return 'offline'

    // Usuário atual
    if (targetId === user?.id) {
      return (rawStatus as UserStatusType) || 'online'
    }

    // Se não está conectado em tempo real, está offline
    const isOnlineNow = onlineUserIds.has(targetId)
    if (!isOnlineNow) {
      return 'offline'
    }

    return (rawStatus as UserStatusType) || 'online'
  }, [user?.id, onlineUserIds])

  const getStatusColor = useCallback((status: UserStatusType): string => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400'
      case 'idle':
        return 'bg-amber-400'
      case 'dnd':
        return 'bg-alura-danger'
      case 'offline':
      default:
        return 'bg-neutral-500'
    }
  }, [])

  const getStatusBadgeText = useCallback((status: UserStatusType): string => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'idle':
        return 'Ausente'
      case 'dnd':
        return 'Não perturbe'
      case 'offline':
      default:
        return 'Offline'
    }
  }, [])

  const value = useMemo(() => ({
    onlineUserIds,
    isUserOnline,
    getUserStatus,
    getStatusColor,
    getStatusBadgeText,
  }), [onlineUserIds, isUserOnline, getUserStatus, getStatusColor, getStatusBadgeText])

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  )
}
