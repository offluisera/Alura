import React, { useState, useEffect } from 'react'
import {
  X,
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Check,
  Trash2,
  Sparkles,
  Inbox,
  CheckCheck
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../contexts/NotificationContext'

export interface NotificationItem {
  id: string
  user_id: string
  type: string
  message: string
  is_read: boolean
  link?: string | null
  created_at: string
}

interface NotificationCenterModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
  onNotificationsUpdated?: () => void
}

type TabType = 'all' | 'unread' | 'social' | 'friends' | 'system'

export function NotificationCenterModal({
  isOpen,
  onClose,
  currentUserId,
  onNotificationsUpdated,
}: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const navigate = useNavigate()
  const { showToast } = useNotification()

  useEffect(() => {
    if (isOpen && currentUserId) {
      loadNotifications()
    }
  }, [isOpen, currentUserId])

  const loadNotifications = async () => {
    if (!currentUserId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (err: any) {
      console.error('[NotificationCenter] Erro ao carregar:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      onNotificationsUpdated?.()
    } catch (err) {
      console.error('[NotificationCenter] Falha ao marcar lida:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUserId)
        .eq('is_read', false)

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      showToast({ type: 'success', title: 'Notificações lidas', message: 'Todas as notificações foram marcadas como lidas.' })
      onNotificationsUpdated?.()
    } catch (err) {
      console.error('[NotificationCenter] Falha ao marcar todas:', err)
    }
  }

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await supabase.from('notifications').delete().eq('id', id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      onNotificationsUpdated?.()
    } catch (err) {
      console.error('[NotificationCenter] Falha ao excluir:', err)
    }
  }

  const handleClearRead = async () => {
    if (!currentUserId) return
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', currentUserId)
        .eq('is_read', true)

      setNotifications((prev) => prev.filter((n) => !n.is_read))
      showToast({ type: 'info', title: 'Notificações limpas', message: 'Notificações já lidas foram removidas.' })
      onNotificationsUpdated?.()
    } catch (err) {
      console.error('[NotificationCenter] Falha ao limpar lidas:', err)
    }
  }

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      await handleMarkAsRead(n.id)
    }
    onClose()

    // Resolução segura de links para evitar redirecionamento indevido para login
    if (n.link) {
      let target = n.link

      // Normaliza links de posts do backend (ex: /app/post/123 -> /)
      if (target.startsWith('/app/post/') || target.startsWith('/post/')) {
        navigate('/')
        showToast({
          type: 'info',
          title: 'Publicação no Feed',
          message: 'Você foi direcionado ao feed principal para conferir a publicação.',
        })
        return
      }

      if (target.startsWith('/app/')) {
        target = target.replace('/app/', '/')
      }

      navigate(target)
      return
    }

    // Fallback inteligente pelo tipo
    if (n.type === 'like' || n.type === 'comment' || n.type === 'friend_post') {
      navigate('/')
    } else if (n.type === 'friend_request') {
      navigate('/requests')
    } else if (n.type === 'dm' || n.type === 'message') {
      navigate('/messages')
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-400" />
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-emerald-400" />
      case 'friend_post':
        return <Sparkles className="w-4 h-4 text-amber-400" />
      default:
        return <Bell className="w-4 h-4 text-alura-accent" />
    }
  }

  const formatTime = (dateString: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000)
    if (diff < 1) return 'Agora mesmo'
    if (diff < 60) return `${diff}m atrás`
    const hours = Math.floor(diff / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  // Filtragem pelas abas
  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab === 'social') return n.type === 'like' || n.type === 'comment' || n.type === 'friend_post'
    if (activeTab === 'friends') return n.type === 'friend_request'
    if (activeTab === 'system') return n.type !== 'like' && n.type !== 'comment' && n.type !== 'friend_request' && n.type !== 'friend_post'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-alura-border flex items-center justify-between bg-alura-surface2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-alura-accent/15 border border-alura-accent/30 flex items-center justify-center text-alura-accent shadow-sm">
              <Bell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-alura-textPrimary tracking-tight">
                  Central de Notificações
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-alura-accent/20 text-alura-accent text-[11px] font-black border border-alura-accent/30">
                    {unreadCount} nova(s)
                  </span>
                )}
              </div>
              <p className="text-xs text-alura-textMuted">
                Acompanhe interações, solicitações e menções da comunidade.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl bg-alura-surface1 hover:bg-alura-surface3 text-alura-textSecondary hover:text-alura-textPrimary border border-alura-border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Marcar todas como lidas"
              >
                <CheckCheck size={14} className="text-alura-accent" />
                <span className="hidden sm:inline">Marcar Lidas</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearRead}
              className="p-2 rounded-xl bg-alura-surface1 hover:bg-red-500/20 text-alura-textMuted hover:text-red-400 border border-alura-border hover:border-red-500/30 transition-all cursor-pointer"
              title="Limpar notificações lidas"
            >
              <Trash2 size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-alura-surface1 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary border border-alura-border transition-all cursor-pointer ml-1"
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Abas de Filtro */}
        <div className="flex items-center gap-1 px-5 py-2.5 bg-alura-surface1 border-b border-alura-border overflow-x-auto custom-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-alura-selected text-alura-accent border border-alura-accent/40 shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            Todas ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-alura-selected text-alura-accent border border-alura-accent/40 shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            <span>Não lidas</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-alura-accent" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'social'
                ? 'bg-alura-selected text-alura-accent border border-alura-accent/40 shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            Curtidas & Comentários
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'friends'
                ? 'bg-alura-selected text-alura-accent border border-alura-accent/40 shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            Amizades
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'system'
                ? 'bg-alura-selected text-alura-accent border border-alura-accent/40 shadow-sm'
                : 'text-alura-textMuted hover:text-alura-textPrimary'
            }`}
          >
            Sistema
          </button>
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-alura-textMuted space-y-2">
              <div className="w-7 h-7 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Carregando notificações...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-alura-textMuted space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-alura-surface2 border border-alura-border flex items-center justify-center text-alura-textMuted">
                <Inbox size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-alura-textPrimary">Nenhuma notificação por aqui</p>
                <p className="text-xs text-alura-textMuted mt-0.5">
                  {activeTab === 'unread'
                    ? 'Você está em dia com todas as suas interações!'
                    : 'Novas interações aparecerão aqui em tempo real.'}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
                  !item.is_read
                    ? 'bg-alura-selected/60 hover:bg-alura-selected border-alura-accent/40 shadow-sm'
                    : 'bg-alura-surface2/40 hover:bg-alura-surface2 border-alura-border/60 text-alura-textSecondary'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-alura-surface1 border border-alura-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!item.is_read ? 'text-alura-textPrimary font-bold' : 'text-alura-textSecondary font-medium'}`}>
                    {item.message}
                  </p>
                  <span className="text-[10px] text-alura-textMuted mt-1 block">
                    {formatTime(item.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="p-1.5 rounded-lg bg-alura-surface1 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-accent border border-alura-border transition-colors cursor-pointer"
                      title="Marcar como lida"
                    >
                      <Check size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    className="p-1.5 rounded-lg bg-alura-surface1 hover:bg-red-500/20 text-alura-textMuted hover:text-red-400 border border-alura-border transition-colors cursor-pointer"
                    title="Excluir notificação"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé com Dica */}
        <div className="p-3 border-t border-alura-border bg-alura-surface2/30 flex items-center justify-between text-[11px] text-alura-textMuted px-5">
          <span>Clique em qualquer notificação para navegar com segurança</span>
          <span className="text-alura-accent font-semibold flex items-center gap-1">
            <Sparkles size={11} /> Alura Realtime
          </span>
        </div>
      </div>
    </div>
  )
}
