import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"
import { Send, Phone, PhoneOff, PhoneCall, PhoneMissed, Video, MoreHorizontal, Image as ImageIcon, Smile, Plus, Users, X, AlertCircle, Moon, Check, ShieldAlert, Eye, EyeOff, Ban, UserMinus, Calendar, Link2, Gamepad2, Activity, Link as LinkIcon, ExternalLink, MessageSquare as DiscordIcon, Github, Twitch, Terminal, Code2, PenTool, MonitorPlay, Music, Tag, Download } from "lucide-react"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { Avatar, AvatarFallback } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import { PrivacyService } from "../../lib/services/PrivacyService"
import { AutoModService, type AutoModConfig, DEFAULT_AUTOMOD_CONFIG } from "../../lib/services/AutoModService"
import { SoundService } from "../../lib/services/SoundService"
import { SpotifyActivityCard, SpotifyIcon } from "../../components/shared/SpotifyActivityCard"
import { BlockService } from "../../lib/services/BlockService"
import { GAMES_DB } from "../onboarding/steps/StepGames"
import { HOBBIES_DB } from "../onboarding/steps/StepHobbies"
import { compressImageToWebp, downloadImageAsPng } from "../../lib/utils/imageOptimizer"
import { UserProfileHoverCard } from "../../components/shared/UserProfileHoverCard"
import { getActiveConnections, ConnectionIcon } from "../../components/shared/ConnectionIcons"
import { useCall } from "../../contexts/CallContext"
import { CallOverlay } from "../../components/call/CallOverlay"
import erroImage from "../../assets/erro.png"

const TAG_TRANSLATIONS: Record<string, { label: string; icon: any }> = {
  programmer: { label: "Programador", icon: Terminal },
  gamer: { label: "Gamer", icon: Gamepad2 },
  learning: { label: "Sempre Aprendendo", icon: Code2 },
  designer: { label: "Designer", icon: PenTool },
  streamer: { label: "Streamer", icon: MonitorPlay },
  music: { label: "Música", icon: Music },
  musico: { label: "Músico", icon: Music },
  dev: { label: "Desenvolvedor", icon: Terminal },
  developer: { label: "Desenvolvedor", icon: Terminal },
  tecnologia: { label: "Tecnologia", icon: Terminal },
  tech: { label: "Tecnologia", icon: Terminal },
  anime: { label: "Anime", icon: Activity },
  games: { label: "Gamer", icon: Gamepad2 },
  jogos: { label: "Jogos", icon: Gamepad2 },
  boardgames: { label: "Jogos de Tabuleiro", icon: Gamepad2 },
  movies: { label: "Filmes", icon: MonitorPlay },
  filmes: { label: "Filmes", icon: MonitorPlay },
  reading: { label: "Leitura", icon: Code2 },
  leitura: { label: "Leitura", icon: Code2 },
  estudante: { label: "Estudante", icon: Code2 },
  student: { label: "Estudante", icon: Code2 },
}

interface MessageAttachment {
  url: string
  type: string
  name: string
  size: number
}

interface Message {
  id: string
  dm_channel_id: string
  user_id: string
  content: string
  created_at: string
  attachments?: MessageAttachment[]
}

import { useNotification } from "../../contexts/NotificationContext"

