import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export interface PinnedServer {
  id: string
  server_id: string
  name: string
  icon_url: string | null
  member_count: number
  online_count: number
}

interface PinnedServersContextType {
  pinnedServers: PinnedServer[]
  loading: boolean
  isPinned: (serverId: string) => boolean
  togglePin: (server: { id: string; name: string; icon_url: string | null }) => Promise<boolean>
  refresh: () => Promise<void>
}

const PinnedServersContext = createContext<PinnedServersContextType | undefined>(undefined)

const STORAGE_PREFIX = 'alura_pinned_servers_'

export function PinnedServersProvider({
  userId,
  children,
}: {
  userId?: string
  children: React.ReactNode
}) {
  const [pinnedServers, setPinnedServers] = useState<PinnedServer[]>(() => {
    if (!userId) return []
    try {
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState<boolean>(true)
  const isFetchingRef = useRef(false)

  // Salva no LocalStorage sempre que o estado muda
  const saveToStorage = useCallback(
    (servers: PinnedServer[]) => {
      if (!userId) return
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(servers))
        window.dispatchEvent(
          new CustomEvent('alura:pinned_servers_changed', {
            detail: { userId, servers },
          })
        )
      } catch (e) {
        console.warn('[PinnedServersContext] Erro ao gravar cache local:', e)
      }
    },
    [userId]
  )

  const fetchPinned = useCallback(async () => {
    if (!userId || isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const { data, error } = await supabase
        .from('user_pinned_servers')
        .select(`
          id,
          server_id,
          servers (
            id,
            name,
            icon_url,
            member_count,
            online_count
          )
        `)
        .eq('user_id', userId)
        .order('position', { ascending: true })

      if (!error && data) {
        const parsed: PinnedServer[] = data
          .filter((item: any) => !!item.servers)
          .map((item: any) => ({
            id: item.id,
            server_id: item.server_id,
            name: item.servers.name,
            icon_url: item.servers.icon_url,
            member_count: item.servers.member_count || 1,
            online_count: item.servers.online_count || 1,
          }))

        setPinnedServers(parsed)
        saveToStorage(parsed)
      } else if (error) {
        console.warn('[PinnedServersContext] Erro Supabase ao buscar fixados:', error.message)
      }
    } catch (err) {
      console.warn('[PinnedServersContext] Falha de conexão ao buscar fixados:', err)
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }, [userId, saveToStorage])

  // Carrega ao montar ou mudar userId
  useEffect(() => {
    if (userId) {
      // Carrega instantaneamente do storage
      try {
        const cached = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
        if (cached) {
          setPinnedServers(JSON.parse(cached))
          setLoading(false)
        }
      } catch {
        // ignora erro de parse
      }
      fetchPinned()
    } else {
      setPinnedServers([])
      setLoading(false)
    }
  }, [userId, fetchPinned])

  // Escuta eventos locais entre abas ou componentes
  useEffect(() => {
    const handleStorage = (e: CustomEvent) => {
      if (e.detail?.userId === userId && Array.isArray(e.detail?.servers)) {
        setPinnedServers(e.detail.servers)
      }
    }

    const handleServerDeleted = (e: any) => {
      const deletedId = e.detail?.serverId
      if (!deletedId) return
      setPinnedServers((prev) => {
        const updated = prev.filter((p) => p.server_id !== deletedId && p.id !== deletedId)
        saveToStorage(updated)
        return updated
      })
    }

    window.addEventListener('alura:pinned_servers_changed' as any, handleStorage)
    window.addEventListener('alura:server_deleted' as any, handleServerDeleted)

    return () => {
      window.removeEventListener('alura:pinned_servers_changed' as any, handleStorage)
      window.removeEventListener('alura:server_deleted' as any, handleServerDeleted)
    }
  }, [userId, saveToStorage])

  // Sincronização Realtime de exclusões de servidores e alterações de fixados
  useEffect(() => {
    if (!userId) return

    const channelName = `pinned_realtime_${userId.slice(0, 8)}_${Math.random().toString(36).slice(2, 6)}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'servers' },
        (payload: any) => {
          const deletedId = payload.old?.id
          if (deletedId) {
            setPinnedServers((prev) => {
              const updated = prev.filter((p) => p.server_id !== deletedId && p.id !== deletedId)
              saveToStorage(updated)
              return updated
            })
            window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId: deletedId } }))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_pinned_servers', filter: `user_id=eq.${userId}` },
        () => {
          fetchPinned()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchPinned, saveToStorage])

  const isPinned = useCallback(
    (serverId: string): boolean => {
      return pinnedServers.some((p) => p.server_id === serverId)
    },
    [pinnedServers]
  )

  const togglePin = useCallback(
    async (server: { id: string; name: string; icon_url: string | null }): Promise<boolean> => {
      if (!userId) return false

      const currentlyPinned = pinnedServers.some((p) => p.server_id === server.id)

      if (currentlyPinned) {
        // Desafixar
        const updated = pinnedServers.filter((p) => p.server_id !== server.id)
        setPinnedServers(updated)
        saveToStorage(updated)

        try {
          await supabase
            .from('user_pinned_servers')
            .delete()
            .eq('user_id', userId)
            .eq('server_id', server.id)
        } catch (err) {
          console.warn('[PinnedServersContext] Erro ao deletar no Supabase:', err)
        }
        return false
      } else {
        // Fixar
        const newItem: PinnedServer = {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          server_id: server.id,
          name: server.name,
          icon_url: server.icon_url,
          member_count: 1,
          online_count: 1,
        }
        const updated = [...pinnedServers, newItem]
        setPinnedServers(updated)
        saveToStorage(updated)

        try {
          const { error } = await supabase.from('user_pinned_servers').insert({
            user_id: userId,
            server_id: server.id,
            position: pinnedServers.length,
          })

          if (error && error.code !== '23505') {
            console.warn('[PinnedServersContext] Aviso ao inserir fixação no Supabase:', error)
          }
        } catch (err) {
          console.warn('[PinnedServersContext] Exceção ao gravar fixação:', err)
        }
        return true
      }
    },
    [userId, pinnedServers, saveToStorage]
  )

  return (
    <PinnedServersContext.Provider
      value={{
        pinnedServers,
        loading,
        isPinned,
        togglePin,
        refresh: fetchPinned,
      }}
    >
      {children}
    </PinnedServersContext.Provider>
  )
}

export function usePinnedServersContext() {
  const ctx = useContext(PinnedServersContext)
  if (!ctx) {
    throw new Error('usePinnedServersContext deve ser utilizado dentro de um PinnedServersProvider')
  }
  return ctx
}
