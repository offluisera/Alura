import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react'
import type { ToastData } from '../components/shared/MessageToast'
import type { SystemToastData } from '../components/shared/SystemToast'
import { ToastContainer } from '../components/shared/ToastContainer'
import { ConfirmModal } from '../components/shared/ConfirmModal'
import { supabase } from '../lib/supabase'
import { SoundService } from '../lib/services/SoundService'
import { NotificationPreferencesService } from '../lib/services/NotificationPreferencesService'

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

interface ConfirmModalOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  onConfirm: () => void
}

interface NotificationContextType {
  notifyMessage: (data: Omit<ToastData, 'id'>) => void
  showToast: (options: ToastOptions) => void
  showConfirmModal: (options: ConfirmModalOptions) => void
  unreadDMCount: number
  refreshUnreadDMs: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [closingToasts, setClosingToasts] = useState<string[]>([])
  
  // Toasts do sistema
  const [systemToasts, setSystemToasts] = useState<SystemToastData[]>([])
  const [closingSystemToasts, setClosingSystemToasts] = useState<string[]>([])

  // Modal de Confirmação Global
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  })

  const [unreadDMCount, setUnreadDMCount] = useState(0)
  const clickHandlers = useRef<Record<string, () => void>>({})

  const refreshUnreadDMs = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { count, error } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .neq('user_id', session.user.id)
      .eq('is_read', false)

    if (!error && count !== null) {
      setUnreadDMCount(count)
    }
  }, [])

  useEffect(() => {
    refreshUnreadDMs()
    
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const win = window as any
    if (typeof win !== 'undefined' && win.require) {
      try {
        const { ipcRenderer } = win.require('electron')
        
        const handleExecuteClick = (_event: any, id: string) => {
          const handler = clickHandlers.current[id]
          if (handler) {
            handler()
            delete clickHandlers.current[id]
          }
        }

        ipcRenderer.on('execute-notification-click', handleExecuteClick)
        return () => {
          ipcRenderer.removeListener('execute-notification-click', handleExecuteClick)
        }
      } catch (err) {
        console.warn('Failed to setup notification click listener', err)
      }
    }
  }, [refreshUnreadDMs])

  const notifyMessage = useCallback(async (data: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...data, id }
    
    if (data.onClick) {
      clickHandlers.current[id] = data.onClick
    }

    // Obter preferências salvas do usuário
    const { data: { session } } = await supabase.auth.getSession()
    const prefs = await NotificationPreferencesService.getPreferences(session?.user?.id)

    // Tocar som se habilitado
    if (prefs.allSoundsEnabled && prefs.sounds.messageReceived) {
      SoundService.play('messageReceived')
    }

    // Notificação desktop (respeitando ocultação de conteúdo por privacidade)
    const notificationBody = prefs.hideMessageContent 
      ? "Nova mensagem recebida." 
      : data.message

    const win = window as any
    if (typeof win !== 'undefined' && win.require) {
      try {
        const { ipcRenderer } = win.require('electron')
        const { onClick, ...ipcData } = newToast
        ipcRenderer.send('show-custom-notification', {
          ...ipcData,
          message: notificationBody
        })
      } catch (err) {
        console.warn('Failed to send IPC notification', err)
      }
    } else if (prefs.desktopNotifications && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const notification = new Notification(`Nova mensagem de ${data.username}`, {
        body: notificationBody,
        icon: data.avatar_url || '/icon.ico',
        silent: true
      })
      
      notification.onclick = () => {
        window.focus()
        if (data.onClick) data.onClick()
      }
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const showToast = useCallback(({ type = "info", title, message, duration = 4500 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: SystemToastData = {
      id,
      type,
      title,
      message,
      duration
    }
    setSystemToasts(prev => [...prev, newToast])
  }, [])

  const showConfirmModal = useCallback((options: ConfirmModalOptions) => {
    setConfirmModalData({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      isDanger: options.isDanger,
      onConfirm: () => {
        options.onConfirm()
        setConfirmModalData(prev => ({ ...prev, isOpen: false }))
      }
    })
  }, [])

  const handleClose = useCallback((id: string) => {
    setClosingToasts(prev => [...prev, id])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      setClosingToasts(prev => prev.filter(tId => tId !== id))
    }, 400)
  }, [])

  const handleCloseSystemToast = useCallback((id: string) => {
    setClosingSystemToasts(prev => [...prev, id])
    setTimeout(() => {
      setSystemToasts(prev => prev.filter(t => t.id !== id))
      setClosingSystemToasts(prev => prev.filter(tId => tId !== id))
    }, 300)
  }, [])

  return (
    <NotificationContext.Provider value={{ 
      notifyMessage, 
      showToast, 
      showConfirmModal, 
      unreadDMCount, 
      refreshUnreadDMs 
    }}>
      {children}
      
      {/* Container Global de Toasts */}
      <ToastContainer 
        toasts={toasts} 
        closingToasts={closingToasts} 
        onClose={handleClose}
        systemToasts={systemToasts}
        closingSystemToasts={closingSystemToasts}
        onCloseSystemToast={handleCloseSystemToast}
      />

      {/* Modal Global de Confirmação */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText={confirmModalData.confirmText}
        cancelText={confirmModalData.cancelText}
        isDanger={confirmModalData.isDanger}
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setConfirmModalData(prev => ({ ...prev, isOpen: false }))}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
