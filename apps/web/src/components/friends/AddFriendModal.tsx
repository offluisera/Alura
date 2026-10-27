import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { PrivacyService } from "../../lib/services/PrivacyService"

interface AddFriendModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: any
}

export function AddFriendModal({ isOpen, onClose, currentUser }: AddFriendModalProps) {
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState("")
  const [targetName, setTargetName] = useState("")

  if (!isOpen) return null

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !currentUser) return

    setLoading(true)
    setStatus('idle')
    setErrorMessage("")

    try {
      const rawInput = username.trim()
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawInput)
      const digitsOnly = rawInput.replace(/\D/g, '')
      const isPhone = digitsOnly.length >= 8 && !rawInput.includes('@') && /^[\d\s\+\(\)\-]+$/.test(rawInput)

      let targetProfile: any = null

      if (isEmail) {
        if (currentUser.email && rawInput.toLowerCase() === currentUser.email.toLowerCase()) {
          throw new Error("Você não pode adicionar a si mesmo.")
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', rawInput)
          .maybeSingle()

        if (error || !data) {
          throw new Error("Nenhum usuário encontrado com este e-mail.")
        }

        if (data.discover_by_email === false) {
          throw new Error("Este usuário desativou a descoberta de conta por e-mail.")
        }

        targetProfile = data
      } else if (isPhone) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`phone.eq.${rawInput},phone.eq.${digitsOnly},phone.ilike.%${digitsOnly}%`)
          .maybeSingle()

        if (error || !data) {
          throw new Error("Nenhum usuário encontrado com este telefone.")
        }

        if (!data.discover_by_phone) {
          throw new Error("Este usuário não ativou a descoberta de conta por telefone.")
        }

        targetProfile = data
      } else {
        const cleanUsername = rawInput.replace(/^@/, '').trim()

        if (cleanUsername.toLowerCase() === (currentUser.user_metadata?.username || "").toLowerCase()) {
          throw new Error("Você não pode adicionar a si mesmo.")
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', cleanUsername)
          .maybeSingle()

        if (error || !data) {
          throw new Error("Nenhum usuário encontrado com o username @" + cleanUsername + ".")
        }

        targetProfile = data
      }

      if (targetProfile.id === currentUser.id) {
        throw new Error("Você não pode adicionar a si mesmo.")
      }

      const privacyCheck = await PrivacyService.checkCanSendFriendRequest(currentUser.id, targetProfile.id, targetProfile)
      if (!privacyCheck.allowed) {
        throw new Error(privacyCheck.reason || "Este usuário não aceita pedidos de amizade no momento.")
      }

      const { data: existing } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(user_id_1.eq.${currentUser.id},user_id_2.eq.${targetProfile.id}),and(user_id_1.eq.${targetProfile.id},user_id_2.eq.${currentUser.id})`)
        .maybeSingle()

      if (existing) {
        if (existing.status === 'accepted') {
          throw new Error("Vocês já são amigos!")
        } else {
          throw new Error("Já existe uma solicitação de amizade pendente entre vocês.")
        }
      }

      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id_1: currentUser.id,
          user_id_2: targetProfile.id,
          status: 'pending'
        })

      if (insertError) {
        console.error("Erro ao inserir amizade:", insertError)
        throw new Error("Erro ao enviar a solicitação. Tente novamente mais tarde.")
      }

      setTargetName(targetProfile.display_name || `@${targetProfile.username}`)
      setStatus('success')
      setUsername("")
      
    } catch (err: any) {
      console.error("Erro ao adicionar amigo:", err)
      setStatus('error')
      setErrorMessage(err.message || "Ocorreu um erro desconhecido.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setUsername("")
    setStatus('idle')
    setErrorMessage("")
    setTargetName("")
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="amigos-dialog animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSendRequest}>
          <h2>Adicionar amigo</h2>
          <p>Digite o nome de usuário da pessoa.</p>

          <input 
            type="text" 
            placeholder="@usuario" 
            autoComplete="off" 
            autoCapitalize="none"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setStatus('idle')
            }}
            disabled={loading}
            autoFocus
          />

          <div className="min-h-[20px] mt-2 text-[13px] font-medium" role="status">
            {status === 'success' && (
              <span className="text-[var(--amigos-accent)]">
                Solicitação de amizade enviada com sucesso para <strong>{targetName}</strong>.
              </span>
            )}
            {status === 'error' && (
              <span className="text-[var(--amigos-dnd)]">
                {errorMessage}
              </span>
            )}
          </div>

          <div className="foot">
            <button 
              type="button" 
              onClick={handleClose} 
              className="amigos-ghost"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={!username.trim() || loading} 
              className="amigos-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--amigos-on-accent)]/30 border-t-[var(--amigos-on-accent)] rounded-full animate-spin" />
              ) : (
                "Enviar solicitação"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
