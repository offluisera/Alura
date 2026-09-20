import { supabase } from '../supabase'

/**
 * Serviço centralizado de bloqueios e ocultamento de conteúdo (Feed).
 * Utilizado por todo o sistema para manter consistência de regras e cache se necessário.
 */

export const BlockService = {
  
  /**
   * Bloqueia um usuário (impede mensagens e oculta do feed mutuamente)
   */
  async blockUser(blockerId: string, blockedId: string) {
    if (!blockerId || !blockedId) throw new Error("IDs inválidos")
    
    const { data, error } = await supabase.from('blocks').insert({ 
      blocker_id: blockerId, 
      blocked_id: blockedId 
    })
    
    if (error) {
      console.error("BlockService.blockUser Error:", error)
      throw error
    }
    return data
  },

  /**
   * Desbloqueia um usuário
   */
  async unblockUser(blockerId: string, blockedId: string) {
    if (!blockerId || !blockedId) throw new Error("IDs inválidos")
      
    const { data, error } = await supabase.from('blocks').delete().match({ 
      blocker_id: blockerId, 
      blocked_id: blockedId 
    })
    
    if (error) {
      console.error("BlockService.unblockUser Error:", error)
      throw error
    }
    return data
  },

  /**
   * Oculta permanentemente uma publicação específica do feed do usuário logado
   */
  async hidePost(userId: string, postId: string) {
    if (!userId || !postId) throw new Error("IDs inválidos")
      
    const { data, error } = await supabase.from('hidden_posts').insert({
      user_id: userId,
      post_id: postId
    })

    if (error) {
      console.error("BlockService.hidePost Error:", error)
      throw error
    }
    return data
  },

  /**
   * Remove uma publicação da lista de ocultas
   */
  async unhidePost(userId: string, postId: string) {
    if (!userId || !postId) throw new Error("IDs inválidos")
      
    const { data, error } = await supabase.from('hidden_posts').delete().match({
      user_id: userId,
      post_id: postId
    })

    if (error) {
      console.error("BlockService.unhidePost Error:", error)
      throw error
    }
    return data
  },

  /**
   * Lista todos os usuários bloqueados por um usuário com seus dados de perfil
   */
  async getBlockedUsers(userId: string) {
    if (!userId) return []

    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id, created_at')
      .eq('blocker_id', userId)

    if (blocksError) {
      console.error("BlockService.getBlockedUsers Error:", blocksError)
      throw blocksError
    }

    if (!blocks || blocks.length === 0) return []

    const blockedIds = blocks.map(b => b.blocked_id)
    const { data: profiles, error: profsError } = await supabase
      .from('profiles')
      .select('id, username, display_name, full_name, avatar_url')
      .in('id', blockedIds)

    if (profsError) {
      console.error("BlockService.getBlockedUsers profiles Error:", profsError)
    }

    return blocks.map(b => {
      const p = profiles?.find(prof => prof.id === b.blocked_id)
      return {
        id: b.blocked_id,
        name: p?.display_name || p?.full_name || p?.username || 'Usuário',
        username: p?.username || 'usuario',
        avatar_url: p?.avatar_url || null,
        blocked_at: b.created_at
      }
    })
  }
}
