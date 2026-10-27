import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Image as ImageIcon, Smile, Link2, MoreHorizontal, Heart, MessageSquare, Share2, ChevronRight, Users, UserPlus, Mail, Bell, Send, Loader2, X, Trash2, Edit2, EyeOff, Ban, Copy, Paperclip, FileText, Download } from "lucide-react"
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { Avatar, AvatarFallback } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import { BlockService } from "../../lib/services/BlockService"
import { useNotification } from "../../contexts/NotificationContext"
import { compressImageToWebp, downloadImageAsPng } from "../../lib/utils/imageOptimizer"
import { UserProfileHoverCard } from "../shared/UserProfileHoverCard"

export interface PostFeedProps {
  user: any
  profile?: any
  filterUserId?: string
  hideComposer?: boolean
  isProfileFeed?: boolean
  onPostCreated?: () => void
  emptyMessage?: string
}

export interface FeedPost {
  id: string
  user_id: string
  content: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at?: string
  attachments?: { url: string, type: 'image' | 'video' | 'document', name: string }[]
  profiles: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

interface PendingAttachment {
  file: File;
  previewUrl: string;
  type: 'image' | 'video' | 'document';
}

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    display_name: string
    username: string
    avatar_url?: string
  }
}

export function PostFeed({ 
  user, 
  profile: propProfile, 
  filterUserId, 
  hideComposer = false, 
  isProfileFeed = false, 
  onPostCreated,
  emptyMessage 
}: PostFeedProps) {
  const navigate = useNavigate()
  const { showToast } = useNotification()
  const displayName = user?.user_metadata?.full_name || "Usuário"
  const firstName = displayName.split(" ")[0]
  const username = user?.user_metadata?.username ? `@${user.user_metadata.username}` : "@usuario"
  const initials = displayName.substring(0, 2).toUpperCase()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null) // Para debug

  // Mídias e Emojis
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // Paginação
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const POSTS_PER_PAGE = 10

  // Metadados
  const [friendCount, setFriendCount] = useState(0)
  const [requestsCount, setRequestsCount] = useState(0)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [messagesCount, setMessagesCount] = useState(0)

  const [currentUserProfile, setCurrentUserProfile] = useState<any>(propProfile || null)

  useEffect(() => {
    if (propProfile) {
      setCurrentUserProfile(propProfile)
    } else if (user?.id) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) setCurrentUserProfile(data)
      })
    }
  }, [user?.id, propProfile])

  useEffect(() => {
    if (!isProfileFeed) {
      fetchMetadata()
    }
  }, [user, isProfileFeed])

  useEffect(() => {
    fetchPosts()
  }, [user, page, filterUserId])

  async function fetchMetadata() {
    if (!user) return
    try {
      const { count: friends } = await supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      if (friends !== null) setFriendCount(friends)

      const { count: requests } = await supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('user_id_2', user.id)
      if (requests !== null) setRequestsCount(requests)

      const { count: notifs } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false)
      if (notifs !== null) setNotificationsCount(notifs)

      const { count: unreadMsgs } = await supabase.from('direct_messages').select('*', { count: 'exact', head: true }).neq('user_id', user.id).eq('is_read', false)
      if (unreadMsgs !== null) setMessagesCount(unreadMsgs)
    } catch (error) { console.error("Erro ao puxar métricas", error) }
  }

  async function fetchPosts() {
    try {
      setLoadingPosts(true)
      setErrorMsg(null)
      
      const from = (page - 1) * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      let query = supabase
        .from('feed_posts')
        .select(`
          id, user_id, content, created_at, updated_at, attachments,
          profiles!user_id(display_name, username, avatar_url),
          feed_likes(count),
          feed_comments(count)
        `, { count: 'exact' })

      if (filterUserId) {
        query = query.eq('user_id', filterUserId)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (error) throw error
      
      if (count !== null) setTotalPages(Math.ceil(count / POSTS_PER_PAGE))

      if (data) {
        // formatar o array substituindo os counts relacionais pelos numbers
        const formatted = data.map((post: any) => ({
          ...post,
          likes_count: post.feed_likes?.[0]?.count || 0,
          comments_count: post.feed_comments?.[0]?.count || 0
        }))
        setPosts(formatted as unknown as FeedPost[])
      }
    } catch (err: any) { 
      console.error("Erro ao carregar posts", err) 
      setErrorMsg(err.message || "Erro desconhecido ao carregar posts")
    } finally { setLoadingPosts(false) }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, acceptType: 'media' | 'doc') {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    
    const newAtts: PendingAttachment[] = []
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        showToast({
          type: "warning",
          title: "Arquivo muito grande",
          message: `O arquivo ${file.name} excede o limite máximo de 10MB.`
        })
        continue
      }
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document'
      newAtts.push({ file, previewUrl: URL.createObjectURL(file), type })
    }
    setAttachments(prev => [...prev, ...newAtts])
    e.target.value = '' // reset
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  async function handlePublish() {
    if (!newPostContent.trim() && attachments.length === 0) return
    if (!user) return
    try {
      setIsPublishing(true)
      setErrorMsg(null)

      const uploadedUrls = []
      if(attachments.length > 0) {
        for (const att of attachments) {
           let fileToUpload = att.file
           let fileExt = att.file.name.split('.').pop() || 'bin'

           // Se for imagem e não for GIF animado, comprime para .webp
           if (att.type === 'image' && att.file.type !== 'image/gif') {
             try {
               fileToUpload = await compressImageToWebp(att.file, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 })
               fileExt = 'webp'
             } catch (e) {
               console.warn("Falha ao comprimir imagem de feed para webp, usando original", e)
             }
           }

           const path = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
           const { error: upErr } = await supabase.storage
             .from('feed_media')
             .upload(path, fileToUpload, {
               contentType: fileToUpload.type,
               upsert: true
             })
           if(upErr) throw new Error("Erro no upload: " + upErr.message)
           
           const { data: publicUrlData } = supabase.storage.from('feed_media').getPublicUrl(path)
           uploadedUrls.push({ url: publicUrlData.publicUrl, type: att.type, name: att.file.name })
        }
      }

      const { error } = await supabase.from('feed_posts').insert({ 
        user_id: user.id, 
        content: newPostContent,
        attachments: uploadedUrls
      })
      if (error) throw error

      setNewPostContent("")
      setAttachments([])
      setShowEmoji(false)
      setPage(1) // Volta para a primeira página ao publicar
      fetchPosts()
      onPostCreated?.()
    } catch (err: any) { 
      console.error("Erro ao publicar post", err)
      setErrorMsg(err.message || "Erro desconhecido ao publicar")
    } finally { setIsPublishing(false) }
  }

  const composerBox = !hideComposer && (
    <div className="p-4 rounded-xl border border-alura-border bg-alura-surface1 space-y-3 relative z-20 transition-colors">
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-[13px] font-medium">
          ⚠️ Erro: {errorMsg}
        </div>
      )}
      
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#243029] text-alura-accent font-bold text-[13px] flex items-center justify-center shrink-0 overflow-hidden">
          {currentUserProfile?.avatar_url || user?.user_metadata?.avatar_url ? (
            <img src={currentUserProfile?.avatar_url || user?.user_metadata?.avatar_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <input 
            type="text" 
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isPublishing && handlePublish()}
            placeholder={`No que você está pensando, ${firstName || displayName}?`}
            className="w-full h-10 px-3.5 rounded-lg bg-alura-background border border-transparent focus:border-alura-accent text-alura-textPrimary placeholder:text-alura-textMuted text-sm outline-none transition-all"
          />

          {/* Previews de Mídia */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-3">
              {attachments.map((att, i) => (
                <div key={i} className="relative group shadow-sm">
                  <button 
                    type="button"
                    onClick={() => removeAttachment(i)} 
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-md cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {att.type === 'image' ? (
                     <img src={att.previewUrl} className="w-16 h-16 object-cover rounded-lg border border-alura-border" />
                  ) : att.type === 'video' ? (
                     <video src={att.previewUrl} className="w-16 h-16 object-cover rounded-lg border border-alura-border" />
                  ) : (
                     <div className="w-16 h-16 bg-alura-surface2 rounded-lg border border-alura-border flex items-center justify-center flex-col p-1.5 text-center">
                       <FileText className="w-5 h-5 text-alura-textSecondary mb-1" />
                       <span className="text-[9px] text-alura-textMuted font-medium truncate w-full">{att.file.name}</span>
                     </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1 relative">
              <input type="file" hidden accept="image/*,video/*" multiple ref={mediaInputRef} onChange={e => handleFileSelect(e, 'media')} />
              <input type="file" hidden accept=".pdf,.doc,.docx,.zip,.rar" multiple ref={docInputRef} onChange={e => handleFileSelect(e, 'doc')} />
              
              <button 
                type="button"
                onClick={() => mediaInputRef.current?.click()} 
                className="w-[34px] h-[34px] rounded-lg text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer group" 
                title="Imagem ou Vídeo"
              >
                <ImageIcon className="w-[18px] h-[18px] group-hover:text-alura-accent transition-colors" />
              </button>
              <button 
                type="button"
                onClick={() => docInputRef.current?.click()} 
                className="w-[34px] h-[34px] rounded-lg text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer group" 
                title="Anexo"
              >
                <Paperclip className="w-[18px] h-[18px] group-hover:text-alura-accent transition-colors" />
              </button>
              
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)} 
                  className="w-[34px] h-[34px] rounded-lg text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary flex items-center justify-center transition-colors cursor-pointer group" 
                  title="Emoji"
                >
                  <Smile className="w-[18px] h-[18px] group-hover:text-alura-accent transition-colors" />
                </button>
                {showEmoji && (
                  <div className="absolute top-10 left-0 z-50 shadow-[0_10px_25px_rgba(0,0,0,0.8)] rounded-xl border border-alura-border overflow-hidden animate-in fade-in zoom-in duration-200">
                    <EmojiPicker theme={Theme.DARK} onEmojiClick={(e) => setNewPostContent(prev => prev + e.emoji)} />
                  </div>
                )}
              </div>
            </div>

            <button 
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || (!newPostContent.trim() && attachments.length === 0)}
              className="h-9 px-4 rounded-lg bg-alura-accent hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-alura-background font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-alura-background" /> : <Send className="w-3.5 h-3.5 fill-alura-background" />}
              <span>Publicar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const postsList = (
    <div className="space-y-4">
      {loadingPosts ? (
        <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-alura-accent" /></div>
      ) : posts.length > 0 ? (
        <>
          {posts.map(post => (
            <Post 
              key={post.id} 
              post={post} 
              user={user} 
              currentUserProfile={currentUserProfile}
              refreshFeed={fetchPosts} 
            />
          ))}
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-4 pb-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-[13px] font-medium text-alura-textPrimary border border-alura-border rounded-[8px] bg-alura-surface1 hover:bg-alura-surface2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-[13px] text-alura-textMuted font-medium">Página {page} de {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-[13px] font-medium text-alura-textPrimary border border-alura-border rounded-[8px] bg-alura-surface1 hover:bg-alura-surface2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center border border-dashed border-alura-border rounded-xl bg-alura-surface1/40">
          <p className="text-alura-textSecondary font-medium">{emptyMessage || "Nenhuma postagem ainda."}</p>
          <p className="text-alura-textMuted text-[13px] mt-1">
            {filterUserId && filterUserId !== user?.id ? "Este usuário ainda não publicou nada no perfil." : "Seja o primeiro a publicar algo!"}
          </p>
        </div>
      )}
    </div>
  )

  if (isProfileFeed) {
    return (
      <div className="space-y-4 w-full">
        {composerBox}
        {postsList}
      </div>
    )
  }

  return (
    <main className="feed flex-1 overflow-y-auto px-6 py-8 pb-16 custom-scrollbar bg-alura-background">
      <div className="col max-w-[680px] mx-auto space-y-4">
        
        {/* Saudação */}
        <div className="hello">
          <h1 className="text-[28px] font-bold tracking-tight text-alura-textPrimary mb-1">
            Olá, <span className="text-alura-accent">{firstName}</span>
          </h1>
          <p className="text-sm text-alura-textMuted">Que bom ter você por aqui.</p>
        </div>

        {/* Stats 4 cols */}
        <div className="stats grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div 
            onClick={() => navigate('/friends')}
            className="stat on bg-alura-surface1 hover:bg-alura-surface2 border border-alura-border rounded-xl p-3 px-3.5 flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <Users className="w-5 h-5 text-alura-accent shrink-0" />
            <div className="min-w-0">
              <b className="block text-[18px] leading-tight font-bold text-alura-accent truncate">{friendCount}</b>
              <small className="text-xs text-alura-textMuted block truncate">Amigos</small>
            </div>
          </div>

          <div 
            onClick={() => navigate('/requests')}
            className="stat bg-alura-surface1 hover:bg-alura-surface2 border border-alura-border rounded-xl p-3 px-3.5 flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <UserPlus className="w-5 h-5 text-alura-textMuted group-hover:text-alura-textPrimary shrink-0 transition-colors" />
            <div className="min-w-0">
              <b className="block text-[18px] leading-tight font-bold text-alura-textPrimary group-hover:text-white truncate">{requestsCount}</b>
              <small className="text-xs text-alura-textMuted block truncate">Pedidos</small>
            </div>
          </div>

          <div 
            onClick={() => navigate('/messages')}
            className="stat bg-alura-surface1 hover:bg-alura-surface2 border border-alura-border rounded-xl p-3 px-3.5 flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <MessageSquare className="w-5 h-5 text-alura-textMuted group-hover:text-alura-textPrimary shrink-0 transition-colors" />
            <div className="min-w-0">
              <b className="block text-[18px] leading-tight font-bold text-alura-textPrimary group-hover:text-white truncate">{messagesCount}</b>
              <small className="text-xs text-alura-textMuted block truncate">Mensagens</small>
            </div>
          </div>

          <div 
            onClick={() => navigate('/notifications')}
            className="stat bg-alura-surface1 hover:bg-alura-surface2 border border-alura-border rounded-xl p-3 px-3.5 flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <Bell className="w-5 h-5 text-alura-textMuted group-hover:text-alura-textPrimary shrink-0 transition-colors" />
            <div className="min-w-0">
              <b className="block text-[18px] leading-tight font-bold text-alura-textPrimary group-hover:text-white truncate">{notificationsCount}</b>
              <small className="text-xs text-alura-textMuted block truncate">Avisos</small>
            </div>
          </div>
        </div>

        {composerBox}
        {postsList}
      </div>
    </main>
  )
}

// ----------------------------------------------------
// Componente de Post (Com Lógica Interativa)
// ----------------------------------------------------
function Post({ 
  post, 
  user, 
  currentUserProfile, 
  refreshFeed 
}: { 
  post: FeedPost, 
  user: any, 
  currentUserProfile?: any, 
  refreshFeed: () => void 
}) {
  const { showToast } = useNotification()
  const authorDisplay = post.profiles?.display_name || "Usuário"
  const authorUsername = post.profiles?.username ? `@${post.profiles.username}` : "@usuario"
  const authorInitials = authorDisplay.substring(0, 2).toUpperCase()
  const isOwner = user?.id === post.user_id

  const isStaff = currentUserProfile?.is_staff === true || 
                  currentUserProfile?.role === "admin" || 
                  currentUserProfile?.role === "moderator" ||
                  currentUserProfile?.username === "luisera" ||
                  currentUserProfile?.username === "adminalura" ||
                  user?.email?.toLowerCase().includes("admin") ||
                  user?.user_metadata?.role === "admin" ||
                  user?.app_metadata?.role === "admin"

  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(post.likes_count)
  const [localComments, setLocalComments] = useState(post.comments_count)
  const [showOptions, setShowOptions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  
  // Edição e Deleção
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAdminDeleteConfirm, setShowAdminDeleteConfirm] = useState(false)
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false)

  // Checar Like inicial (simplificado - na vdd requere query feed_likes. Mas por UX simularemos o toggle via state local+db)
  useEffect(() => {
    async function checkLike() {
      if(!user) return
      const { data } = await supabase.from('feed_likes').select('post_id').eq('post_id', post.id).eq('user_id', user.id).single()
      if(data) setLiked(true)
    }
    checkLike()
  }, [post.id, user])

  // A contagem pode ficar dessincronizada caso ele mude localLikes mas receba novos props. 
  // O React não reflete a mudança no estado inicial, então vamos sincronizar com o prop do DB quando ele vier:
  useEffect(() => {
    setLocalLikes(post.likes_count)
    setLocalComments(post.comments_count)
  }, [post.likes_count, post.comments_count])

  async function toggleLike() {
    if (!user) return
    const newState = !liked
    setLiked(newState)
    setLocalLikes(prev => newState ? prev + 1 : prev - 1)
    
    try {
      if (newState) {
        await supabase.from('feed_likes').insert({ post_id: post.id, user_id: user.id })
      } else {
        await supabase.from('feed_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      }
    } catch (e) {
      setLiked(!newState)
      setLocalLikes(prev => !newState ? prev + 1 : prev - 1)
    }
  }

  async function openComments() {
    setShowComments(true)
    setLoadingComments(true)
    const { data } = await supabase
      .from('feed_comments')
      .select(`id, content, created_at, profiles!user_id(display_name, username, avatar_url)`)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if(data) setComments(data as any)
    setLoadingComments(false)
  }

  async function sendComment() {
    if(!newComment.trim() || !user) return
    const { data } = await supabase
      .from('feed_comments')
      .insert({ post_id: post.id, user_id: user.id, content: newComment })
      .select(`id, content, created_at, profiles!user_id(display_name, username, avatar_url)`)
      .single()
    if (data) {
      setComments([...comments, data as any])
      setNewComment("")
      setLocalComments(prev => prev + 1)
    }
  }

  async function handleAdminDeletePost() {
    setIsDeletingAdmin(true)
    try {
      const { error: rpcError } = await supabase.rpc('admin_delete_feed_post', { target_post_id: post.id })
      if (rpcError) {
        console.warn("RPC admin_delete_feed_post erro, tentando delete direto:", rpcError)
        const { error: delError } = await supabase.from('feed_posts').delete().eq('id', post.id)
        if (delError) throw delError
      }
      setShowOptions(false)
      setShowAdminDeleteConfirm(false)
      refreshFeed()
      showToast({ 
        type: "info", 
        title: "Publicação removida (Admin)", 
        message: `A publicação de ${authorUsername} foi removida da plataforma com sucesso.` 
      })
    } catch (err: any) {
      showToast({ 
        type: "error", 
        title: "Erro ao moderar", 
        message: err.message || "Não foi possível remover a publicação." 
      })
    } finally {
      setIsDeletingAdmin(false)
    }
  }

  async function handleEdit() {
    if (!editedContent.trim() || !user) return
    const newDate = new Date().toISOString()
    const { error } = await supabase.from('feed_posts').update({ content: editedContent, updated_at: newDate }).eq('id', post.id)
    if (!error) {
      setIsEditing(false)
      refreshFeed()
      showToast({ type: "success", title: "Publicação atualizada", message: "Suas edições foram salvas no feed." })
    } else {
      showToast({ type: "error", title: "Erro ao editar", message: error.message })
    }
  }

  async function deletePost() {
    const { error } = await supabase.from('feed_posts').delete().eq('id', post.id)
    if (error) {
      showToast({ type: "error", title: "Erro ao apagar", message: error.message })
    } else {
      setShowOptions(false)
      setShowDeleteConfirm(false)
      refreshFeed()
      showToast({ type: "info", title: "Publicação removida", message: "A publicação foi apagada com sucesso." })
    }
  }

  async function handleHidePost() {
    if (!user) return
    try {
      await BlockService.hidePost(user.id, post.id)
      setShowOptions(false)
      refreshFeed() // o RLS cuidará de omitir o post
      showToast({ type: "info", title: "Publicação oculta", message: "Esta postagem não aparecerá mais no seu feed." })
    } catch (e: any) {
      showToast({ type: "error", title: "Erro ao ocultar", message: e.message })
    }
  }

  async function handleBlockAuthor() {
    if (!user) return
    try {
      await BlockService.blockUser(user.id, post.user_id)
      setShowOptions(false)
      refreshFeed() // o RLS cuidará de omitir todos os posts deste autor
      showToast({ type: "warning", title: "Autor bloqueado", message: `Você bloqueou ${authorDisplay}. Suas postagens foram removidas.` })
    } catch (e: any) {
      showToast({ type: "error", title: "Erro ao bloquear", message: e.message })
    }
  }

  function handleShare() {
    const link = `${window.location.origin}/app/post/${post.id}`
    navigator.clipboard.writeText(link)
    showToast({ type: "success", title: "Link copiado!", message: "Link da publicação copiado para a área de transferência." })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const diffMins = Math.floor((new Date().getTime() - date.getTime()) / 60000)
    if (diffMins < 60) return `${Math.max(1, diffMins)}m atrás`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`
    return `${Math.floor(diffMins / 1440)}d atrás`
  }

  return (
    <>
      <div className="p-4 rounded-xl border border-alura-border bg-alura-surface1 space-y-3 relative group">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <UserProfileHoverCard userId={post.user_id} profile={post.profiles} side="right">
            <div className="w-9 h-9 rounded-full bg-[#243029] text-alura-accent font-bold text-[13px] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer">
              {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt={authorDisplay} className="w-full h-full object-cover" />
              ) : (
                <span>{authorInitials}</span>
              )}
            </div>
          </UserProfileHoverCard>
          
          <UserProfileHoverCard userId={post.user_id} profile={post.profiles} side="right">
            <div className="flex-1 min-w-0 cursor-pointer leading-tight">
              <b className="font-semibold text-sm text-alura-textPrimary hover:underline block truncate">
                {authorDisplay}
              </b>
              <small className="text-xs text-alura-textMuted block truncate mt-0.5">
                {authorUsername} · {formatTime(post.created_at)}
                {post.updated_at && new Date(post.updated_at).getTime() > new Date(post.created_at).getTime() + 1000 && " (editado)"}
              </small>
            </div>
          </UserProfileHoverCard>
          
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowOptions(!showOptions)} 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary transition-colors cursor-pointer"
              title="Mais opções"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-alura-surface1 border border-alura-border rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 py-1.5 animate-in fade-in zoom-in duration-200">
                {isOwner ? (
                  <>
                    <button onClick={() => { setIsEditing(true); setShowOptions(false) }} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-surface2 flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Editar Publicação</button>
                    <button onClick={() => { setShowDeleteConfirm(true); setShowOptions(false) }} className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Apagar Publicação</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleHidePost} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-surface2 flex items-center gap-2"><EyeOff className="w-3.5 h-3.5" /> Ocultar Publicação</button>
                    <button onClick={handleBlockAuthor} className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Ban className="w-3.5 h-3.5" /> Bloquear {authorUsername}</button>
                    {isStaff && (
                      <button 
                        onClick={() => { setShowAdminDeleteConfirm(true); setShowOptions(false) }} 
                        className="w-full text-left px-3 py-2 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 border-t border-alura-border/40 mt-1 pt-2 font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" /> Apagar Publicação (Admin)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-alura-textPrimary leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="pt-1 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {post.attachments.map((att, i) => {
              if (att.type === 'image') return (
                <div key={i} className="relative group/feedimg rounded-lg overflow-hidden border border-alura-border shadow-sm">
                  <img 
                    src={att.url} 
                    alt="anexo" 
                    className="w-full object-cover max-h-[380px] cursor-pointer hover:opacity-95 transition-opacity" 
                    onClick={() => window.open(att.url, '_blank')} 
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImageAsPng(att.url, att.name || 'alura-post')
                    }}
                    className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-md bg-black/75 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-md opacity-0 group-hover/feedimg:opacity-100 transition-all flex items-center gap-1.5 shadow-lg z-10 cursor-pointer border border-white/10"
                    title="Baixar imagem em .PNG"
                  >
                    <Download className="w-3.5 h-3.5 text-alura-accent" />
                    <span>Baixar PNG</span>
                  </button>
                </div>
              )
              if (att.type === 'video') return <video key={i} src={att.url} controls className="rounded-lg w-full max-h-[380px] border border-alura-border shadow-sm bg-black/20" />
              return (
                 <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-3 p-3 bg-alura-surface2 border border-alura-border rounded-lg hover:border-alura-accent transition-all group shadow-sm col-span-1 md:col-span-2">
                   <div className="w-9 h-9 bg-alura-surface1 rounded-md flex items-center justify-center text-alura-textSecondary group-hover:text-alura-accent transition-colors"><FileText className="w-5 h-5" /></div>
                   <div className="flex flex-col overflow-hidden">
                     <span className="text-[13px] font-medium text-alura-textPrimary truncate">{att.name}</span>
                     <span className="text-[11px] text-alura-textMuted uppercase font-semibold">Documento Anexo</span>
                   </div>
                 </a>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 pt-1 -ml-2">
          <button 
            type="button"
            onClick={toggleLike} 
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              liked 
                ? 'text-alura-accent bg-alura-accent/10' 
                : 'text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-alura-accent' : ''}`} />
            <span>{localLikes}</span>
          </button>
          
          <button 
            type="button"
            onClick={openComments} 
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{localComments}</span>
          </button>
          
          <button 
            type="button"
            onClick={handleShare} 
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-alura-textMuted hover:bg-alura-surface2 hover:text-alura-textPrimary transition-colors ml-auto cursor-pointer" 
            title="Copiar Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Overlay de Comentários */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Caixa do Modal */}
          <div className="bg-alura-surface1 border border-alura-borderStrong w-full max-w-xl rounded-[16px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 border-b border-alura-border/50 bg-alura-surface2">
              <h3 className="font-semibold text-alura-textPrimary">Comentários</h3>
              <button onClick={() => setShowComments(false)} className="text-alura-textMuted hover:text-alura-textPrimary transition-colors p-1 rounded-full hover:bg-alura-hover"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Lista de Comentarios */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {loadingComments ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-alura-accent" /></div>
              ) : comments.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="flex items-start space-x-3">
                    <UserProfileHoverCard userId={c.user_id} profile={c.profiles} side="right">
                      <Avatar className="w-8 h-8 mt-1 border border-alura-border bg-alura-surface2 cursor-pointer overflow-hidden shrink-0">
                        {c.profiles?.avatar_url ? (
                          <img src={c.profiles.avatar_url} alt={c.profiles?.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback className="text-[11px] text-alura-textPrimary">{c.profiles?.display_name?.substring(0,2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                    </UserProfileHoverCard>
                    <div className="flex-1 bg-alura-surface2 p-3 rounded-[12px] border border-alura-border/40">
                      <div className="flex justify-between items-baseline mb-1">
                        <UserProfileHoverCard userId={c.user_id} profile={c.profiles} side="top">
                          <span className="text-[13px] font-medium text-alura-textPrimary hover:underline cursor-pointer">{c.profiles?.display_name} <span className="text-alura-textMuted ml-1 text-[11px]">@{c.profiles?.username}</span></span>
                        </UserProfileHoverCard>
                        <span className="text-[10px] text-alura-textMuted">{formatTime(c.created_at)}</span>
                      </div>
                      <p className="text-[13px] text-alura-textSecondary leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-alura-textMuted text-[13px]">Seja o primeiro a comentar.</div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t border-alura-border/50 bg-alura-surface2/60 flex items-center space-x-3">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                placeholder="Escreva um comentário..."
                className="flex-1 h-10 px-4 rounded-[10px] bg-alura-surface1 border border-alura-border text-alura-textPrimary text-[13px] outline-none focus:border-alura-borderStrong transition-all"
              />
              <button 
                onClick={sendComment}
                disabled={!newComment.trim()}
                className="h-10 px-4 bg-alura-accent hover:bg-alura-accentBright text-alura-background rounded-[10px] disabled:opacity-50 transition-colors flex items-center gap-2 font-medium text-[13px]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Edição */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-alura-surface2 border border-alura-border rounded-[14px] w-full max-w-lg p-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-white text-[15px] font-semibold mb-4">Editar Publicação</h3>
            <textarea 
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="w-full bg-alura-surface1 border border-alura-border rounded-lg p-3 text-alura-textPrimary outline-none min-h-[120px] custom-scrollbar text-[14px]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-[13px] text-alura-textMuted hover:text-alura-textPrimary transition-colors font-medium">Cancelar</button>
              <button onClick={handleEdit} className="px-4 py-2 text-[13px] bg-alura-accent hover:bg-alura-accentBright text-alura-background font-semibold rounded-[8px] shadow-[0_0_10px_rgba(57,255,136,0.2)] transition-all">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Apagar Simples */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-alura-surface2 border border-alura-border rounded-[14px] w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-white text-[17px] font-semibold">Apagar Publicação?</h3>
            <p className="text-alura-textMuted text-[13px] leading-relaxed">
              Esta ação não pode ser desfeita. A publicação será apagada permanentemente do sistema.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 text-[13px] border border-alura-border rounded-[8px] text-alura-textPrimary hover:bg-alura-hover transition-colors font-medium">Cancelar</button>
              <button onClick={deletePost} className="flex-1 py-2.5 text-[13px] bg-red-500 hover:bg-red-600 text-white font-semibold rounded-[8px] transition-all">Apagar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Apagar (Admin) */}
      {showAdminDeleteConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-alura-surface2 border border-red-500/40 rounded-[14px] w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mx-auto mb-2 border border-red-500/25">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-white text-[17px] font-semibold">Apagar Publicação (Admin)?</h3>
            <p className="text-alura-textMuted text-[13px] leading-relaxed">
              Como administrador, você está removendo a publicação de <strong className="text-white">{authorUsername}</strong> do feed. Esta moderação é irreversível.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={() => setShowAdminDeleteConfirm(false)} 
                disabled={isDeletingAdmin}
                className="flex-1 py-2.5 text-[13px] border border-alura-border rounded-[8px] text-alura-textPrimary hover:bg-alura-hover transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdminDeletePost} 
                disabled={isDeletingAdmin}
                className="flex-1 py-2.5 text-[13px] bg-red-500 hover:bg-red-600 text-white font-semibold rounded-[8px] transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeletingAdmin ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Remover Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
