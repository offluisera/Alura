import { useState } from "react"
import { X, Search, UserPlus, Check, AlertCircle } from "lucide-react"
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

      // 1. Busca inteligente por E-mail, Telefone ou Username
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
          throw new Error("Nenhum usuário encontrado com este e-mail. Verifique se o endereço está correto ou se o usuário permite descoberta por e-mail.")
        }

        // Valida se o usuário alvo permite ser encontrado por e-mail (padrão true)
        if (data.discover_by_email === false) {
          throw new Error("Este usuário desativou a descoberta de conta por e-mail nas configurações de privacidade.")
        }

        targetProfile = data
      } else if (isPhone) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`phone.eq.${rawInput},phone.eq.${digitsOnly},phone.ilike.%${digitsOnly}%`)
          .maybeSingle()

        if (error || !data) {
          throw new Error("Nenhum usuário encontrado com este telefone. Verifique se o número está correto ou se o usuário ativou a descoberta por telefone.")
        }

        // Valida se o usuário alvo permite ser encontrado por telefone (padrão false)
        if (!data.discover_by_phone) {
          throw new Error("Este usuário não ativou a descoberta de conta por telefone nas configurações de privacidade.")
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
          throw new Error("Nenhum usuário encontrado com o username @" + cleanUsername + ". Verifique se as letras estão corretas.")
        }

        targetProfile = data
      }

      if (targetProfile.id === currentUser.id) {
        throw new Error("Você não pode adicionar a si mesmo.")
      }

      // 1.1 Verificar privacidade do destinatário (Quem pode enviar pedido de amizade)
      const privacyCheck = await PrivacyService.checkCanSendFriendRequest(currentUser.id, targetProfile.id, targetProfile)
      if (!privacyCheck.allowed) {
        throw new Error(privacyCheck.reason || "Este usuário não aceita pedidos de amizade no momento.")
      }

      // 2. Verificar se já existe uma amizade ou solicitação
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

      // 3. Enviar a solicitação de amizade
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-alura-surface1 w-full max-w-[480px] rounded-2xl shadow-2xl border border-alura-border overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight uppercase">Adicionar amigo</h2>
            <p className="text-sm text-alura-textMuted mt-1">Você pode adicionar amigos usando o username, e-mail ou telefone.</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-alura-textMuted hover:text-white hover:bg-alura-surface2 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 pt-2">
          <form onSubmit={handleSendRequest} className="space-y-4">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-alura-textMuted group-focus-within:text-alura-accent transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Digite o @username, e-mail ou telefone..." 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setStatus('idle')
                }}
                disabled={loading}
                className={`w-full h-14 bg-alura-surface2 border ${status === 'error' ? 'border-alura-danger focus:border-alura-danger' : status === 'success' ? 'border-alura-success focus:border-alura-success' : 'border-alura-border focus:border-alura-accent'} focus:shadow-[0_0_15px_rgba(57,255,136,0.1)] rounded-[12px] pl-11 pr-32 text-[15px] text-white placeholder:text-alura-textDisabled outline-none transition-all disabled:opacity-50`}
              />
              
              <div className="absolute right-2 inset-y-0 flex items-center">
                <button 
                  type="submit"
                  disabled={!username.trim() || loading}
                  className="h-10 px-4 bg-alura-accent hover:brightness-110 text-alura-background disabled:opacity-50 disabled:cursor-not-allowed rounded-[8px] text-sm font-semibold transition-all shadow-[0_0_15px_rgba(57,255,136,0.2)] flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-alura-background/30 border-t-alura-background rounded-full animate-spin" />
                  ) : (
                    "Enviar"
                  )}
                </button>
              </div>
            </div>

            {/* Mensagens de Feedback */}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-alura-success text-sm font-medium animate-in slide-in-from-top-2 bg-alura-success/10 p-3 rounded-lg border border-alura-success/20">
                <Check className="w-4 h-4 shrink-0" />
                <span>Sucesso! A solicitação de amizade foi enviada para <strong>{targetName}</strong>.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-2 text-alura-danger text-[13px] font-medium animate-in slide-in-from-top-2 bg-alura-danger/10 p-3 rounded-lg border border-alura-danger/20">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

          </form>
        </div>

      </div>
    </div>
  )
}
