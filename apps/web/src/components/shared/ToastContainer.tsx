import { MessageToast } from "./MessageToast"
import type { ToastData } from "./MessageToast"
import { SystemToast } from "./SystemToast"
import type { SystemToastData } from "./SystemToast"

interface ToastContainerProps {
  toasts: ToastData[]
  closingToasts: string[]
  onClose: (id: string) => void
  systemToasts?: SystemToastData[]
  closingSystemToasts?: string[]
  onCloseSystemToast?: (id: string) => void
}

export function ToastContainer({ 
  toasts, 
  closingToasts, 
  onClose,
  systemToasts = [],
  closingSystemToasts = [],
  onCloseSystemToast = () => {}
}: ToastContainerProps) {
  if (toasts.length === 0 && systemToasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse items-end pointer-events-none gap-1">
      {/* Toasts do Sistema (Sucessos, Erros, Informações) */}
      {systemToasts.map((toast) => (
        <SystemToast
          key={toast.id}
          toast={toast}
          isClosing={closingSystemToasts.includes(toast.id)}
          onClose={onCloseSystemToast}
        />
      ))}

      {/* Toasts de Mensagens Diretas */}
      {toasts.map((toast) => (
        <MessageToast
          key={toast.id}
          toast={toast}
          isClosing={closingToasts.includes(toast.id)}
          onClose={onClose}
        />
      ))}
    </div>
  )
}
