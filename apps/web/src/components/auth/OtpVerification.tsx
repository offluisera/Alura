import { useState, useRef, useEffect } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@alura/ui" 

interface OtpVerificationProps {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  isVerifying?: boolean
}

export function OtpVerification({ email, onVerify, onResend, isVerifying = false }: OtpVerificationProps) {
  const [boxes, setBoxes] = useState<string[]>(Array(8).fill(""))
  const [timeLeft, setTimeLeft] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isResending, setIsResending] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const focusBox = (index: number) => {
    if (index >= 0 && index < 8) {
      inputRefs.current[index]?.focus()
      // Selecionar o texto para facilitar digitação contínua (opcional)
      setTimeout(() => inputRefs.current[index]?.select(), 0)
    }
  }

  const handleInput = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(0, 1)
    
    setBoxes(prev => {
      const newBoxes = [...prev]
      newBoxes[index] = digit
      return newBoxes
    })

    if (digit && index < 7) {
      focusBox(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!boxes[index] && index > 0) {
        // Se a caixa atual está vazia e aperta backspace, volta para a anterior
        focusBox(index - 1)
      }
    } else if (e.key === "ArrowLeft") {
      focusBox(index - 1)
    } else if (e.key === "ArrowRight") {
      focusBox(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!pastedData) return

    setBoxes(prev => {
      const newBoxes = [...prev]
      for (let k = 0; k < 8; k++) {
        // Preenche as caixas a partir do index em que o paste ocorreu
        if (index + k < 8 && pastedData.charAt(k)) {
          newBoxes[index + k] = pastedData.charAt(k)
        }
      }
      return newBoxes
    })

    const focusIndex = Math.min(index + pastedData.length, 7)
    focusBox(focusIndex)
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResend()
      setBoxes(Array(8).fill(""))
      setTimeLeft(30)
      focusBox(0)
    } catch (err) {
      console.error(err)
    } finally {
      setIsResending(false)
    }
  }

  const isComplete = boxes.every(b => b !== "")

  const onSubmit = () => {
    if (!isComplete) return
    onVerify(boxes.join(""))
  }

  return (
    <div className="flex flex-col items-center justify-center w-full animate-in fade-in zoom-in-95 duration-300">
      
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Cheque o seu e-mail</h2>
        <p className="text-sm text-alura-textMuted max-w-xs mx-auto">
          Nós enviamos um código de 8 dígitos para <span className="font-semibold text-white">{email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 mb-8 w-full max-w-sm" id="otp">
        {boxes.map((val, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={val}
            onChange={(e) => handleInput(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={(e) => handlePaste(e, i)}
            disabled={isVerifying}
            className="w-10 h-12 sm:w-12 sm:h-14 rounded-[14px] bg-alura-surface1 border border-alura-border text-center text-xl font-bold text-white outline-none focus:border-alura-accent focus:ring-4 focus:ring-alura-accent/20 transition-all disabled:opacity-50 shadow-inner"
          />
        ))}
      </div>

      <Button
        onClick={onSubmit}
        disabled={!isComplete || isVerifying}
        className="w-full h-12 text-base font-medium flex items-center justify-center space-x-2 bg-white text-black hover:bg-white/90 disabled:bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
      >
        <span>{isVerifying ? "Verificando..." : "Verificar conta"}</span>
        {isVerifying ? (
           <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
           <ArrowRight className="w-5 h-5 opacity-70" />
        )}
      </Button>

      <div className="mt-6 text-sm text-center min-h-[20px]">
        {timeLeft > 0 ? (
          <p className="text-alura-textMuted">
            Não recebeu? Reenviaremos em <span className="font-mono text-white font-medium">0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </p>
        ) : (
          <p className="text-alura-textMuted">
            Não recebeu o código?{" "}
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold text-alura-accent hover:text-white underline transition-colors disabled:opacity-50"
            >
              {isResending ? "Reenviando..." : "Reenviar código"}
            </button>
          </p>
        )}
      </div>

    </div>
  )
}
