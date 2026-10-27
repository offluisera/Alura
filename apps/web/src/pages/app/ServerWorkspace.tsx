import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import {
  Hash,
  Volume2,
  Send,
  Smile,
  Image as ImageIcon,
  Users,
  Pin,
  PinOff,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Crown,
  LogOut,
  Share2,
  Check,
  Mic,
  MicOff,
  Headphones,
  Monitor,
  MonitorOff,
  Video,
  PhoneOff,
  Shield,
  CheckCircle2,
  Sparkles,
  Paperclip,
  Radio,
  Settings,
  CornerUpLeft,
  Trash2,
  MoreHorizontal,
  UserMinus,
  Ban,
  ShieldAlert,
  Music2,
  PanelLeftClose,
  PanelLeft,
  AtSign,
  Maximize2,
  Minimize2,
  Scaling,
  BarChart2,
  FileUp,
  MessageSquarePlus,
  Play,
  EyeOff,
} from 'lucide-react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { supabase } from '../../lib/supabase'
import { usePinnedServers } from '../../lib/hooks/usePinnedServers'
import { useCall } from '../../contexts/CallContext'
import { usePresence } from '../../contexts/PresenceContext'
import { useNotification } from '../../contexts/NotificationContext'
import { compressImageToWebp } from '../../lib/utils/imageOptimizer'
import { SoundService } from '../../lib/services/SoundService'
import { CleanvoiceService } from '../../lib/services/CleanvoiceService'
import { ServerSettingsModal } from '../../components/servers/ServerSettingsModal'
import { UserProfileHoverCard } from '../../components/shared/UserProfileHoverCard'
import { MentionAutocomplete } from '../../components/servers/MentionAutocomplete'
import type { MentionItem } from '../../components/servers/MentionAutocomplete'
import { ServerSoundboardPanel } from '../../components/servers/ServerSoundboardPanel'
import { MyInstantsService } from '../../lib/services/MyInstantsService'
import { CreatePollModal, type PollData } from '../../components/chat/CreatePollModal'
import { GifPickerPopover } from '../../components/chat/GifPickerPopover'
import { ScreenShareModal } from '../../components/call/ScreenShareModal'
import { ImageLightboxModal } from '../../components/common/ImageLightboxModal'
import { MessageContextMenu } from '../../components/common/MessageContextMenu'

interface Space {
  id: string
  server_id: string
  name: string
  position: number
}

interface Room {
  id: string
  space_id: string | null
  server_id: string
  name: string
  description?: string | null
  type: 'text' | 'voice' | 'video' | 'forum' | 'announcements' | 'media'
  position: number
}

interface ServerDetails {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  banner_url: string | null
  owner_id: string
  category: string
  tags: string[]
  is_verified: boolean
  member_count: number
  online_count: number
}

interface RoleItem {
  id: string
  name: string
  color: string | null
  position: number
  is_hoisted?: boolean
  permissions?: Record<string, boolean>
}

interface ServerMember {
  user_id: string
  nickname: string | null
  joined_at: string
  profile?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    status: string | null
    bio?: string | null
  }
  roles?: RoleItem[]
  topRoleName?: string
  topRoleColor?: string
}

interface VoiceParticipant {
  id: string
  name: string
  avatar?: string | null
  isMuted?: boolean
  isDeafened?: boolean
}

interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  reply_to_id?: string | null
  reply_message?: {
    id: string
    user_id?: string
    content: string
    profiles?: {
      username?: string
      display_name?: string | null
    }
  } | null
  created_at: string
  is_deleted?: boolean
  profiles?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  attachments?: {
    id: string
    url: string
    file_type: string
  }[]
}

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀']

