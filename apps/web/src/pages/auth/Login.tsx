import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button, Input } from "@alura/ui"
import { supabase } from "../../lib/supabase"
import { useNotification } from "../../contexts/NotificationContext"
import { OtpVerification } from "../../components/auth/OtpVerification"
import { motion } from "framer-motion"
import { 
  Server, 
  Users, 
  Mic, 
  Cpu, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Github,
  User,
  AtSign,
  Fingerprint,
  ShieldCheck
} from "lucide-react"
import { TwoFactorService } from "../../lib/services/TwoFactorService"

// Importar imagens via ES Module para que o Vite resolva paths do Electron no file://
import logoUrl from '../../../public/logo-sombra.png'
import heroUrl from '../../../public/alura_login_hero.png'
export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { showToast } = useNotification()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1)
  const [isVerifying, setIsVerifying] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        showToast({ type: "error", title: "Erro ao Entrar", message: error.message })
        setLoading(false)
      } else if (data.user) {
        // Verificar se a conta possui 2FA ativo
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
    } else {
      if (password !== confirmPassword) {
        showToast({ type: "warning", title: "Senhas Divergentes", message: "As senhas digitadas não coincidem." })
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            username: username
          }
        }
      })
      if (error) {
        showToast({ type: "error", title: "Erro no Cadastro", message: error.message })
      } else {
        // Avança para a Etapa OTP
        setRegisterStep(2)
      }
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (code: string) => {
    setIsVerifying(true)
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup'
    })

    if (error) {
      showToast({ type: "error", title: "Código Inválido", message: "Código incorreto ou expirado. Tente novamente." })
    } else {
      // Sucesso
      setRegisterStep(3)
    }
    setIsVerifying(false)
  }

  const handleResendOtp = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    if (error) {
      showToast({ type: "error", title: "Erro no Reenvio", message: error.message })
    } else {
      showToast({ type: "success", title: "Código Reenviado", message: "Novo código de verificação enviado para seu e-mail." })
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
    <div className="flex min-h-screen w-full bg-background overflow-hidden text-foreground">
      
      {/* Coluna Esquerda: Hero / Identidade */}
      <div className="hidden lg:flex flex-col relative w-1/2 overflow-hidden bg-black">
        {/* Imagem de Fundo (Placeholder, mas usaremos a gerada) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
          style={{ backgroundImage: `url(${heroUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        
        {/* Conteúdo da Esquerda */}
        <div className="relative z-10 flex flex-col h-full justify-between p-12 2xl:p-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={logoUrl} alt="Alura Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(0,83,34,0.4)]" />
              <span className="text-3xl font-bold tracking-tight text-white">Alura</span>
            </div>
            
            <div className="space-y-4 max-w-md">
              <h1 className="text-3xl font-medium tracking-tight text-white/90">
                Comunidades reais. Conversas que importam.
              </h1>
              <p className="text-lg text-muted-foreground/80 font-light leading-relaxed">
                Conecte-se com pessoas, crie comunidades, compartilhe ideias e faça parte de algo maior.
              </p>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <FeatureItem 
              icon={<Server className="w-5 h-5 text-primary" />}
              title="Servidores"
              desc="Encontre e crie comunidades sobre os mais diversos temas."
            />
            <FeatureItem 
              icon={<Users className="w-5 h-5 text-primary" />}
              title="Conexões"
              desc="Adicione amigos e mantenha contato com quem importa."
            />
            <FeatureItem 
              icon={<Mic className="w-5 h-5 text-primary" />}
              title="Voz e Vídeo"
              desc="Converse, compartilhe tela e viva experiências em tempo real."
            />
            <FeatureItem 
              icon={<Cpu className="w-5 h-5 text-primary" />}
              title="Inteligência Artificial"
              desc="Recursos de IA para tornar sua jornada ainda mais produtiva."
            />
          </motion.div>

          {/* Footer Esquerdo */}
          <div className="pt-12 border-t border-white/10 flex items-center space-x-4">
            <span className="text-xs font-bold tracking-widest uppercase text-white/50">Alura</span>
            <span className="text-xs text-white/30">Mais que uma plataforma. Um ecossistema.</span>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Formulário */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-12">
        
        {/* Container do Formulário */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Header Mobile / Tab */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 lg:hidden">
              <img src={logoUrl} alt="Alura Logo" className="w-8 h-8 object-contain" />
              <span className="text-2xl font-bold text-foreground">Alura</span>
            </div>

            {mode === "register" && (
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${registerStep >= 1 ? 'bg-alura-accent shadow-[0_0_8px_rgba(0,223,160,0.5)]' : 'bg-alura-surface2'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 delay-150 ${registerStep >= 2 ? 'bg-alura-accent shadow-[0_0_8px_rgba(0,223,160,0.5)]' : 'bg-alura-surface2'}`}></div>
              </div>
            )}

            {!require2FA && (mode === "login" || (mode === "register" && registerStep === 1)) ? (
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === "login" ? "Faça login para continuar sua jornada." : "Registre-se e junte-se ao ecossistema."}
                </p>
              </div>
            ) : null}
          </div>

          {/* Toggle Login/Register */}
          {registerStep === 1 && !require2FA && (
            <div className="flex p-1 bg-muted/50 rounded-lg">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {/* Tela de Autenticação 2FA Real */}
          {require2FA ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 py-2"
            >
              <div className="flex flex-col items-center text-center space-y-2.5">
                <div className="w-16 h-16 rounded-2xl bg-alura-surface2 border border-alura-accent/40 flex items-center justify-center text-alura-accent shadow-[0_0_25px_rgba(57,255,136,0.2)]">
                  <Fingerprint className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Autenticação em Duas Etapas</h2>
                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Digite o código de 6 dígitos do seu app autenticador ou use um código de recuperação (ex: ABCD-1234).
                </p>
              </div>

              <form onSubmit={handleVerify2FALogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/80 block">Código Temporário ou de Recuperação</label>
                  <input
                    type="text"
                    autoFocus
                    value={twoFactorCode}
                    onChange={(e) => {
                      setTwoFactorCode(e.target.value.toUpperCase())
                      if (twoFactorError) setTwoFactorError(null)
                    }}
                    placeholder="000 000 ou XXXX-XXXX"
                    className="w-full h-12 bg-background/50 border border-border/60 rounded-xl px-4 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:border-alura-accent shadow-inner transition-colors"
                  />
                </div>

                {twoFactorError && (
                  <div className="p-3 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs text-center font-medium">
                    {twoFactorError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || twoFactorCode.trim().length < 6}
                  className="w-full h-12 text-base font-bold bg-alura-accent text-[#0B0D0F] hover:bg-alura-accent/90 shadow-[0_0_20px_rgba(57,255,136,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Confirmar e Entrar"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setRequire2FA(false)
                    setPendingUser(null)
                    setTwoFactorCode("")
                    supabase.auth.signOut()
                  }}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center block"
                >
                  ← Voltar para o Login
                </button>
              </form>
            </motion.div>
          ) : mode === "register" && registerStep === 3 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center space-y-6 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-alura-accent/10 border border-alura-accent/30 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(0,223,160,0.15)]">
                <svg className="w-10 h-10 text-alura-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white text-center">Código confirmado com sucesso!</h2>
              <p className="text-alura-textMuted text-center max-w-xs">
                Sua conta foi verificada. Vamos configurar o seu perfil para você aproveitar ao máximo a comunidade.
              </p>
              
              <Button 
                onClick={() => navigate("/")}
                className="w-full h-12 mt-4 text-base font-medium flex items-center justify-center space-x-2 bg-alura-accent text-[#0B0D0F] hover:bg-alura-accent/90 shadow-[0_0_15px_rgba(57,255,136,0.3)] hover:shadow-[0_0_25px_rgba(57,255,136,0.5)] transition-all"
              >
                <span>Continuar cadastro</span>
                <ArrowRight className="w-5 h-5 opacity-80" />
              </Button>
            </motion.div>
          ) : mode === "register" && registerStep === 2 ? (
             <OtpVerification 
                email={email} 
                onVerify={handleVerifyOtp} 
                onResend={handleResendOtp}
                isVerifying={isVerifying} 
             />
          ) : (
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-4">
                {mode === "register" && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input 
                      type="text" 
                      placeholder="Nome completo" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 bg-background/50 focus:bg-background border-border/50 hover:border-border transition-colors"
                      required={mode === "register"}
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    type="email" 
                    placeholder={mode === "login" ? "E-mail ou nome de usuário" : "E-mail"} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-background/50 focus:bg-background border-border/50 hover:border-border transition-colors"
                    required
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <AtSign className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input 
                        type="text" 
                        placeholder="Nome de usuário" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 bg-background/50 focus:bg-background border-border/50 hover:border-border transition-colors"
                        required={mode === "register"}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground ml-1">
                      Este será seu identificador para adicionar amigos.
                    </p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Senha" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-background/50 focus:bg-background border-border/50 hover:border-border transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {mode === "register" && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirmar senha" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-background/50 focus:bg-background border-border/50 hover:border-border transition-colors"
                      required={mode === "register"}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-primary/50 group-hover:border-primary flex items-center justify-center bg-primary/10 transition-colors">
                    {/* Um check icon simples se fosse usar Radix Checkbox, mas faremos html simples por hora */}
                    <div className="w-2 h-2 bg-primary rounded-sm opacity-100" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">Manter conectado</span>
                </label>
                
                {mode === "login" && (
                  <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                    Esqueceu sua senha?
                  </a>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium flex items-center justify-center space-x-2"
                disabled={loading}
              >
                <span>{loading ? "Processando..." : (mode === "login" ? "Entrar" : "Continuar")}</span>
                {!loading && <ArrowRight className="w-5 h-5 opacity-70" />}
              </Button>

              <div className="relative flex items-center justify-center py-4">
                <div className="absolute border-t border-border w-full" />
                <span className="relative bg-background px-4 text-xs text-muted-foreground uppercase tracking-wider">
                  ou
                </span>
              </div>

              <div className="space-y-3">
                <Button type="button" variant="outline" className="w-full h-12 bg-background/50 border-border/50 hover:bg-card">
                  {/* Ícone fake do Google para mock */}
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuar com Google
                </Button>
                <Button type="button" variant="outline" className="w-full h-12 bg-background/50 border-border/50 hover:bg-card">
                  <Github className="w-5 h-5 mr-3" />
                  Continuar com GitHub
                </Button>
              </div>
            </form>
          )}

          {/* Footer Text */}
          <div className="pt-8 text-center text-xs text-muted-foreground/60 leading-relaxed">
            Ao continuar, você concorda com nossos <br/>
            <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(0,83,34,0.1)]">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-white/90">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
