import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Settings,
  Hash,
  Volume2,
  Shield,
  Users,
  AlertTriangle,
  Plus,
  Trash2,
  Check,
  Edit2,
  Upload,
  Globe,
  Lock,
  ChevronDown,
  Radio,
  Search,
  UserMinus,
  Ban,
  RotateCcw,
  Sparkles,
  Info,
  GripVertical
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { SERVER_CATEGORIES } from './ServerCategoryFilter'
import { compressImageToWebp } from '../../lib/utils/imageOptimizer'
import { useNotification } from '../../contexts/NotificationContext'
import { Switch } from '../ui/Switch'
import { SortableGroup, SortableItem, SortableDragHandle } from '../ui/Sortable'
import { DeleteChannelConfirmationModal } from './DeleteChannelConfirmationModal'

export interface ServerSettingsModalProps {
  isOpen: boolean
  serverId: string
  currentUserId: string
  onClose: () => void
  onServerUpdated: () => void
  onServerDeleted: () => void
}

type SettingsTab = 'overview' | 'channels' | 'roles' | 'members' | 'bans' | 'danger'

interface SpaceItem {
  id: string
  name: string
  position: number
}

interface RoomItem {
  id: string
  space_id: string | null
  name: string
  type: 'text' | 'voice' | 'video' | 'forum' | 'announcements' | 'media'
  position: number
}

interface RoleItem {
  id: string
  server_id: string
  name: string
  color: string | null
  position: number
  is_hoisted?: boolean
  permissions?: Record<string, boolean>
}

interface MemberWithRoles {
  user_id: string
  nickname: string | null
  joined_at: string
  profile?: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    status: string | null
  }
  roles: RoleItem[]
}

interface BanItem {
  id: string
  user_id: string
  reason: string | null
  created_at: string
  profiles?: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

const PRESET_ROLE_COLORS = [
  '#00E6A0', // Alura Emerald Accent
  '#39FF88', // Bright Neon
  '#00C98A', // Deep Emerald
  '#58A6FF', // Cyber Blue
  '#8B7CFF', // Indigo AI
  '#D9B84A', // Gold
  '#FF9F43', // Warm Amber
  '#FF5C6C', // Soft Coral / Crimson
  '#FD79A8', // Neon Pink
  '#A29BFE', // Lavender
  '#B8CEC2', // Alura Muted Green
]

export function ServerSettingsModal({
  isOpen,
  serverId,
  currentUserId,
  onClose,
  onServerUpdated,
  onServerDeleted,
}: ServerSettingsModalProps) {
  const { showToast } = useNotification()
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Servidor
  const [server, setServer] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)

