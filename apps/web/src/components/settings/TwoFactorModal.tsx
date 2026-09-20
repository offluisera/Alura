import { useState, useEffect } from "react"
import { QrCode, ShieldCheck, Copy, Check, Download, AlertTriangle, ArrowRight, ArrowLeft, X, Smartphone, Key } from "lucide-react"
import { TwoFactorService, type EnrollmentData } from "../../lib/services/TwoFactorService"

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: any
  profile: any
}

export function TwoFactorModal({ isOpen, onClose, onSuccess, user, profile }: TwoFactorModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [enrollData, setEnrollData] = useState<EnrollmentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)
  const [savedCodesChecked, setSavedCodesChecked] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Inicia o processo de configuração
  useEffect(() => {
    if (!isOpen || !user) return

    setStep(1)
    setCode("")
    setErrorMsg(null)
    setSavedCodesChecked(false)
    setLoading(true)

    TwoFactorService.startEnrollment(
      user.id,
      user.email || "",
      profile?.username || user.user_metadata?.full_name || ""
    ).then((data) => {
      setEnrollData(data)
      setLoading(false)
    }).catch((err) => {
      console.error("Erro ao iniciar 2FA:", err)
      setErrorMsg("Não foi possível gerar a chave de segurança. Tente novamente.")
      setLoading(false)
    })
  }, [isOpen, user, profile])

  if (!isOpen) return null

  // Copiar chave manual
  const handleCopyKey = () => {
    if (!enrollData?.secret) return
    navigator.clipboard.writeText(enrollData.secret)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2500)
  }

  // Copiar todos os códigos de recuperação
  const handleCopyBackupCodes = () => {
    if (!enrollData?.backupCodes) return
    const text = `CÓDIGOS DE RECUPERAÇÃO ALURA (2FA):\n\n` +
      enrollData.backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
      `\n\nGuarde em local seguro. Cada código só pode ser utilizado uma única vez.`
    navigator.clipboard.writeText(text)
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2500)
  }

  // Baixar arquivo .txt dos códigos
  const handleDownloadBackupCodes = () => {
    if (!enrollData?.backupCodes) return
    const text = `=========================================\n` +
      `ALURA - CÓDIGOS DE RECUPERAÇÃO EM DUAS ETAPAS (2FA)\n` +
      `=========================================\n\n` +
      `Conta: ${user?.email || profile?.username}\n` +
      `Data: ${new Date().toLocaleString("pt-BR")}\n\n` +
      `Cada código é de uso único. Se você perder acesso ao seu\n` +
      `aplicativo autenticador, use um destes códigos para entrar.\n\n` +
      enrollData.backupCodes.map((c, i) => `[ ] ${i + 1}. ${c}`).join("\n") +
      `\n\n=========================================\n`
    
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alura-codigos-recuperacao-2fa-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Validar código de 6 dígitos
  const handleVerify = async () => {
    if (!enrollData || !user) return
    const cleanCode = code.trim().replace(/\D/g, "")
    if (cleanCode.length !== 6) {
      setErrorMsg("Digite o código de 6 dígitos gerado pelo aplicativo.")
      return
    }

    setVerifying(true)
    setErrorMsg(null)

    const res = await TwoFactorService.verifyAndEnable(
      user.id,
      enrollData.factorId,
      enrollData.secret,
      cleanCode,
      enrollData.backupCodes
    )

    setVerifying(false)

    if (res.success) {
      // Avança para a tela final de backup codes
      setStep(3)
    } else {
      setErrorMsg(res.error || "Código inválido. Tente novamente.")
    }
  }

  // Concluir tudo
  const handleFinish = () => {
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#001609] border border-alura-border rounded-2xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 text-left">
        
        {/* Header com indicador de etapas */}
        <div className="flex items-center justify-between pb-3 border-b border-alura-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-alura-surface2 border border-alura-accent/30 flex items-center justify-center text-alura-accent shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                Ativar Autenticação em Duas Etapas (2FA)
              </h3>
              <span className="text-[11px] text-alura-textMuted">
                {step === 1 && "Etapa 1 de 3 — Conectar Aplicativo Autenticador"}
                {step === 2 && "Etapa 2 de 3 — Verificar Código Temporário"}
                {step === 3 && "Etapa 3 de 3 — Códigos de Recuperação de Emergência"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-white/10 text-alura-textMuted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Progresso das Etapas */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= s ? "bg-alura-accent shadow-[0_0_8px_rgba(57,255,136,0.4)]" : "bg-alura-surface2 border border-alura-border/40"
              }`}
            />
          ))}
        </div>

        {/* CONTEÚDO ETAPA 1: QR CODE & CHAVE MANUAL */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-alura-textMuted">
                <div className="w-8 h-8 border-2 border-alura-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Gerando credenciais seguras de 2FA...</span>
              </div>
            ) : enrollData ? (
              <>
                <div className="p-3 rounded-xl bg-alura-surface2/60 border border-alura-border/40 flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-alura-accent shrink-0 mt-0.5" />
                  <div className="text-xs text-alura-textSecondary leading-relaxed">
                    Abra seu aplicativo autenticador preferido (<strong>Google Authenticator, Authy, Microsoft Authenticator</strong> ou <strong>1Password</strong>) e escaneie o código abaixo.
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-alura-surface1 border border-alura-border/80">
                  <div className="w-44 h-44 bg-white p-2.5 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
                    {enrollData.qrCode.startsWith("<svg") ? (
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: enrollData.qrCode }}
                      />
                    ) : (
                      <img
                        src={enrollData.qrCode}
                        alt="QR Code 2FA Alura"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Chave de Configuração Manual */}
                  <div className="mt-3.5 w-full space-y-1.5 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-alura-textMuted">
                      Não consegue escanear? Digite a chave manual:
                    </span>
                    <div className="flex items-center justify-center gap-2 bg-alura-surface2 border border-alura-border/70 rounded-lg px-3 py-1.5 max-w-sm mx-auto">
                      <span className="font-mono text-xs text-alura-accent font-bold tracking-wider select-all">
                        {enrollData.secret}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="text-alura-textMuted hover:text-white transition-colors cursor-pointer p-1"
                        title="Copiar chave"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-alura-accent" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-alura-surface2 hover:bg-white/10 text-alura-textSecondary hover:text-white text-xs font-semibold border border-alura-border transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover text-[#0B0D0F] text-xs font-bold shadow-[0_0_15px_rgba(57,255,136,0.25)] transition-all cursor-pointer"
                  >
                    Continuar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-alura-danger">
                {errorMsg || "Erro ao carregar dados do 2FA."}
              </div>
            )}
          </div>
        )}

        {/* CONTEÚDO ETAPA 2: VALIDAR CÓDIGO */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-white block">Digite o código de verificação</span>
              <p className="text-xs text-alura-textMuted leading-relaxed">
                Digite o código de 6 números gerado pelo aplicativo autenticador para confirmar a sincronização.
              </p>
            </div>

            <div className="py-2">
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setCode(val)
                  if (errorMsg) setErrorMsg(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && code.length === 6) {
                    handleVerify()
                  }
                }}
                placeholder="000 000"
                className="w-full bg-alura-surface2 border border-alura-border rounded-xl px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-white focus:outline-none focus:border-alura-accent shadow-inner transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-alura-danger/15 border border-alura-danger/30 text-alura-danger text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-alura-surface2 hover:bg-white/10 text-alura-textSecondary hover:text-white text-xs font-semibold border border-alura-border transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={code.length !== 6 || verifying}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-alura-accent hover:bg-alura-accentHover disabled:opacity-50 text-[#0B0D0F] text-xs font-bold shadow-[0_0_15px_rgba(57,255,136,0.25)] transition-all cursor-pointer"
              >
                {verifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0B0D0F] border-t-transparent rounded-full animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Ativar 2FA
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CONTEÚDO ETAPA 3: CÓDIGOS DE BACKUP */}
        {step === 3 && enrollData && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-alura-accent/10 border border-alura-accent/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-alura-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">2FA Habilitado com Sucesso!</span>
                <span className="text-[11px] text-alura-textMuted leading-relaxed">
                  Guarde estes <strong>8 códigos de recuperação de uso único</strong>. Se você perder acesso ao seu aparelho autenticador, eles serão o único meio de recuperar a sua conta.
                </span>
              </div>
            </div>

            {/* Grid de Códigos de Recuperação */}
            <div className="p-4 rounded-xl bg-alura-surface2 border border-alura-border">
              <div className="grid grid-cols-2 gap-2.5">
                {enrollData.backupCodes.map((codeItem, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-lg bg-alura-surface1 border border-alura-border/60 text-center font-mono text-xs font-bold text-white select-all tracking-wider"
                  >
                    <span className="text-[10px] text-alura-textMuted mr-2">{idx + 1}.</span>
                    {codeItem}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-alura-border/40">
                <button
                  type="button"
                  onClick={handleCopyBackupCodes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-alura-surface3 hover:bg-alura-hover border border-alura-border text-xs text-white transition-colors cursor-pointer"
                >
                  {copiedCodes ? <Check className="w-3.5 h-3.5 text-alura-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCodes ? "Copiados!" : "Copiar Códigos"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBackupCodes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-alura-surface3 hover:bg-alura-hover border border-alura-border text-xs text-white transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-alura-accent" /> Baixar .TXT
                </button>
              </div>
            </div>

            {/* Checkbox de Confirmação Obrigatória */}
            <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={savedCodesChecked}
                onChange={(e) => setSavedCodesChecked(e.target.checked)}
                className="mt-0.5 rounded border-alura-border bg-alura-surface2 text-alura-accent focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-alura-textSecondary leading-relaxed">
                Confirmo que copiei ou baixei meus códigos de recuperação e guardei em um gerenciador seguro.
              </span>
            </label>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleFinish}
                disabled={!savedCodesChecked}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-alura-accent hover:bg-alura-accentHover disabled:opacity-40 text-[#0B0D0F] text-xs font-bold shadow-[0_0_15px_rgba(57,255,136,0.3)] transition-all cursor-pointer"
              >
                Concluir Configuração
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
