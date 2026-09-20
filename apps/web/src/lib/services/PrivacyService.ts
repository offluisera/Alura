import { supabase } from '../supabase'
import { BlockService } from './BlockService'

export interface PrivacySettings {
  friendRequestPolicy: 'everyone' | 'mutual' | 'nobody'
  directMessagesFromNonFriends: boolean
  activityStatusVisible: boolean
  discoverByEmail: boolean
  discoverByPhone: boolean
}

const DEFAULT_SETTINGS: PrivacySettings = {
  friendRequestPolicy: 'everyone',
  directMessagesFromNonFriends: true,
  activityStatusVisible: true,
  discoverByEmail: true,
  discoverByPhone: false,
}

export const PrivacyService = {
  /**
   * Obtém as configurações de privacidade do usuário.
   * Prioridade: Colunas de profiles -> user_metadata -> localStorage -> padrões.
   */
  async getSettings(userId: string, currentProfile?: any): Promise<PrivacySettings> {
    if (!userId) return { ...DEFAULT_SETTINGS }

    // 1. Tentar ler do perfil se já tiver as colunas
    if (currentProfile) {
      const fromProfile = {
        friendRequestPolicy: currentProfile.friend_request_policy || undefined,
        directMessagesFromNonFriends: currentProfile.direct_messages_from_mutual !== undefined ? currentProfile.direct_messages_from_mutual : undefined,
        activityStatusVisible: currentProfile.activity_status_visible !== undefined ? currentProfile.activity_status_visible : undefined,
        discoverByEmail: currentProfile.discover_by_email !== undefined ? currentProfile.discover_by_email : undefined,
        discoverByPhone: currentProfile.discover_by_phone !== undefined ? currentProfile.discover_by_phone : undefined,
      }

      if (fromProfile.friendRequestPolicy !== undefined || fromProfile.discoverByEmail !== undefined) {
        return {
          friendRequestPolicy: fromProfile.friendRequestPolicy ?? DEFAULT_SETTINGS.friendRequestPolicy,
          directMessagesFromNonFriends: fromProfile.directMessagesFromNonFriends ?? DEFAULT_SETTINGS.directMessagesFromNonFriends,
          activityStatusVisible: fromProfile.activityStatusVisible ?? DEFAULT_SETTINGS.activityStatusVisible,
          discoverByEmail: fromProfile.discoverByEmail ?? DEFAULT_SETTINGS.discoverByEmail,
          discoverByPhone: fromProfile.discoverByPhone ?? DEFAULT_SETTINGS.discoverByPhone,
        }
      }
    }

    // 2. Tentar ler do Supabase auth user_metadata
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.privacy_settings) {
        return {
          ...DEFAULT_SETTINGS,
          ...user.user_metadata.privacy_settings,
        }
      }
    } catch (e) {
      console.warn("PrivacyService: erro ao obter user_metadata:", e)
    }

    // 3. Fallback para cache local (localStorage)
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`alura_privacy_${userId}`)
        if (cached) {
          return {
            ...DEFAULT_SETTINGS,
            ...JSON.parse(cached),
          }
        }
      } catch (e) {
        // Ignorar
      }
    }

    return { ...DEFAULT_SETTINGS }
  },

  /**
   * Salva as configurações de privacidade.
   * Persiste no Auth metadata, tenta salvar na tabela profiles e atualiza cache local.
   */
  async saveSettings(userId: string, settings: PrivacySettings): Promise<void> {
    if (!userId) return

    // 1. Salvar no localStorage imediatamente
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`alura_privacy_${userId}`, JSON.stringify(settings))
      } catch (e) {
        console.warn("Falha ao salvar no localStorage:", e)
      }
    }

    // 2. Salvar no Auth user_metadata do Supabase (persistência do usuário)
    try {
      await supabase.auth.updateUser({
        data: {
          privacy_settings: settings,
        }
      })
    } catch (e) {
      console.warn("Falha ao atualizar user_metadata no Supabase:", e)
    }

    // 3. Tentar salvar nas colunas da tabela profiles (caso a migration esteja rodada)
    try {
      await supabase.from('profiles').update({
        friend_request_policy: settings.friendRequestPolicy,
        direct_messages_from_mutual: settings.directMessagesFromNonFriends,
        activity_status_visible: settings.activityStatusVisible,
        discover_by_email: settings.discoverByEmail,
        discover_by_phone: settings.discoverByPhone,
        updated_at: new Date().toISOString(),
      }).eq('id', userId)
    } catch (e) {
      // Se a coluna ainda não existir no DB local, ignoramos sem quebrar a UI
      console.warn("Aviso: colunas de privacidade em profiles podem não estar migradas ainda:", e)
    }
  },

  /**
   * Valida se um usuário pode enviar pedido de amizade para outro usuário
   * com base nas políticas de privacidade do destinatário.
   */
  async checkCanSendFriendRequest(
    senderId: string,
    targetUserId: string,
    targetProfileHint?: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (senderId === targetUserId) {
      return { allowed: false, reason: "Você não pode enviar pedido de amizade para si mesmo." }
    }

    // 1. Checa se há bloqueio mútuo
    const { data: blockCheck } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`and(blocker_id.eq.${senderId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${senderId})`)
      .limit(1)

    if (blockCheck && blockCheck.length > 0) {
      return { allowed: false, reason: "Não é possível interagir com este usuário devido a um bloqueio." }
    }

    // 2. Obter perfil do destinatário para verificar a política
    let policy: string = targetProfileHint?.friend_request_policy || 'everyone'
    if (!targetProfileHint?.friend_request_policy) {
      const { data: targetProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (targetProf?.friend_request_policy) {
        policy = targetProf.friend_request_policy
      }
    }

    // 3. Avaliar política do destinatário
    if (policy === 'nobody') {
      return {
        allowed: false,
        reason: "Este usuário não está aceitando novos pedidos de amizade no momento.",
      }
    }

    if (policy === 'mutual') {
      // Verificar se possuem amigos em comum
      const { data: senderFriends } = await supabase
        .from('friendships')
        .select('user_id_1, user_id_2')
        .eq('status', 'accepted')
        .or(`user_id_1.eq.${senderId},user_id_2.eq.${senderId}`)

      const senderFriendIds = new Set<string>()
      senderFriends?.forEach(f => {
        senderFriendIds.add(f.user_id_1 === senderId ? f.user_id_2 : f.user_id_1)
      })

      const { data: targetFriends } = await supabase
        .from('friendships')
        .select('user_id_1, user_id_2')
        .eq('status', 'accepted')
        .or(`user_id_1.eq.${targetUserId},user_id_2.eq.${targetUserId}`)

      let hasMutual = false
      targetFriends?.forEach(f => {
        const other = f.user_id_1 === targetUserId ? f.user_id_2 : f.user_id_1
        if (senderFriendIds.has(other)) {
          hasMutual = true
        }
      })

      if (!hasMutual) {
        return {
          allowed: false,
          reason: "Este usuário só aceita pedidos de amizade de pessoas com amigos ou servidores em comum.",
        }
      }
    }

    return { allowed: true }
  },

  /**
   * Valida se um usuário pode enviar mensagem direta para outro usuário
   * com base na amizade e na política de mensagens diretas de membros de servidores em comum.
   */
  async checkCanSendDirectMessage(
    senderId: string,
    targetUserId: string,
    targetProfileHint?: any
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (senderId === targetUserId) {
      return { allowed: true }
    }

    // 1. Checa se há bloqueio mútuo
    const { data: blockCheck } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`and(blocker_id.eq.${senderId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${senderId})`)
      .limit(1)

    if (blockCheck && blockCheck.length > 0) {
      return { allowed: false, reason: "Mensagens desativadas devido a um bloqueio ativo entre os usuários." }
    }

    // 2. Checa se já são amigos aceitos
    const { data: friendship } = await supabase
      .from('friendships')
      .select('status')
      .eq('status', 'accepted')
      .or(`and(user_id_1.eq.${senderId},user_id_2.eq.${targetUserId}),and(user_id_1.eq.${targetUserId},user_id_2.eq.${senderId})`)
      .maybeSingle()

    // Se já forem amigos aceitos, envio de DM é sempre permitido
    if (friendship) {
      return { allowed: true }
    }

    // 3. Se não forem amigos, checa se o destinatário permite DMs de servidores em comum
    let allowFromMutual = true
    if (targetProfileHint?.direct_messages_from_mutual !== undefined) {
      allowFromMutual = targetProfileHint.direct_messages_from_mutual
    } else {
      const { data: targetProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (targetProf && targetProf.direct_messages_from_mutual !== undefined && targetProf.direct_messages_from_mutual !== null) {
        allowFromMutual = targetProf.direct_messages_from_mutual
      }
    }

    if (!allowFromMutual) {
      return {
        allowed: false,
        reason: "Este usuário desativou o recebimento de mensagens diretas de pessoas que não estão na sua lista de amigos.",
      }
    }

    // 4. Se o destinatário permite DMs de servidores em comum, valida se compartilham algum servidor
    try {
      const { data: senderServers } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', senderId)

      if (senderServers && senderServers.length > 0) {
        const senderServerIds = senderServers.map(s => s.server_id)
        const { data: mutualServer } = await supabase
          .from('server_members')
          .select('server_id')
          .eq('user_id', targetUserId)
          .in('server_id', senderServerIds)
          .limit(1)

        if (mutualServer && mutualServer.length > 0) {
          return { allowed: true }
        }
      }
    } catch (e) {
      console.warn("PrivacyService: aviso ao consultar servidores mútuos:", e)
      // Em fallback de ambiente local sem servidores configurados, não bloquear indevidamente se permitido
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: "Você precisa compartilhar um servidor ou ser amigo deste usuário para enviar mensagens diretas.",
    }
  }
}