  // Campos de Visão Geral
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Tecnologia')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isNsfw, setIsNsfw] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  // Espaços e Canais
  const [spaces, setSpaces] = useState<SpaceItem[]>([])
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [newSpaceName, setNewSpaceName] = useState('')
  const [isCreatingSpace, setIsCreatingSpace] = useState(false)
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null)
  const [editingSpaceName, setEditingSpaceName] = useState('')
  const [newRoomInSpaceId, setNewRoomInSpaceId] = useState<string | null>(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomType, setNewRoomType] = useState<'text' | 'voice'>('text')

  // Modal de Confirmação de Exclusão de Canal ou Espaço
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    name: string
    type: 'canal' | 'espaço'
  } | null>(null)
  const [isDeletingItem, setIsDeletingItem] = useState(false)

  // Cargos
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [roleName, setRoleName] = useState('')
  const [roleColor, setRoleColor] = useState('#00E6A0')
  const [roleIsHoisted, setRoleIsHoisted] = useState(false)
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({
    manage_server: false,
    manage_roles: false,
    manage_rooms: false,
    manage_members: false,
    ban_member: false,
    mute_members: false,
    deafen_members: false,
    move_members: false,
    send_message: true,
    delete_message: false,
    mention_everyone: false,
    connect_voice: true,
    speak: true,
    video: true,
    screen_share: true,
    use_soundboard: true,
  })

  // Membros e Dropdown controlado de cargos (corrige hover que sumia)
  const [members, setMembers] = useState<MemberWithRoles[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [openRoleMenuForMemberId, setOpenRoleMenuForMemberId] = useState<string | null>(null)

  // Bans
  const [bans, setBans] = useState<BanItem[]>([])

  // Exclusão
  const [confirmDeleteName, setConfirmDeleteName] = useState('')

  const iconInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const memberMenuRef = useRef<HTMLDivElement>(null)

  // Fecha dropdown de cargos ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openRoleMenuForMemberId && !(e.target as Element).closest('.role-dropdown-container')) {
        setOpenRoleMenuForMemberId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openRoleMenuForMemberId])

  // Carrega todos os dados do servidor ao abrir
  useEffect(() => {
    if (!isOpen || !serverId) return
    loadAllServerData()
  }, [isOpen, serverId])

  const loadAllServerData = async () => {
    setLoading(true)
    try {
      // 1. Dados do Servidor
      const { data: srvData } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single()

      if (srvData) {
        setServer(srvData)
        setIsOwner(srvData.owner_id === currentUserId)
        setName(srvData.name || '')
        setDescription(srvData.description || '')
        setCategory(srvData.category || 'Tecnologia')
        setTags(srvData.tags || [])
        setIconUrl(srvData.icon_url || '')
        setBannerUrl(srvData.banner_url || '')
        setIsPublic(srvData.is_public ?? true)
        setIsNsfw(srvData.is_nsfw ?? false)
      }

      // 2. Espaços e Salas
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true })
      setSpaces(spacesData || [])

      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .eq('server_id', serverId)
        .order('position', { ascending: true })
      setRooms(roomsData || [])

      // 3. Cargos e Permissões
      const { data: rolesData } = await supabase
        .from('roles')
        .select(`
          id,
          server_id,
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

      let mappedRoles: RoleItem[] = (rolesData || []).map((r: any) => {
        const rawPerms = Array.isArray(r.role_permissions) ? r.role_permissions[0] : r.role_permissions
        return {
          id: r.id,
          server_id: r.server_id,
          name: r.name,
          color: r.color,
          position: r.position,
          is_hoisted: r.is_hoisted ?? false,
          permissions: rawPerms || {},
        }
      })

      // Garante a existência do cargo base @everyone
      const hasEveryone = mappedRoles.some((r) => r.name.toLowerCase() === '@everyone' || r.name.toLowerCase() === 'everyone')
      if (!hasEveryone) {
        try {
          const { data: createdEveryone } = await supabase
            .from('roles')
            .insert({
              server_id: serverId,
              name: '@everyone',
              color: '#94A3B8',
              position: 0,
              is_hoisted: false,
            })
            .select()
            .single()

          if (createdEveryone) {
            await supabase.from('role_permissions').insert({
              role_id: createdEveryone.id,
              send_message: true,
              read_message_history: true,
              attach_files: true,
              create_polls: true,
              send_gifs: true,
              create_threads: true,
              connect_voice: true,
              speak: true,
              video: true,
              screen_share: true,
              use_soundboard: true,
            })
            mappedRoles.push({
              id: createdEveryone.id,
              server_id: serverId,
              name: '@everyone',
              color: '#94A3B8',
              position: 0,
              is_hoisted: false,
              permissions: {
                send_message: true,
                read_message_history: true,
                attach_files: true,
                create_polls: true,
                send_gifs: true,
                create_threads: true,
                connect_voice: true,
                speak: true,
                video: true,
                screen_share: true,
                use_soundboard: true,
              },
            })
          }
        } catch (e) {
          console.warn('[ServerSettingsModal] Erro ao criar @everyone padrão:', e)
        }
      }

      setRoles(mappedRoles)
      if (mappedRoles.length > 0) {
        selectRole(mappedRoles[0])
      }

      // 4. Membros e seus Cargos
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

      const { data: memberRolesData } = await supabase
        .from('member_roles')
        .select('user_id, role_id')
        .eq('server_id', serverId)

      const formattedMembers: MemberWithRoles[] = (membersData || []).map((m: any) => {
        const assignedRoleIds = (memberRolesData || [])
          .filter((mr: any) => mr.user_id === m.user_id)
          .map((mr: any) => mr.role_id)

        const userRoles = mappedRoles.filter((r) => assignedRoleIds.includes(r.id))

        return {
          user_id: m.user_id,
          nickname: m.nickname,
          joined_at: m.joined_at,
          profile: m.profiles,
          roles: userRoles,
        }
      })
      setMembers(formattedMembers)

      // 5. Bans
      const { data: bansData } = await supabase
        .from('server_bans')
        .select(`
          id,
          user_id,
          reason,
          created_at,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('server_id', serverId)
      setBans((bansData as any) || [])
    } catch (err) {
      console.error('[ServerSettingsModal] Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  // --- SELEÇÃO E GESTÃO DE CARGOS ---
  const selectRole = (r: RoleItem) => {
    setSelectedRoleId(r.id)
    setRoleName(r.name)
    setRoleColor(r.color || '#00E6A0')
    setRoleIsHoisted(r.is_hoisted ?? false)
    setRolePermissions(
      r.permissions || {
        manage_server: false,
        manage_roles: false,
        manage_rooms: false,
        manage_members: false,
        ban_member: false,
        mute_members: false,
        deafen_members: false,
        move_members: false,
        send_message: true,
        delete_message: false,
        mention_everyone: false,
        connect_voice: true,
        speak: true,
        video: true,
        screen_share: true,
        use_soundboard: true,
      }
    )
  }

  const handleCreateRole = async () => {
    try {
      const newPos = roles.length
      const { data: newRole, error: roleErr } = await supabase
        .from('roles')
        .insert({
          server_id: serverId,
          name: 'Novo Cargo',
          color: '#00E6A0',
          position: newPos,
          is_hoisted: false,
        })
        .select()
        .single()

      if (roleErr || !newRole) throw roleErr

      // Cria permissões padrão
      await supabase.from('role_permissions').insert({
        role_id: newRole.id,
        send_message: true,
        read_message_history: true,
        attach_files: true,
        create_polls: true,
        send_gifs: true,
        create_threads: true,
        connect_voice: true,
        speak: true,
        video: true,
        screen_share: true,
        use_soundboard: true,
      })

      const item: RoleItem = {
        id: newRole.id,
        server_id: serverId,
        name: newRole.name,
        color: newRole.color,
        position: newRole.position,
        is_hoisted: false,
        permissions: {
          manage_server: false,
          manage_roles: false,
          manage_rooms: false,
          manage_members: false,
          ban_member: false,
          mute_members: false,
          deafen_members: false,
          move_members: false,
          send_message: true,
          read_message_history: true,
          attach_files: true,
          create_polls: true,
          send_gifs: true,
          create_threads: true,
          delete_message: false,
          mention_everyone: false,
          connect_voice: true,
          speak: true,
          video: true,
          screen_share: true,
          use_soundboard: true,
        },
      }

      setRoles([item, ...roles])
      selectRole(item)
      showToast({ type: 'success', title: 'Cargo criado!', message: 'Personalize o nome, cor e permissões.' })
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao criar cargo', message: err.message })
    }
  }

  const handleSaveRole = async () => {
    if (!selectedRoleId || !roleName.trim()) return
    setSaving(true)
    try {
      await supabase
        .from('roles')
        .update({
          name: roleName.trim(),
          color: roleColor,
          is_hoisted: roleIsHoisted,
        })
        .eq('id', selectedRoleId)

      await supabase
        .from('role_permissions')
        .upsert({
          role_id: selectedRoleId,
          ...rolePermissions,
        })

      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRoleId
            ? {
                ...r,
                name: roleName.trim(),
                color: roleColor,
                is_hoisted: roleIsHoisted,
                permissions: rolePermissions,
              }
            : r
        )
      )

      showToast({ type: 'success', title: 'Cargo salvo!', message: 'As permissões foram atualizadas.' })
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao salvar cargo', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (rId: string) => {
    const roleToDelete = roles.find((r) => r.id === rId)
    if (roleToDelete?.name.toLowerCase() === '@everyone' || roleToDelete?.name.toLowerCase() === 'everyone') {
      showToast({
        type: 'warning',
        title: 'Operação não permitida',
        message: 'O cargo base @everyone não pode ser excluído, mas você pode personalizar todas as suas permissões.',
      })
      return
    }
    try {
      await supabase.from('roles').delete().eq('id', rId)
      const remaining = roles.filter((r) => r.id !== rId)
      setRoles(remaining)
      if (selectedRoleId === rId && remaining.length > 0) {
        selectRole(remaining[0])
      } else if (remaining.length === 0) {
        setSelectedRoleId(null)
      }
      showToast({ type: 'success', title: 'Cargo removido com sucesso' })
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao excluir cargo', message: err.message })
    }
  }

  // Reordenação de Cargos (Sortable)
  const handleReorderRoles = async (newOrderedRoles: RoleItem[]) => {
    const updatedRoles = newOrderedRoles.map((r, idx) => ({
      ...r,
      position: newOrderedRoles.length - idx,
    }))
    setRoles(updatedRoles)
    try {
      // Atualiza positions no banco de dados (mais alto = maior hierarquia)
      for (let i = 0; i < updatedRoles.length; i++) {
        await supabase
          .from('roles')
          .update({ position: updatedRoles[i].position })
          .eq('id', updatedRoles[i].id)
      }
      onServerUpdated()
    } catch (err) {
      console.error('Erro ao salvar nova ordem de cargos:', err)
    }
  }

  // --- ATRIBUIÇÃO DE CARGOS AOS MEMBROS ---
  const handleToggleMemberRole = async (userId: string, roleId: string) => {
    const member = members.find((m) => m.user_id === userId)
    if (!member) return

    const hasRole = member.roles.some((r) => r.id === roleId)
    try {
      if (hasRole) {
        await supabase
          .from('member_roles')
          .delete()
          .eq('server_id', serverId)
          .eq('user_id', userId)
          .eq('role_id', roleId)

        setMembers((prev) =>
          prev.map((m) =>
            m.user_id === userId
              ? { ...m, roles: m.roles.filter((r) => r.id !== roleId) }
              : m
          )
        )
      } else {
        await supabase.from('member_roles').insert({
          server_id: serverId,
          user_id: userId,
          role_id: roleId,
        })

        const roleToAdd = roles.find((r) => r.id === roleId)
        if (roleToAdd) {
          setMembers((prev) =>
            prev.map((m) =>
              m.user_id === userId ? { ...m, roles: [...m.roles, roleToAdd] } : m
            )
          )
        }
      }
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao alterar cargo do membro', message: err.message })
    }
  }

  // Expulsar membro
  const handleKickMember = async (userId: string) => {
    if (userId === server?.owner_id) {
      showToast({ type: 'error', title: 'Ação não permitida', message: 'O proprietário da comunidade não pode ser expulso.' })
      return
    }

    try {
      await supabase
        .from('server_members')
        .delete()
        .eq('server_id', serverId)
        .eq('user_id', userId)

      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
      showToast({ type: 'success', title: 'Membro expulso da comunidade' })
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao expulsar membro', message: err.message })
    }
  }

  // Banir membro
  const handleBanMember = async (userId: string) => {
    if (userId === server?.owner_id) {
      showToast({ type: 'error', title: 'Ação não permitida', message: 'O proprietário da comunidade não pode ser banido.' })
      return
    }

    try {
      await supabase.from('server_bans').insert({
        server_id: serverId,
        user_id: userId,
        reason: 'Banido pelas configurações de moderação.',
        banned_by: currentUserId,
      })

      await supabase
        .from('server_members')
        .delete()
        .eq('server_id', serverId)
        .eq('user_id', userId)

      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
      showToast({ type: 'success', title: 'Membro banido com sucesso' })
      loadAllServerData()
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao banir membro', message: err.message })
    }
  }

  // Desbanir membro
  const handleUnbanMember = async (banId: string) => {
    try {
      await supabase.from('server_bans').delete().eq('id', banId)
      setBans((prev) => prev.filter((b) => b.id !== banId))
      showToast({ type: 'success', title: 'Banimento revogado!' })
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao revogar banimento', message: err.message })
    }
  }

  // --- GESTÃO DE ESPAÇOS E CANAIS ---
  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return
    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          server_id: serverId,
          name: newSpaceName.trim(),
          position: spaces.length,
        })
        .select()
        .single()

      if (!error && data) {
        setSpaces([...spaces, data])
        setNewSpaceName('')
        setIsCreatingSpace(false)
        showToast({ type: 'success', title: 'Espaço criado!' })
        onServerUpdated()
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao criar espaço', message: err.message })
    }
  }

  const handleUpdateSpace = async (spaceId: string) => {
    if (!editingSpaceName.trim()) return
    try {
      await supabase.from('spaces').update({ name: editingSpaceName.trim() }).eq('id', spaceId)
      setSpaces((prev) =>
        prev.map((s) => (s.id === spaceId ? { ...s, name: editingSpaceName.trim() } : s))
      )
      setEditingSpaceId(null)
      showToast({ type: 'success', title: 'Espaço renomeado!' })
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao atualizar espaço', message: err.message })
    }
  }

  const handleCreateRoom = async (spaceId: string) => {
    if (!newRoomName.trim()) return
    try {
      const cleanName = newRoomName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')

      const { data, error } = await supabase
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

      if (!error && data) {
        setRooms([...rooms, data])
        setNewRoomInSpaceId(null)
        setNewRoomName('')
        showToast({ type: 'success', title: 'Canal criado com sucesso!' })
        onServerUpdated()
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao criar canal', message: err.message })
    }
  }

  // Reordenação de Canais dentro de um Espaço (Sortable)
  const handleReorderRooms = async (spaceId: string, newSpaceRooms: RoomItem[]) => {
    // Atualiza explicitamente o campo position de cada canal
    const updatedSpaceRooms = newSpaceRooms.map((r, idx) => ({
      ...r,
      position: idx,
    }))

    // Atualiza estado local mantendo os canais de outros espaços
    setRooms((prev) => {
      const otherRooms = prev.filter((r) => r.space_id !== spaceId)
      return [...otherRooms, ...updatedSpaceRooms]
    })

    try {
      for (let i = 0; i < updatedSpaceRooms.length; i++) {
        await supabase
          .from('rooms')
          .update({ position: updatedSpaceRooms[i].position })
          .eq('id', updatedSpaceRooms[i].id)
      }
      onServerUpdated()
    } catch (err) {
      console.error('Erro ao reordenar canais:', err)
    }
  }

  // Confirmação de exclusão do canal ou espaço
  const handleExecuteDelete = async () => {
    if (!itemToDelete) return
    setIsDeletingItem(true)

    try {
      if (itemToDelete.type === 'canal') {
        await supabase.from('rooms').delete().eq('id', itemToDelete.id)
        setRooms((prev) => prev.filter((r) => r.id !== itemToDelete.id))
        showToast({ type: 'success', title: 'Canal excluído com sucesso.' })
      } else {
        await supabase.from('spaces').delete().eq('id', itemToDelete.id)
        setSpaces((prev) => prev.filter((s) => s.id !== itemToDelete.id))
        setRooms((prev) => prev.filter((r) => r.space_id !== itemToDelete.id))
        showToast({ type: 'success', title: 'Espaço e seus canais foram removidos.' })
      }
      setItemToDelete(null)
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao excluir item', message: err.message })
    } finally {
      setIsDeletingItem(false)
    }
  }

  // --- UPLOAD DE ÍCONE E BANNER ---
  const handleUploadMedia = async (file: File, type: 'icon' | 'banner') => {
    if (type === 'icon') setUploadingIcon(true)
    else setUploadingBanner(true)

    try {
      let finalFile = file
      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        try {
          const comp = await compressImageToWebp(file)
          finalFile = new File([comp], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
            type: 'image/webp',
          })
        } catch {
          // ignora falha de compressão
        }
      }

      const ext = finalFile.name.split('.').pop()
      const path = `server_${type}s/${serverId}_${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, finalFile, { contentType: finalFile.type })

      if (!upErr) {
        const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(path)
        if (pubData?.publicUrl) {
          if (type === 'icon') setIconUrl(pubData.publicUrl)
          else setBannerUrl(pubData.publicUrl)
          showToast({ type: 'success', title: `${type === 'icon' ? 'Ícone' : 'Banner'} carregado!` })
        }
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro no upload', message: err.message })
    } finally {
      if (type === 'icon') setUploadingIcon(false)
      else setUploadingBanner(false)
    }
  }

  // Salvar Visão Geral
  const handleSaveOverview = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', title: 'Nome obrigatório', message: 'O nome da comunidade não pode ficar em branco.' })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('servers')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          category,
          tags,
          icon_url: iconUrl.trim() || null,
          banner_url: bannerUrl.trim() || null,
          is_public: isPublic,
          is_nsfw: isNsfw,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serverId)

      if (error) throw error

      showToast({ type: 'success', title: 'Servidor atualizado!', message: 'As alterações foram salvas com sucesso.' })
      onServerUpdated()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao salvar', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Excluir Servidor Definitivamente
  const handleDeleteServer = async () => {
    if (!isOwner) return
    if (confirmDeleteName.trim() !== server?.name) {
      showToast({
        type: 'error',
        title: 'Nome incorreto',
        message: `Digite exatamente "${server?.name}" para confirmar a exclusão.`,
      })
      return
    }

    setSaving(true)
    try {
      // 1. Remove qualquer fixação de servidor antes ou em cascata
      try {
        await supabase.from('user_pinned_servers').delete().eq('server_id', serverId)
      } catch (pinErr) {
        console.warn('[ServerSettingsModal] Aviso ao remover fixações do servidor:', pinErr)
      }

      // 2. Exclui o servidor no Supabase
      const { error } = await supabase.from('servers').delete().eq('id', serverId)
      if (error) throw error

      // 3. Limpa storage local do usuário atual
      if (currentUserId) {
        try {
          const storageKey = `alura_pinned_servers_${currentUserId}`
          const cached = localStorage.getItem(storageKey)
          if (cached) {
            const list = JSON.parse(cached)
            const filtered = list.filter((s: any) => s.server_id !== serverId && s.id !== serverId)
            localStorage.setItem(storageKey, JSON.stringify(filtered))
            window.dispatchEvent(
              new CustomEvent('alura:pinned_servers_changed', {
                detail: { userId: currentUserId, servers: filtered },
              })
            )
          }
        } catch (storageErr) {
          console.warn('[ServerSettingsModal] Falha ao limpar storage local:', storageErr)
        }
      }

      // 4. Dispara evento global de servidor deletado para toda a aplicação
      window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId } }))

      showToast({ type: 'success', title: 'Servidor excluído permanentemente.' })
      onClose()
      onServerDeleted()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao excluir servidor', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  // Sair do Servidor
  const handleLeaveServer = async () => {
    try {
      // 1. Remove fixação da barra lateral se o usuário tiver fixado
      if (currentUserId) {
        try {
          await supabase
            .from('user_pinned_servers')
            .delete()
            .eq('server_id', serverId)
            .eq('user_id', currentUserId)

          const storageKey = `alura_pinned_servers_${currentUserId}`
          const cached = localStorage.getItem(storageKey)
          if (cached) {
            const list = JSON.parse(cached)
            const filtered = list.filter((s: any) => s.server_id !== serverId && s.id !== serverId)
            localStorage.setItem(storageKey, JSON.stringify(filtered))
            window.dispatchEvent(
              new CustomEvent('alura:pinned_servers_changed', {
                detail: { userId: currentUserId, servers: filtered },
              })
            )
          }
        } catch (e) {
          console.warn('[ServerSettingsModal] Aviso ao desafixar ao sair:', e)
        }
      }

      // 2. Remove membro
      const { error } = await supabase
        .from('server_members')
        .delete()
        .eq('server_id', serverId)
        .eq('user_id', currentUserId)

      if (error) throw error

      // 3. Notifica a aplicação para atualizar listas e sidebar
      window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId } }))

      showToast({ type: 'success', title: 'Você saiu da comunidade.' })
      onClose()
      onServerDeleted()
    } catch (err: any) {
      showToast({ type: 'error', title: 'Erro ao sair do servidor', message: err.message })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-5xl h-[88vh] rounded-3xl overflow-hidden bg-alura-surface1 border border-alura-borderStrong/60 shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex text-alura-textPrimary animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. BARRA LATERAL DE ABAS ── */}
        <aside className="w-56 sm:w-64 bg-alura-background border-r border-alura-border flex flex-col shrink-0 p-4 justify-between">
          <div className="space-y-6">
            {/* Header do Servidor */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-alura-surface2 border border-alura-borderStrong shrink-0 flex items-center justify-center font-black text-xs text-alura-accent">
                {iconUrl ? (
                  <img src={iconUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name[0]?.toUpperCase() || 'A'
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-black text-xs text-alura-textPrimary truncate">
                  {name || 'Servidor'}
                </span>
                <span className="text-[10px] text-alura-textMuted uppercase tracking-wider font-bold">
                  Configurações
                </span>
              </div>
            </div>

            {/* Abas */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'overview'
                    ? 'bg-alura-selected text-alura-accent border border-alura-borderStrong shadow-sm'
                    : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2'
                }`}
              >
                <Settings size={15} />
                <span>Visão Geral</span>
              </button>

              <button
                onClick={() => setActiveTab('channels')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'channels'
                    ? 'bg-alura-selected text-alura-accent border border-alura-borderStrong shadow-sm'
                    : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2'
                }`}
              >
                <Hash size={15} />
                <span>Canais & Espaços</span>
              </button>

              <button
                onClick={() => setActiveTab('roles')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'roles'
                    ? 'bg-alura-selected text-alura-accent border border-alura-borderStrong shadow-sm'
                    : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2'
                }`}
              >
                <Shield size={15} />
                <span>Cargos & Permissões</span>
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'members'
                    ? 'bg-alura-selected text-alura-accent border border-alura-borderStrong shadow-sm'
                    : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2'
                }`}
              >
                <Users size={15} />
                <span>Membros ({members.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bans')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'bans'
                    ? 'bg-alura-selected text-alura-accent border border-alura-borderStrong shadow-sm'
                    : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2'
                }`}
              >
                <Ban size={15} />
                <span>Banimentos ({bans.length})</span>
              </button>

              <div className="pt-2 border-t border-alura-border/60" />

              <button
                onClick={() => setActiveTab('danger')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === 'danger'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                    : 'text-red-400/80 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <AlertTriangle size={15} />
                <span>Zona de Perigo</span>
              </button>
            </nav>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-alura-surface2 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary transition-all cursor-pointer border border-alura-border"
          >
            <span>Fechar Configurações</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-alura-surface1 border border-alura-border font-mono text-alura-textMuted">
              ESC
            </span>
          </button>
        </aside>

        {/* ── 2. PAINEL DE CONTEÚDO DA ABA ATIVA ── */}
        <main className="flex-1 flex flex-col bg-alura-surface1 overflow-hidden relative">
          
          {/* Header Superior da Aba */}
          <div className="h-16 px-6 sm:px-8 border-b border-alura-border flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-black text-alura-textPrimary tracking-tight">
                {activeTab === 'overview' && 'Visão Geral da Comunidade'}
                {activeTab === 'channels' && 'Gestão de Canais e Espaços'}
                {activeTab === 'roles' && 'Cargos e Permissões Granulares'}
                {activeTab === 'members' && 'Gerenciamento de Membros'}
                {activeTab === 'bans' && 'Usuários Banidos da Comunidade'}
                {activeTab === 'danger' && 'Zona de Perigo'}
              </h2>
              <p className="text-[11px] text-alura-textMuted">
                {activeTab === 'overview' && 'Ajuste a identidade, imagens e visibilidade pública da comunidade.'}
                {activeTab === 'channels' && 'Arraste para organizar canais e crie novas salas de bate-papo.'}
                {activeTab === 'roles' && 'Arraste para reordenar hierarquia e configure permissões com switches.'}
                {activeTab === 'members' && 'Atribua cargos, expulse ou bana usuários da sua comunidade.'}
                {activeTab === 'bans' && 'Revogue banimentos e visualize motivos registrados.'}
                {activeTab === 'danger' && 'Ações destrutivas e transferência ou saída da comunidade.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-alura-surface2 hover:bg-alura-surface3 text-alura-textMuted hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Área com Scroll do Conteúdo */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* ══════════ ABA 1: VISÃO GERAL ══════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-2xl">
                {/* Upload de Ícone e Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ícone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                      Ícone da Comunidade
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-alura-surface2 border border-alura-borderStrong shrink-0 flex items-center justify-center text-xl font-black text-alura-accent relative group">
                        {iconUrl ? (
                          <img src={iconUrl} alt="Ícone" className="w-full h-full object-cover" />
                        ) : (
                          name[0]?.toUpperCase() || 'A'
                        )}
                        {uploadingIcon && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => iconInputRef.current?.click()}
                          disabled={uploadingIcon}
                          className="px-3 py-1.5 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-xs font-bold text-alura-textPrimary border border-alura-border cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Upload size={13} className="text-alura-accent" />
                          <span>Alterar Ícone</span>
                        </button>
                        <p className="text-[10px] text-alura-textMuted">Recomendado 512x512px. Squircle automático.</p>
                      </div>
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleUploadMedia(f, 'icon')
                        }}
                      />
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                      Banner Superior
                    </label>
                    <div className="h-16 rounded-2xl overflow-hidden bg-alura-surface2 border border-alura-border relative group flex items-center justify-center">
                      {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] text-alura-textMuted font-bold">Sem Banner</span>
                      )}
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploadingBanner}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-opacity cursor-pointer"
                      >
                        <Upload size={14} className="text-alura-accent" />
                        <span>Trocar Banner</span>
                      </button>
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleUploadMedia(f, 'banner')
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Nome do Servidor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                    Nome da Comunidade *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                    placeholder="Ex: Alura Developers"
                    className="w-full px-4 py-2.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs font-semibold text-alura-textPrimary focus:outline-none focus:border-alura-borderStrong focus:ring-1 focus:ring-alura-borderStrong"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                    Descrição da Comunidade
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={280}
                    rows={3}
                    placeholder="Apresente sua comunidade em poucas palavras..."
                    className="w-full px-4 py-2.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs font-medium text-alura-textPrimary focus:outline-none focus:border-alura-borderStrong focus:ring-1 focus:ring-alura-borderStrong resize-none"
                  />
                  <div className="flex justify-end text-[10px] text-alura-textMuted">
                    {description.length}/280 caracteres
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                    Categoria Principal
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs font-semibold text-alura-textPrimary focus:outline-none focus:border-alura-borderStrong cursor-pointer"
                  >
                    {SERVER_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id} className="bg-alura-surface1">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                    Tags de Busca
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-alura-surface2 border border-alura-border min-h-[42px] items-center">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-alura-surface3 text-[11px] font-bold text-alura-accent border border-alura-border"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((x) => x !== t))}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          const clean = tagInput.trim().replace(/^#/, '').toLowerCase()
                          if (clean && !tags.includes(clean) && tags.length < 8) {
                            setTags([...tags, clean])
                            setTagInput('')
                          }
                        }
                      }}
                      placeholder="Adicionar tag e apertar Enter..."
                      className="flex-1 bg-transparent px-2 text-xs font-medium text-alura-textPrimary focus:outline-none min-w-[140px]"
                    />
                  </div>
                </div>

                {/* Visibilidade Pública e NSFW com Switch Shadcn/ReUI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-alura-surface2 border border-alura-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-alura-textPrimary">
                        <Globe size={14} className="text-alura-accent" />
                        <span>Comunidade Pública</span>
                      </div>
                      <p className="text-[10px] text-alura-textMuted mt-0.5">Aparece na aba de descoberta para todos.</p>
                    </div>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-alura-surface2 border border-alura-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-alura-textPrimary">
                        <AlertTriangle size={14} className="text-amber-400" />
                        <span>Conteúdo Adulto (+18)</span>
                      </div>
                      <p className="text-[10px] text-alura-textMuted mt-0.5">Classifica o servidor como NSFW.</p>
                    </div>
                    <Switch
                      checked={isNsfw}
                      onCheckedChange={setIsNsfw}
                    />
                  </div>
                </div>

                {/* Botão de Salvar Overview */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveOverview}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-alura-accent text-alura-background font-black text-xs hover:bg-alura-accentBright transition-all cursor-pointer shadow-lg shadow-alura-accent/20 flex items-center gap-2"
                  >
                    {saving && <div className="w-3.5 h-3.5 border-2 border-alura-background border-t-transparent rounded-full animate-spin" />}
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══════════ ABA 2: CANAIS E ESPAÇOS (SORTABLE + MODAL CONFIRMAÇÃO) ══════════ */}
            {activeTab === 'channels' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-alura-textSecondary uppercase tracking-wider">
                    Estrutura de Canais ({rooms.length} canais em {spaces.length} espaços)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingSpace(true)}
                    className="px-3 py-1.5 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-xs font-bold text-alura-accent border border-alura-borderStrong/60 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus size={14} />
                    <span>Novo Espaço / Categoria</span>
                  </button>
                </div>

                {/* Formulário de Criação de Espaço */}
                {isCreatingSpace && (
                  <div className="p-4 rounded-2xl bg-alura-surface2 border border-alura-borderStrong animate-in fade-in space-y-3">
                    <span className="text-xs font-bold text-alura-textPrimary">Criar Novo Espaço</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpaceName}
                        onChange={(e) => setNewSpaceName(e.target.value)}
                        placeholder="Ex: PROJETOS, JOGOS, ESTUDOS..."
                        className="flex-1 px-3 py-2 rounded-xl bg-alura-surface1 border border-alura-border text-xs text-alura-textPrimary focus:outline-none focus:border-alura-borderStrong"
                      />
                      <button
                        type="button"
                        onClick={handleCreateSpace}
                        className="px-4 py-2 rounded-xl bg-alura-accent text-alura-background text-xs font-black cursor-pointer hover:bg-alura-accentBright"
                      >
                        Criar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingSpace(false)}
                        className="px-3 py-2 rounded-xl bg-alura-surface3 text-xs font-bold text-alura-textMuted cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Espaços com Sortable nos Canais */}
                <div className="space-y-4">
                  {spaces.map((space) => {
                    const spaceRooms = rooms
                      .filter((r) => r.space_id === space.id)
                      .sort((a, b) => a.position - b.position)

                    return (
                      <div
                        key={space.id}
                        className="p-4 rounded-2xl bg-alura-surface2/60 border border-alura-border space-y-3"
                      >
                        {/* Header do Espaço */}
                        <div className="flex items-center justify-between border-b border-alura-border/60 pb-2">
                          {editingSpaceId === space.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editingSpaceName}
                                onChange={(e) => setEditingSpaceName(e.target.value)}
                                className="px-2 py-1 rounded bg-alura-surface1 border border-alura-border text-xs text-alura-textPrimary font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateSpace(space.id)}
                                className="text-xs font-bold text-alura-accent hover:underline cursor-pointer"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSpaceId(null)}
                                className="text-xs text-alura-textMuted hover:underline cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-alura-textPrimary uppercase tracking-wider">
                                {space.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSpaceId(space.id)
                                  setEditingSpaceName(space.name)
                                }}
                                className="text-alura-textMuted hover:text-alura-textPrimary cursor-pointer"
                                title="Renomear Espaço"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setNewRoomInSpaceId(space.id)
                                setNewRoomName('')
                              }}
                              className="px-2 py-1 rounded-lg bg-alura-surface2 hover:bg-alura-surface3 text-[11px] font-bold text-alura-accent flex items-center gap-1 cursor-pointer"
                              title="Adicionar Canal neste Espaço"
                            >
                              <Plus size={12} />
                              <span>Novo Canal</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setItemToDelete({
                                  id: space.id,
                                  name: space.name,
                                  type: 'espaço',
                                })
                              }
                              className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-alura-textMuted hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                              title="Excluir Espaço"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Formulário inline para novo canal no espaço */}
                        {newRoomInSpaceId === space.id && (
                          <div className="p-3 rounded-xl bg-alura-surface1 border border-alura-borderStrong space-y-2 animate-in fade-in">
                            <span className="text-[11px] font-bold text-alura-textPrimary">
                              Novo Canal em {space.name}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-1 bg-alura-surface2 p-1 rounded-xl border border-alura-border">
                                <button
                                  type="button"
                                  onClick={() => setNewRoomType('text')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                    newRoomType === 'text'
                                      ? 'bg-alura-selected text-alura-accent'
                                      : 'text-alura-textMuted'
                                  }`}
                                >
                                  <Hash size={12} />
                                  <span>Texto</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewRoomType('voice')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                                    newRoomType === 'voice'
                                      ? 'bg-alura-selected text-alura-accent'
                                      : 'text-alura-textMuted'
                                  }`}
                                >
                                  <Volume2 size={12} />
                                  <span>Voz</span>
                                </button>
                              </div>

                              <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="nome-do-canal"
                                className="flex-1 px-3 py-1.5 rounded-xl bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary focus:outline-none min-w-[140px]"
                              />

                              <button
                                type="button"
                                onClick={() => handleCreateRoom(space.id)}
                                className="px-3 py-1.5 rounded-xl bg-alura-accent text-alura-background text-xs font-black cursor-pointer hover:bg-alura-accentBright"
                              >
                                Criar Canal
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewRoomInSpaceId(null)}
                                className="px-2.5 py-1.5 rounded-xl bg-alura-surface3 text-xs font-bold text-alura-textMuted cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Canais dentro do Espaço com Sortable Drag & Drop */}
                        {spaceRooms.length === 0 ? (
                          <p className="text-[11px] text-alura-textMuted italic py-1">
                            Nenhum canal neste espaço ainda.
                          </p>
                        ) : (
                          <SortableGroup
                            items={spaceRooms}
                            onReorder={(newOrder) => handleReorderRooms(space.id, newOrder)}
                            className="space-y-1.5"
                          >
                            {spaceRooms.map((room) => (
                              <SortableItem key={room.id} value={room}>
                                {({ dragControls }) => (
                                  <div
                                    onPointerDown={(e) => {
                                      if ((e.target as HTMLElement).closest('button, input')) return
                                      dragControls.start(e)
                                    }}
                                    style={{ touchAction: 'none' }}
                                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-alura-surface1/80 hover:bg-alura-surface1 border border-alura-border/60 transition-colors group cursor-grab active:cursor-grabbing"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <SortableDragHandle dragControls={dragControls} />
                                      {room.type === 'voice' ? (
                                        <Volume2 size={14} className="text-alura-accent shrink-0" />
                                      ) : (
                                        <Hash size={14} className="text-alura-textMuted shrink-0" />
                                      )}
                                      <span className="text-xs font-bold text-alura-textPrimary truncate">
                                        {room.name}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-alura-surface2 text-alura-textMuted font-mono">
                                        {room.type}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setItemToDelete({
                                          id: room.id,
                                          name: room.name,
                                          type: 'canal',
                                        })
                                      }
                                      className="w-6 h-6 rounded hover:bg-red-500/20 text-alura-textMuted hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Excluir Canal"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </SortableItem>
                            ))}
                          </SortableGroup>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══════════ ABA 3: CARGOS E PERMISSÕES (SORTABLE + SWITCHES REUI) ══════════ */}
            {activeTab === 'roles' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {/* Coluna 1: Lista de Cargos com Sortable Hierárquico */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                      Hierarquia de Cargos ({roles.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateRole}
                      className="px-2.5 py-1 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-xs font-bold text-alura-accent border border-alura-border flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Novo</span>
                    </button>
                  </div>

                  <SortableGroup
                    items={roles}
                    onReorder={handleReorderRoles}
                    className="space-y-1.5 max-h-[52vh] overflow-y-auto custom-scrollbar"
                  >
                    {roles.map((r) => {
                      const isSelected = selectedRoleId === r.id

                      return (
                        <SortableItem key={r.id} value={r}>
                          {({ dragControls }) => (
                            <div
                              onClick={() => selectRole(r)}
                              onPointerDown={(e) => {
                                if ((e.target as HTMLElement).closest('button, input')) return
                                dragControls.start(e)
                              }}
                              style={{ touchAction: 'none' }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-grab active:cursor-grabbing ${
                                isSelected
                                  ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm'
                                  : 'bg-alura-surface2/60 text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-surface2 border border-alura-border/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <SortableDragHandle dragControls={dragControls} />
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: r.color || '#00E6A0' }}
                                />
                                <span className="truncate">{r.name}</span>
                              </div>
                              {isSelected && <Check size={13} className="text-alura-accent shrink-0" />}
                            </div>
                          )}
                        </SortableItem>
                      )
                    })}
                  </SortableGroup>
                </div>

                {/* Colunas 2 e 3: Edição do Cargo Selecionado com Switches */}
                <div className="md:col-span-2 space-y-5 bg-alura-surface2/50 p-5 rounded-2xl border border-alura-border">
                  {selectedRoleId ? (
                    <>
                      {/* Nome e Cor do Cargo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                            Nome do Cargo
                          </label>
                          <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-alura-surface1 border border-alura-border text-xs font-bold text-alura-textPrimary focus:outline-none focus:border-alura-borderStrong"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-alura-textSecondary uppercase tracking-wider">
                            Cor de Exibição
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {PRESET_ROLE_COLORS.map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() => setRoleColor(col)}
                                  className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                                    roleColor === col ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: col }}
                                />
                              ))}
                            </div>
                            <input
                              type="color"
                              value={roleColor}
                              onChange={(e) => setRoleColor(e.target.value)}
                              className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                              title="Cor personalizada"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Opção Destacada: Separar membros deste cargo (is_hoisted) */}
                      <div className="p-3.5 rounded-xl bg-alura-surface1 border border-alura-border flex items-center justify-between">
                        <div className="space-y-0.5 pr-3">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-alura-accent" />
                            <span className="text-xs font-black text-alura-textPrimary">
                              Separar membros por cargo
                            </span>
                          </div>
                          <p className="text-[11px] text-alura-textMuted leading-relaxed">
                            Exibe membros que possuem este cargo em uma seção destacada na barra lateral da comunidade.
                          </p>
                        </div>
                        <Switch
                          checked={roleIsHoisted}
                          onCheckedChange={setRoleIsHoisted}
                        />
                      </div>

                      {/* Matriz de Permissões com Switches Shadcn/ReUI */}
                      <div className="space-y-4 pt-2">
                        <span className="text-xs font-black text-alura-textPrimary uppercase tracking-wider">
                          Permissões do Cargo
                        </span>

                        {/* Moderação e Membros */}
                        <div className="p-4 rounded-xl bg-alura-surface1 border border-alura-border space-y-2.5">
                          <span className="text-[11px] font-extrabold text-alura-accent uppercase tracking-wider">
                            Moderação e Membros
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Expulsar Membros (Kick)</span>
                              <Switch
                                checked={rolePermissions.manage_members ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, manage_members: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Banir Membros (Ban)</span>
                              <Switch
                                checked={rolePermissions.ban_member ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, ban_member: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Mutar Usuários em Voz</span>
                              <Switch
                                checked={rolePermissions.mute_members ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, mute_members: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Gerenciar Cargos</span>
                              <Switch
                                checked={rolePermissions.manage_roles ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, manage_roles: val })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Canais de Texto */}
                        <div className="p-4 rounded-xl bg-alura-surface1 border border-alura-border space-y-2.5">
                          <span className="text-[11px] font-extrabold text-alura-accent uppercase tracking-wider">
                            Canais de Texto
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Enviar Mensagens</span>
                              <Switch
                                checked={rolePermissions.send_message ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, send_message: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Ver Histórico de Mensagens</span>
                              <Switch
                                checked={rolePermissions.read_message_history ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, read_message_history: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Enviar Arquivos e Imagens</span>
                              <Switch
                                checked={rolePermissions.attach_files ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, attach_files: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Criar Enquetes</span>
                              <Switch
                                checked={rolePermissions.create_polls ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, create_polls: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Enviar GIFs e Figurinhas</span>
                              <Switch
                                checked={rolePermissions.send_gifs ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, send_gifs: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Criar Tópicos</span>
                              <Switch
                                checked={rolePermissions.create_threads ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, create_threads: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Apagar Mensagens de Outros</span>
                              <Switch
                                checked={rolePermissions.delete_message ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, delete_message: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Mencionar @todos</span>
                              <Switch
                                checked={rolePermissions.mention_everyone ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, mention_everyone: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Gerenciar Salas de Texto</span>
                              <Switch
                                checked={rolePermissions.manage_rooms ?? false}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, manage_rooms: val })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Voz e Transmissão */}
                        <div className="p-4 rounded-xl bg-alura-surface1 border border-alura-border space-y-2.5">
                          <span className="text-[11px] font-extrabold text-alura-accent uppercase tracking-wider">
                            Voz e Transmissão
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Conectar em Canais de Voz</span>
                              <Switch
                                checked={rolePermissions.connect_voice ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, connect_voice: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Falar (Microfone)</span>
                              <Switch
                                checked={rolePermissions.speak ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, speak: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Transmitir Tela</span>
                              <Switch
                                checked={rolePermissions.screen_share ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, screen_share: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Ligar Câmera (Vídeo)</span>
                              <Switch
                                checked={rolePermissions.video ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, video: val })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-alura-surface2">
                              <span>Usar Soundboard nas Chamadas</span>
                              <Switch
                                checked={rolePermissions.use_soundboard ?? true}
                                onCheckedChange={(val) =>
                                  setRolePermissions({ ...rolePermissions, use_soundboard: val })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões do Cargo */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(selectedRoleId)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 size={13} />
                          <span>Excluir Cargo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveRole}
                          disabled={saving}
                          className="px-5 py-2 rounded-xl bg-alura-accent text-alura-background text-xs font-black hover:bg-alura-accentBright transition-all cursor-pointer shadow-md shadow-alura-accent/20"
                        >
                          Salvar Cargo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-alura-textMuted">
                      <Shield size={32} className="mb-2 opacity-40 text-alura-accent" />
                      <p className="text-xs font-bold">Selecione ou crie um cargo para configurar permissões.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════ ABA 4: MEMBROS (CORRIGIDO DROPDOWN CONTROLADO) ══════════ */}
            {activeTab === 'members' && (
              <div className="space-y-4 max-w-3xl">
                {/* Barra de Busca de Membros */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alura-textMuted" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Buscar membros por nome ou username..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-alura-surface2 border border-alura-border text-xs text-alura-textPrimary focus:outline-none focus:border-alura-borderStrong"
                  />
                </div>

                {/* Lista de Membros */}
                <div className="space-y-2">
                  {members
                    .filter((m) => {
                      if (!memberSearch) return true
                      const term = memberSearch.toLowerCase()
                      return (
                        m.profile?.username?.toLowerCase().includes(term) ||
                        m.profile?.display_name?.toLowerCase().includes(term)
                      )
                    })
                    .map((m) => {
                      const isServerOwner = m.user_id === server?.owner_id
                      const isDropdownOpen = openRoleMenuForMemberId === m.user_id

                      return (
                        <div
                          key={m.user_id}
                          className="p-3.5 rounded-2xl bg-alura-surface2/60 border border-alura-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-alura-surface1 border border-alura-borderStrong shrink-0 flex items-center justify-center font-bold text-xs text-alura-accent">
                              {m.profile?.avatar_url ? (
                                <img src={m.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                m.profile?.username?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-alura-textPrimary truncate">
                                  {m.profile?.display_name || m.profile?.username || 'Membro'}
                                </span>
                                {isServerOwner && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40">
                                    Dono
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-alura-textMuted">
                                @{m.profile?.username || 'user'}
                              </span>
                            </div>
                          </div>

                          {/* Cargos e Ações */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Tags de Cargos Atribuídos */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {m.roles.map((r) => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                                  style={{
                                    backgroundColor: `${r.color || '#00E6A0'}15`,
                                    borderColor: `${r.color || '#00E6A0'}40`,
                                    color: r.color || '#00E6A0',
                                  }}
                                >
                                  {r.name}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMemberRole(m.user_id, r.id)}
                                    className="hover:opacity-75 cursor-pointer"
                                  >
                                    <X size={10} />
                                  </button>
                                </span>
                              ))}
                            </div>

                            {/* Dropdown Controlado via Click de Adicionar Cargo */}
                            {roles.length > 0 && (
                              <div className="relative role-dropdown-container">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenRoleMenuForMemberId(
                                      isDropdownOpen ? null : m.user_id
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-alura-surface1 hover:bg-alura-surface3 text-[11px] font-bold text-alura-accent border border-alura-border cursor-pointer flex items-center gap-1"
                                >
                                  <Plus size={11} />
                                  <span>Cargo</span>
                                  <ChevronDown
                                    size={11}
                                    className={`transition-transform duration-150 ${
                                      isDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                {isDropdownOpen && (
                                  <div className="absolute right-0 top-full mt-1.5 z-50 p-1.5 rounded-xl bg-alura-surface1 border border-alura-borderStrong shadow-2xl min-w-[150px] space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-2 py-1 text-[10px] font-bold text-alura-textMuted uppercase tracking-wider border-b border-alura-border/60">
                                      Atribuir Cargo
                                    </div>
                                    {roles.map((r) => {
                                      const hasRole = m.roles.some((mr) => mr.id === r.id)
                                      return (
                                        <button
                                          key={r.id}
                                          type="button"
                                          onClick={() => handleToggleMemberRole(m.user_id, r.id)}
                                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                            hasRole
                                              ? 'bg-alura-selected text-alura-accent'
                                              : 'hover:bg-alura-surface2 text-alura-textSecondary'
                                          }`}
                                        >
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: r.color || '#00E6A0' }}
                                            />
                                            <span className="truncate">{r.name}</span>
                                          </div>
                                          {hasRole && <Check size={11} />}
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Ações de Moderação (Expulsar / Banir) */}
                            {!isServerOwner && (
                              <div className="flex items-center gap-1 pl-2 border-l border-alura-border/60">
                                <button
                                  type="button"
                                  onClick={() => handleKickMember(m.user_id)}
                                  className="p-1.5 rounded-lg hover:bg-amber-500/20 text-alura-textMuted hover:text-amber-400 transition-colors cursor-pointer"
                                  title="Expulsar Membro"
                                >
                                  <UserMinus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleBanMember(m.user_id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-alura-textMuted hover:text-red-400 transition-colors cursor-pointer"
                                  title="Banir Membro"
                                >
                                  <Ban size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* ══════════ ABA 5: BANS ══════════ */}
            {activeTab === 'bans' && (
              <div className="space-y-4 max-w-2xl">
                {bans.length === 0 ? (
                  <div className="p-8 text-center text-alura-textMuted space-y-2">
                    <Ban size={32} className="mx-auto opacity-30 text-alura-accent" />
                    <p className="text-xs font-bold">Nenhum membro banido nesta comunidade.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bans.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-2xl bg-alura-surface2/60 border border-alura-border flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-alura-textPrimary block truncate">
                            @{b.profiles?.username || 'Usuário'}
                          </span>
                          <span className="text-[11px] text-alura-textMuted">
                            Motivo: {b.reason || 'Não informado'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUnbanMember(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-alura-surface2 hover:bg-alura-surface3 text-xs font-bold text-alura-accent border border-alura-border cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <RotateCcw size={12} />
                          <span>Desbanir</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ ABA 6: ZONA DE PERIGO ══════════ */}
            {activeTab === 'danger' && (
              <div className="space-y-6 max-w-2xl">
                {/* Sair do Servidor */}
                {!isOwner && (
                  <div className="p-5 rounded-2xl bg-alura-surface2/60 border border-alura-border space-y-3">
                    <span className="font-extrabold text-xs text-alura-textPrimary block">
                      Sair da Comunidade
                    </span>
                    <p className="text-xs text-alura-textMuted">
                      Você deixará de ser membro deste servidor e não terá mais acesso aos canais privados.
                    </p>
                    <button
                      type="button"
                      onClick={handleLeaveServer}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold cursor-pointer transition-colors"
                    >
                      Sair do Servidor
                    </button>
                  </div>
                )}

                {/* Excluir Servidor Definitivamente (Dono) */}
                {isOwner && (
                  <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle size={18} />
                      <span className="font-black text-xs uppercase tracking-wider">
                        Exclusão Permanente da Comunidade
                      </span>
                    </div>

                    <p className="text-xs text-alura-textSecondary leading-relaxed">
                      Esta ação é <strong className="text-red-400">irreversível</strong>. Todos os canais, mensagens,
                      cargos e anexos enviados nesta comunidade serão apagados definitivamente do banco de dados.
                    </p>

                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] font-bold text-alura-textMuted block">
                        Para confirmar, digite exatamente o nome da comunidade (
                        <span className="text-alura-textPrimary font-mono font-bold">{server?.name}</span>):
                      </label>
                      <input
                        type="text"
                        value={confirmDeleteName}
                        onChange={(e) => setConfirmDeleteName(e.target.value)}
                        placeholder={server?.name}
                        className="w-full px-3 py-2 rounded-xl bg-alura-surface1 border border-red-500/40 text-xs font-mono text-red-300 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteServer}
                      disabled={confirmDeleteName.trim() !== server?.name || saving}
                      className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-black text-xs hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg shadow-red-500/20"
                    >
                      Excluir Servidor Definitivamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Confirmação de Exclusão de Canal ou Espaço */}
      {itemToDelete && (
        <DeleteChannelConfirmationModal
          isOpen={Boolean(itemToDelete)}
          targetName={itemToDelete.name}
          targetType={itemToDelete.type}
          onConfirm={handleExecuteDelete}
          onClose={() => setItemToDelete(null)}
          isDeleting={isDeletingItem}
        />
      )}
    </div>
  )
}
