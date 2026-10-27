import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabase'

export type ServerTab = 'discover' | 'owned' | 'joined'

export interface ServerItem {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  banner_url: string | null
  category: string
  tags: string[]
  is_verified: boolean
  is_public: boolean
  is_nsfw: boolean
  member_count: number
  online_count: number
  featured: boolean
  owner_id: string
  created_at: string
  is_member?: boolean
  is_pinned?: boolean
}

export function useServers(currentUserId?: string) {
  const [activeTab, setActiveTab] = useState<ServerTab>('discover')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [servers, setServers] = useState<ServerItem[]>([])
  const [selectedServer, setSelectedServer] = useState<ServerItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [myMemberServerIds, setMyMemberServerIds] = useState<Set<string>>(new Set())

  // Carrega IDs dos servidores onde o usuário atual é membro
  const fetchMemberships = useCallback(async () => {
    if (!currentUserId) {
      setMyMemberServerIds(new Set())
      return
    }
    try {
      const { data } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', currentUserId)

      if (data) {
        setMyMemberServerIds(new Set(data.map((m) => m.server_id)))
      }
    } catch (err) {
      console.warn('[useServers] Falha ao carregar filiações:', err)
    }
  }, [currentUserId])

  // Busca e filtra a lista de servidores
  const fetchServers = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('servers').select('*')

      // Filtro por aba
      if (activeTab === 'discover') {
        query = query.eq('is_public', true).order('featured', { ascending: false }).order('member_count', { ascending: false })
      } else if (activeTab === 'owned') {
        if (!currentUserId) {
          setServers([])
          setLoading(false)
          return
        }
        query = query.eq('owner_id', currentUserId).order('created_at', { ascending: false })
      } else if (activeTab === 'joined') {
        if (!currentUserId || myMemberServerIds.size === 0) {
          setServers([])
          setLoading(false)
          return
        }
        query = query.in('id', Array.from(myMemberServerIds)).order('member_count', { ascending: false })
      }

      // Filtro por Categoria
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      // Filtro por busca textual (nome, descrição ou tags)
      if (searchQuery.trim()) {
        const term = `%${searchQuery.trim()}%`
        query = query.or(`name.ilike.${term},description.ilike.${term}`)
      }

      const { data, error } = await query

      if (!error && data) {
        const enriched: ServerItem[] = data.map((srv: any) => ({
          ...srv,
          tags: Array.isArray(srv.tags) ? srv.tags : [],
          is_member: myMemberServerIds.has(srv.id) || srv.owner_id === currentUserId,
        }))
        setServers(enriched)

        // Mantém ou seleciona o primeiro servidor como ativo para o Master-Detail
        if (enriched.length > 0) {
          setSelectedServer((prev) => {
            if (!prev) return enriched[0]
            const found = enriched.find((s) => s.id === prev.id)
            return found || enriched[0]
          })
        } else {
          setSelectedServer(null)
        }
      }
    } catch (err) {
      console.warn('[useServers] Erro ao buscar servidores:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedCategory, searchQuery, currentUserId, myMemberServerIds])

  useEffect(() => {
    fetchMemberships()
  }, [fetchMemberships])

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  // Entrar em um servidor
  const joinServer = useCallback(async (serverId: string) => {
    if (!currentUserId) return false
    try {
      const { error } = await supabase.from('server_members').insert({
        server_id: serverId,
        user_id: currentUserId,
        nickname: null,
      })

      if (!error) {
        setMyMemberServerIds((prev) => new Set([...prev, serverId]))
        setServers((prev) =>
          prev.map((s) =>
            s.id === serverId ? { ...s, is_member: true, member_count: (s.member_count || 0) + 1 } : s
          )
        )
        if (selectedServer?.id === serverId) {
          setSelectedServer((s) => (s ? { ...s, is_member: true, member_count: (s.member_count || 0) + 1 } : null))
        }
        return true
      }
      return false
    } catch (err) {
      console.error('[useServers] Falha ao entrar no servidor:', err)
      return false
    }
  }, [currentUserId, selectedServer])

  // Sair de um servidor
  const leaveServer = useCallback(async (serverId: string) => {
    if (!currentUserId) return false
    try {
      const { error } = await supabase
        .from('server_members')
        .delete()
        .match({ server_id: serverId, user_id: currentUserId })

      if (!error) {
        setMyMemberServerIds((prev) => {
          const next = new Set(prev)
          next.delete(serverId)
          return next
        })
        setServers((prev) =>
          prev.map((s) =>
            s.id === serverId ? { ...s, is_member: false, member_count: Math.max(1, (s.member_count || 1) - 1) } : s
          )
        )
        if (selectedServer?.id === serverId) {
          setSelectedServer((s) => (s ? { ...s, is_member: false, member_count: Math.max(1, (s.member_count || 1) - 1) } : null))
        }
        return true
      }
      return false
    } catch (err) {
      console.error('[useServers] Falha ao sair do servidor:', err)
      return false
    }
  }, [currentUserId, selectedServer])

  // Escuta evento local de servidor deletado
  useEffect(() => {
    const handleServerDeleted = (e: any) => {
      const deletedId = e.detail?.serverId
      if (!deletedId) return
      setServers((prev) => prev.filter((s) => s.id !== deletedId))
      setMyMemberServerIds((prev) => {
        const next = new Set(prev)
        next.delete(deletedId)
        return next
      })
      setSelectedServer((prev) => (prev?.id === deletedId ? null : prev))
    }

    window.addEventListener('alura:server_deleted' as any, handleServerDeleted)
    return () => {
      window.removeEventListener('alura:server_deleted' as any, handleServerDeleted)
    }
  }, [])

  const fetchServersRef = useRef(fetchServers)
  fetchServersRef.current = fetchServers

  // Realtime subscription com isolamento de canal
  useEffect(() => {
    let channel: any = null
    try {
      const channelName = `servers_realtime_${Math.random().toString(36).slice(2, 8)}`
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'servers' }, (payload: any) => {
          if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id
            if (deletedId) {
              setServers((prev) => prev.filter((s) => s.id !== deletedId))
              setMyMemberServerIds((prev) => {
                const next = new Set(prev)
                next.delete(deletedId)
                return next
              })
              setSelectedServer((prev) => (prev?.id === deletedId ? null : prev))
              window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId: deletedId } }))
            }
          }
          fetchServersRef.current()
        })
        .subscribe()
    } catch (err) {
      console.warn('[useServers] Erro ao registrar canal realtime:', err)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    servers,
    selectedServer,
    setSelectedServer,
    loading,
    refresh: fetchServers,
    refetch: fetchServers,
    joinServer,
    leaveServer,
  }
}
