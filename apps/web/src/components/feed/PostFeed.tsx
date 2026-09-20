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

interface PostFeedProps {
  user: any
}

interface FeedPost {
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
  }
}

export function PostFeed({ user }: PostFeedProps) {
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

  useEffect(() => {
    fetchMetadata()
  }, [user])

  useEffect(() => {
    fetchPosts()
  }, [user, page])

  async function fetchMetadata() {
    if (!user) return
    try {
      const { count: friends } = await supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      if (friends !== null) setFriendCount(friends)

      const { count: requests } = await supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('user_id_2', user.id)
      if (requests !== null) setRequestsCount(requests)

      const { count: notifs } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false)
      if (notifs !== null) setNotificationsCount(notifs)
    } catch (error) { console.error("Erro ao puxar métricas", error) }
  }

  async function fetchPosts() {
    try {
      setLoadingPosts(true)
      setErrorMsg(null)
      
      const from = (page - 1) * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from('feed_posts')
        .select(`
          id, user_id, content, created_at, updated_at, attachments,
          profiles!user_id(display_name, username),
          feed_likes(count),
          feed_comments(count)
        `, { count: 'exact' })
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
    } catch (err: any) { 
      console.error("Erro ao publicar post", err)
      setErrorMsg(err.message || "Erro desconhecido ao publicar")
    } finally { setIsPublishing(false) }
  }

  return (
    <main className="flex-1 h-full p-4 md:p-6 overflow-y-auto custom-scrollbar relative">
      <div className="relative w-full min-h-full rounded-[20px] border border-alura-border bg-alura-background shadow-2xl pb-10">
        <div 
          className="absolute top-0 left-0 w-full h-[450px] pointer-events-none opacity-90 rounded-t-[20px] transition-all duration-500 overflow-hidden" 
          style={{ background: 'var(--theme-hero-bg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-alura-background/60 to-alura-background" />
        </div>

        <div className="relative z-10 px-6 py-8 md:px-10 space-y-8">
          <div className="pt-2">
            <h1 className="text-[32px] font-bold tracking-tight text-alura-textPrimary mb-1 drop-shadow-md">
              Olá, <span className="text-alura-accent drop-shadow-[0_0_8px_var(--alura-accent)]">{firstName}</span>!
            </h1>
            <p className="text-[15px] text-alura-textSecondary drop-shadow-sm">Que bom ter você por aqui!</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <StatusCard title="Amigos" value={friendCount.toString()} icon={<Users className="text-alura-accent w-5 h-5" />} onClick={() => navigate('/friends')} />
            <StatusCard title="Solicitações" value={requestsCount.toString()} icon={<UserPlus className="text-alura-textMuted w-5 h-5" />} onClick={() => navigate('/requests')} />
            <StatusCard title="Mensagens" value="0" icon={<Mail className="text-alura-textMuted w-5 h-5" />} onClick={() => navigate('/messages')} />
            <StatusCard title="Notificações" value={notificationsCount.toString()} icon={<Bell className="text-alura-textMuted w-5 h-5" />} />
          </div>

          <div className="p-4 rounded-[14px] border border-alura-border/60 bg-alura-surface1/90 backdrop-blur-md space-y-4 flex flex-col mt-2 relative z-20">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-[13px] font-medium">
                ⚠️ Erro do Supabase: {errorMsg}
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-alura-accent shadow-[0_0_8px_var(--alura-accent)] bg-alura-surface1">
                <AvatarFallback className="bg-transparent text-alura-textPrimary">{initials}</AvatarFallback>
              </Avatar>
              <input 
                type="text" 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
                placeholder={`No que você está pensando, ${username}?`}
                className="flex-1 h-10 px-4 rounded-lg bg-alura-surface2 border border-alura-border text-alura-textPrimary placeholder:text-alura-textDisabled text-[14px] outline-none focus:border-alura-borderStrong focus:shadow-[0_0_10px_rgba(57,255,136,0.1)] transition-all"
              />
            </div>
            <div className="flex items-center justify-between pl-[52px]">
              
              {/* Previews de Mídia */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3 w-full">
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group shadow-sm">
                      <button onClick={() => removeAttachment(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-md"><X className="w-3 h-3" /></button>
                      {att.type === 'image' ? (
                         <img src={att.previewUrl} className="w-16 h-16 object-cover rounded-[10px] border border-alura-border/60" />
                      ) : att.type === 'video' ? (
                         <video src={att.previewUrl} className="w-16 h-16 object-cover rounded-[10px] border border-alura-border/60" />
                      ) : (
                         <div className="w-16 h-16 bg-alura-surface1 rounded-[10px] border border-alura-border/60 flex items-center justify-center flex-col p-1.5 text-center">
                           <FileText className="w-5 h-5 text-alura-textSecondary mb-1" />
                           <span className="text-[9px] text-alura-textMuted font-medium truncate w-full">{att.file.name}</span>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 w-full justify-between">
                <div className="flex items-center space-x-2 relative">
                  <input type="file" hidden accept="image/*,video/*" multiple ref={mediaInputRef} onChange={e => handleFileSelect(e, 'media')} />
                  <input type="file" hidden accept=".pdf,.doc,.docx,.zip,.rar" multiple ref={docInputRef} onChange={e => handleFileSelect(e, 'doc')} />
                  
                  <button onClick={() => mediaInputRef.current?.click()} className="p-1.5 rounded-[8px] text-alura-textMuted hover:bg-alura-hover hover:text-alura-textPrimary border border-transparent transition-all group" title="Foto ou Vídeo">
                    <ImageIcon className="w-[18px] h-[18px] group-hover:text-alura-accent transition-colors" />
                  </button>
                  <button onClick={() => docInputRef.current?.click()} className="p-1.5 rounded-[8px] text-alura-textMuted hover:bg-alura-hover hover:text-alura-textPrimary border border-transparent transition-all group" title="Anexar Arquivo">
                    <Paperclip className="w-[18px] h-[18px] group-hover:text-alura-accent transition-colors" />
                  </button>
                  
                  <div className="relative">
                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 rounded-[8px] text-alura-textMuted hover:bg-alura-hover hover:text-alura-textPrimary border border-transparent transition-all group" title="Emojis">
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
                  onClick={handlePublish}
                  disabled={isPublishing || (!newPostContent.trim() && attachments.length === 0)}
                  className="h-9 px-4 rounded-[8px] flex items-center space-x-1.5 bg-alura-accent hover:bg-alura-accentBright disabled:opacity-50 disabled:cursor-not-allowed text-alura-background font-semibold text-[13px] shadow-[0_0_10px_rgba(0,223,160,0.3)] transition-all"
                >
                  {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-alura-background" /> : <Send className="w-3.5 h-3.5 fill-alura-background" />}
                  <span>Publicar</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loadingPosts ? (
              <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-alura-accent" /></div>
            ) : posts.length > 0 ? (
              <>
                {posts.map(post => <Post key={post.id} post={post} user={user} refreshFeed={fetchPosts} />)}
                
                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-4 pt-6 pb-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-[13px] font-medium text-alura-textPrimary border border-alura-border rounded-[8px] bg-alura-surface1 hover:bg-alura-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-[13px] text-alura-textMuted font-medium">Página {page} de {totalPages}</span>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-[13px] font-medium text-alura-textPrimary border border-alura-border rounded-[8px] bg-alura-surface1 hover:bg-alura-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center border border-dashed border-alura-border rounded-[14px]">
                <p className="text-alura-textSecondary">Nenhuma postagem ainda.</p>
                <p className="text-alura-textMuted text-[13px] mt-1">Seja o primeiro a publicar algo!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}

function StatusCard({ title, value, icon, onClick }: { title: string, value: string, icon: React.ReactNode, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-3 rounded-[12px] border border-alura-border/60 bg-alura-surface1/90 backdrop-blur-md hover:bg-alura-surface2 hover:border-alura-borderStrong transition-all cursor-pointer group shadow-sm min-w-0 gap-2">
      <div className="flex items-center space-x-2.5 min-w-0">
        <div className="w-9 h-9 flex-shrink-0 rounded-[10px] bg-alura-surface2 flex items-center justify-center border border-alura-border/50 group-hover:border-alura-border transition-colors">{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-alura-textSecondary leading-tight truncate">{title}</span>
          <span className="text-[17px] font-bold text-alura-textPrimary mt-0.5 group-hover:text-alura-accentBright transition-colors truncate">{value}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 flex-shrink-0 text-alura-textDisabled group-hover:text-alura-textSecondary transition-colors" />
    </div>
  )
}

function ActionButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-1.5 rounded-[8px] text-alura-textMuted hover:bg-alura-hover hover:text-alura-textPrimary hover:border-alura-border border border-transparent transition-all">{icon}</button>
  )
}

// ----------------------------------------------------
// Componente de Post (Com Lógica Interativa)
// ----------------------------------------------------
function Post({ post, user, refreshFeed }: { post: FeedPost, user: any, refreshFeed: () => void }) {
  const { showToast } = useNotification()
  const authorDisplay = post.profiles?.display_name || "Usuário"
  const authorUsername = post.profiles?.username ? `@${post.profiles.username}` : "@usuario"
  const authorInitials = authorDisplay.substring(0, 2).toUpperCase()
  const isOwner = user?.id === post.user_id

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
        // Removido o UPDATE na feed_posts porque o DB recusa sem política RLS de update! 
        // Em vez disso, usaremos views ou contaremos do feed_likes na query principal.
      } else {
        await supabase.from('feed_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      }
    } catch (e) {
      // Revert if error
      setLiked(!newState)
      setLocalLikes(prev => !newState ? prev + 1 : prev - 1)
    }
  }

  async function openComments() {
    setShowComments(true)
    setLoadingComments(true)
    const { data } = await supabase.from('feed_comments').select(`id, content, created_at, profiles!user_id(display_name, username)`).eq('post_id', post.id).order('created_at', { ascending: true })
    if(data) setComments(data as any)
    setLoadingComments(false)
  }

  async function sendComment() {
    if(!newComment.trim() || !user) return
    const { data } = await supabase.from('feed_comments').insert({ post_id: post.id, user_id: user.id, content: newComment }).select(`id, content, created_at, profiles!user_id(display_name, username)`).single()
    if (data) {
      setComments([...comments, data as any])
      setNewComment("")
      setLocalComments(prev => prev + 1)
      // O UPDATE falharia igual o like, desabilitado!
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
      <div className="p-5 rounded-[14px] border border-alura-border/60 bg-alura-surface1/90 backdrop-blur-sm hover:border-alura-borderStrong transition-colors space-y-3 relative group">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <UserProfileHoverCard userId={post.user_id} profile={post.profiles} side="right">
            <div className="flex items-center space-x-3 cursor-pointer group/postauthor">
              <Avatar className="w-10 h-10 border-2 border-alura-accent shadow-[0_0_8px_rgba(57,255,136,0.2)] bg-alura-surface1">
                <AvatarFallback className="bg-transparent text-alura-textPrimary text-[13px] font-semibold">{authorInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[14px] font-medium text-alura-textPrimary group-hover/postauthor:underline leading-tight">{authorDisplay} <span className="text-alura-textMuted font-normal ml-1">{authorUsername}</span></span>
                <span className="text-[12px] text-alura-textMuted mt-0.5">
                  {formatTime(post.created_at)}
                  {post.updated_at && new Date(post.updated_at).getTime() > new Date(post.created_at).getTime() + 1000 && " (editado)"}
                </span>
              </div>
            </div>
          </UserProfileHoverCard>
          
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="text-alura-textMuted hover:text-alura-textPrimary p-1 rounded hover:bg-alura-hover transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-alura-surface1 border border-alura-borderStrong rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 py-1.5 animate-in fade-in zoom-in duration-200">
                {isOwner ? (
                  <>
                    <button onClick={() => { setIsEditing(true); setShowOptions(false) }} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-hover flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" /> Editar Publicação</button>
                    <button onClick={() => { setShowDeleteConfirm(true); setShowOptions(false) }} className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Apagar Publicação</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleHidePost} className="w-full text-left px-3 py-2 text-[13px] text-alura-textPrimary hover:bg-alura-hover flex items-center gap-2"><EyeOff className="w-3.5 h-3.5" /> Ocultar Publicação</button>
                    <button onClick={handleBlockAuthor} className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Ban className="w-3.5 h-3.5" /> Bloquear {authorUsername}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-[14px] text-alura-textSecondary leading-relaxed pt-1 whitespace-pre-wrap">{post.content}</p>

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {post.attachments.map((att, i) => {
              if (att.type === 'image') return (
                <div key={i} className="relative group/feedimg rounded-[12px] overflow-hidden border border-alura-border/30 shadow-md">
                  <img 
                    src={att.url} 
                    alt="anexo" 
                    className="w-full object-cover max-h-[400px] cursor-pointer hover:opacity-95 transition-opacity" 
                    onClick={() => window.open(att.url, '_blank')} 
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadImageAsPng(att.url, att.name || 'alura-post')
                    }}
                    className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded-[8px] bg-black/75 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-md opacity-0 group-hover/feedimg:opacity-100 transition-all flex items-center gap-1.5 shadow-lg z-10 cursor-pointer border border-white/10"
                    title="Baixar imagem em .PNG"
                  >
                    <Download className="w-3.5 h-3.5 text-alura-accent" />
                    <span>Baixar PNG</span>
                  </button>
                </div>
              )
              if (att.type === 'video') return <video key={i} src={att.url} controls className="rounded-[12px] w-full max-h-[400px] border border-alura-border/30 shadow-md bg-black/20" />
              return (
                 <a key={i} href={att.url} target="_blank" rel="noreferrer" className="flex items-center space-x-3 p-3 bg-alura-surface1 border border-alura-border/60 rounded-[10px] hover:border-alura-borderStrong hover:bg-alura-hover transition-all group shadow-sm col-span-1 md:col-span-2">
                   <div className="w-10 h-10 bg-alura-surface2 rounded-[8px] flex items-center justify-center text-alura-textSecondary group-hover:text-alura-accent transition-colors"><FileText className="w-5 h-5" /></div>
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
        <div className="flex items-center space-x-5 pt-3">
          <button onClick={toggleLike} className={`flex items-center space-x-1.5 transition-colors group ${liked ? 'text-alura-accent' : 'text-alura-textMuted hover:text-alura-textPrimary'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-alura-accent' : 'group-hover:fill-alura-textPrimary/20'}`} />
            <span className="text-[12px] font-medium">{localLikes}</span>
          </button>
          
          <button onClick={openComments} className="flex items-center space-x-1.5 text-alura-textMuted hover:text-alura-accent transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[12px] font-medium">{localComments}</span>
          </button>
          
          <button onClick={handleShare} className="flex items-center space-x-1.5 text-alura-textMuted hover:text-alura-textPrimary transition-colors ml-auto group" title="Copiar Link">
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                      <Avatar className="w-8 h-8 mt-1 border border-alura-border bg-alura-surface2 cursor-pointer">
                        <AvatarFallback className="text-[11px] text-alura-textPrimary">{c.profiles?.display_name?.substring(0,2).toUpperCase()}</AvatarFallback>
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
    </>
  )
}
