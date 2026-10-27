import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { OtpVerification } from "../../components/auth/OtpVerification"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Eye, 
  EyeOff, 
  Fingerprint, 
  ArrowRight,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { TwoFactorService } from "../../lib/services/TwoFactorService"

// Logo oficial SVG animada da Alura (docs/doc/alura-icon-animated.svg)
import aluraIconAnimatedUrl from "../../../public/alura-icon-animated.svg"

export function Login() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [keepConnected, setKeepConnected] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fluxos secundários (OTP, 2FA)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
  const [isVerifying, setIsVerifying] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)

  const { showToast } = useNotification()
  const navigate = useNavigate()

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!email.trim() || !validateEmail(email.trim())) {
      newErrors.email = "Informe um e-mail válido."
    }
    if (!password) {
      newErrors.password = "Informe sua senha."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      showToast({ type: "error", title: "Erro ao Entrar", message: error.message })
      setErrors({ form: error.message })
      setLoading(false)
    } else if (data.user) {
      const st = await TwoFactorService.getStatus(data.user.id)
      if (st.enabled) {
        setPendingUser(data.user)
        setRequire2FA(true)
        setLoading(false)
        return
      }
      navigate("/")
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!email.trim() || !validateEmail(email.trim())) {
      newErrors.email = "Informe um e-mail válido."
    }
    if (!fullName.trim()) {
      newErrors.fullName = "Informe como quer ser chamado."
    }
    if (!username.trim() || !/^[a-z0-9_.]{3,24}$/i.test(username.trim())) {
      newErrors.username = "Use de 3 a 24 letras, números, _ ou ponto."
    }
    if (password.length < 8) {
      newErrors.password = "A senha precisa ter pelo menos 8 caracteres."
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase()
        }
      }
    })

    if (error) {
      showToast({ type: "error", title: "Erro no Cadastro", message: error.message })
      setErrors({ form: error.message })
    } else {
      setRegisterStep(2)
    }
    setLoading(false)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !validateEmail(email.trim())) {
      setErrors({ forgotEmail: "Informe um e-mail válido." })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/#/settings`
    })
    setLoading(false)

    if (error) {
      showToast({ type: "error", title: "Erro ao Redefinir", message: error.message })
      setErrors({ forgotEmail: error.message })
    } else {
      showToast({
        type: "success",
        title: "E-mail Enviado",
        message: "Enviamos um link de recuperação para o seu e-mail."
      })
      setMode("login")
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setIsVerifying(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "signup"
    })

    if (error) {
      showToast({
        type: "error",
        title: "Código Inválido",
        message: "Código incorreto ou expirado. Tente novamente."
      })
    } else {
      setRegisterStep(3)
    }
    setIsVerifying(false)
  }

  const handleResendOtp = async () => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim()
    })
    if (error) {
      showToast({ type: "error", title: "Erro no Reenvio", message: error.message })
    } else {
      showToast({
        type: "success",
        title: "Código Reenviado",
        message: "Novo código de verificação enviado para seu e-mail."
      })
    }
  }

  const handleVerify2FALogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingUser) return
    const clean = twoFactorCode.trim()
    if (clean.length < 6) {
      setTwoFactorError("Digite o código de 6 dígitos ou seu código de recuperação.")
      return
    }

    setLoading(true)
    setTwoFactorError(null)

    const res = await TwoFactorService.verifyLoginCode(
      pendingUser.id,
      clean,
      pendingUser.user_metadata?.mfa_secret,
      pendingUser.user_metadata?.backup_codes
    )

    setLoading(false)

    if (res.success) {
      if (res.usedBackupCode) {
        showToast({
          type: "warning",
          title: "Código de Emergência Utilizado",
          message: "Você utilizou um código de recuperação. Lembre-se de gerar novos códigos nas Configurações."
        })
      } else {
        showToast({
          type: "success",
          title: "2FA Confirmado",
          message: "Identidade verificada com sucesso."
        })
      }
      navigate("/")
    } else {
      setTwoFactorError(res.error || "Código de verificação incorreto ou expirado.")
    }
  }

  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 select-none relative overflow-x-hidden font-sans"
      style={{
        backgroundColor: "#0c0e0d",
        backgroundImage: `
          radial-gradient(900px 500px at 15% 0%, rgba(45,255,122,.10), transparent 60%),
          radial-gradient(700px 500px at 100% 100%, rgba(45,255,122,.06), transparent 60%)
        `,
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <motion.main
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-[#181b1a] border border-[#2a2f2d] rounded-2xl p-7 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.65)] relative z-10 text-[#f2f5f3]"
      >
        {/* Brand Logo Oficial Alura (SVG animado) */}
        <div className="flex justify-center mb-4">
          <img
            src={aluraIconAnimatedUrl}
            alt="Alura"
            className="w-[72px] h-[72px] object-contain drop-shadow-[0_0_24px_rgba(45,255,122,0.22)]"
          />
        </div>

        {/* ── FLUXO DE 2FA ── */}
        {require2FA ? (
          <div className="space-y-6 py-2">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0f1211] border border-[#2dff7a]/40 flex items-center justify-center text-[#2dff7a] shadow-[0_0_20px_rgba(45,255,122,0.2)]">
                <Fingerprint className="w-7 h-7 animate-pulse" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#f2f5f3]">
                Autenticação em Duas Etapas
              </h1>
              <p className="text-xs text-[#9aa49f] max-w-xs leading-relaxed">
                Digite o código de 6 dígitos do app autenticador ou seu código de emergência.
              </p>
            </div>

            <form onSubmit={handleVerify2FALogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  autoFocus
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value.toUpperCase())
                    if (twoFactorError) setTwoFactorError(null)
                  }}
                  placeholder="000 000 ou XXXX-XXXX"
                  className="w-full h-11 bg-[#0f1211] border border-[#2a2f2d] focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 rounded-lg text-center font-mono text-lg tracking-widest text-[#f2f5f3] focus:outline-none transition-all"
                />
              </div>

              {twoFactorError && (
                <p className="text-xs text-[#ff6b6b] text-center">{twoFactorError}</p>
              )}

              <button
                type="submit"
                disabled={loading || twoFactorCode.trim().length < 6}
                className="w-full h-11 rounded-lg bg-[#2dff7a] hover:bg-[#1fe068] active:translate-y-px text-[#04130a] font-bold text-[15px] transition-all cursor-pointer shadow-[0_0_15px_rgba(45,255,122,0.25)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? "Verificando..." : "Confirmar e Entrar"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequire2FA(false)
                  setPendingUser(null)
                  setTwoFactorCode("")
                  supabase.auth.signOut()
                }}
                className="w-full py-2 text-xs text-[#9aa49f] hover:text-[#f2f5f3] transition-colors cursor-pointer text-center block"
              >
                ← Voltar para o Login
              </button>
            </form>
          </div>
        ) : mode === "register" && registerStep === 3 ? (
          /* ── CADASTRO SUCESSO ── */
          <div className="flex flex-col items-center justify-center space-y-5 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2dff7a]/10 border border-[#2dff7a]/40 flex items-center justify-center text-[#2dff7a] shadow-[0_0_24px_rgba(45,255,122,0.25)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#f2f5f3] mb-1">
                Conta confirmada!
              </h1>
              <p className="text-sm text-[#9aa49f]">
                Tudo pronto para você explorar e conversar na Alura.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full h-11 rounded-lg bg-[#2dff7a] hover:bg-[#1fe068] active:translate-y-px text-[#04130a] font-bold text-[15px] transition-all cursor-pointer shadow-[0_0_15px_rgba(45,255,122,0.25)] flex items-center justify-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : mode === "register" && registerStep === 2 ? (
          /* ── OTP VERIFICATION ── */
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center tracking-tight text-[#f2f5f3]">
              Verifique seu e-mail
            </h1>
            <p className="text-center text-sm text-[#9aa49f] mb-2">
              Enviamos um código de verificação para <strong className="text-[#f2f5f3]">{email}</strong>.
            </p>
            <OtpVerification
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              isVerifying={isVerifying}
            />
            <button
              type="button"
              onClick={() => setRegisterStep(1)}
              className="w-full text-center text-xs text-[#9aa49f] hover:text-[#f2f5f3] pt-2 cursor-pointer transition-colors"
            >
              ← Alterar dados do cadastro
            </button>
          </div>
        ) : mode === "forgot" ? (
          /* ── RECUPERAÇÃO DE SENHA ── */
          <div>
            <h1 className="text-2xl font-bold text-center text-[#f2f5f3] tracking-tight mb-1.5">
              Redefinir senha
            </h1>
            <p className="text-center text-sm text-[#9aa49f] mb-6">
              Informe seu e-mail para receber as instruções de recuperação.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-4.5" noValidate>
              <div>
                <label htmlFor="f-email" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  E-mail
                </label>
                <input
                  id="f-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError("forgotEmail")
                  }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className={`w-full h-11 bg-[#0f1211] border ${
                    errors.forgotEmail ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                  } rounded-lg text-[#f2f5f3] text-[15px] px-3.5 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                />
                {errors.forgotEmail && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.forgotEmail}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#2dff7a] hover:bg-[#1fe068] active:translate-y-px text-[#04130a] font-bold text-[15px] transition-all cursor-pointer shadow-[0_0_15px_rgba(45,255,122,0.25)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? "Enviando..." : "Enviar link de recuperação"}</span>
              </button>

              <p className="text-center text-[#9aa49f] text-sm mt-5">
                Lembrou sua senha?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    setErrors({})
                  }}
                  className="text-[#2dff7a] hover:underline font-semibold cursor-pointer"
                >
                  Voltar ao login
                </button>
              </p>
            </form>
          </div>
        ) : mode === "login" ? (
          /* ── LOGIN ── */
          <div>
            <h1 className="text-2xl font-bold text-center text-[#f2f5f3] tracking-tight mb-1.5">
              Bem-vindo de volta
            </h1>
            <p className="text-center text-sm text-[#9aa49f] mb-6">
              Entre para continuar de onde parou.
            </p>

            <form onSubmit={handleLoginSubmit} noValidate>
              {/* E-mail */}
              <div className="mb-4.5">
                <label htmlFor="l-email" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  E-mail
                </label>
                <input
                  id="l-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError("email")
                  }}
                  autoComplete="email"
                  required
                  className={`w-full h-11 bg-[#0f1211] border ${
                    errors.email ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                  } rounded-lg text-[#f2f5f3] text-[15px] px-3.5 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                />
                {errors.email && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div className="mb-4.5">
                <label htmlFor="l-pass" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="l-pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError("password")
                    }}
                    autoComplete="current-password"
                    required
                    className={`w-full h-11 bg-[#0f1211] border ${
                      errors.password ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                    } rounded-lg text-[#f2f5f3] text-[15px] pl-3.5 pr-11 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-1 top-1 w-9 h-9 flex items-center justify-center text-[#9aa49f] hover:text-[#f2f5f3] rounded-md transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Manter conectado + Esqueceu a senha */}
              <div className="flex justify-between items-center -mt-1 mb-5 text-[13px]">
                <label className="flex items-center gap-2 text-[#9aa49f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepConnected}
                    onChange={(e) => setKeepConnected(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2dff7a] bg-[#0f1211] border-[#2a2f2d]"
                  />
                  <span>Manter conectado</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot")
                    setErrors({})
                  }}
                  className="text-[#2dff7a] hover:underline cursor-pointer"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              {errors.form && (
                <p className="text-xs text-[#ff6b6b] mb-4 text-center">{errors.form}</p>
              )}

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#2dff7a] hover:bg-[#1fe068] active:translate-y-px text-[#04130a] font-bold text-[15px] transition-all cursor-pointer shadow-[0_0_15px_rgba(45,255,122,0.25)] hover:shadow-[0_0_25px_rgba(45,255,122,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? "Entrando..." : "Entrar"}</span>
              </button>
            </form>

            {/* Alternar para Cadastro */}
            <p className="text-center text-[#9aa49f] text-sm mt-5">
              Novo por aqui?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register")
                  setErrors({})
                }}
                className="text-[#2dff7a] hover:underline font-semibold cursor-pointer"
              >
                Criar conta
              </button>
            </p>
          </div>
        ) : (
          /* ── REGISTRO ── */
          <div>
            <h1 className="text-2xl font-bold text-center text-[#f2f5f3] tracking-tight mb-1.5">
              Crie sua conta
            </h1>
            <p className="text-center text-sm text-[#9aa49f] mb-6">
              Leva menos de um minuto.
            </p>

            <form onSubmit={handleRegisterSubmit} noValidate>
              {/* E-mail */}
              <div className="mb-4">
                <label htmlFor="r-email" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  E-mail
                </label>
                <input
                  id="r-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError("email")
                  }}
                  autoComplete="email"
                  required
                  className={`w-full h-11 bg-[#0f1211] border ${
                    errors.email ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                  } rounded-lg text-[#f2f5f3] text-[15px] px-3.5 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                />
                {errors.email && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Nome de exibição */}
              <div className="mb-4">
                <label htmlFor="r-name" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  Nome de exibição
                </label>
                <input
                  id="r-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    clearError("fullName")
                  }}
                  autoComplete="name"
                  required
                  className={`w-full h-11 bg-[#0f1211] border ${
                    errors.fullName ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                  } rounded-lg text-[#f2f5f3] text-[15px] px-3.5 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                />
                {errors.fullName && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.fullName}</p>
                )}
              </div>

              {/* Nome de usuário */}
              <div className="mb-4">
                <label htmlFor="r-user" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  Nome de usuário
                </label>
                <input
                  id="r-user"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    clearError("username")
                  }}
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                  className={`w-full h-11 bg-[#0f1211] border ${
                    errors.username ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                  } rounded-lg text-[#f2f5f3] text-[15px] px-3.5 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                />
                <p className="text-xs text-[#9aa49f] mt-1.5">
                  É com ele que seus amigos vão te adicionar.
                </p>
                {errors.username && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.username}</p>
                )}
              </div>

              {/* Senha */}
              <div className="mb-4">
                <label htmlFor="r-pass" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="r-pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearError("password")
                    }}
                    autoComplete="new-password"
                    required
                    className={`w-full h-11 bg-[#0f1211] border ${
                      errors.password ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                    } rounded-lg text-[#f2f5f3] text-[15px] pl-3.5 pr-11 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-1 top-1 w-9 h-9 flex items-center justify-center text-[#9aa49f] hover:text-[#f2f5f3] rounded-md transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-[#9aa49f] mt-1.5">Use pelo menos 8 caracteres.</p>
                {errors.password && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="mb-5">
                <label htmlFor="r-pass2" className="block text-xs font-semibold text-[#9aa49f] mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="r-pass2"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      clearError("confirmPassword")
                    }}
                    autoComplete="new-password"
                    required
                    className={`w-full h-11 bg-[#0f1211] border ${
                      errors.confirmPassword ? "border-[#ff6b6b]" : "border-[#2a2f2d]"
                    } rounded-lg text-[#f2f5f3] text-[15px] pl-3.5 pr-11 placeholder-[#5d6762] focus:outline-none focus:border-[#2dff7a] focus:ring-2 focus:ring-[#2dff7a]/20 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-1 top-1 w-9 h-9 flex items-center justify-center text-[#9aa49f] hover:text-[#f2f5f3] rounded-md transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#ff6b6b] mt-1.5">{errors.confirmPassword}</p>
                )}
              </div>

              {errors.form && (
                <p className="text-xs text-[#ff6b6b] mb-4 text-center">{errors.form}</p>
              )}

              {/* Botão Criar Conta */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#2dff7a] hover:bg-[#1fe068] active:translate-y-px text-[#04130a] font-bold text-[15px] transition-all cursor-pointer shadow-[0_0_15px_rgba(45,255,122,0.25)] hover:shadow-[0_0_25px_rgba(45,255,122,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? "Criando conta..." : "Criar conta"}</span>
              </button>

              <p className="text-xs text-[#9aa49f] text-center mt-3.5 leading-relaxed">
                Ao criar sua conta, você concorda com os{" "}
                <a href="#/terms" className="text-[#2dff7a] hover:underline">
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a href="#/privacy" className="text-[#2dff7a] hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </form>

            {/* Alternar para Login */}
            <p className="text-center text-[#9aa49f] text-sm mt-5.5">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setErrors({})
                }}
                className="text-[#2dff7a] hover:underline font-semibold cursor-pointer"
              >
                Entrar
              </button>
            </p>
          </div>
        )}
      </motion.main>
    </div>
  )
}
