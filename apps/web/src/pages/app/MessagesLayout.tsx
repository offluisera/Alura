import { useState, useEffect } from "react"
import { useNavigate, useOutletContext, Outlet, useLocation, useParams } from "react-router-dom"
import { MessageSquare, Search, Plus, Image as ImageIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"

interface DMChannel {
  id: string
  otherUserId: string
  otherUser?: any
  lastMessage?: any
  unreadCount: number
}

export function MessagesLayout() {
  const { user } = useOutletContext<{ user: any }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { otherUserId: activeUserId } = useParams<{ otherUserId: string }>()
  const [channels, setChannels] = useState<DMChannel[]>([])
  const [loading, setLoading] = useState(true)
  const { unreadDMCount, refreshUnreadDMs } = useNotification()

  useEffect(() => {
    if (user) loadChannels()
  }, [user, unreadDMCount])

  async function loadChannels() {
    setLoading(true)
    
    // 1. Fetch DM channels where user is a participant
    const { data: dmChannels, error } = await supabase
      .from('dm_channels')
      .select('*')
      .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)

    if (error || !dmChannels) {
      setLoading(false)
      return
    }

    // 2. Fetch profiles and messages data
    const channelsData = await Promise.all(dmChannels.map(async (channel) => {
      const otherUserId = channel.user_1_id === user.id ? channel.user_2_id : channel.user_1_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single()

      // Fetch last message
      const { data: lastMessages } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('dm_channel_id', channel.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null

      // Fetch unread count (messages NOT sent by me, and is_read is false)
      const { count } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('dm_channel_id', channel.id)
        .neq('user_id', user.id)
        .eq('is_read', false)
        
      return {
        id: channel.id,
        otherUserId,
        otherUser: profile,
        lastMessage,
        unreadCount: count || 0
      }
    }))

    // Sort channels by last message date (or created_at if no messages)
    channelsData.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
      return bTime - aTime
    })

    setChannels(channelsData)
    setLoading(false)
  }

  // Format date helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full w-full bg-alura-background overflow-hidden text-alura-textPrimary">
      
      {/* 2. Conversation Sidebar (List of channels) */}
      <div className="w-[330px] border-r border-alura-border bg-alura-surface1/30 flex flex-col shrink-0 overflow-hidden relative z-10">
        
        {/* Header da Sidebar */}
        <div className="h-[60px] flex items-center justify-between px-5 shrink-0">
          <h2 className="font-bold text-[18px]">Mensagens</h2>
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Busca */}
        <div className="px-4 pb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-alura-textDisabled" />
            <input 
              type="text" 
              placeholder="Buscar conversas..."
              className="w-full h-9 bg-alura-surface1 border border-alura-border rounded-[8px] pl-9 pr-3 text-[13px] text-alura-textPrimary placeholder:text-alura-textDisabled focus:border-alura-borderStrong focus:shadow-[0_0_10px_rgba(0,223,160,0.1)] outline-none transition-all"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar pb-4">
          {loading ? (
            <div className="flex flex-col gap-1 px-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-[10px] bg-alura-surface1/10">
                  <div className="w-10 h-10 rounded-full bg-alura-surface2"></div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="w-24 h-3 bg-alura-surface2 rounded"></div>
                    <div className="w-16 h-2 bg-alura-surface2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : channels.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare className="w-8 h-8 text-alura-textDisabled mx-auto mb-3" />
              <p className="text-sm text-alura-textMuted">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            channels.map((channel) => {
              const profile = channel.otherUser
              const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "US"
              const isActive = activeUserId === channel.otherUserId
              
              const isImage = channel.lastMessage?.content?.match(/\.(jpeg|jpg|gif|png)$/i) !== null
              const hasLastMessage = !!channel.lastMessage
              
              return (
                <button
                  key={channel.id}
                  onClick={() => navigate(`/messages/${channel.otherUserId}`)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-[8px] transition-all group text-left
                    ${isActive 
                      ? "bg-alura-surface2/80 border border-alura-border text-alura-textPrimary shadow-[0_4px_10px_rgba(0,0,0,0.2)]" 
                      : "border border-transparent text-alura-textSecondary hover:bg-alura-surface1 hover:text-alura-textPrimary"
                    }
                  `}
                >
                  <Avatar className="w-10 h-10 shrink-0 border border-transparent shadow-sm bg-alura-surface3 flex items-center justify-center rounded-full relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-transparent font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    )}
                    {/* Fake Status indicator (Online) for design matching - ideally real data */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-alura-accent border-2 border-alura-surface1 rounded-full z-10" />
                  </Avatar>
                  <div className="flex flex-col flex-1 overflow-hidden justify-center leading-tight">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-[14.5px] truncate ${isActive ? 'text-alura-textPrimary' : (channel.unreadCount > 0 ? 'text-alura-textPrimary' : '')}`}>
                        @{profile?.username || 'usuario'}
                      </span>
                      {hasLastMessage && (
                        <span className={`text-[11px] shrink-0 ${channel.unreadCount > 0 ? 'text-alura-accent font-bold' : 'text-alura-textDisabled'}`}>
                          {formatTime(channel.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-[12px] truncate flex items-center gap-1 ${channel.unreadCount > 0 ? 'text-alura-textPrimary font-medium' : 'text-alura-textMuted'}`}>
                        {hasLastMessage ? (
                          isImage ? (
                            <><ImageIcon className="w-3.5 h-3.5" /> Imagem</>
                          ) : (
                            channel.lastMessage.content
                          )
                        ) : (
                          profile?.full_name || 'Usuário'
                        )}
                      </span>
                      
                      {channel.unreadCount > 0 && (
                        <span className="bg-alura-accent text-alura-background text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center rounded-full leading-none shrink-0 ml-2 shadow-[0_0_5px_rgba(0,223,160,0.5)]">
                          {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* 3 & 4. Main Conversation & Context Panel */}
      <div className="flex-1 flex overflow-hidden">
        <Outlet context={{ user }} />
      </div>

    </div>
  )
}