function RemoteVideoView({
  stream,
  className,
  onDoubleClick,
}: {
  stream: MediaStream
  className?: string
  onDoubleClick?: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = videoRef.current
    if (el && stream) {
      if (el.srcObject !== stream) {
        el.srcObject = stream
      }
      el.muted = true
      const playVideo = () => {
        if (el && el.paused) {
          el.play().catch(() => {})
        }
      }
      playVideo()

      const vt = stream.getVideoTracks()[0]
      if (vt) {
        vt.enabled = true
        const handleUnmute = () => playVideo()
        vt.addEventListener('unmute', handleUnmute)
        return () => {
          vt.removeEventListener('unmute', handleUnmute)
        }
      }
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      onDoubleClick={onDoubleClick}
      onLoadedMetadata={(e) => {
        const vid = e.currentTarget
        vid.muted = true
        vid.play().catch(() => {})
      }}
      className={className || "w-full h-full object-contain cursor-pointer"}
    />
  )
}

export function ServerWorkspace() {
  const { serverId, roomId } = useParams<{ serverId: string; roomId?: string }>()
  const navigate = useNavigate()
  const { user, profile } = useOutletContext<{ user: any; profile: any }>()
  const { showToast } = useNotification()
  const { isPinned, togglePin } = usePinnedServers(user?.id)

  const { getUserStatus, getStatusColor, getStatusBadgeText } = usePresence()

  // Voice call context (persistente globalmente no CallProvider)
  const {
    callState,
    isMuted,
    isDeafened: isGlobalDeafened,
    isCameraOn,
    isSharingScreen,
    toggleMute,
    toggleDeafen: toggleGlobalDeafen,
    toggleCamera: toggleGlobalCamera,
    startScreenShareWithSource,
    stopScreenShare: stopGlobalScreenShare,
    hangUp,
    serverVoice,
  } = useCall()

  // Estados principais do Servidor
  const [server, setServer] = useState<ServerDetails | null>(null)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<ServerMember[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({
    manage_server: false,
    manage_roles: false,
    manage_rooms: false,
    manage_members: false,
    ban_member: false,
    mute_members: false,
    delete_message: false,
    mention_everyone: false,
  })
  const [loading, setLoading] = useState(true)

  // Mensagens da sala ativa
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [showMembersSidebar, setShowMembersSidebar] = useState(true)
  const [showServerMenu, setShowServerMenu] = useState(false)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomType, setNewRoomType] = useState<'text' | 'voice'>('text')
  const [newRoomSpaceId, setNewRoomSpaceId] = useState<string>('')
  const [collapsedSpaces, setCollapsedSpaces] = useState<Record<string, boolean>>({})

  // Respostas e Reações
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number; users: string[] }[]>>({})
  const [reactionPickerForMsgId, setReactionPickerForMsgId] = useState<string | null>(null)

  // Menu de contexto de membro
  const [activeMemberMenuId, setActiveMemberMenuId] = useState<string | null>(null)

  // Modo de Simulação de Permissões de Cargo para o Dono
  const [isSimulatingMemberView, setIsSimulatingMemberView] = useState(false)

  // Sistema de Autocomplete de Menções
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)

  // Voz conectada no CallContext global (não cai ao navegar para outras abas!)
  const connectedVoiceRoomId = serverVoice.connectedRoomId
  const voiceParticipants = serverVoice.voiceParticipants
  const localAudioStream = serverVoice.localAudioStream
  const localCameraStream = serverVoice.localCameraStream
  const localScreenStream = serverVoice.localScreenStream
  const remoteScreenStreams = serverVoice.remoteScreenStreams
  const isLocalAudioMuted = serverVoice.isLocalAudioMuted
  const isDeafened = serverVoice.isDeafened
  const isLocalSpeaking = serverVoice.isLocalSpeaking
  const remoteSpeakingUsers = serverVoice.remoteSpeakingUsers
  const voiceNoiseFilter = serverVoice.voiceNoiseFilter
  const setVoiceNoiseFilter = serverVoice.setVoiceNoiseFilter

  // Participante cuja tela estamos assistindo no palco
  const [watchingParticipantId, setWatchingParticipantId] = useState<string | null>(null)
  const [isServerStreamFullscreen, setIsServerStreamFullscreen] = useState(false)
  const [serverStreamFit, setServerStreamFit] = useState<'contain' | 'cover'>('contain')
  const serverStreamContainerRef = useRef<HTMLDivElement>(null)

  const [isLocalStreamFullscreen, setIsLocalStreamFullscreen] = useState(false)
  const [localStreamFit, setLocalStreamFit] = useState<'contain' | 'cover'>('contain')
  const localStreamContainerRef = useRef<HTMLDivElement>(null)

  const toggleServerStreamFullscreen = () => {
    const el = serverStreamContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsServerStreamFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsServerStreamFullscreen(false)
    }
  }

  const toggleLocalStreamFullscreen = () => {
    const el = localStreamContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsLocalStreamFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsLocalStreamFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      const fsEl = document.fullscreenElement
      setIsServerStreamFullscreen(fsEl === serverStreamContainerRef.current)
      setIsLocalStreamFullscreen(fsEl === localStreamContainerRef.current)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Sincroniza o servidor que estamos visualizando com o hook de voz global
  useEffect(() => {
    serverVoice.setViewingServerId(serverId || null)
  }, [serverId, serverVoice])

  // Solicita a transmissão sob demanda via WebRTC caso ainda não tenhamos recebido o stream
  useEffect(() => {
    if (watchingParticipantId) {
      serverVoice.setWatchedStreamer?.(watchingParticipantId)
      if (!remoteScreenStreams?.has(watchingParticipantId)) {
        serverVoice.requestScreenStream(watchingParticipantId)
        const timer = setTimeout(() => {
          if (watchingParticipantId && !remoteScreenStreams?.has(watchingParticipantId)) {
            serverVoice.requestScreenStream(watchingParticipantId)
          }
        }, 1500)
        return () => clearTimeout(timer)
      }
    } else {
      serverVoice.setWatchedStreamer?.(null)
    }
  }, [watchingParticipantId, remoteScreenStreams, serverVoice])

  // Fecha o modo de visualização caso o apresentador pare de transmitir
  useEffect(() => {
    if (watchingParticipantId && activeRoom) {
      const participants = voiceParticipants[activeRoom.id] || []
      const streamer = participants.find((p) => p.id === watchingParticipantId)
      const hasStream = remoteScreenStreams?.has(watchingParticipantId)
      if (streamer && !streamer.isSharingScreen && !hasStream) {
        setWatchingParticipantId(null)
      }
    }
  }, [watchingParticipantId, voiceParticipants, activeRoom, remoteScreenStreams])

  // Se desconectou da voz enquanto visualizava o canal de voz, redireciona para o canal de texto padrão
  useEffect(() => {
    if (activeRoom?.type === 'voice' && !connectedVoiceRoomId) {
      const firstTextRoom = rooms.find((r) => r.type === 'text') || rooms[0]
      if (firstTextRoom && serverId) {
        setActiveRoom(firstTextRoom)
        navigate(`/servers/${serverId}/${firstTextRoom.id}`, { replace: true })
      }
    }
  }, [activeRoom?.type, connectedVoiceRoomId, rooms, serverId, navigate])

  // Escuta evento global de servidor deletado para redirecionar se o usuário estiver neste servidor
  useEffect(() => {
    const handleGlobalServerDeleted = (e: any) => {
      const deletedId = e.detail?.serverId
      if (deletedId && deletedId === serverId) {
        showToast({
          type: 'warning',
          title: 'Servidor encerrado',
          message: 'Este servidor foi excluído ou você não faz mais parte dele.',
        })
        if (connectedVoiceRoomId) {
          hangUp()
        }
        navigate('/servers', { replace: true })
      }
    }

    window.addEventListener('alura:server_deleted' as any, handleGlobalServerDeleted)
    return () => {
      window.removeEventListener('alura:server_deleted' as any, handleGlobalServerDeleted)
    }
  }, [serverId, connectedVoiceRoomId, hangUp, navigate, showToast])

  // UI local do palco
  const [isVoiceChannelsCollapsed, setIsVoiceChannelsCollapsed] = useState(false)
  const [isVoiceMinimized, setIsVoiceMinimized] = useState(false)
  const [showSoundboard, setShowSoundboard] = useState(false)
  const [showNoiseFilterMenu, setShowNoiseFilterMenu] = useState(false)

  // Menus do Chat: Dropdown +, Enquetes e GIFs
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [showPollModal, setShowPollModal] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)

  // Compartilhamento de tela Desktop (Electron)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const serverMenuRef = useRef<HTMLDivElement>(null)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const gifPickerAnchorRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localScreenRef = useRef<HTMLVideoElement>(null)

  // Lightbox de Imagem em Tela Cheia e Menu de Contexto (Botão Direito)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name?: string } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    message: Message | null
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    message: null,
  })

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serverMenuRef.current && !serverMenuRef.current.contains(e.target as Node)) {
        setShowServerMenu(false)
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false)
      }
      if (gifPickerAnchorRef.current && !gifPickerAnchorRef.current.contains(e.target as Node)) {
        setShowGifPicker(false)
      }
      if (reactionPickerForMsgId && !(e.target as Element).closest('.reaction-picker-container')) {
        setReactionPickerForMsgId(null)
      }
      if (activeMemberMenuId && !(e.target as Element).closest('.member-context-menu')) {
        setActiveMemberMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showServerMenu, reactionPickerForMsgId, activeMemberMenuId, showPlusMenu, showGifPicker])

  // Auto-focus no chat ao mudar de canal
  useEffect(() => {
    messageInputRef.current?.focus()
  }, [activeRoom?.id])

  // Listener global de digitação: foca automaticamente na chatbox do canal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isEditing =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      if (isEditing) return

      if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Escape' || e.key === 'Tab') return

      if (e.key.length === 1 && !lightboxImage && !contextMenu.isOpen && !showSettingsModal && !showPollModal) {
        messageInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [lightboxImage, contextMenu.isOpen, showSettingsModal, showPollModal])

  // Captura Ctrl+V (colar imagens da área de transferência)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          const renamed = new File([file], `imagem-colada-${Date.now()}.png`, { type: file.type })
          imageFiles.push(renamed)
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault()
      setAttachments((prev) => [...prev, ...imageFiles])
      showToast({
        type: 'info',
        title: 'Imagem Colada',
        message: `${imageFiles.length} imagem(ns) adicionada(s) aos anexos do canal.`,
      })
    }
  }

  // Deletar mensagem do canal
  const handleDeleteServerMessage = async (msgId: string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', msgId)
      if (error) throw error
      setMessages((prev) => prev.filter((m) => m.id !== msgId))
      showToast({ type: 'success', title: 'Mensagem Apagada', message: 'A mensagem foi excluída.' })
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao excluir', message: err.message })
    }
  }

  // Conecta streams de vídeo e tela aos respectivos elementos <video>
  useEffect(() => {
    if (localVideoRef.current && localCameraStream) {
      localVideoRef.current.srcObject = localCameraStream
    }
  }, [localCameraStream])

  useEffect(() => {
    if (localScreenRef.current && localScreenStream) {
      localScreenRef.current.srcObject = localScreenStream
    }
  }, [localScreenStream])

  // 1. Carrega dados do Servidor, Espaços, Salas, Cargos e Membros
  const loadServerData = useCallback(async (silent = false) => {
    if (!serverId) return
    if (!silent) setLoading(true)

    try {
      // 1.1 Busca servidor
      const { data: serverData, error: serverErr } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single()

      if (serverErr || !serverData) {
        showToast({ type: 'error', title: 'Servidor não encontrado', message: 'Este servidor não existe ou foi removido.' })
        window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId } }))
        if (connectedVoiceRoomId) {
          hangUp()
        }
        navigate('/servers', { replace: true })
        return
      }

      setServer(serverData)
      const isOwnerUser = serverData.owner_id === user?.id

      // 1.2 Garante que o usuário atual seja membro da comunidade
      if (user?.id) {
        const { data: memberData } = await supabase
          .from('server_members')
          .select('server_id')
          .eq('server_id', serverId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (!memberData) {
          await supabase.from('server_members').insert({
            server_id: serverId,
            user_id: user.id,
          })
        }
      }

      // 1.3 Busca cargos da comunidade
      const { data: rolesData } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          color,
          position,
          is_hoisted,
          role_permissions (
            manage_server,
            manage_roles,
            manage_rooms,
            manage_members,
            ban_member,
            mute_members,
            deafen_members,
            move_members,
            send_message,
            delete_message,
            mention_everyone,
            connect_voice,
            speak,
            video,
            screen_share,
            use_soundboard,
            read_message_history,
            attach_files,
            create_polls,
            send_gifs,
            create_threads
          )
        `)
        .eq('server_id', serverId)
        .order('position', { ascending: false })

      const mappedRoles: RoleItem[] = (rolesData || []).map((r: any) => {
        const rawPerms = Array.isArray(r.role_permissions) ? r.role_permissions[0] : r.role_permissions
        return {
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position,
          is_hoisted: r.is_hoisted ?? false,
          permissions: rawPerms || {},
        }
      })
      setRoles(mappedRoles)

      // 1.4 Busca atribuições de cargos (member_roles)
      const { data: memberRolesData } = await supabase
        .from('member_roles')
        .select('user_id, role_id')
        .eq('server_id', serverId)

      // 1.5 Calcula permissões consolidadas do usuário com herança real de @everyone e cargos
      const myRoleIds = (memberRolesData || [])
        .filter((mr: any) => mr.user_id === user?.id)
        .map((mr: any) => mr.role_id)

      const myRoles = mappedRoles.filter((r) => myRoleIds.includes(r.id))
      // Cargo base (@everyone)
      const everyoneRole = mappedRoles.find((r) => r.name.toLowerCase() === '@everyone' || r.name.toLowerCase() === 'everyone')

      const consolidated: Record<string, boolean> = {
        manage_server: false,
        manage_roles: false,
        manage_rooms: false,
        manage_members: false,
        ban_member: false,
        mute_members: false,
        deafen_members: false,
        move_members: false,
        delete_message: false,
        mention_everyone: false,
        connect_voice: true,
        speak: true,
        video: true,
        screen_share: true,
        use_soundboard: true,
        send_message: true,
        read_message_history: true,
        attach_files: true,
        create_polls: true,
        send_gifs: true,
        create_threads: true,
      }

      // Aplica permissões do cargo everyone se existir
      if (everyoneRole?.permissions) {
        Object.keys(everyoneRole.permissions).forEach((k) => {
          if (typeof everyoneRole.permissions![k] === 'boolean') {
            consolidated[k] = everyoneRole.permissions![k]
          }
        })
      }

      // Aplica permissões dos cargos atribuídos (respeita proibições e concessões)
      if (myRoles.length > 0) {
        myRoles.forEach((r) => {
          if (r.permissions) {
            Object.keys(r.permissions).forEach((k) => {
              const val = r.permissions![k]
              if (typeof val === 'boolean') {
                if (val === true) {
                  consolidated[k] = true
                } else if (val === false) {
                  // Se o cargo restringe explicitamente e nenhum outro cargo atribuído concede true
                  if (!myRoles.some((other) => other.id !== r.id && other.permissions?.[k] === true)) {
                    consolidated[k] = false
                  }
                }
              }
            })
          }
        })
      }

      setUserPermissions(consolidated)

      // 1.6 Busca espaços
      let { data: spacesData } = await supabase
        .from('spaces')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true })

      // 1.7 Busca salas
      let { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true })

      // Auto-inicialização de canais se vazio
      if (!spacesData || spacesData.length === 0) {
        const { data: createdSpace } = await supabase
          .from('spaces')
          .insert({
            server_id: serverId,
            name: 'Canais da Comunidade',
            position: 0,
          })
          .select()
          .single()

        if (createdSpace) {
          spacesData = [createdSpace]

          const { data: createdRooms } = await supabase
            .from('rooms')
            .insert([
              {
                server_id: serverId,
                space_id: createdSpace.id,
                name: 'boas-vindas',
                description: 'Apresentações e regras da comunidade',
                type: 'text',
                position: 0,
              },
              {
                server_id: serverId,
                space_id: createdSpace.id,
                name: 'geral',
                description: 'Bate-papo livre entre membros',
                type: 'text',
                position: 1,
              },
              {
                server_id: serverId,
                space_id: createdSpace.id,
                name: 'Voz Geral',
                description: 'Canal de voz e transmissão ao vivo',
                type: 'voice',
                position: 2,
              },
            ])
            .select()

          if (createdRooms) {
            roomsData = createdRooms
          }
        }
      }

      setSpaces(spacesData || [])
      setRooms(roomsData || [])

      // Define sala ativa
      if (roomsData && roomsData.length > 0) {
        const target = roomId
          ? roomsData.find((r) => r.id === roomId)
          : roomsData.find((r) => r.type === 'text') || roomsData[0]
        setActiveRoom(target || roomsData[0])
      }

      // 1.8 Busca membros do servidor com seus perfis e cargos associados
      const { data: membersData } = await supabase
        .from('server_members')
        .select(`
          user_id,
          nickname,
          joined_at,
          profiles (
            id,
            username,
            display_name,
            avatar_url,
            status
          )
        `)
        .eq('server_id', serverId)

      if (membersData) {
        const mappedMembers: ServerMember[] = membersData.map((m: any) => {
          const userRoleIds = (memberRolesData || [])
            .filter((mr: any) => mr.user_id === m.user_id)
            .map((mr: any) => mr.role_id)

          const userAssignedRoles = mappedRoles.filter((r) => userRoleIds.includes(r.id))
          const topRole = userAssignedRoles.length > 0 ? userAssignedRoles[0] : null

          return {
            user_id: m.user_id,
            nickname: m.nickname,
            joined_at: m.joined_at,
            profile: m.profiles,
            roles: userAssignedRoles,
            topRoleName: topRole?.name,
            topRoleColor: topRole?.color || undefined,
          }
        })
        setMembers(mappedMembers)
      }
    } catch (err) {
      console.error('[ServerWorkspace] Erro ao carregar workspace do servidor:', err)
    } finally {
      setLoading(false)
    }
  }, [serverId, roomId, user?.id, navigate, showToast])

  useEffect(() => {
    loadServerData()
  }, [loadServerData])

  // 2. Carrega mensagens com fallback seguro
  const loadMessages = useCallback(async () => {
    if (!activeRoom || activeRoom.type === 'voice') {
      setMessages([])
      setReactions({})
      return
    }

    try {
      let { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          room_id,
          user_id,
          content,
          reply_to_id,
          created_at,
          is_deleted,
          profiles (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('room_id', activeRoom.id)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        console.warn('[ServerWorkspace] Fallback para select básico de mensagens:', error)
        const fb = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', activeRoom.id)
          .order('created_at', { ascending: true })
          .limit(100)
        data = fb.data as any
      }

      if (data) {
        // Encontra mensagens citadas para criar vínculo visual
        const messagesMap = new Map<string, any>()
        data.forEach((m: any) => messagesMap.set(m.id, m))

        const enrichedMessages: ChatMessage[] = data.map((m: any) => {
          let replyMsg = null
          if (m.reply_to_id && messagesMap.has(m.reply_to_id)) {
            const original = messagesMap.get(m.reply_to_id)
            const origMember = members.find((mb) => mb.user_id === original.user_id)?.profile
            replyMsg = {
              id: original.id,
              user_id: original.user_id,
              content: original.content,
              profiles: {
                username: original.profiles?.username || origMember?.username || (original.user_id === user?.id ? profile?.username : undefined) || 'usuario',
                display_name: original.profiles?.display_name || origMember?.display_name || 'Usuário',
              },
            }
          }

          let authorProfile = m.profiles
          if (!authorProfile) {
            const foundMember = members.find((mb) => mb.user_id === m.user_id)
            authorProfile = foundMember?.profile || {
              id: m.user_id,
              username: 'usuario',
              display_name: 'Usuário',
              avatar_url: null,
            }
          }

          return {
            ...m,
            profiles: authorProfile,
            reply_message: replyMsg,
          }
        })

        setMessages(enrichedMessages)

        // Busca reações de todas as mensagens
        const messageIds = data.map((m: any) => m.id)
        if (messageIds.length > 0) {
          const { data: reactionsData } = await supabase
            .from('message_reactions')
            .select('message_id, user_id, emoji')
            .in('message_id', messageIds)

          const aggregated: Record<string, { emoji: string; count: number; users: string[] }[]> = {}
          ;(reactionsData || []).forEach((r: any) => {
            if (!aggregated[r.message_id]) aggregated[r.message_id] = []
            const existing = aggregated[r.message_id].find((x) => x.emoji === r.emoji)
            if (existing) {
              existing.count += 1
              existing.users.push(r.user_id)
            } else {
              aggregated[r.message_id].push({
                emoji: r.emoji,
                count: 1,
                users: [r.user_id],
              })
            }
          })
          setReactions(aggregated)
        }
      }
    } catch (err) {
      console.warn('[ServerWorkspace] Erro ao buscar mensagens:', err)
    }
  }, [activeRoom, members])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // 3. Inscrição em Tempo Real para Mensagens e Reações
  useEffect(() => {
    if (!activeRoom || activeRoom.type === 'voice') return

    const messagesChannel = supabase
      .channel(`server_room_${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoom.id}`,
        },
        async (payload) => {
          // Busca o profile do autor da nova mensagem
          const { data: prof } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          let replySnippet = null
          if (payload.new.reply_to_id) {
            const { data: original } = await supabase
              .from('messages')
              .select('id, user_id, content, profiles(username, display_name)')
              .eq('id', payload.new.reply_to_id)
              .single()

            if (original) {
              const origMember = members.find((mb) => mb.user_id === original.user_id)?.profile
              replySnippet = {
                id: original.id,
                user_id: original.user_id,
                content: original.content,
                profiles: {
                  username: (original as any).profiles?.username || origMember?.username || (original.user_id === user?.id ? profile?.username : undefined) || 'usuario',
                  display_name: (original as any).profiles?.display_name || origMember?.display_name || 'Usuário',
                },
              }
            }
          }

          const msgWithProfile: ChatMessage = {
            ...payload.new,
            profiles: prof || undefined,
            reply_message: replySnippet,
          } as any

          setMessages((prev) => {
            // Se já foi inserida de forma otimista, atualiza id
            if (prev.some((m) => m.id === msgWithProfile.id)) return prev
            // Se tem uma mensagem temporária equivalente recente do próprio usuário, ignora
            const isSelfDuplicate = prev.some(
              (m) =>
                m.user_id === msgWithProfile.user_id &&
                m.content === msgWithProfile.content &&
                m.id.startsWith('temp_')
            )
            if (isSelfDuplicate) {
              return prev.map((m) =>
                m.user_id === msgWithProfile.user_id &&
                m.content === msgWithProfile.content &&
                m.id.startsWith('temp_')
                  ? msgWithProfile
                  : m
              )
            }
            return [...prev, msgWithProfile]
          })

          if (payload.new.user_id !== user?.id) {
            const content = (payload.new.content || '').toLowerCase()
            const myHandle = profile?.username ? `@${profile.username.toLowerCase()}` : null
            const isMentioned =
              (myHandle && content.includes(myHandle)) ||
              content.includes('@everyone') ||
              content.includes('@here') ||
              content.includes('@notificar')

            if (isMentioned) {
              SoundService.play('mention')
              showToast({
                type: 'info',
                title: 'Você foi mencionado!',
                message: `${prof?.display_name || prof?.username || 'Alguém'}: ${payload.new.content?.slice(0, 70)}`,
              })
            } else {
              SoundService.play('messageReceived')
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoom.id}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    // Canal para reações em tempo real
    const reactionsChannel = supabase
      .channel(`server_reactions_${activeRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(reactionsChannel)
    }
  }, [activeRoom, user?.id, loadMessages])

  // Scroll automático ao receber nova mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4. Envio de mensagem de texto com Atualização OTIMISTA (0ms)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && attachments.length === 0) || !activeRoom || !user?.id || isSending) return

    setIsSending(true)
    const contentToSend = newMessage.trim()
    const filesToSend = [...attachments]
    const currentReplyId = replyingTo?.id || null

    setNewMessage('')
    setAttachments([])
    setReplyingTo(null)
    setShowEmojiPicker(false)

    // Inserção Otimista Imediata
    const tempId = `temp_${Date.now()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: activeRoom.id,
      user_id: user.id,
      content: contentToSend,
      reply_to_id: currentReplyId,
      reply_message: replyingTo
        ? {
            id: replyingTo.id,
            user_id: replyingTo.user_id,
            content: replyingTo.content,
            profiles: replyingTo.profiles || {
              username: members.find((mb) => mb.user_id === replyingTo.user_id)?.profile?.username || 'usuario',
              display_name: members.find((mb) => mb.user_id === replyingTo.user_id)?.profile?.display_name || 'Usuário',
            },
          }
        : null,
      created_at: new Date().toISOString(),
      profiles: profile || {
        id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'você',
        display_name: profile?.display_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url,
      },
      attachments: [],
    }

    setMessages((prev) => [...prev, optimisticMessage])
    SoundService.play('messageSent')

    try {
      const insertPayload: any = {
        room_id: activeRoom.id,
        user_id: user.id,
        content: contentToSend || null,
      }
      if (currentReplyId) {
        insertPayload.reply_to_id = currentReplyId
      }

      const { data: msgData, error: msgErr } = await supabase
        .from('messages')
        .insert(insertPayload)
        .select()
        .maybeSingle()

      if (msgErr) {
        console.error('[ServerWorkspace] Erro ao gravar mensagem:', msgErr)
        showToast({
          type: 'error',
          title: 'Erro ao enviar',
          message: msgErr.message || 'Falha ao salvar mensagem.',
        })
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        return
      }

      if (msgData) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: msgData.id } : m))
        )
      }

      // Upload de anexos se houver
      if (filesToSend.length > 0 && msgData) {
        for (const file of filesToSend) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`
          const filePath = `server_attachments/${activeRoom.id}/${fileName}`

          const { error: uploadErr } = await supabase.storage
            .from('chat-attachments')
            .upload(filePath, file, { contentType: file.type })

          if (!uploadErr) {
            const { data: pubData } = supabase.storage.from('chat-attachments').getPublicUrl(filePath)
            if (pubData?.publicUrl) {
              await supabase.from('message_attachments').insert({
                message_id: msgData.id,
                url: pubData.publicUrl,
                file_type: file.type,
                size_bytes: file.size,
              })
            }
          }
        }
      }
    } catch (err) {
      console.error('[ServerWorkspace] Exceção ao enviar mensagem:', err)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setIsSending(false)
      setTimeout(() => {
        messageInputRef.current?.focus()
      }, 20)
    }
  }

  const NOISE_FILTER_MODES = [
    { id: 'cleanvoice', name: 'Cleanvoice DSP', desc: 'Filtro Alura com HighPass, Notch 60Hz e Noise Gate', badge: 'Recomendado' },
    { id: 'krisp', name: 'Krisp Studio', desc: 'Redução avançada de eco e ruído de fundo' },
    { id: 'standard', name: 'Padrão do Sistema', desc: 'Processamento nativo do navegador/Chromium' },
    { id: 'passthrough', name: 'Externo / Passthrough', desc: 'Ideal para Krisp Desktop, Elgato Wavelink ou RTX Voice' },
    { id: 'off', name: 'Desativado', desc: 'Sem nenhum filtro ou redução de ruído' },
  ]

  // 4. Módulo de Redução de Ruído DSP
  const handleChangeNoiseFilter = (filterId: string) => {
    setShowNoiseFilterMenu(false)
    serverVoice.changeNoiseFilter(filterId)
    const activeObj = NOISE_FILTER_MODES.find((m) => m.id === filterId)
    showToast({
      type: 'success',
      title: 'Módulo de Ruído Atualizado',
      message: `Modo ativo: ${activeObj?.name || filterId}`,
    })
  }

  // 5. Entrar / Sair da Sala de Voz integrado globalmente no CallContext (não cai ao navegar)
  const handleJoinVoiceRoom = async (room: Room) => {
    setActiveRoom(room)
    setIsVoiceMinimized(false)
    if (server) {
      await serverVoice.joinVoiceRoom(server, room)
    }
    if (serverId) {
      navigate(`/servers/${serverId}/${room.id}`, { replace: true })
    }
  }

  const handleLeaveVoiceRoom = () => {
    serverVoice.leaveVoiceRoom()
    setIsVoiceMinimized(false)
    setWatchingParticipantId(null)
    const firstTextRoom = rooms.find((r) => r.type === 'text') || rooms[0]
    if (firstTextRoom && serverId) {
      setActiveRoom(firstTextRoom)
      navigate(`/servers/${serverId}/${firstTextRoom.id}`, { replace: true })
    }
  }

  const handleToggleAudioMute = () => serverVoice.toggleAudioMute()
  const handleToggleDeafen = () => serverVoice.toggleDeafen()
  const handleToggleCamera = () => serverVoice.toggleCamera()

  const handleToggleScreenShare = async () => {
    if (localScreenStream) {
      serverVoice.stopScreenShare()
      showToast({ type: 'info', title: 'Transmissão encerrada' })
      return
    }
    // Abre o modal de seleção e qualidade tanto no Web quanto no Electron
    setShowScreenShareModal(true)
  }

  const handleStartScreenShare = (stream: MediaStream) => {
    serverVoice.startScreenShareWithStream(stream)
    showToast({ type: 'success', title: 'Transmitindo tela' })
  }

  // ── Agrupamento de Membros por Cargos 'is_hoisted' & Proprietário com Status Real (Online / Offline) ──
  const memberGroups = useMemo(() => {
    const hoistedRoles = roles.filter((r) => r.is_hoisted).sort((a, b) => b.position - a.position)
    const groups: {
      id: string
      name: string
      color?: string
      members: ServerMember[]
    }[] = []

    const assignedIds = new Set<string>()

    // Separação real de membros online e offline usando WebSocket presence do Supabase
    const onlineMembers = members.filter((m) => getUserStatus(m.profile) !== 'offline')
    const offlineMembers = members.filter((m) => getUserStatus(m.profile) === 'offline')

    // 1. Grupos de Cargos Hoisted (apenas membros online)
    hoistedRoles.forEach((role) => {
      const roleMembers = onlineMembers.filter((m) => {
        if (assignedIds.has(m.user_id)) return false
        const hasRole = m.roles?.some((r) => r.id === role.id)
        if (hasRole) {
          assignedIds.add(m.user_id)
          return true
        }
        return false
      })

      if (roleMembers.length > 0) {
        groups.push({
          id: role.id,
          name: role.name,
          color: role.color || undefined,
          members: roleMembers,
        })
      }
    })

    // 2. Grupo do Proprietário/Dono (se online e ainda não agrupado em cargo hoisted)
    const ownerMembers = onlineMembers.filter(
      (m) => server?.owner_id === m.user_id && !assignedIds.has(m.user_id)
    )
    if (ownerMembers.length > 0) {
      ownerMembers.forEach((m) => assignedIds.add(m.user_id))
      groups.push({
        id: 'owner-group',
        name: '👑 Dono',
        color: '#F59E0B',
        members: ownerMembers,
      })
    }

    // 3. Membros Online Restantes
    const remainingOnline = onlineMembers.filter((m) => !assignedIds.has(m.user_id))
    if (remainingOnline.length > 0) {
      groups.push({
        id: 'default-members',
        name: 'Online',
        color: undefined,
        members: remainingOnline,
      })
    }

    // 4. Seção OFFLINE clara no final com contagem
    if (offlineMembers.length > 0) {
      groups.push({
        id: 'offline-members',
        name: `Offline — ${offlineMembers.length}`,
        color: '#72767D',
        members: offlineMembers,
      })
    }

    return groups
  }, [roles, members, server?.owner_id, getUserStatus])

  const handleSelectDesktopSource = async (sourceId: string, withAudio: boolean) => {
    setShowScreenShareModal(false)
    try {
      let stream: MediaStream | null = null

      if (withAudio) {
        try {
          stream = await (navigator.mediaDevices as any).getUserMedia({
            audio: {
              mandatory: {
                chromeMediaSource: 'desktop',
              },
            },
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId,
              },
            },
          })
        } catch (audioErr) {
          console.warn('[ServerWorkspace] Captura de áudio desktop falhou, tentando sem áudio:', audioErr)
        }
      }

      if (!stream) {
        stream = await (navigator.mediaDevices as any).getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
            },
          },
        })
      }

      const track = stream.getVideoTracks()[0]
      if (track) {
        track.onended = () => {
          serverVoice.stopScreenShare()
          showToast({ type: 'info', title: 'Transmissão finalizada' })
        }
      }
      serverVoice.startScreenShareWithStream(stream)
      showToast({ type: 'success', title: 'Transmitindo aplicativo compartilhado' })
    } catch (err: any) {
      console.error('[ServerWorkspace] Erro ao capturar tela no Electron:', err)
      showToast({
        type: 'error',
        title: 'Falha ao compartilhar tela',
        message: err.message || 'Não foi possível capturar o aplicativo selecionado.',
      })
    }
  }

  // Handlers para GIFs e Enquetes
  const handleSendGif = async (gifUrl: string) => {
    if (!activeRoom || !user?.id || isSending) return
    if (!canSendGifs) {
      showToast({ type: 'warning', title: 'Permissão negada', message: 'Seu cargo não tem permissão para enviar GIFs.' })
      return
    }

    const tempId = `temp_${Date.now()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: activeRoom.id,
      user_id: user.id,
      content: gifUrl,
      reply_to_id: null,
      reply_message: null,
      created_at: new Date().toISOString(),
      profiles: profile || {
        id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'você',
        display_name: profile?.display_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url,
      },
      attachments: [],
    }

    setMessages((prev) => [...prev, optimisticMessage])
    SoundService.play('messageSent')

    try {
      const { data: msgData, error } = await supabase
        .from('messages')
        .insert({
          room_id: activeRoom.id,
          user_id: user.id,
          content: gifUrl,
        })
        .select()
        .maybeSingle()

      if (!error && msgData) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: msgData.id } : m))
        )
      }
    } catch (err) {
      console.error('[ServerWorkspace] Erro ao enviar GIF:', err)
    }
  }

  const handleCreatePoll = async (pollData: PollData) => {
    if (!activeRoom || !user?.id) return
    if (!canCreatePolls) {
      showToast({ type: 'warning', title: 'Permissão negada', message: 'Seu cargo não tem permissão para criar enquetes.' })
      return
    }

    const payloadContent = JSON.stringify({
      type: 'poll',
      question: pollData.question,
      options: pollData.options,
      allowMultiple: pollData.allowMultiple,
      durationDays: pollData.durationDays,
      createdAt: new Date().toISOString(),
      votes: {},
    })

    const tempId = `temp_${Date.now()}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: activeRoom.id,
      user_id: user.id,
      content: payloadContent,
      reply_to_id: null,
      reply_message: null,
      created_at: new Date().toISOString(),
      profiles: profile || {
        id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'você',
        display_name: profile?.display_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url,
      },
      attachments: [],
    }

    setMessages((prev) => [...prev, optimisticMessage])
    SoundService.play('messageSent')
    setShowPollModal(false)

    try {
      const { data: msgData, error } = await supabase
        .from('messages')
        .insert({
          room_id: activeRoom.id,
          user_id: user.id,
          content: payloadContent,
        })
        .select()
        .maybeSingle()

      if (!error && msgData) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: msgData.id } : m))
        )
        showToast({ type: 'success', title: 'Enquete criada com sucesso!' })
      }
    } catch (err) {
      console.error('[ServerWorkspace] Erro ao criar enquete:', err)
    }
  }

  const handleVotePoll = async (messageId: string, optionIndex: number) => {
    if (!user?.id) return
    const msg = messages.find((m) => m.id === messageId)
    if (!msg) return

    try {
      const pollData = JSON.parse(msg.content)
      if (pollData.type !== 'poll') return

      const votes = pollData.votes || {}
      const myId = user.id
      const allowMultiple = !!pollData.allowMultiple

      const currentVoters: string[] = votes[optionIndex] || []
      const alreadyVotedOption = currentVoters.includes(myId)

      if (alreadyVotedOption) {
        votes[optionIndex] = currentVoters.filter((id: string) => id !== myId)
      } else {
        if (!allowMultiple) {
          Object.keys(votes).forEach((optIdx) => {
            votes[optIdx] = (votes[optIdx] || []).filter((id: string) => id !== myId)
          })
        }
        votes[optionIndex] = [...currentVoters, myId]
      }

      pollData.votes = votes
      const newContent = JSON.stringify(pollData)

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
      )

      await supabase.from('messages').update({ content: newContent }).eq('id', messageId)
    } catch (err) {
      console.error('[ServerWorkspace] Erro ao votar na enquete:', err)
    }
  }

  const handlePlaySoundboard = (soundId: string, label: string, mp3Url: string, emoji?: string) => {
    if (voiceChannelRef.current) {
      voiceChannelRef.current.send({
        type: 'broadcast',
        event: 'soundboard',
        payload: {
          soundId,
          label,
          mp3Url,
          emoji,
          senderName: profile?.display_name || profile?.username || 'Você',
        },
      })
    }
  }

  // ── Handlers do Autocomplete de Menção (@) ──
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNewMessage(val)

    const cursorPos = e.target.selectionStart || val.length
    const textBeforeCursor = val.slice(0, cursorPos)
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_\u00C0-\u017F]*)$/)

    if (match) {
      setMentionQuery(match[1])
      setMentionIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  const handleSelectMention = (item: MentionItem) => {
    const cursorPos = messageInputRef.current?.selectionStart || newMessage.length
    const textBeforeCursor = newMessage.slice(0, cursorPos)
    const textAfterCursor = newMessage.slice(cursorPos)

    const replacedBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_\u00C0-\u017F]*)$/, `${item.tag} `)
    setNewMessage(replacedBefore + textAfterCursor)
    setMentionQuery(null)
    messageInputRef.current?.focus()
  }

  const renderFormattedContent = (content: string) => {
    if (!content) return null
    const parts = content.split(/(@[a-zA-Z0-9_\u00C0-\u017F]+)/g)

    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const cleanHandle = part.slice(1).toLowerCase()
        const matchedMember = members.find(
          (m) =>
            m.profile?.username?.toLowerCase() === cleanHandle ||
            m.profile?.display_name?.toLowerCase() === cleanHandle
        )
        const isSelf =
          profile?.username && cleanHandle === profile.username.toLowerCase()
        const isGlobal = part === '@everyone' || part === '@here' || part === '@notificar'

        const pill = (
          <span
            className={`px-1.5 py-0.5 mx-0.5 rounded font-bold text-xs inline-block transition-colors cursor-pointer ${
              isSelf || isGlobal
                ? 'bg-alura-accent/25 text-alura-accent border border-alura-accent/40 shadow-sm hover:bg-alura-accent/35'
                : 'bg-alura-surface2 text-alura-textPrimary border border-alura-border hover:border-alura-accent/50 hover:text-white'
            }`}
          >
            {part}
          </span>
        )

        if (matchedMember) {
          return (
            <UserProfileHoverCard
              key={i}
              userId={matchedMember.user_id}
              profile={matchedMember.profile}
              serverRoles={matchedMember.roles}
              isServerOwner={server?.owner_id === matchedMember.user_id}
              joinedServerAt={matchedMember.joined_at}
              canKick={canManageMembers && server?.owner_id !== matchedMember.user_id}
              onKick={(targetId) => handleKickMember(targetId)}
              canBan={canBanMembers && server?.owner_id !== matchedMember.user_id}
              onBan={(targetId) => handleBanMember(targetId)}
            >
              {pill}
            </UserProfileHoverCard>
          )
        }

        return <React.Fragment key={i}>{pill}</React.Fragment>
      }
      return <span key={i}>{part}</span>
    })
  }

  const renderMessageContent = (msg: ChatMessage) => {
    // 1. Enquete Interativa
    if (msg.content && msg.content.startsWith('{"type":"poll"')) {
      try {
        const pollData = JSON.parse(msg.content)
        const totalVotes = Object.values(pollData.votes || {}).reduce(
          (acc: number, cur: any) => acc + (cur?.length || 0),
          0
        ) as number
        const myId = user?.id || ''

        return (
          <div className="mt-1 p-3.5 rounded-2xl bg-alura-surface2/90 border border-alura-borderStrong shadow-md max-w-md w-full space-y-3">
            <div className="flex items-center gap-2 text-alura-accent">
              <BarChart2 size={16} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Enquete</span>
              {pollData.allowMultiple && (
                <span className="text-[10px] text-alura-textMuted font-normal">(Múltipla escolha)</span>
              )}
            </div>

            <h4 className="text-sm font-bold text-alura-textPrimary leading-snug">
              {pollData.question}
            </h4>

            <div className="space-y-2">
              {pollData.options.map((opt: string, idx: number) => {
                const voters: string[] = pollData.votes?.[idx] || []
                const hasVoted = voters.includes(myId)
                const count = voters.length
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleVotePoll(msg.id, idx)}
                    className={`w-full relative overflow-hidden rounded-xl border p-2.5 text-left transition-all cursor-pointer group ${
                      hasVoted
                        ? 'border-alura-accent bg-alura-accent/10 text-alura-textPrimary'
                        : 'border-alura-border hover:border-alura-borderStrong bg-alura-surface1/60 hover:bg-alura-surface1 text-alura-textSecondary'
                    }`}
                  >
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                        hasVoted ? 'bg-alura-accent/25' : 'bg-alura-surface3/40'
                      }`}
                      style={{ width: `${pct}%` }}
                    />

                    <div className="relative flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            hasVoted
                              ? 'border-alura-accent bg-alura-accent text-alura-surface0'
                              : 'border-alura-border group-hover:border-alura-textMuted'
                          }`}
                        >
                          {hasVoted && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className="font-semibold truncate">{opt}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold shrink-0 ml-2">
                        {pct}% ({count})
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="text-[10px] text-alura-textMuted flex items-center justify-between pt-1 border-t border-alura-border/40">
              <span>{totalVotes} voto(s) no total</span>
              <span>Duração: {pollData.durationDays || 1} dia(s)</span>
            </div>
          </div>
        )
      } catch {
        // fallback
      }
    }

    // 2. GIF Animado (Tenor, Klipy, Giphy ou URL .gif / .webp)
    const trimmed = msg.content ? msg.content.trim() : ''
    const isGifUrl =
      trimmed &&
      /^(https?:\/\/[^\s]+(?:\.gif|\.webp|tenor\.com|klipy\.co|giphy\.com|media[0-9]*\.giphy\.com)[^\s]*)$/i.test(trimmed)
    if (isGifUrl) {
      return (
        <div className="mt-1 max-w-xs sm:max-w-sm rounded-2xl overflow-hidden border border-alura-border shadow-lg bg-black/40 relative group">
          <img
            src={trimmed}
            alt="GIF"
            loading="lazy"
            className="w-full max-h-72 object-contain hover:scale-[1.02] transition-transform duration-200 cursor-pointer rounded-2xl"
            onClick={() => window.open(trimmed, '_blank')}
          />
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/20">
            GIF
          </span>
        </div>
      )
    }

    // 3. Conteúdo Textual com Menções Formatadas
    return (
      <div className="text-xs text-alura-textSecondary leading-relaxed break-words whitespace-pre-wrap">
        {renderFormattedContent(msg.content)}
      </div>
    )
  }

  // 6. Alternar Reação com Emoji (Optimistic UI)
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!user?.id) return

    const currentList = reactions[messageId] || []
    const hasReacted = currentList.some((r) => r.emoji === emoji && r.users.includes(user.id))

    // Atualização Otimista
    setReactions((prev) => {
      const list = [...(prev[messageId] || [])]
      const idx = list.findIndex((x) => x.emoji === emoji)
      if (hasReacted) {
        if (idx !== -1) {
          if (list[idx].count <= 1) {
            list.splice(idx, 1)
          } else {
            list[idx] = {
              ...list[idx],
              count: list[idx].count - 1,
              users: list[idx].users.filter((u) => u !== user.id),
            }
          }
        }
      } else {
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            count: list[idx].count + 1,
            users: [...list[idx].users, user.id],
          }
        } else {
          list.push({ emoji, count: 1, users: [user.id] })
        }
      }
      return { ...prev, [messageId]: list }
    })

    try {
      if (hasReacted) {
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)
      } else {
        await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        })
      }
    } catch (err) {
      console.error('[ServerWorkspace] Erro ao alternar reação:', err)
    }
  }

  // 7. Excluir Mensagem
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await supabase.from('messages').delete().eq('id', msgId)
      setMessages((prev) => prev.filter((m) => m.id !== msgId))
      showToast({ type: 'success', title: 'Mensagem apagada com sucesso' })
    } catch (err) {
      showToast({ type: 'error', title: 'Erro ao apagar mensagem' })
    }
  }

  // 8. Moderação Rápida de Membros (Kick / Ban)
  const handleKickMember = async (targetUserId: string) => {
    if (targetUserId === server?.owner_id) return
    try {
      await supabase
        .from('server_members')
        .delete()
        .eq('server_id', serverId)
        .eq('user_id', targetUserId)

      setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId))
      setActiveMemberMenuId(null)
      showToast({ type: 'success', title: 'Membro expulso da comunidade' })
    } catch (err) {
      showToast({ type: 'error', title: 'Erro ao expulsar membro' })
    }
  }

  const handleBanMember = async (targetUserId: string) => {
    if (targetUserId === server?.owner_id) return
    try {
      await supabase.from('server_bans').insert({
        server_id: serverId,
        user_id: targetUserId,
        reason: 'Banido por moderador através do workspace.',
        banned_by: user?.id,
      })

      await supabase
        .from('server_members')
        .delete()
        .eq('server_id', serverId)
        .eq('user_id', targetUserId)

      setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId))
      setActiveMemberMenuId(null)
      showToast({ type: 'success', title: 'Membro banido da comunidade' })
    } catch (err) {
      showToast({ type: 'error', title: 'Erro ao banir membro' })
    }
  }

  // Upload rápido de imagem / arquivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        try {
          const compressed = await compressImageToWebp(file)
          file = new File([compressed], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
            type: 'image/webp',
          })
        } catch {
          // ignora erro de compressão
        }
      }
      validFiles.push(file)
    }

    setAttachments((prev) => [...prev, ...validFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Criação de nova sala no servidor
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !serverId) return

    try {
      const spaceId = newRoomSpaceId || (spaces[0]?.id ?? null)
      const cleanName = newRoomName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')

      const { data: created, error } = await supabase
        .from('rooms')
        .insert({
          server_id: serverId,
          space_id: spaceId,
          name: cleanName,
          type: newRoomType,
          position: rooms.length,
        })
        .select()
        .single()

      if (!error && created) {
        setRooms((prev) => [...prev, created])
        setActiveRoom(created)
        setShowCreateRoomModal(false)
        setNewRoomName('')
        showToast({ type: 'success', title: 'Sala criada!', message: `O canal #${created.name} está pronto.` })
      }
    } catch (err) {
      console.error('[ServerWorkspace] Erro ao criar sala:', err)
    }
  }

  // Copiar link de convite
  const handleCopyInvite = () => {
    const url = `${window.location.origin}/#/servers/${serverId}`
    navigator.clipboard.writeText(url)
    showToast({ type: 'success', title: 'Link de convite copiado!', message: 'Compartilhe com amigos para entrarem nesta comunidade.' })
    setShowServerMenu(false)
  }

  const isOwner = server?.owner_id === user?.id
  const effectiveIsOwner = isOwner && !isSimulatingMemberView

  const canManageServer = effectiveIsOwner || userPermissions.manage_server
  const canManageRoles = effectiveIsOwner || userPermissions.manage_roles
  const canManageRooms = effectiveIsOwner || userPermissions.manage_rooms
  const canManageMembers = effectiveIsOwner || userPermissions.manage_members
  const canBanMembers = effectiveIsOwner || userPermissions.ban_member
  const canDeleteMessage = effectiveIsOwner || userPermissions.delete_message
  const canSendMessage = effectiveIsOwner || userPermissions.send_message === true
  const canReadHistory = effectiveIsOwner || userPermissions.read_message_history === true
  const canAttachFiles = effectiveIsOwner || userPermissions.attach_files === true
  const canCreatePolls = effectiveIsOwner || userPermissions.create_polls === true
  const canSendGifs = effectiveIsOwner || userPermissions.send_gifs === true
  const canCreateThreads = effectiveIsOwner || userPermissions.create_threads === true

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-alura-background text-alura-textPrimary select-none">
        <div className="w-10 h-10 border-3 border-alura-accent border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-alura-textMuted tracking-wider uppercase">
          Carregando comunidade...
        </p>
      </div>
    )
  }

  if (!server) return null

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-alura-background text-alura-textPrimary select-none">
      
      {/* ── 1. BARRA LATERAL DE CANAIS DO SERVIDOR ── */}
      <aside
        className={`h-full flex flex-col bg-alura-surface1 border-r border-alura-border shrink-0 z-20 transition-all duration-300 ${
          isVoiceChannelsCollapsed
            ? 'w-0 opacity-0 overflow-hidden border-none pointer-events-none'
            : 'w-64 sm:w-72 opacity-100'
        }`}
      >
        
        {/* Header do Servidor com Dropdown e Botão de Recolher */}
        <div className="relative flex items-center border-b border-alura-border">
          <button
            onClick={() => setShowServerMenu((prev) => !prev)}
            className="flex-1 h-16 px-4 flex items-center justify-between hover:bg-alura-surface2/60 transition-colors cursor-pointer text-left min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-alura-surface2 border border-alura-borderStrong shrink-0 flex items-center justify-center font-black text-sm text-alura-accent">
                {server.icon_url ? (
                  <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
                ) : (
                  server.name[0]?.toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-alura-textPrimary truncate">
                    {server.name}
                  </span>
                  {server.is_verified && (
                    <CheckCircle2 size={15} className="text-alura-accent shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-alura-textMuted flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {members.length} {members.length === 1 ? 'membro' : 'membros'}
                </span>
              </div>
            </div>
            <ChevronDown size={16} className={`text-alura-textMuted transition-transform duration-200 shrink-0 ${showServerMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Botão com seta para recolher os canais */}
          <button
            type="button"
            onClick={() => setIsVoiceChannelsCollapsed(true)}
            className="h-16 px-3 flex items-center justify-center border-l border-alura-border/60 text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2/80 transition-colors cursor-pointer shrink-0"
            title="Recolher canais do servidor"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Menu Dropdown de Opções do Servidor */}
          {showServerMenu && (
            <div
              ref={serverMenuRef}
              className="absolute top-16 left-3 right-3 z-50 p-2 rounded-2xl bg-alura-surface1 border border-alura-borderStrong shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 space-y-1"
            >
              <button
                onClick={handleCopyInvite}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-alura-textPrimary hover:bg-alura-surface2 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Share2 size={14} className="text-alura-accent" />
                  Convidar pessoas
                </span>
              </button>

              <button
                onClick={() => {
                  togglePin({ id: server.id, name: server.name, icon_url: server.icon_url })
                  setShowServerMenu(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-alura-textPrimary hover:bg-alura-surface2 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {isPinned(server.id) ? (
                    <>
                      <PinOff size={14} className="text-amber-400" />
                      Desafixar da sidebar
                    </>
                  ) : (
                    <>
                      <Pin size={14} className="text-alura-accent" />
                      Fixar na barra lateral
                    </>
                  )}
                </span>
              </button>

              {canManageServer && (
                <button
                  onClick={() => {
                    setShowServerMenu(false)
                    setShowSettingsModal(true)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-alura-accent hover:bg-alura-surface2 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings size={14} />
                    Configurações do Servidor
                  </span>
                </button>
              )}

              {canManageRooms && (
                <button
                  onClick={() => {
                    setShowServerMenu(false)
                    setShowCreateRoomModal(true)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-alura-textPrimary hover:bg-alura-surface2 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={14} className="text-alura-accent" />
                    Criar novo canal
                  </span>
                </button>
              )}

              <div className="my-1 border-t border-alura-border/60" />

              <button
                onClick={() => {
                  setShowServerMenu(false)
                  navigate('/servers')
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogOut size={14} />
                  Voltar ao Hub de Servidores
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Lista de Espaços e Canais */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {spaces.map((space) => {
            const spaceRooms = rooms
              .filter((r) => r.space_id === space.id || (!r.space_id && space === spaces[0]))
              .sort((a, b) => a.position - b.position)
            const isCollapsed = collapsedSpaces[space.id]

            return (
              <div key={space.id} className="space-y-1">
                {/* Cabeçalho do Espaço / Categoria */}
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-alura-textMuted uppercase tracking-wider group">
                  <button
                    onClick={() =>
                      setCollapsedSpaces((prev) => ({ ...prev, [space.id]: !prev[space.id] }))
                    }
                    className="flex items-center gap-1.5 hover:text-alura-textPrimary transition-colors cursor-pointer"
                  >
                    <ChevronRight
                      size={12}
                      className={`transition-transform duration-200 ${!isCollapsed ? 'rotate-90' : ''}`}
                    />
                    <span>{space.name}</span>
                  </button>

                  {canManageRooms && (
                    <button
                      onClick={() => {
                        setNewRoomSpaceId(space.id)
                        setShowCreateRoomModal(true)
                      }}
                      className="w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-alura-surface2 text-alura-textMuted hover:text-alura-textPrimary transition-all cursor-pointer"
                      title="Adicionar Canal"
                    >
                      <Plus size={13} />
                    </button>
                  )}
                </div>

                {/* Lista de Canais do Espaço */}
                {!isCollapsed && (
                  <div className="space-y-1">
                    {spaceRooms.map((room) => {
                      const isSelected = activeRoom?.id === room.id
                      const isVoice = room.type === 'voice'
                      const isConnectedHere = isVoice && connectedVoiceRoomId === room.id

                      // Lista de participantes da sala de voz com deduplicação estrita por id
                      const currentVoiceMembers = voiceParticipants[room.id] || []
                      const uniqueMap = new Map<string, VoiceParticipant>()

                      // Se o usuário atual está conectado nesta sala de voz, garante presença e estados locais corretos
                      if (isConnectedHere && user?.id) {
                        uniqueMap.set(user.id, {
                          id: user.id,
                          name: profile?.display_name || profile?.username || 'Você',
                          avatar: profile?.avatar_url,
                          isMuted: isLocalAudioMuted,
                          isDeafened: isDeafened,
                        })
                      }

                      // Adiciona os demais membros reportados pela presença sem duplicação
                      currentVoiceMembers.forEach((p) => {
                        if (p && p.id && !uniqueMap.has(p.id)) {
                          // Se for o próprio usuário mas não está conectado nesta sala, ignora
                          if (p.id === user?.id && !isConnectedHere) return
                          uniqueMap.set(p.id, p)
                        }
                      })

                      const participantsToDisplay = Array.from(uniqueMap.values())

                      return (
                        <div key={room.id} className="space-y-1">
                          <button
                            onClick={() => {
                              if (isVoice) {
                                if (connectedVoiceRoomId === room.id) {
                                  setActiveRoom(room)
                                  setIsVoiceMinimized(false)
                                } else {
                                  handleJoinVoiceRoom(room)
                                }
                              } else {
                                setActiveRoom(room)
                                if (connectedVoiceRoomId) {
                                  setIsVoiceMinimized(true)
                                }
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                              isSelected
                                ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm font-bold'
                                : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover'
                            }`}
                          >
                            {isVoice ? (
                              <Volume2
                                size={15}
                                className={isSelected || isConnectedHere ? 'text-alura-accent' : 'text-alura-textMuted'}
                              />
                            ) : (
                              <Hash
                                size={15}
                                className={isSelected ? 'text-alura-accent' : 'text-alura-textMuted'}
                              />
                            )}
                            <span className="truncate flex-1">{room.name}</span>

                            {isConnectedHere && (
                              <span className="ch-live-badge">
                                <Radio size={11} />
                                NO AR
                              </span>
                            )}
                          </button>

                          {/* USUÁRIOS CONECTADOS NA SALA DE VOZ (Abaixo do nome do canal) */}
                          {isVoice && participantsToDisplay.length > 0 && (
                            <div className="py-1 space-y-0.5">
                              {participantsToDisplay.map((p) => {
                                const isSpeaking = p.id === user?.id ? isLocalSpeaking : !!remoteSpeakingUsers[p.id]
                                return (
                                  <div
                                    key={p.id}
                                    className={`ch-part-item ${isSpeaking ? 'speaking' : ''}`}
                                  >
                                    {p.avatar ? (
                                      <img src={p.avatar} alt={p.name} className="ch-part-avatar" />
                                    ) : (
                                      <div className="ch-part-avatar fallback">
                                        {p.name?.[0]?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                    <span className="truncate flex-1">
                                      {p.name}{p.id === user?.id ? ' (você)' : ''}
                                    </span>
                                    <div className="ch-part-icons">
                                      {p.isMuted ? (
                                        <MicOff size={11} className="text-[var(--dnd)]" />
                                      ) : isSpeaking ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                                      ) : null}
                                      {p.isDeafened && <Headphones size={11} className="text-[var(--dnd)]" />}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── 2. ÁREA CENTRAL: SALA DE CHAT OU SALA DE VOZ ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-alura-background min-w-0">
        
        {/* Topbar da Sala Ativa */}
        <header className="h-16 px-4 sm:px-6 border-b border-alura-border flex items-center justify-between shrink-0 bg-alura-surface1/60 backdrop-blur-md gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Seta para regredir / reabrir canais quando recolhidos */}
            {isVoiceChannelsCollapsed && (
              <button
                type="button"
                onClick={() => setIsVoiceChannelsCollapsed(false)}
                className="w-8 h-8 rounded-xl bg-alura-surface2/80 hover:bg-alura-surface3 text-alura-accent hover:text-white border border-alura-border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                title="Expandir canais do servidor"
              >
                <ChevronRight size={16} />
              </button>
            )}
            {activeRoom?.type === 'voice' ? (
              <Volume2 size={20} className="text-alura-accent shrink-0" />
            ) : (
              <Hash size={20} className="text-alura-accent shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-alura-textPrimary truncate leading-tight">
                {activeRoom?.name || 'Canal'}
              </h2>
              {activeRoom?.description && (
                <p className="text-xs text-alura-textMuted truncate hidden md:block max-w-xs lg:max-w-md">
                  {activeRoom.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Se for sala de voz ativa, exibe botão de minimizar palco */}
            {activeRoom?.type === 'voice' && (
              <button
                type="button"
                onClick={() => {
                  setIsVoiceMinimized(true)
                  const textRoom = rooms.find((r) => r.type === 'text')
                  if (textRoom) setActiveRoom(textRoom)
                }}
                className="stage-pill"
                title="Minimizar palco para navegar pelo servidor"
              >
                <Minimize2 size={13} className="text-[var(--accent)]" />
                <span className="hidden sm:inline">Minimizar palco</span>
              </button>
            )}

            {/* Modo de Simulação de Permissões para o Dono (Testar Cargos) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setIsSimulatingMemberView((prev) => !prev)}
                className={`stage-pill ${isSimulatingMemberView ? 'active' : ''}`}
                title={
                  isSimulatingMemberView
                    ? 'Clique para voltar à Visão de Dono (Acesso Total)'
                    : 'Clique para Simular Permissões de Membro/Cargo'
                }
              >
                <ShieldAlert size={13} />
                <span className="hidden sm:inline">
                  {isSimulatingMemberView ? 'Simulando Membro' : 'Visão de Dono'}
                </span>
              </button>
            )}

            {/* Exibir Lista de Membros somente quando estiver recolhida (evitando duplicação com o painel aberto) */}
            {!showMembersSidebar && (
              <button
                type="button"
                onClick={() => setShowMembersSidebar(true)}
                className="px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border border-alura-border/60 bg-alura-surface2/60 hover:bg-alura-surface2 text-alura-textMuted hover:text-alura-textPrimary flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0"
                title="Exibir lista de membros"
              >
                <Users size={15} className="shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">Membros</span>
                <ChevronLeft size={13} className="shrink-0" />
              </button>
            )}
          </div>
        </header>

        {/* Conteúdo Dinâmico: Texto ou Voz */}
        {activeRoom?.type === 'voice' ? (
          /* ── MODO SALA DE VOZ / PALCO ALURA (alura-voz.html) ── */
          <div className="stage-wrap select-none">
            {connectedVoiceRoomId !== activeRoom.id ? (
              /* ESTADO DESCONECTADO (alura-voz.html: .stage-off-state) */
              <div className="stage-arena">
                <div className="stage-off-state">
                  <div className="icon-circle">
                    <Volume2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">Você não está conectado</h3>
                    <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
                      Conecte-se ao canal #{activeRoom.name} para conversar por voz, ligar sua câmera ou transmitir sua tela.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoinVoiceRoom(activeRoom)}
                    className="stage-btn"
                  >
                    <Volume2 size={16} />
                    <span>Entrar no canal de voz</span>
                  </button>
                </div>
              </div>
            ) : (
              /* PALCO CONECTADO COM PARTICIPANTES, TRANSMISSÃO E CONTROLES */
              <>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 custom-scrollbar">
                  {(() => {
                    const otherParticipants = Array.from(
                      new Map(
                        (voiceParticipants[activeRoom.id] || [])
                          .filter((p) => p && p.id && p.id !== user?.id)
                          .map((p) => [p.id, p])
                      ).values()
                    )
                    const streamingParticipant = otherParticipants.find(
                      (p) => !!p.isSharingScreen
                    )
                    const watchingParticipant = otherParticipants.find((p) => p.id === watchingParticipantId)
                    const watchingStream = watchingParticipantId ? remoteScreenStreams?.get(watchingParticipantId) : null
                    const totalParticipants = 1 + otherParticipants.length

                    return (
                      <>
                        {/* Banner Informativo quando alguém está transmitindo na sala e ainda não assistimos */}
                        {streamingParticipant && !watchingParticipantId && !localScreenStream && (
                          <div className="w-full px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border-strong)] shadow-xl flex items-center justify-between text-xs text-[var(--text)] animate-in slide-in-from-top-2 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] shrink-0">
                                <Monitor size={18} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-[var(--text)] text-sm truncate">
                                    {streamingParticipant.name} está transmitindo a tela!
                                  </p>
                                  <span className="ch-live-badge">
                                    AO VIVO
                                  </span>
                                </div>
                                <p className="text-xs text-[var(--muted)] truncate">
                                  Clique no botão ao lado para assistir à transmissão ao vivo.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setWatchingParticipantId(streamingParticipant.id)
                                serverVoice.requestScreenStream(streamingParticipant.id)
                              }}
                              className="stage-btn shrink-0 ml-3"
                            >
                              <Play size={13} fill="currentColor" />
                              <span>Assistir transmissão</span>
                            </button>
                          </div>
                        )}

                    {/* Transmissão de Tela Local em Destaque (se o próprio usuário estiver transmitindo) */}
                    {localScreenStream && (
                      <div
                        ref={localStreamContainerRef}
                        className={`w-full aspect-video overflow-hidden bg-black relative flex items-center justify-center shrink-0 transition-all ${
                          isLocalStreamFullscreen
                            ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none border-none max-h-none'
                            : 'max-h-[60vh] rounded-3xl border border-alura-borderStrong shadow-2xl'
                        }`}
                      >
                        <video
                          ref={(el) => {
                            (localScreenRef as any).current = el
                            if (el && localScreenStream && el.srcObject !== localScreenStream) {
                              el.srcObject = localScreenStream
                              el.muted = true
                              el.play().catch(() => {})
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
                          onDoubleClick={toggleLocalStreamFullscreen}
                          className={`w-full h-full ${localStreamFit === 'cover' ? 'object-cover' : 'object-contain'} cursor-pointer`}
                        />
                        {/* Topbar Local */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-bold shadow-lg pointer-events-auto">
                            <Monitor size={14} className="text-alura-accent" />
                            <span>Sua Transmissão de Tela</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          </div>

                          <div className="flex items-center gap-2 pointer-events-auto">
                            <button
                              type="button"
                              onClick={() => setLocalStreamFit((f) => (f === 'contain' ? 'cover' : 'contain'))}
                              className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
                              title={localStreamFit === 'contain' ? 'Preencher tela' : 'Ajustar à tela'}
                            >
                              <Scaling size={13} className="text-alura-accent" />
                              <span className="hidden sm:inline">{localStreamFit === 'contain' ? 'Ajustar' : 'Preencher'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={toggleLocalStreamFullscreen}
                              className="px-3.5 py-1.5 rounded-xl bg-alura-accent/20 hover:bg-alura-accent/30 text-alura-accent border border-alura-accent/40 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
                              title={isLocalStreamFullscreen ? 'Restaurar janela' : 'Maximizar transmissão em tela cheia'}
                            >
                              {isLocalStreamFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                              <span>{isLocalStreamFullscreen ? 'Restaurar' : 'Maximizar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => serverVoice.stopScreenShare()}
                              className="px-3.5 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
                              title="Parar transmissão de tela"
                            >
                              <MonitorOff size={13} />
                              <span className="hidden sm:inline">Parar Transmissão</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transmissão de Tela Remota em Destaque (quando o usuário clica em Assistir Transmissão) */}
                    {watchingParticipant && (
                      <div
                        ref={serverStreamContainerRef}
                        className={`w-full aspect-video overflow-hidden bg-black relative flex items-center justify-center shrink-0 transition-all ${
                          isServerStreamFullscreen
                            ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none border-none max-h-none'
                            : 'max-h-[65vh] rounded-3xl border-2 border-alura-accent/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200'
                        }`}
                      >
                        {watchingStream ? (
                          <RemoteVideoView
                            stream={watchingStream}
                            onDoubleClick={toggleServerStreamFullscreen}
                            className={`w-full h-full ${serverStreamFit === 'cover' ? 'object-cover' : 'object-contain'}`}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-alura-textMuted p-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-alura-surface2 flex items-center justify-center text-alura-accent animate-pulse">
                              <Monitor size={24} />
                            </div>
                            <p className="text-sm font-semibold text-white">
                              Conectando à transmissão de {watchingParticipant.name}...
                            </p>
                            <button
                              type="button"
                              onClick={() => serverVoice.requestScreenStream(watchingParticipant.id)}
                              className="px-3 py-1.5 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-alura-textPrimary text-xs font-semibold border border-white/10 transition-all cursor-pointer active:scale-95"
                            >
                              Reconectar transmissão
                            </button>
                          </div>
                        )}

                        {/* Topbar Flutuante do Vídeo da Transmissão */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
                          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold shadow-lg pointer-events-auto">
                            <Monitor size={14} className="text-alura-accent" />
                            <span className="truncate max-w-[200px]">Transmissão de {watchingParticipant.name}</span>
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Ao vivo
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pointer-events-auto">
                            {/* Ajuste de Proporção (Ajustar vs Preencher) */}
                            <button
                              type="button"
                              onClick={() => setServerStreamFit((f) => (f === 'contain' ? 'cover' : 'contain'))}
                              className="px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
                              title={serverStreamFit === 'contain' ? 'Preencher tela (cortar bordas)' : 'Ajustar à tela (proporção original)'}
                            >
                              <Scaling size={13} className="text-alura-accent" />
                              <span className="hidden sm:inline">{serverStreamFit === 'contain' ? 'Ajustar' : 'Preencher'}</span>
                            </button>

                            {/* Maximizar Transmissão em Tela Cheia */}
                            <button
                              type="button"
                              onClick={toggleServerStreamFullscreen}
                              className="px-3.5 py-1.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-alura-surface0 border border-alura-accent font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-alura-accent/20 active:scale-95 cursor-pointer backdrop-blur-md"
                              title={isServerStreamFullscreen ? 'Restaurar janela' : 'Maximizar transmissão de tela em tela cheia'}
                            >
                              {isServerStreamFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                              <span>{isServerStreamFullscreen ? 'Restaurar' : 'Maximizar'}</span>
                            </button>

                            {/* Parar de Assistir */}
                            <button
                              type="button"
                              onClick={() => {
                                if (document.fullscreenElement) {
                                  document.exitFullscreen().catch(() => {})
                                }
                                setWatchingParticipantId(null)
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-black/80 hover:bg-red-500/20 text-white hover:text-red-300 border border-white/10 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
                              title="Parar de assistir transmissão"
                            >
                              <EyeOff size={13} />
                              <span>Parar de Assistir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Grade de Participantes com Estilo alura-voz.html */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center p-2">
                      <div className={`stage-grid ${totalParticipants === 1 ? 'single' : totalParticipants === 2 ? 'two' : ''}`}>
                        {/* Tile do Usuário Logado */}
                        <div className={`stage-tile ${isLocalSpeaking ? 'speaking' : ''}`}>
                          {localCameraStream ? (
                            <video
                              ref={localVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="big-av">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Você" />
                              ) : (
                                profile?.username?.[0]?.toUpperCase() || 'V'
                              )}
                            </div>
                          )}

                          {/* Tag inferior */}
                          <div className="stage-tag">
                            <span className={`dot ${isLocalSpeaking ? 'speaking' : ''}`} />
                            <span className="truncate max-w-[150px]">{profile?.display_name || profile?.username || 'Você'}</span>
                            {isLocalAudioMuted ? (
                              <span className="text-[10px] text-[var(--dnd)] font-bold flex items-center gap-1">
                                <MicOff size={11} /> Mudo
                              </span>
                            ) : isLocalSpeaking ? (
                              <span className="text-[10px] text-[var(--accent)] font-bold">Falando</span>
                            ) : null}
                          </div>
                        </div>

                        {/* Demais Participantes Conectados */}
                        {otherParticipants.map((p) => {
                          const isRemoteSpeaking = !!remoteSpeakingUsers[p.id]
                          const isParticipantStreaming = !!p.isSharingScreen

                          return (
                            <div key={p.id} className={`stage-tile ${isRemoteSpeaking ? 'speaking' : ''}`}>
                              {/* Badge Ao Vivo se estiver transmitindo */}
                              {isParticipantStreaming && (
                                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)] text-[var(--on-accent)] text-[10px] font-bold uppercase tracking-wider shadow-md z-10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>Ao Vivo</span>
                                </div>
                              )}

                              <div className="big-av">
                                {p.avatar ? (
                                  <img src={p.avatar} alt={p.name} />
                                ) : (
                                  p.name?.[0]?.toUpperCase() || '?'
                                )}
                              </div>

                              {/* Botão Assistir Transmissão sobre o Tile do Participante */}
                              {isParticipantStreaming && (
                                <div className="absolute inset-x-0 bottom-14 flex items-center justify-center z-10 pointer-events-auto px-3">
                                  {watchingParticipantId === p.id ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setWatchingParticipantId(null)
                                      }}
                                      className="stage-pill active"
                                    >
                                      <EyeOff size={13} />
                                      <span>Parar de assistir</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setWatchingParticipantId(p.id)
                                        serverVoice.requestScreenStream(p.id)
                                      }}
                                      className="stage-btn"
                                    >
                                      <Play size={13} fill="currentColor" />
                                      <span>Assistir transmissão</span>
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Nome e Indicador de Áudio */}
                              <div className="stage-tag">
                                <span className={`dot ${isRemoteSpeaking ? 'speaking' : ''}`} />
                                <span className="truncate max-w-[150px]">{p.name}</span>
                                {p.isMuted ? (
                                  <span className="text-[10px] text-[var(--dnd)] font-bold flex items-center gap-1">
                                    <MicOff size={11} /> Mudo
                                  </span>
                                ) : isRemoteSpeaking ? (
                                  <span className="text-[10px] text-[var(--accent)] font-bold">Falando</span>
                                ) : null}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Aviso se estiver sozinho na chamada */}
                      {totalParticipants === 1 && (
                        <div className="stage-alone">
                          <span>Você é a única pessoa na chamada de voz por enquanto.</span>
                          <button
                            type="button"
                            onClick={handleCopyInvite}
                            className="stage-pill"
                          >
                            <Share2 size={12} />
                            <span>Convidar membros</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Dock Flutuante de Voz (alura-voz.html: .voice-dock .voice-bar) */}
            <div className="voice-dock">
              <div className="voice-bar">
                {/* Mutar / Desmutar Microfone */}
                <button
                  type="button"
                  onClick={handleToggleAudioMute}
                  className={`voice-cb ${isLocalAudioMuted ? 'mute' : ''}`}
                  title={isLocalAudioMuted ? 'Desmutar Microfone' : 'Mutar Microfone'}
                >
                  {isLocalAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Cancelamento de Ruído Krisp / Módulos */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNoiseFilterMenu((prev) => !prev)}
                    className={`voice-krisp ${voiceNoiseFilter !== 'off' ? 'active' : ''}`}
                    title="Módulo de Limpeza de Ruído"
                  >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline">
                      {voiceNoiseFilter === 'krisp'
                        ? 'Krisp'
                        : voiceNoiseFilter === 'cleanvoice'
                        ? 'Cleanvoice'
                        : voiceNoiseFilter === 'passthrough'
                        ? 'Passthrough'
                        : voiceNoiseFilter === 'standard'
                        ? 'Padrão'
                        : 'Ruído Off'}
                    </span>
                    {voiceNoiseFilter !== 'off' && <span className="k-tag">ATIVO</span>}
                  </button>

                  {showNoiseFilterMenu && (
                    <div className="noise-filter-menu animate-in fade-in zoom-in-95">
                      <div className="menu-head">
                        <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                          <Sparkles size={13} className="text-[var(--accent)]" />
                          <span>Supressão de Ruído</span>
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">Escolha o módulo de cancelamento de som</div>
                      </div>

                      {NOISE_FILTER_MODES.map((mode) => {
                        const isSelected = voiceNoiseFilter === mode.id
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => handleChangeNoiseFilter(mode.id)}
                            className={`noise-filter-item ${isSelected ? 'active' : ''}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isSelected ? (
                                <CheckCircle2 size={15} className="text-[var(--accent)]" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-[var(--line)] mt-0.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[var(--text)]">{mode.name}</span>
                                {mode.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)]">
                                    {mode.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[var(--muted)] leading-tight mt-0.5">{mode.desc}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Ligar / Desligar Câmera */}
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`voice-cb ${localCameraStream ? 'active' : ''}`}
                  title={localCameraStream ? 'Desligar Câmera' : 'Ligar Câmera'}
                >
                  <Video size={18} />
                </button>

                {/* Compartilhar Tela */}
                <button
                  type="button"
                  onClick={handleToggleScreenShare}
                  className={`voice-cb ${localScreenStream ? 'active' : ''}`}
                  title={localScreenStream ? 'Parar Compartilhamento' : 'Compartilhar Tela'}
                >
                  <Monitor size={18} />
                </button>

                {/* Soundboard */}
                <button
                  type="button"
                  onClick={() => setShowSoundboard((prev) => !prev)}
                  className={`voice-cb ${showSoundboard ? 'active' : ''}`}
                  title="Abrir Soundboard"
                >
                  <Music2 size={18} />
                </button>

                {/* Ocultar / Restaurar Canais */}
                <button
                  type="button"
                  onClick={() => setIsVoiceChannelsCollapsed((prev) => !prev)}
                  className={`voice-cb ${isVoiceChannelsCollapsed ? 'active' : ''}`}
                  title={isVoiceChannelsCollapsed ? 'Restaurar Canais' : 'Ocultar Canais (Foco Total)'}
                >
                  {isVoiceChannelsCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                </button>

                {/* Desconectar da Sala de Voz */}
                <button
                  type="button"
                  onClick={handleLeaveVoiceRoom}
                  className="voice-cb hang"
                  title="Sair da Chamada"
                >
                  <PhoneOff size={18} />
                </button>
              </div>
            </div>
          </>
        )}

            {/* Painel Flutuante do Soundboard */}
            <ServerSoundboardPanel
              isOpen={showSoundboard}
              onClose={() => setShowSoundboard(false)}
              onPlaySound={handlePlaySoundboard}
              canUseSoundboard={isOwner || userPermissions.use_soundboard !== false}
            />
          </div>
        ) : (
          /* ── MODO SALA DE CHAT TEXTUAL ── */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Banner de Aviso: Modo de Simulação Ativo */}
            {isSimulatingMemberView && (
              <div className="px-6 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-in fade-in shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={15} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>Modo de Simulação Ativo:</strong> Você está visualizando o servidor com as permissões reais calculadas dos cargos e @everyone. O bypass de proprietário está desativado para testes.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulatingMemberView(false)}
                  className="underline hover:text-white font-bold ml-2 cursor-pointer shrink-0"
                >
                  Sair da Simulação
                </button>
              </div>
            )}

            {/* Lista de Mensagens com Scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              
              {/* Mensagem de Boas-vindas ao Canal */}
              <div className="pt-6 pb-4 border-b border-alura-border/40 space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-alura-surface2 border border-alura-border flex items-center justify-center text-alura-accent">
                  <Hash size={28} />
                </div>
                <h3 className="text-2xl font-black text-alura-textPrimary tracking-tight">
                  Bem-vindo a #{activeRoom?.name}!
                </h3>
                <p className="text-xs text-alura-textSecondary max-w-lg leading-relaxed">
                  {activeRoom?.description || `Este é o início do canal #${activeRoom?.name}. Envie a primeira mensagem e inicie a conversa com a comunidade!`}
                </p>
              </div>

              {/* Histórico de Mensagens ou Aviso de Sem Permissão */}
              {!canReadHistory ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <ShieldAlert size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-alura-textPrimary">Histórico Oculto</h4>
                  <p className="text-xs text-alura-textMuted max-w-sm mx-auto">
                    Seu cargo não possui permissão para ler o histórico de mensagens deste canal.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-alura-textMuted text-xs font-semibold">
                  Nenhuma mensagem por aqui ainda. Seja o primeiro a falar!
                </div>
              ) : (
                messages.map((msg) => {
                  const author = msg.profiles
                  const isMine = msg.user_id === user?.id
                  const isAuthorOwner = server.owner_id === msg.user_id
                  const authorMember = members.find((m) => m.user_id === msg.user_id)
                  const authorColor = authorMember?.topRoleColor
                  const authorRoleName = authorMember?.topRoleName

                  const time = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  const msgReactions = reactions[msg.id] || []

                  return (
                    <div
                      key={msg.id}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setContextMenu({
                          isOpen: true,
                          position: { x: e.clientX, y: e.clientY },
                          message: msg,
                        })
                      }}
                      className="group relative flex items-start gap-3.5 hover:bg-alura-surface1/50 -mx-4 px-4 py-2.5 rounded-2xl transition-colors select-text"
                    >
                      {/* Avatar do Autor */}
                      <div
                        onClick={(e) => {
                          if (authorMember) {
                            setPopoverMember({
                              member: authorMember,
                              rect: e.currentTarget.getBoundingClientRect(),
                              isHover: false,
                            })
                          }
                        }}
                        className="w-10 h-10 min-w-[40px] rounded-xl overflow-hidden bg-alura-surface2 border border-alura-border shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-alura-accent/50 transition-all"
                      >
                        {author?.avatar_url ? (
                          <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-extrabold text-sm text-alura-accent">
                            {author?.username?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>

                      {/* Conteúdo da Mensagem */}
                      <div className="flex-1 min-w-0 space-y-1">
                        
                        {/* Se for resposta a outra mensagem, renderiza citação visual */}
                        {msg.reply_to_id && msg.reply_message && (
                          <div className="flex items-center gap-1.5 text-[11px] text-alura-textMuted mb-1 pl-2 border-l-2 border-alura-accent/50 max-w-lg truncate">
                            <CornerUpLeft size={11} className="text-alura-accent shrink-0" />
                            <span className="font-bold text-alura-textSecondary">
                              @{msg.reply_message.profiles?.username || msg.reply_message.profiles?.display_name || 'usuario'}:
                            </span>
                            <span className="truncate">{msg.reply_message.content || 'Anexo'}</span>
                          </div>
                        )}

                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            onClick={(e) => {
                              if (authorMember) {
                                setPopoverMember({
                                  member: authorMember,
                                  rect: e.currentTarget.getBoundingClientRect(),
                                  isHover: false,
                                })
                              }
                            }}
                            className={`text-xs font-extrabold truncate cursor-pointer hover:underline ${
                              !authorColor ? (isMine ? 'text-alura-accent' : 'text-alura-textPrimary') : ''
                            }`}
                            style={{ color: authorColor }}
                          >
                            {author?.display_name || author?.username || 'Usuário'}
                          </span>

                          {isAuthorOwner ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                              <Crown size={9} /> Dono
                            </span>
                          ) : authorRoleName ? (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                              style={{
                                backgroundColor: `${authorColor || '#00E6A0'}15`,
                                borderColor: `${authorColor || '#00E6A0'}40`,
                                color: authorColor || '#00E6A0',
                              }}
                            >
                              {authorRoleName}
                            </span>
                          ) : null}

                          <span className="text-[10px] text-alura-textMuted">{time}</span>
                        </div>

                        {/* Conteúdo da Mensagem (Texto, Menções, Enquetes ou GIFs) */}
                        {msg.content && renderMessageContent(msg)}

                        {/* Anexos de Imagem */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.attachments.map((att) => (
                              <div
                                key={att.id}
                                className="max-w-xs sm:max-w-md rounded-2xl overflow-hidden border border-alura-border shadow-md bg-black/40"
                              >
                                {att.file_type.startsWith('image/') ? (
                                  <img
                                    src={att.url}
                                    alt="Anexo"
                                    className="w-full max-h-72 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                                    onClick={() => setLightboxImage({ url: att.url, name: 'Anexo de Imagem' })}
                                  />
                                ) : (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-3 text-xs text-alura-accent hover:underline"
                                  >
                                    <Paperclip size={14} /> Baixar anexo
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Lista de Reações da Mensagem */}
                        {msgReactions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msgReactions.map((r) => {
                              const userReacted = r.users.includes(user?.id)

                              return (
                                <button
                                  key={r.emoji}
                                  type="button"
                                  onClick={() => handleToggleReaction(msg.id, r.emoji)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    userReacted
                                      ? 'bg-alura-selected border-alura-accent text-alura-accent shadow-sm'
                                      : 'bg-alura-surface2/60 hover:bg-alura-surface2 border-alura-border text-alura-textSecondary'
                                  }`}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="text-[11px] font-mono">{r.count}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Barra de Ações Rápidas da Mensagem (Hover Bar) */}
                      <div className="absolute right-4 top-2 hidden group-hover:flex items-center gap-1 p-1 rounded-xl bg-alura-surface1 border border-alura-border shadow-xl backdrop-blur-md z-10 animate-in fade-in zoom-in-95 duration-100">
                        {/* Emojis Rápidos */}
                        {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="p-1 hover:bg-alura-surface2 rounded-lg text-sm transition-transform hover:scale-125 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}

                        <div className="w-px h-3.5 bg-alura-border mx-0.5" />

                        {/* Botão Responder */}
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1.5 rounded-lg text-alura-textMuted hover:text-alura-accent hover:bg-alura-surface2 transition-colors cursor-pointer"
                          title="Responder"
                        >
                          <CornerUpLeft size={14} />
                        </button>

                        {/* Moderação na Mensagem (Expulsar / Banir se tiver permissão e não for o dono nem você mesmo) */}
                        {!isMine && !isAuthorOwner && (canManageMembers || canBanMembers) && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMemberMenuId(activeMemberMenuId === msg.id ? null : msg.id)}
                              className="p-1.5 rounded-lg text-alura-textMuted hover:text-white hover:bg-alura-surface2 transition-colors cursor-pointer"
                              title="Moderar Autor"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {activeMemberMenuId === msg.id && (
                              <div className="member-context-menu absolute right-0 top-full mt-1 z-30 p-1.5 rounded-xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl min-w-[140px] space-y-1 animate-in fade-in zoom-in-95">
                                {canManageMembers && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMemberMenuId(null)
                                      handleKickMember(msg.user_id)
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/15 cursor-pointer text-left"
                                  >
                                    <UserMinus size={13} />
                                    <span>Expulsar</span>
                                  </button>
                                )}
                                {canBanMembers && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMemberMenuId(null)
                                      handleBanMember(msg.user_id)
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/15 cursor-pointer text-left"
                                  >
                                    <Ban size={13} />
                                    <span>Banir</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Botão Apagar Mensagem (se autor ou moderador) */}
                        {(isMine || canDeleteMessage) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg text-alura-textMuted hover:text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer"
                            title="Apagar mensagem"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Prévia de Anexos Pendentes */}
            {attachments.length > 0 && (
              <div className="px-6 py-2 bg-alura-surface1 border-t border-alura-border flex items-center gap-2 overflow-x-auto">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary"
                  >
                    <ImageIcon size={13} className="text-alura-accent" />
                    <span className="truncate max-w-[140px]">{file.name}</span>
                    <button
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-alura-textMuted hover:text-red-400 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Barra de Resposta Ativa */}
            {replyingTo && (
              <div className="px-6 py-2 bg-alura-surface2/70 border-t border-alura-border flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <CornerUpLeft size={14} className="text-alura-accent shrink-0" />
                  <span className="text-alura-textMuted">Respondendo a</span>
                  <span className="font-extrabold text-alura-accent truncate">
                    @{replyingTo.profiles?.username || replyingTo.profiles?.display_name || 'usuario'}
                  </span>
                  <span className="text-alura-textSecondary truncate max-w-sm italic">
                    "{replyingTo.content || 'Anexo'}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-md text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface3 cursor-pointer"
                  title="Cancelar resposta"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Barra de Digitação de Mensagens */}
            <div className="p-4 bg-alura-surface1 border-t border-alura-border relative">
              
              {/* Autocomplete de Menções (Anexo 1 - corrigido) */}
              {mentionQuery !== null && (
                <div className="absolute bottom-full mb-3 left-4 sm:left-6 z-50">
                  <MentionAutocomplete
                    query={mentionQuery}
                    members={members}
                    roles={roles}
                    selectedIndex={mentionIndex}
                    onSelect={handleSelectMention}
                  />
                </div>
              )}

              {/* Seletor de Emojis Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-3 right-16 z-50 shadow-2xl rounded-2xl overflow-hidden border border-alura-border">
                  <EmojiPicker
                    theme={Theme.DARK}
                    onEmojiClick={(emojiData) => {
                      setNewMessage((prev) => prev + emojiData.emoji)
                    }}
                  />
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                onPaste={handlePaste}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 transition-all shadow-inner ${
                  canSendMessage
                    ? 'bg-alura-surface2 border-alura-border focus-within:border-alura-accent'
                    : 'bg-alura-surface1/60 border-alura-border/40 opacity-70'
                }`}
              >
                {/* Input de arquivo escondido */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  accept="image/*,video/*,application/pdf"
                />

                {/* Botão + com Menu Dropdown (Anexo 2) */}
                <div className="relative" ref={plusMenuRef}>
                  <button
                    type="button"
                    disabled={!canSendMessage}
                    onClick={() => setShowPlusMenu((prev) => !prev)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      showPlusMenu
                        ? 'bg-alura-surface1 text-alura-accent'
                        : 'text-alura-textMuted hover:text-alura-accent hover:bg-alura-surface1'
                    }`}
                    title="Adicionar anexo, tópico ou enquete"
                  >
                    <Plus size={18} />
                  </button>

                  {showPlusMenu && (
                    <div className="absolute bottom-full mb-3 left-0 z-50 w-60 p-1.5 rounded-2xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl space-y-1 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                      {/* Opção 1: Enviar Arquivo */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlusMenu(false)
                          if (!canAttachFiles) {
                            showToast({
                              type: 'warning',
                              title: 'Permissão negada',
                              message: 'Seu cargo não possui permissão para anexar arquivos.',
                            })
                            return
                          }
                          fileInputRef.current?.click()
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          canAttachFiles
                            ? 'hover:bg-alura-surface2 text-alura-textPrimary hover:text-alura-accent'
                            : 'opacity-40 text-alura-textMuted cursor-not-allowed'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <FileUp size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Enviar arquivo</div>
                          <div className="text-[10px] text-alura-textMuted">Imagens, vídeos ou docs</div>
                        </div>
                      </button>

                      {/* Opção 2: Criar Tópico */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlusMenu(false)
                          if (!canCreateThreads) {
                            showToast({
                              type: 'warning',
                              title: 'Permissão negada',
                              message: 'Seu cargo não possui permissão para criar tópicos.',
                            })
                            return
                          }
                          showToast({
                            type: 'info',
                            title: 'Tópicos',
                            message: `Iniciando nova discussão em #${activeRoom?.name || 'chat'}`,
                          })
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          canCreateThreads
                            ? 'hover:bg-alura-surface2 text-alura-textPrimary hover:text-alura-accent'
                            : 'opacity-40 text-alura-textMuted cursor-not-allowed'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                          <MessageSquarePlus size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Criar tópico</div>
                          <div className="text-[10px] text-alura-textMuted">Subconversa organizada</div>
                        </div>
                      </button>

                      {/* Opção 3: Criar Enquete */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowPlusMenu(false)
                          if (!canCreatePolls) {
                            showToast({
                              type: 'warning',
                              title: 'Permissão negada',
                              message: 'Seu cargo não possui permissão para criar enquetes.',
                            })
                            return
                          }
                          setShowPollModal(true)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                          canCreatePolls
                            ? 'hover:bg-alura-surface2 text-alura-textPrimary hover:text-alura-accent'
                            : 'opacity-40 text-alura-textMuted cursor-not-allowed'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                          <BarChart2 size={15} />
                        </div>
                        <div>
                          <div className="text-xs font-bold">Criar enquete</div>
                          <div className="text-[10px] text-alura-textMuted">Votação com a comunidade</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Textarea Principal com auto-expand, suporte a @menção, Shift+Enter e colar imagens */}
                <textarea
                  ref={messageInputRef}
                  rows={1}
                  disabled={!canSendMessage}
                  value={newMessage}
                  onChange={(e) => {
                    handleMessageInputChange(e as any)
                    e.target.style.height = 'auto'
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                  }}
                  onKeyDown={(e) => {
                    if (mentionQuery !== null) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setMentionIndex((prev) => prev + 1)
                        return
                      }
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        setMentionIndex((prev) => Math.max(0, prev - 1))
                        return
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        setMentionQuery(null)
                        return
                      }
                    }

                    if (e.key === 'Enter') {
                      if (e.shiftKey) {
                        // Shift + Enter: insere quebra de linha normal
                        return
                      } else {
                        // Enter comum: envia a mensagem
                        e.preventDefault()
                        handleSendMessage(e)
                        if (messageInputRef.current) {
                          messageInputRef.current.style.height = 'auto'
                          messageInputRef.current.focus()
                        }
                      }
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder={
                    canSendMessage
                      ? `Conversar em #${activeRoom?.name || 'geral'}...`
                      : 'Você não tem permissão para enviar mensagens neste canal.'
                  }
                  className="flex-1 bg-transparent text-xs sm:text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none py-1.5 disabled:cursor-not-allowed resize-none max-h-32 custom-scrollbar leading-relaxed"
                />

                {/* Botão de GIF (Anexo 3) */}
                <div className="relative" ref={gifPickerAnchorRef}>
                  <button
                    type="button"
                    disabled={!canSendMessage}
                    onClick={() => {
                      if (!canSendGifs) {
                        showToast({
                          type: 'warning',
                          title: 'Permissão negada',
                          message: 'Seu cargo não possui permissão para enviar GIFs.',
                        })
                        return
                      }
                      setShowGifPicker((prev) => !prev)
                    }}
                    className={`px-2 py-1 rounded-xl text-[11px] font-black tracking-wider transition-all cursor-pointer uppercase border ${
                      showGifPicker
                        ? 'bg-alura-accent text-alura-surface0 border-alura-accent'
                        : canSendGifs
                        ? 'text-alura-textMuted hover:text-alura-accent hover:bg-alura-surface1 border-alura-border/60 hover:border-alura-accent/50'
                        : 'opacity-30 border-transparent text-alura-textMuted cursor-not-allowed'
                    }`}
                    title={canSendGifs ? 'Buscar e Enviar GIF (Tenor)' : 'Sem permissão para GIFs'}
                  >
                    GIF
                  </button>

                  {/* Popover de GIFs Klipy / Tenor */}
                  {showGifPicker && (
                    <GifPickerPopover
                      isOpen={showGifPicker}
                      onClose={() => setShowGifPicker(false)}
                      onSelectGif={(url) => {
                        handleSendGif(url)
                        setShowGifPicker(false)
                      }}
                      onSelectEmoji={() => setShowEmojiPicker(true)}
                    />
                  )}
                </div>

                {/* Botão de Emojis */}
                <button
                  type="button"
                  disabled={!canSendMessage}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    showEmojiPicker
                      ? 'text-alura-accent bg-alura-surface1'
                      : 'text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface1 disabled:opacity-40'
                  }`}
                  title="Inserir Emoji"
                >
                  <Smile size={18} />
                </button>

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={!canSendMessage || isSending || (!newMessage.trim() && attachments.length === 0)}
                  className="p-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover disabled:opacity-30 disabled:hover:bg-alura-accent text-alura-surface0 transition-all cursor-pointer shadow-sm"
                  title="Enviar Mensagem (Enter)"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── 3. PAINEL LATERAL DIREITO: MEMBROS DO SERVIDOR COM SEPARAÇÃO POR CARGO (HOIST) ── */}
      <aside
        className={`h-full bg-alura-surface1 border-l border-alura-border overflow-y-auto space-y-4 custom-scrollbar shrink-0 transition-all duration-300 ease-in-out relative ${
          showMembersSidebar
            ? 'w-56 sm:w-64 opacity-100 p-4 hidden md:block'
            : 'w-0 opacity-0 overflow-hidden border-none p-0 pointer-events-none'
        }`}
      >
        {/* Cabeçalho da Lista de Membros com botão de recolher com seta */}
        <div className="flex items-center justify-between pb-3 border-b border-alura-border/40">
          <span className="text-[11px] font-bold text-alura-textMuted uppercase tracking-wider flex items-center gap-1.5">
            <Users size={13} className="text-alura-accent" /> Membros ({members.length})
          </span>
          <button
            type="button"
            onClick={() => setShowMembersSidebar(false)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-alura-textMuted hover:text-alura-textPrimary hover:bg-alura-surface2 transition-all cursor-pointer"
            title="Recolher membros"
          >
            <ChevronRight size={15} />
          </button>
        </div>
          {memberGroups.map((group) => {
            if (group.members.length === 0) return null

            return (
              <div key={group.id} className="space-y-1.5">
                <h4
                  className="text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-between px-1"
                  style={{ color: group.color || '#8E9297' }}
                >
                  <span>{group.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{group.members.length}</span>
                </h4>

                <div className="space-y-0.5">
                  {group.members.map((m) => {
                    const isMemberOwner = server.owner_id === m.user_id
                    const p = m.profile
                    const showMenu = activeMemberMenuId === m.user_id

                    const userStatus = getUserStatus(p)
                    const statusColor = getStatusColor(userStatus)
                    const isOffline = userStatus === 'offline'

                    return (
                      <div key={m.user_id} className="relative group">
                        <UserProfileHoverCard
                          userId={m.user_id}
                          profile={p}
                          serverRoles={m.roles}
                          isServerOwner={isMemberOwner}
                          joinedServerAt={m.joined_at}
                          canKick={canManageMembers && !isMemberOwner && user?.id !== m.user_id}
                          onKick={(targetUserId) => handleKickMember(targetUserId)}
                          canBan={canBanMembers && !isMemberOwner && user?.id !== m.user_id}
                          onBan={(targetUserId) => handleBanMember(targetUserId)}
                          side="left"
                          className="w-full"
                        >
                          <div
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-alura-surface2/60 transition-colors cursor-pointer w-full ${isOffline ? 'opacity-65' : ''}`}
                          >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Squircle Avatar com Dot de Status */}
                            <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-alura-surface2 border border-alura-border shrink-0 flex items-center justify-center">
                              {p?.avatar_url ? (
                                <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-black text-xs text-alura-accent">
                                  {p?.username?.[0]?.toUpperCase() || '?'}
                                </span>
                              )}
                              <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${statusColor} border border-alura-surface1`} title={getStatusBadgeText(userStatus)} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span
                                  className="text-xs font-semibold truncate group-hover:underline"
                                  style={{ color: m.topRoleColor || undefined }}
                                >
                                  {p?.display_name || p?.username || 'Membro'}
                                </span>
                                {isMemberOwner ? (
                                  <Crown size={12} className="text-amber-400 shrink-0" title="Proprietário" />
                                ) : m.topRoleName ? (
                                  <span
                                    className="text-[9px] px-1 py-0.2 rounded border font-bold"
                                    style={{
                                      borderColor: `${m.topRoleColor || '#00E6A0'}40`,
                                      color: m.topRoleColor || '#00E6A0',
                                    }}
                                  >
                                    {m.topRoleName}
                                  </span>
                                ) : null}
                              </div>
                              <span className="text-[10px] text-alura-textMuted truncate block">
                                @{p?.username || 'usuario'}
                              </span>
                            </div>
                          </div>

                          {/* Botão de Moderação Rápida se tiver permissão e não for o dono */}
                          {!isMemberOwner && (canManageMembers || canBanMembers) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMemberMenuId(showMenu ? null : m.user_id)
                              }}
                              className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary transition-all cursor-pointer"
                            >
                              <MoreHorizontal size={13} />
                            </button>
                          )}
                          </div>
                        </UserProfileHoverCard>

                        {/* Menu Contextual de Moderação */}
                        {showMenu && (
                          <div className="member-context-menu absolute right-2 top-8 z-30 p-1.5 rounded-xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl min-w-[140px] space-y-1 animate-in fade-in zoom-in-95">
                            {canManageMembers && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleKickMember(m.user_id)
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-500/15 cursor-pointer text-left"
                              >
                                <UserMinus size={13} />
                                <span>Expulsar</span>
                              </button>
                            )}
                            {canBanMembers && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBanMember(m.user_id)
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/15 cursor-pointer text-left"
                              >
                                <Ban size={13} />
                                <span>Banir</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </aside>

      {/* ── MODAL: CRIAR NOVO CANAL NO SERVIDOR ── */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-alura-surface1 border border-alura-border shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-alura-textPrimary">
                Criar Canal
              </h3>
              <button
                onClick={() => setShowCreateRoomModal(false)}
                className="p-1 rounded-lg text-alura-textMuted hover:text-alura-textPrimary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Seleção do Tipo: Texto ou Voz */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewRoomType('text')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  newRoomType === 'text'
                    ? 'bg-alura-selected border-alura-accent text-alura-textPrimary shadow-sm'
                    : 'bg-alura-surface2/60 border-alura-border text-alura-textSecondary hover:bg-alura-surface2'
                }`}
              >
                <Hash size={18} className={newRoomType === 'text' ? 'text-alura-accent' : 'text-alura-textMuted'} />
                <span className="text-xs font-bold">Canal de Texto</span>
                <span className="text-[10px] text-alura-textMuted">Poste mensagens, imagens e links</span>
              </button>

              <button
                type="button"
                onClick={() => setNewRoomType('voice')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  newRoomType === 'voice'
                    ? 'bg-alura-selected border-alura-accent text-alura-textPrimary shadow-sm'
                    : 'bg-alura-surface2/60 border-alura-border text-alura-textSecondary hover:bg-alura-surface2'
                }`}
              >
                <Volume2 size={18} className={newRoomType === 'voice' ? 'text-alura-accent' : 'text-alura-textMuted'} />
                <span className="text-xs font-bold">Canal de Voz</span>
                <span className="text-[10px] text-alura-textMuted">Converse com áudio e compartilhe tela</span>
              </button>
            </div>

            {/* Nome do Canal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                Nome do Canal
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-alura-surface2 border border-alura-border focus-within:border-alura-accent">
                {newRoomType === 'text' ? <Hash size={16} className="text-alura-textMuted" /> : <Volume2 size={16} className="text-alura-textMuted" />}
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="ex: novidades"
                  className="w-full bg-transparent text-xs sm:text-sm text-alura-textPrimary placeholder:text-alura-textMuted outline-none"
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateRoomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-alura-textSecondary hover:text-alura-textPrimary cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                className="px-5 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover disabled:opacity-40 text-alura-surface0 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Criar Canal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIGURAÇÕES COMPLETAS DO SERVIDOR ── */}
      {showSettingsModal && serverId && (
        <ServerSettingsModal
          isOpen={showSettingsModal}
          serverId={serverId}
          currentUserId={user?.id}
          onClose={() => setShowSettingsModal(false)}
          onServerUpdated={() => loadServerData(true)}
          onServerDeleted={() => {
            if (connectedVoiceRoomId) {
              hangUp()
            }
            navigate('/servers', { replace: true })
          }}
        />
      )}



      {/* ── MINI-WIDGET FLUTUANTE DE VOZ MINIMIZADA (NAVEGANDO NO SERVIDOR) ── */}
      {connectedVoiceRoomId && isVoiceMinimized && (
        <div className="fixed bottom-6 right-6 z-40 bg-alura-surface1/95 border border-alura-borderStrong rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-3.5 flex items-center gap-3.5 text-alura-textPrimary select-none animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-alura-accent/20 border border-alura-accent/40 flex items-center justify-center text-alura-accent shadow-sm">
              <Volume2 size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-alura-surface1" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-alura-textPrimary truncate max-w-[130px]">
                  #{rooms.find((r) => r.id === connectedVoiceRoomId)?.name || 'Voz'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Ao vivo
                </span>
              </div>
              <span className="text-[10px] text-alura-textMuted flex items-center gap-1">
                {voiceParticipants[connectedVoiceRoomId]?.length || 1} participante(s)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-l border-alura-border/70 pl-2.5">
            <button
              onClick={handleToggleAudioMute}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLocalAudioMuted
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-alura-surface2 hover:bg-alura-surface3 text-alura-textSecondary border-alura-border'
              }`}
              title={isLocalAudioMuted ? 'Desmutar Microfone' : 'Mutar Microfone'}
            >
              {isLocalAudioMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>

            <button
              onClick={() => {
                const room = rooms.find((r) => r.id === connectedVoiceRoomId)
                if (room) {
                  setActiveRoom(room)
                }
                setIsVoiceMinimized(false)
              }}
              className="px-3 py-2 rounded-xl bg-alura-accent text-alura-surface0 text-xs font-extrabold hover:bg-alura-accentHover transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
              title="Maximizar tela da chamada"
            >
              <Maximize2 size={13} />
              <span>Maximizar</span>
            </button>

            <button
              onClick={handleLeaveVoiceRoom}
              className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 transition-all cursor-pointer"
              title="Desconectar da chamada"
            >
              <PhoneOff size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: CRIAR ENQUETE (ANEXO 2) ── */}
      <CreatePollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />

      {/* ── MODAL: COMPARTILHAMENTO DE TELA COM ÁUDIO E QUALIDADE ── */}
      <ScreenShareModal
        isOpen={showScreenShareModal}
        onClose={() => setShowScreenShareModal(false)}
        onStartShare={handleStartScreenShare}
        onSelectSource={handleSelectDesktopSource}
      />

      {/* ── MODAL: LIGHTBOX DE IMAGENS EM TELA CHEIA ── */}
      <ImageLightboxModal
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage?.url || null}
        imageName={lightboxImage?.name}
        onClose={() => setLightboxImage(null)}
      />

      {/* ── MENU DE CONTEXTO (BOTÃO DIREITO) ESTILO DISCORD ── */}
      {contextMenu.isOpen && contextMenu.message && (
        <MessageContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          messageContent={contextMenu.message.content}
          mediaUrl={contextMenu.message.attachments?.[0]?.url}
          messageId={contextMenu.message.id}
          canDelete={contextMenu.message.user_id === user?.id || effectiveIsOwner || userPermissions.manage_messages}
          onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, message: null })}
          onDelete={() => handleDeleteServerMessage(contextMenu.message!.id)}
          onReply={() => {
            setReplyingTo(contextMenu.message)
            messageInputRef.current?.focus()
          }}
          onToast={(msg) => showToast({ type: 'info', title: 'Área de Transferência', message: msg })}
        />
      )}

    </div>
  )
}

export default ServerWorkspace