export function DirectMessage() {
  const { otherUserId } = useParams<{ otherUserId: string }>()
  const { user } = useOutletContext<{ user: any }>()
  const { refreshUnreadDMs, showToast, showConfirmModal } = useNotification()
  const navigate = useNavigate()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [friendProfile, setFriendProfile] = useState<any>(null)
  const [channelId, setChannelId] = useState<string | null>(null)
  
  // Attachments & Emojis State
  const [attachments, setAttachments] = useState<File[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  
  const [isBlocked, setIsBlocked] = useState(false)
  const [isRestricted, setIsRestricted] = useState(false)
  const [restrictionReason, setRestrictionReason] = useState("")
  
  // Auto-MOD Estado
  const [myAutoMod, setMyAutoMod] = useState<AutoModConfig>(DEFAULT_AUTOMOD_CONFIG)
  const [isFriend, setIsFriend] = useState(false)
  const [revealedMessages, setRevealedMessages] = useState<Record<string, boolean>>({})
  const [revealedMedia, setRevealedMedia] = useState<Record<string, boolean>>({})

  // ── WebRTC Call via CallContext Global ────────────────────────────────────
  const {
    callState,
    callType,
    localStream,
    remoteStream,
    screenStream,
    isMuted,
    isDeafened,
    isCameraOn,
    isSharingScreen,
    isRemoteSharingScreen,
    callDuration,
    remoteParticipant,
    callerProfile,
    noiseFilter,
    setNoiseFilter,
    hangUp,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    startScreenShareWithSource,
    stopScreenShare,
    startCallWithProfile,
    acceptIncomingCall,
    rejectIncomingCall,
    setActiveDmUserId,
    isDnd,
  } = useCall()

  // Sincroniza DM ativa com o CallContext para saber se a chamada pertence a esta tela
  useEffect(() => {
    setActiveDmUserId(otherUserId || null)
    return () => setActiveDmUserId(null)
  }, [otherUserId, setActiveDmUserId])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !otherUserId) return
    loadChat()
  }, [user, otherUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle outside click for emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!channelId) return
    
    const channel = supabase.channel(`dm_${channelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages',
        filter: `dm_channel_id=eq.${channelId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as Message]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [channelId])

  // Real-time listener for the friend's profile status
  useEffect(() => {
    if (!otherUserId) return
    const profileChannel = supabase.channel(`profile_${otherUserId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${otherUserId}`
      }, (payload) => {
        setFriendProfile((prev: any) => ({ ...prev, ...payload.new }))
      })
      .subscribe()
    
    return () => { supabase.removeChannel(profileChannel) }
  }, [otherUserId])

  async function loadChat() {
    if (!otherUserId || !user) return
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherUserId).single()
    if (profile) setFriendProfile(profile)

    // Check if blocked
    const { data: blockCheck } = await supabase.from('blocks')
      .select('*')
      .in('blocker_id', [user.id, otherUserId])
      .in('blocked_id', [user.id, otherUserId])
      
    if (blockCheck && blockCheck.length > 0) {
      setIsBlocked(true)
    } else {
      setIsBlocked(false)
    }

    // Check friendship status for Auto-MOD rules
    const { data: friendship } = await supabase.from('friendships')
      .select('status')
      .eq('status', 'accepted')
      .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${otherUserId}),and(user_id_1.eq.${otherUserId},user_id_2.eq.${user.id})`)
      .maybeSingle()
    setIsFriend(!!friendship)

    // Load Auto-MOD preferences
    const automodCfg = await AutoModService.getConfig(user.id)
    setMyAutoMod(automodCfg)

    // Check direct message privacy permissions
    const dmCheck = await PrivacyService.checkCanSendDirectMessage(user.id, otherUserId, profile)
    if (!dmCheck.allowed) {
      setIsRestricted(true)
      setRestrictionReason(dmCheck.reason || "Este usuário não aceita mensagens diretas de não-amigos.")
    } else {
      setIsRestricted(false)
      setRestrictionReason("")
    }

    const { data: channels } = await supabase.from('dm_channels')
      .select('*')
      .or(`and(user_1_id.eq.${user.id},user_2_id.eq.${otherUserId}),and(user_1_id.eq.${otherUserId},user_2_id.eq.${user.id})`)
    
    let currentChannelId = channels && channels.length > 0 ? channels[0].id : null

    if (currentChannelId) {
      setChannelId(currentChannelId)

      // Mark messages as read
      const { data: updateData, error: updateError } = await supabase.from('direct_messages')
        .update({ is_read: true })
        .eq('dm_channel_id', currentChannelId)
        .neq('user_id', user.id)
        .eq('is_read', false)
        .select()
        
      if (updateData && updateData.length > 0) {
        await refreshUnreadDMs()
      }

      const { data: msgs } = await supabase.from('direct_messages')
        .select('*')
        .eq('dm_channel_id', currentChannelId)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)
    } else {
      setChannelId(null)
      setMessages([])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, acceptImagesOnly: boolean = false) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      
      if (acceptImagesOnly && !isImage) {
        setAlertMessage(`O arquivo ${file.name} não é uma imagem válida.`)
        return false
      }

      const sizeMB = file.size / (1024 * 1024)
      if (isVideo && sizeMB > 25) {
        setAlertMessage(`O vídeo ${file.name} excede o limite de 25MB.`)
        return false
      }
      if (isImage && sizeMB > 8) {
        setAlertMessage(`A imagem ${file.name} excede o limite de 8MB.`)
        return false
      }
      if (!isVideo && !isImage && sizeMB > 25) {
         setAlertMessage(`O arquivo ${file.name} excede o limite de 25MB.`)
         return false
      }
      return true
    })

    setAttachments(prev => [...prev, ...validFiles])
    e.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage(prev => prev + emojiObject.emoji)
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if ((!newMessage.trim() && attachments.length === 0) || !user || !otherUserId || isUploading) return

    const dmCheck = await PrivacyService.checkCanSendDirectMessage(user.id, otherUserId, friendProfile)
    if (!dmCheck.allowed) {
      setAlertMessage(dmCheck.reason || "Mensagens diretas não permitidas por este usuário.")
      return
    }

    // Auto-MOD Scan 1: Links maliciosos e Phishing no texto
    const textCheck = AutoModService.checkTextMessage(newMessage, myAutoMod)
    if (textCheck.blocked) {
      setAlertMessage(textCheck.reason || "Auto-MOD: Esta mensagem foi bloqueada por conter link malicioso ou tentativa de phishing.")
      return
    }

    // Auto-MOD Scan 2: Arquivos executáveis ou mídias perigosas nos anexos
    for (const file of attachments) {
      const attCheck = await AutoModService.checkAttachment(file, myAutoMod)
      if (attCheck.blocked) {
        setAlertMessage(attCheck.reason || `Auto-MOD: O arquivo ${file.name} foi bloqueado por segurança.`)
        return
      }
    }

    setIsUploading(true)
    let currentChannelId = channelId

    if (!currentChannelId) {
      const { data: newChannel, error } = await supabase.from('dm_channels')
        .insert({ user_1_id: user.id, user_2_id: otherUserId })
        .select()
        .single()
      
      if (error) {
        setAlertMessage("Erro ao criar canal de DM: " + error.message)
        setIsUploading(false)
        return
      }
      currentChannelId = newChannel.id
      setChannelId(currentChannelId)
    }

    // 1. Upload Attachments
    const uploadedAttachments: MessageAttachment[] = []
    
    for (const file of attachments) {
      let fileToUpload = file
      let fileExt = file.name.split('.').pop()

      // Se for imagem e não for GIF animado, comprime para .webp
      if (file.type.startsWith('image/') && file.type !== 'image/gif') {
        try {
          fileToUpload = await compressImageToWebp(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 })
          fileExt = 'webp'
        } catch (e) {
          console.warn("Falha ao comprimir imagem para webp, enviando original", e)
        }
      }

      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${currentChannelId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, fileToUpload, {
          contentType: fileToUpload.type,
          upsert: true
        })

      if (uploadError) {
        setAlertMessage(`Erro ao subir ${file.name}: ` + uploadError.message)
        continue
      }

      const { data } = supabase.storage.from('chat_attachments').getPublicUrl(filePath)
      
      uploadedAttachments.push({
        url: data.publicUrl,
        type: fileToUpload.type,
        name: file.name,
        size: fileToUpload.size
      })
    }

    const msgContent = newMessage.trim()
    setNewMessage("")
    setAttachments([])

    // 2. Insert Message
    const { data: insertedMsg, error } = await supabase.from('direct_messages')
      .insert({
        dm_channel_id: currentChannelId,
        user_id: user.id,
        content: msgContent,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : null
      })
      .select()
      .single()
      
    if (error) {
       setAlertMessage("Erro ao enviar mensagem: " + error.message)
       setIsUploading(false)
       return
    }

    if (insertedMsg) {
      setMessages(prev => {
        if (prev.some(m => m.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg as Message]
      })
      SoundService.play('messageSent')
    }
    
    setIsUploading(false)
    setShowEmojiPicker(false)
  }

  const initials = friendProfile?.full_name ? friendProfile.full_name.substring(0, 2).toUpperCase() : "US"

  return (
    <div className="flex w-full h-full text-alura-textPrimary bg-alura-background relative">

      {/* ── Overlay de Chamada (Persistente e com suporte a DND) ── */}
      {(() => {
        const isCallWithThisFriend =
          remoteParticipant?.userId === otherUserId ||
          callerProfile?.userId === otherUserId

        // Se estiver em DND e o estado for 'ringing', a barra flutuante no rodapé assume
        const shouldShowOverlay =
          callState !== 'idle' &&
          isCallWithThisFriend &&
          !(callState === 'ringing' && isDnd)

        if (!shouldShowOverlay) return null

        return (
          <CallOverlay
            callState={callState}
            callType={callType}
            localStream={localStream}
            remoteStream={remoteStream}
            screenStream={screenStream}
            isMuted={isMuted}
            isDeafened={isDeafened}
            isCameraOn={isCameraOn}
            isSharingScreen={isSharingScreen}
            isRemoteSharingScreen={isRemoteSharingScreen}
            callDuration={callDuration}
            remoteParticipant={remoteParticipant || callerProfile}
            myName={user?.user_metadata?.username || user?.user_metadata?.full_name || 'Você'}
            myAvatar={user?.user_metadata?.avatar_url}
            noiseFilter={noiseFilter}
            setNoiseFilter={setNoiseFilter}
            hangUp={hangUp}
            toggleMute={toggleMute}
            toggleDeafen={toggleDeafen}
            toggleCamera={toggleCamera}
            startScreenShareWithSource={startScreenShareWithSource}
            stopScreenShare={stopScreenShare}
            acceptCall={acceptIncomingCall}
            rejectCall={rejectIncomingCall}
          />
        )
      })()}

      {/* Coluna 3: Chat Principal */}
      <div className="flex-1 flex flex-col bg-alura-background border-r border-alura-border">
        
        {/* Header do Chat */}
        <div className="h-[60px] border-b border-alura-border flex items-center justify-between px-6 shrink-0 z-10">
          {friendProfile ? (
            <UserProfileHoverCard userId={friendProfile.id} profile={friendProfile} side="bottom">
              <div className="flex items-center gap-3 cursor-pointer group/headerprofile">
                <Avatar className="w-8 h-8 rounded-full">
                  {friendProfile.avatar_url ? (
                    <img src={friendProfile.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-alura-surface2 text-xs font-bold">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[15px] group-hover/headerprofile:underline">@{friendProfile.username || 'usuario'}</span>
                  {(!friendProfile.status || friendProfile.status !== 'offline') && (
                    <>
                      <div className={`w-1.5 h-1.5 rounded-full ${friendProfile.status === 'dnd' ? 'bg-alura-danger' : friendProfile.status === 'idle' ? 'bg-[#F5A623]' : 'bg-alura-accent'}`} />
                      <span className={`text-[12px] font-medium tracking-wide ${friendProfile.status === 'dnd' ? 'text-alura-danger' : friendProfile.status === 'idle' ? 'text-[#F5A623]' : 'text-alura-accent'}`}>
                        {friendProfile.status === 'dnd' ? 'Não perturbe' : friendProfile.status === 'idle' ? 'Ausente' : 'Online'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </UserProfileHoverCard>
          ) : (
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-alura-surface2"></div>
              <div className="w-24 h-4 rounded bg-alura-surface2"></div>
            </div>
          )}

          {/* Ações (Phone, Video, More) */}
          <div className="flex items-center gap-4 text-alura-textMuted">
            <button
              className={`w-8 h-8 flex items-center justify-center hover:bg-alura-surface2 hover:text-alura-accent rounded-full transition-colors ${callState !== 'idle' && (remoteParticipant?.userId === otherUserId || callerProfile?.userId === otherUserId) ? 'text-alura-accent' : ''}`}
              onClick={() => {
                if (callState !== 'idle') return
                startCallWithProfile(
                  otherUserId!,
                  {
                    userId: otherUserId!,
                    name: friendProfile?.username || friendProfile?.display_name || 'Usuário',
                    avatar: friendProfile?.avatar_url,
                  },
                  'audio',
                  channelId
                )
              }}
              title="Chamada de voz"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              className={`w-8 h-8 flex items-center justify-center hover:bg-alura-surface2 hover:text-alura-accent rounded-full transition-colors ${callState !== 'idle' && (remoteParticipant?.userId === otherUserId || callerProfile?.userId === otherUserId) ? 'text-alura-accent' : ''}`}
              onClick={() => {
                if (callState !== 'idle') return
                startCallWithProfile(
                  otherUserId!,
                  {
                    userId: otherUserId!,
                    name: friendProfile?.username || friendProfile?.display_name || 'Usuário',
                    avatar: friendProfile?.avatar_url,
                  },
                  'video',
                  channelId
                )
              }}
              title="Chamada de vídeo"
            >
              <Video className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-alura-surface2 hover:text-alura-textPrimary rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar flex flex-col">
          {messages.map(msg => {
            const isMe = msg.user_id === user?.id
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar lateral (somente se não for eu) */}
                  {!isMe && (
                    <UserProfileHoverCard userId={friendProfile?.id} profile={friendProfile} side="right">
                      <Avatar className="w-9 h-9 shrink-0 mt-0.5 rounded-full border border-alura-border cursor-pointer">
                         {friendProfile?.avatar_url ? (
                            <img src={friendProfile.avatar_url} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <AvatarFallback className="bg-alura-surface2 text-xs font-bold">{initials}</AvatarFallback>
                          )}
                      </Avatar>
                    </UserProfileHoverCard>
                  )}

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Metadados */}
                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <UserProfileHoverCard userId={msg.user_id} profile={!isMe ? friendProfile : undefined} side={isMe ? "left" : "right"}>
                        <span className="font-semibold text-[13px] hover:underline cursor-pointer">{isMe ? user?.user_metadata?.username || 'Você' : friendProfile?.username}</span>
                      </UserProfileHoverCard>
                      <span className="text-[11px] text-alura-textDisabled">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* Renderização de Anexos com Auto-MOD */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={`flex flex-wrap gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {msg.attachments.map((att, i) => {
                          const isImage = att.type.startsWith('image/')
                          const mediaKey = `${msg.id}_${i}`
                          const isRevealed = revealedMedia[mediaKey]
                          const shouldBlurMedia = !isMe && isImage && myAutoMod.mode !== 'off' && myAutoMod.filterExplicitMedia && !isRevealed

                          return isImage ? (
                            <div key={i} className="relative rounded-[10px] overflow-hidden border border-alura-border group/dmimg">
                              <img 
                                src={att.url} 
                                alt={att.name} 
                                className={`max-w-[300px] max-h-[300px] object-cover transition-all ${shouldBlurMedia ? 'blur-xl scale-105 select-none pointer-events-none' : ''}`} 
                              />
                              {!shouldBlurMedia && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    downloadImageAsPng(att.url, att.name || 'alura-chat')
                                  }}
                                  className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-[8px] bg-black/75 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-md opacity-0 group-hover/dmimg:opacity-100 transition-all flex items-center gap-1.5 shadow-lg z-10 cursor-pointer border border-white/10"
                                  title="Baixar imagem em .PNG"
                                >
                                  <Download className="w-3.5 h-3.5 text-alura-accent" />
                                  <span>PNG</span>
                                </button>
                              )}
                              {shouldBlurMedia && (
                                <div 
                                  onClick={() => setRevealedMedia(prev => ({ ...prev, [mediaKey]: true }))}
                                  className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-black/80 transition-colors"
                                >
                                  <ShieldAlert className="w-6 h-6 text-alura-accent mb-1.5" />
                                  <span className="text-[12px] font-bold text-white leading-tight">Conteúdo Sensível</span>
                                  <span className="text-[10px] text-alura-textMuted mt-0.5 mb-2">Ocultado preventivamente pelo Auto-MOD</span>
                                  <span className="text-[11px] font-semibold text-alura-accent bg-alura-surface2 px-2.5 py-1 rounded-md border border-alura-border hover:bg-alura-surface3 transition-colors flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> Ver mídia
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : att.type.startsWith('video/') ? (
                            <video key={i} src={att.url} controls className="max-w-[300px] max-h-[300px] rounded-[10px] border border-alura-border" />
                          ) : (
                            <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-alura-surface1 border border-alura-border rounded-[10px] hover:bg-alura-hover hover:border-alura-accent transition-all group min-w-[200px] max-w-[300px]">
                               <div className="w-10 h-10 rounded-[8px] bg-alura-surface2 border border-alura-border flex items-center justify-center group-hover:bg-alura-accent transition-colors shrink-0">
                                 <svg className="w-5 h-5 text-alura-accent group-hover:text-[#0B0D0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                               </div>
                               <div className="flex flex-col min-w-0">
                                 <span className="text-[13px] font-semibold text-alura-textPrimary truncate">{att.name}</span>
                                 <span className="text-[11px] text-alura-textMuted uppercase tracking-wider">{att.name.split('.').pop()} {att.size ? `• ${(att.size / 1024 / 1024).toFixed(2)} MB` : ''}</span>
                               </div>
                            </a>
                          )
                        })}
                      </div>
                    )}

                    {/* Bolha de mensagem textual com proteção Auto-MOD */}
                    {msg.content && (() => {
                      const isFilteredSender = !isMe && AutoModService.shouldModerate(myAutoMod.mode, isFriend)
                      const textCheck = isFilteredSender ? AutoModService.checkTextMessage(msg.content, myAutoMod) : { flagged: false, reason: '' }
                      const isFlagged = textCheck.flagged
                      const isRevealed = revealedMessages[msg.id]

                      if (isFlagged && !isRevealed) {
                        return (
                          <div className="px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm bg-alura-surface2 border border-alura-danger/30 text-alura-textSecondary rounded-[12px] rounded-tl-sm flex flex-col gap-1.5 max-w-[320px]">
                            <div className="flex items-center gap-1.5 text-alura-danger text-[11px] font-bold">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span>{textCheck.reason || "Mensagem sinalizada pelo Auto-MOD"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRevealedMessages(prev => ({ ...prev, [msg.id]: true }))}
                              className="self-start text-[11px] font-semibold text-alura-accent hover:underline flex items-center gap-1 cursor-pointer mt-0.5"
                            >
                              <Eye className="w-3 h-3" /> Mostrar mensagem
                            </button>
                          </div>
                        )
                      }

                      const isCallMessage = 
                        msg.content.startsWith('[call:') || 
                        msg.content.startsWith('📞') || 
                        msg.content.includes('Chamada iniciada') || 
                        msg.content.includes('Chamada encerrada') || 
                        msg.content.includes('Você perdeu uma ligação')

                      if (isCallMessage) {
                        const isStarted = msg.content.includes('iniciada')
                        const isMissed = msg.content.includes('perdeu')
                        const cleanText = msg.content
                          .replace(/^\[call:[^\]]+\]\s*/, '')
                          .replace(/^📞\s*/, '')
                          .trim()

                        return (
                          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-alura-surface1 border border-alura-border/70 text-xs font-semibold shadow-sm w-fit max-w-[380px] my-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isMissed 
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm' 
                                : isStarted 
                                  ? 'bg-alura-accent/15 text-alura-accent border border-alura-accent/30 shadow-sm' 
                                  : 'bg-alura-surface2 text-alura-textSecondary border border-alura-border'
                            }`}>
                              {isMissed ? (
                                <PhoneMissed size={16} className="text-red-400" />
                              ) : isStarted ? (
                                <PhoneCall size={16} className="text-alura-accent" />
                              ) : (
                                <PhoneOff size={16} className="text-alura-textMuted" />
                              )}
                            </div>
                            <span className={`text-[13px] font-medium leading-tight ${
                              isMissed ? 'text-red-400 font-semibold' : isStarted ? 'text-alura-textPrimary font-semibold' : 'text-alura-textSecondary'
                            }`}>
                              {cleanText}
                            </span>
                          </div>
                        )
                      }

                      return (
                        <div 
                          className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm
                            ${isMe 
                              ? 'bg-alura-accent text-[#0B0D0F] font-medium rounded-[12px] rounded-tr-sm' 
                              : 'bg-alura-surface2 text-alura-textPrimary border border-alura-border rounded-[12px] rounded-tl-sm'
                            }`}
                        >
                          {msg.content}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Preview de arquivos selecionados */}
        {attachments.length > 0 && (
          <div className="px-6 py-4 bg-alura-surface1 border-t border-alura-border flex gap-3 overflow-x-auto custom-scrollbar">
            {attachments.map((file, i) => (
              <div key={i} className="relative w-20 h-20 rounded-[8px] bg-alura-surface2 border border-alura-border shrink-0 group flex items-center justify-center">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-[8px]" />
                ) : file.type.startsWith('video/') ? (
                  <Video className="w-8 h-8 text-alura-textMuted" />
                ) : (
                  <span className="text-[10px] text-alura-textMuted font-medium truncate max-w-full px-2 text-center leading-tight">
                    {file.name}
                  </span>
                )}
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-alura-surface1 border border-alura-border rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-alura-hover"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="p-4 px-6 shrink-0 bg-alura-background relative">
          
          {isBlocked || isRestricted ? (
            <div className="flex items-center justify-center py-4 px-4 bg-alura-surface1 border border-alura-border rounded-[12px] opacity-75">
              <span className="text-[13px] text-alura-textDisabled font-bold tracking-wide text-center">
                {restrictionReason || "Não é possível enviar mensagem para este usuário."}
              </span>
            </div>
          ) : (
            <>
              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-6 mb-2 z-50 shadow-2xl" ref={emojiPickerRef}>
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick} 
                    theme={Theme.DARK} 
                    lazyLoadEmojis={true}
                    searchPlaceHolder="Buscar emoji..."
                  />
                </div>
              )}

              <form onSubmit={handleSendMessage} className="relative flex items-center bg-alura-surface1 border border-alura-border rounded-[12px] overflow-visible focus-within:border-alura-borderStrong transition-colors shadow-sm">
                
                {/* Inputs escondidos */}
                <input type="file" multiple accept=".pdf,.doc,.docx,.rar,.zip,.txt,.xlsx,.csv" className="hidden" ref={fileInputRef} onChange={(e) => handleFileSelect(e)} />
                <input type="file" multiple accept="image/*,video/mp4,video/webm" className="hidden" ref={imageInputRef} onChange={(e) => handleFileSelect(e, true)} />

                {/* Ações da esquerda */}
                <div className="relative group/file flex items-center">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="pl-4 pr-2 py-3 text-alura-textMuted hover:text-alura-textPrimary transition-colors">
                    <Plus className="w-5 h-5 hover:scale-110 transition-transform" />
                  </button>
                  <div className="absolute bottom-full left-2 mb-2 hidden group-hover/file:block bg-alura-surface2 border border-alura-border text-alura-textSecondary text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">Documentos (Máx 25MB)</div>
                </div>
                
                <div className="relative group/media flex items-center">
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="px-2 py-3 text-alura-textMuted hover:text-alura-textPrimary transition-colors">
                    <ImageIcon className="w-5 h-5 hover:scale-110 transition-transform" />
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover/media:block bg-alura-surface2 border border-alura-border text-alura-textSecondary text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">Mídia (Máx 25MB)</div>
                </div>

                {/* Input textual */}
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isUploading ? `Enviando...` : `Digite sua mensagem...`}
                  className="flex-1 bg-transparent border-none py-3 px-2 text-[14px] text-alura-textPrimary placeholder:text-alura-textDisabled outline-none disabled:opacity-50"
                  disabled={isUploading}
                />
                
                {/* Ações da direita */}
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`px-2 py-3 transition-all ${showEmojiPicker ? 'text-alura-accent scale-110' : 'text-alura-textMuted hover:text-alura-textPrimary hover:scale-110'}`}>
                  <Smile className="w-5 h-5" />
                </button>
                <button 
                  type="submit"
                  disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
                  className="mr-2 ml-1 w-8 h-8 flex items-center justify-center rounded-lg bg-alura-accent text-[#0B0D0F] disabled:opacity-50 disabled:bg-alura-surface3 disabled:text-alura-textDisabled transition-all hover:bg-alura-accentBright cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUploading ? <div className="w-4 h-4 border-2 border-[#0B0D0F] border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Coluna 4: Context / Profile Panel */}
      <div className="w-[320px] bg-alura-surface1 flex flex-col overflow-y-auto custom-scrollbar shrink-0 border-l border-alura-border">
        {friendProfile ? (
          <div className="flex flex-col pb-6">
            
            {/* Banner e Avatar */}
            <div 
              className="relative h-28 bg-gradient-to-r from-alura-surface3 to-alura-surface2 bg-cover bg-center"
              style={friendProfile.banner_url ? { backgroundImage: `url(${friendProfile.banner_url})` } : undefined}
            >
              <div className="absolute -bottom-10 left-6">
                <Avatar className="w-20 h-20 border-4 border-alura-surface1 rounded-full shadow-lg">
                  {friendProfile.avatar_url ? (
                    <img src={friendProfile.avatar_url} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-alura-surface2 text-xl font-bold">{initials}</AvatarFallback>
                  )}
                </Avatar>
                {(!friendProfile.status || friendProfile.status !== 'offline') && friendProfile.activity_status_visible !== false && (
                  <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-[3px] border-alura-surface1 flex items-center justify-center ${friendProfile.status === 'dnd' ? 'bg-alura-danger' : friendProfile.status === 'idle' ? 'bg-[#F5A623]' : 'bg-alura-accent'}`}>
                     {friendProfile.status === 'dnd' && <div className="w-2 h-[2px] bg-[#0B0D0F] rounded-full" />}
                     {friendProfile.status === 'idle' && <Moon className="w-3 h-3 text-[#0B0D0F]" fill="currentColor" />}
                     {(!friendProfile.status || friendProfile.status === 'online') && <Check className="w-3 h-3 text-[#0B0D0F]" />}
                  </div>
                )}
              </div>
            </div>

            {/* Info Primária Sincronizada */}
            <div className="px-6 pt-12 pb-4 border-b border-alura-border space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold text-white truncate">
                    {friendProfile.display_name || friendProfile.full_name || friendProfile.username || 'Usuário'}
                  </h2>
                  <div className="w-4 h-4 rounded-full bg-alura-accent flex items-center justify-center shrink-0" title="Verificado">
                     <svg className="w-2.5 h-2.5 text-[#0B0D0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-[13px] text-alura-textMuted font-mono block mt-0.5">
                  @{friendProfile.username || 'usuario'}
                </span>
              </div>

              {friendProfile.title && (
                 <p className="text-[12px] text-alura-accent font-medium">{friendProfile.title}</p>
              )}

              {friendProfile.bio && (
                 <p className="text-[13px] text-alura-textSecondary leading-relaxed whitespace-pre-wrap">
                   {friendProfile.bio}
                 </p>
              )}

              {friendProfile.tags && friendProfile.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {friendProfile.tags.map((tag: string, i: number) => {
                    const tagKey = tag.replace(/^#/, '').trim().toLowerCase()
                    const info = TAG_TRANSLATIONS[tagKey] || { 
                      label: tag.replace(/^#/, '').trim(), 
                      icon: Tag 
                    }
                    const Icon = info.icon || Tag
                    return (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-alura-surface2 text-alura-textPrimary text-[11px] font-medium border border-alura-border hover:border-alura-accent/50 transition-all shadow-xs"
                      >
                        <Icon className="w-3.5 h-3.5 text-alura-accent" />
                        <span>{info.label}</span>
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 text-[12px] text-alura-textMuted">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-alura-accent" />
                <span>Membro desde {friendProfile.created_at ? new Date(friendProfile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '2024'}</span>
              </div>

              {/* Atividade de Música do Spotify no Perfil */}
              {friendProfile?.spotify_activity?.isPlaying && friendProfile?.show_spotify_activity !== false && (
                <div className="pt-2">
                  <SpotifyActivityCard 
                    compact 
                    track={friendProfile.spotify_activity} 
                    userName={friendProfile.display_name || friendProfile.username} 
                  />
                </div>
              )}

              {/* Ações de Amizade com Confirmação */}
              <div className="pt-2 space-y-2">
                <button 
                  onClick={() => {
                    showConfirmModal({
                      title: "Remover Amizade",
                      message: `Tem certeza que deseja remover @${friendProfile?.username || 'este usuário'} da sua lista de amigos?`,
                      confirmText: "Remover",
                      cancelText: "Cancelar",
                      isDanger: true,
                      onConfirm: async () => {
                        if (!otherUserId || !user) return
                        try {
                          await supabase
                            .from('friendships')
                            .delete()
                            .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${otherUserId}),and(user_id_1.eq.${otherUserId},user_id_2.eq.${user.id})`)
                          showToast({
                            type: "info",
                            title: "Amizade Removida",
                            message: `@${friendProfile?.username || 'Usuário'} foi removido da sua lista de amigos.`
                          })
                          navigate('/friends')
                        } catch (err) {
                          console.error("Erro ao remover amizade:", err)
                        }
                      }
                    })
                  }}
                  className="w-full h-9 bg-transparent border border-alura-border text-alura-textSecondary hover:text-white rounded-[8px] text-[13px] font-bold hover:bg-alura-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserMinus className="w-4 h-4 text-alura-danger" />
                  Remover amizade
                </button>

                <button 
                  onClick={() => {
                    showConfirmModal({
                      title: "Bloquear Usuário",
                      message: `Tem certeza que deseja bloquear @${friendProfile?.username || 'este usuário'}? Você não receberá mais mensagens nem convites dele.`,
                      confirmText: "Bloquear",
                      cancelText: "Cancelar",
                      isDanger: true,
                      onConfirm: async () => {
                        if (!otherUserId || !user) return
                        try {
                          await BlockService.blockUser(user.id, otherUserId)
                          setIsBlocked(true)
                          showToast({
                            type: "success",
                            title: "Usuário Bloqueado",
                            message: `@${friendProfile?.username || 'Usuário'} foi bloqueado.`
                          })
                          navigate('/friends')
                        } catch (err) {
                          console.error("Erro ao bloquear usuário:", err)
                        }
                      }
                    })
                  }}
                  className="w-full h-9 bg-alura-danger/10 border border-alura-danger/30 text-alura-danger hover:bg-alura-danger/20 rounded-[8px] text-[13px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  Bloquear
                </button>
              </div>
            </div>

            {/* Jogos Favoritos do Perfil */}
            <div className="px-5 py-3 border-b border-alura-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-bold text-alura-textPrimary flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-alura-accent" />
                  Jogos Favoritos
                </h3>
                {friendProfile.favorite_games && friendProfile.favorite_games.length > 0 && (
                  <span className="text-[10px] text-alura-accent font-mono bg-alura-surface2 px-1.5 py-0.5 rounded-full font-bold">
                    {friendProfile.favorite_games.length}
                  </span>
                )}
              </div>
              {friendProfile.favorite_games && friendProfile.favorite_games.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {friendProfile.favorite_games.slice(0, 4).map((gameId: string, idx: number) => {
                    const cleanId = String(gameId).toLowerCase()
                    const game = GAMES_DB.find(g => g.id.toLowerCase() === cleanId || g.name.toLowerCase() === cleanId) || { 
                      name: gameId, 
                      genre: "Gamer", 
                      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80" 
                    }
                    return (
                      <div key={idx} className="rounded-lg overflow-hidden border border-alura-border/70 bg-alura-surface2/60 group hover:border-alura-accent/50 transition-all shadow-xs">
                        <div className="h-12 w-full overflow-hidden relative">
                          <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-alura-surface2/90 via-transparent to-transparent" />
                        </div>
                        <div className="p-1.5">
                          <span className="text-[10.5px] font-bold text-white block truncate leading-tight" title={game.name}>{game.name}</span>
                          <span className="text-[9.5px] text-alura-accent font-semibold block truncate mt-0.5">{game.genre}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-alura-textMuted italic">Nenhum jogo favorito compartilhado.</p>
              )}
            </div>

            {/* Hobbies & Interesses do Perfil */}
            <div className="px-5 py-3 border-b border-alura-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-bold text-alura-textPrimary flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-alura-accent" />
                  Hobbies & Interesses
                </h3>
                {friendProfile.hobbies && friendProfile.hobbies.length > 0 && (
                  <span className="text-[10px] text-alura-accent font-mono bg-alura-surface2 px-1.5 py-0.5 rounded-full font-bold">
                    {friendProfile.hobbies.length}
                  </span>
                )}
              </div>
              {friendProfile.hobbies && friendProfile.hobbies.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {friendProfile.hobbies.slice(0, 4).map((hobbyId: string, idx: number) => {
                    const cleanId = String(hobbyId).toLowerCase()
                    const hobby = HOBBIES_DB.find(h => h.id.toLowerCase() === cleanId || h.name.toLowerCase() === cleanId) || { 
                      name: hobbyId, 
                      category: "Interesse", 
                      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" 
                    }
                    return (
                      <div key={idx} className="rounded-lg overflow-hidden border border-alura-border/70 bg-alura-surface2/60 group hover:border-alura-accent/50 transition-all shadow-xs">
                        <div className="h-11 w-full overflow-hidden relative">
                          <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-alura-surface2/90 via-transparent to-transparent" />
                        </div>
                        <div className="p-1.5">
                          <span className="text-[10.5px] font-bold text-white block truncate leading-tight" title={hobby.name}>{hobby.name}</span>
                          <span className="text-[9.5px] text-alura-textMuted block truncate mt-0.5">{hobby.category}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-alura-textMuted italic">Nenhum hobby compartilhado.</p>
              )}
            </div>

            {/* Links e Redes Conectadas do Perfil */}
            {(() => {
              const activeConns = getActiveConnections(friendProfile.social_links)

              return (
                <div className="px-6 py-4 border-b border-alura-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-bold text-alura-textPrimary flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-alura-accent" />
                      Links & Redes Sociais
                    </h3>
                    {activeConns.length > 0 && (
                      <span className="text-[10px] font-bold text-alura-accent bg-alura-accent/10 px-2 py-0.5 rounded-full border border-alura-accent/20">
                        {activeConns.length} ativas
                      </span>
                    )}
                  </div>
                  {activeConns.length > 0 ? (
                    <div className="space-y-2">
                      {activeConns.map((link) => {
                        const display = link.getDisplay ? link.getDisplay(link.value) : link.value
                        const url = link.getUrl ? link.getUrl(link.value) : null

                        if (link.isCopyOnly || !url) {
                          return (
                            <div 
                              key={link.id}
                              onClick={() => {
                                navigator.clipboard.writeText(display)
                                showToast({
                                  type: "success",
                                  title: "Copiado!",
                                  message: `${link.label} (${display}) copiado para a área de transferência.`
                                })
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-alura-surface2/50 border border-alura-border/60 hover:border-alura-border hover:bg-alura-surface2 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div 
                                  className="w-7 h-7 rounded-lg bg-alura-surface3 flex items-center justify-center shrink-0 border border-alura-border/60"
                                  style={{ color: link.color }}
                                >
                                  <ConnectionIcon id={link.id} className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[12px] font-semibold text-white leading-tight">{link.label}</span>
                                  <span className="text-[10px] text-alura-textSecondary truncate leading-tight mt-0.5">{display}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-alura-textMuted group-hover:text-alura-accent transition-colors font-medium shrink-0">Copiar</span>
                            </div>
                          )
                        }

                        return (
                          <a 
                            key={link.id}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-alura-surface2/50 border border-alura-border/60 hover:border-alura-border hover:bg-alura-surface2 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div 
                                className="w-7 h-7 rounded-lg bg-alura-surface3 flex items-center justify-center shrink-0 border border-alura-border/60"
                                style={{ color: link.color }}
                              >
                                <ConnectionIcon id={link.id} className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[12px] font-semibold text-white leading-tight">{link.label}</span>
                                <span className="text-[10px] text-alura-textSecondary truncate leading-tight mt-0.5">{display}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-alura-textDisabled group-hover:text-alura-accent transition-colors shrink-0" />
                          </a>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-[12px] text-alura-textMuted italic">Nenhum link compartilhado.</p>
                  )}
                </div>
              )
            })()}

            <div className="px-6 py-4">
              <h3 className="text-[13px] font-bold text-alura-textPrimary mb-3">Em um servidor</h3>
              <p className="text-[12px] text-alura-textMuted italic">Nenhum servidor em comum.</p>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-alura-textMuted">
            <div className="w-16 h-16 rounded-full border-4 border-alura-border border-t-alura-accent animate-spin" />
          </div>
        )}
      </div>

      {/* Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-alura-surface2 border border-alura-border rounded-xl w-full max-w-sm flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="mb-6">
                <img src={erroImage} alt="Atenção" className="w-32 h-32 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Atenção</h3>
              <p className="text-alura-textSecondary text-sm leading-relaxed">
                {alertMessage}
              </p>
            </div>
            <div className="p-4 border-t border-alura-border flex justify-center bg-alura-surface1 rounded-b-xl">
              <button 
                onClick={() => setAlertMessage(null)}
                className="px-6 py-2 bg-alura-accent text-[#0B0D0F] font-bold rounded-[8px] hover:brightness-110 transition-colors shadow-[0_0_15px_rgba(57,255,136,0.2)]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
