import { useEffect, useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Sidebar } from "../../components/layout/Sidebar"
import { Topbar } from "../../components/layout/Topbar"
import { OnboardingWizard } from "../onboarding/OnboardingWizard"
import { GlobalRealtimeListener } from "../../components/shared/GlobalRealtimeListener"
import { SpotifyService } from "../../lib/services/SpotifyService"
import { useNotification } from "../../contexts/NotificationContext"
import { PinnedServersProvider } from "../../contexts/PinnedServersContext"
import { CallProvider } from "../../contexts/CallContext"
import { PresenceProvider } from "../../contexts/PresenceContext"
import { FloatingIncomingCallBar } from "../../components/call/FloatingIncomingCallBar"
import { CallOverlay } from "../../components/call/CallOverlay"
import { useCall } from "../../contexts/CallContext"

import { Ban, ChevronRight } from "lucide-react"
import { AppUpdateModal } from "../../components/common/AppUpdateModal"

function CallOverlayMount({ user, profile }: { user: any; profile: any }) {
  const {
    callState,
    callType,
    localStream,
    remoteStream,
    screenStream,
    isMuted,
    isDeafened,
    isCameraOn,
    isSharingScreen,
    isRemoteSharingScreen,
    callDuration,
    remoteParticipant,
    callerProfile,
    noiseFilter,
    setNoiseFilter,
    hangUp,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    startScreenShareWithSource,
    stopScreenShare,
    streamViewers,
    sendStreamViewerSignal,
    acceptIncomingCall,
    rejectIncomingCall,
  } = useCall()

  if (callState === "idle" || callState === "ended") return null

  return (
    <CallOverlay
      callState={callState}
      callType={callType}
      localStream={localStream}
      remoteStream={remoteStream}
      screenStream={screenStream}
      isMuted={isMuted}
      isDeafened={isDeafened}
      isCameraOn={isCameraOn}
      isSharingScreen={isSharingScreen}
      isRemoteSharingScreen={isRemoteSharingScreen}
      callDuration={callDuration}
      remoteParticipant={remoteParticipant || callerProfile}
      myName={profile?.username || profile?.display_name || user?.user_metadata?.username || "Você"}
      myAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url}
      noiseFilter={noiseFilter}
      setNoiseFilter={setNoiseFilter}
      hangUp={hangUp}
      toggleMute={toggleMute}
      toggleDeafen={toggleDeafen}
      toggleCamera={toggleCamera}
      startScreenShareWithSource={startScreenShareWithSource}
      stopScreenShare={stopScreenShare}
      streamViewers={streamViewers}
      sendStreamViewerSignal={sendStreamViewerSignal}
      acceptCall={acceptIncomingCall}
      rejectCall={rejectIncomingCall}
    />
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { showToast } = useNotification()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('alura_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('alura_sidebar_collapsed', String(next))
      } catch {}
      return next
    })
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate("/login")
        return
      }

      setUser(session.user)

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)

        // Sincronização e Restauração de Tema Persistente
        const localTheme = typeof window !== 'undefined' ? localStorage.getItem('alura_theme') : null
        if (profileData.theme) {
          document.documentElement.setAttribute('data-theme', profileData.theme)
          try { localStorage.setItem('alura_theme', profileData.theme) } catch (e) {}
        } else if (localTheme) {
          supabase.from('profiles').update({ theme: localTheme }).eq('id', session.user.id).then(() => {})
        }

        // Sincronização de Densidade
        if (profileData.chat_density) {
          document.documentElement.setAttribute('data-density', profileData.chat_density)
          try { localStorage.setItem('alura_chat_density', profileData.chat_density) } catch (e) {}
        }

        // Sincronização de Redução de Movimento
        if (profileData.reduced_motion !== undefined && profileData.reduced_motion !== null) {
          document.documentElement.setAttribute('data-reduced-motion', String(profileData.reduced_motion))
          try { localStorage.setItem('alura_reduced_motion', String(profileData.reduced_motion)) } catch (e) {}
        }

        // Auto-sincronizar email em profiles para permitir descoberta por e-mail quando ativada
        if (session.user.email && !profileData.email) {
          supabase.from('profiles').update({ email: session.user.email }).eq('id', session.user.id).then(() => {})
        }
      }
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login")
      } else {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  // Escuta mudanças no próprio perfil para manter UI atualizada
  useEffect(() => {
    if (!user) return
    const channel = supabase.channel(`profile_self_${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        const updated = payload.new
        setProfile((prev: any) => ({ ...prev, ...updated }))
        if (updated?.theme) {
          document.documentElement.setAttribute('data-theme', updated.theme)
          try { localStorage.setItem('alura_theme', updated.theme) } catch (e) {}
        }
        if (updated?.chat_density) {
          document.documentElement.setAttribute('data-density', updated.chat_density)
          try { localStorage.setItem('alura_chat_density', updated.chat_density) } catch (e) {}
        }
        if (updated?.reduced_motion !== undefined && updated?.reduced_motion !== null) {
          document.documentElement.setAttribute('data-reduced-motion', String(updated.reduced_motion))
          try { localStorage.setItem('alura_reduced_motion', String(updated.reduced_motion)) } catch (e) {}
        }
      })
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [user])

  // Captura retorno do OAuth do Spotify em qualquer rota raiz (ex: ?code=... com PKCE)
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return

    const search = window.location.search
    const hash = window.location.hash
    const callbackData = search.includes("code=") ? search : (hash.includes("access_token=") ? hash : null)

    if (callbackData) {
      SpotifyService.handleAuthCallback(callbackData).then(async (authResult) => {
        if (authResult) {
          window.history.replaceState(null, '', `${window.location.pathname}#/settings`)
          showToast({
            type: "success",
            title: "Spotify Conectado!",
            message: "Sua conta do Spotify foi vinculada com sucesso à Alura."
          })
          const track = await SpotifyService.fetchCurrentlyPlaying(authResult.token)
          if (track && user?.id) {
            await SpotifyService.saveActivity(user.id, track, true)
          }
          navigate("/settings")
        }
      })
    }
  }, [user, navigate, showToast])

  if (loading) return (
    <div className="min-h-screen bg-alura-background flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-alura-accent border-t-transparent rounded-full animate-spin"></div>
      <p className="text-alura-textMuted font-medium tracking-wide">Carregando ecossistema...</p>
    </div>
  )

  // Intercepta se a conta estiver banida pela moderação
  if (profile?.is_banned) {
    return (
      <div className="min-h-screen bg-[#001007] flex flex-col items-center justify-center p-6 text-zinc-300">
        <div className="w-full max-w-md rounded-2xl border border-red-900/40 bg-[#001609] p-8 text-center shadow-2xl">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-red-950/50 border border-red-800/40 flex items-center justify-center text-red-400 mb-4">
            <Ban className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Conta Suspensa</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Sua conta Alura foi suspensa pela equipe de moderação.
          </p>
          <div className="rounded-xl bg-[#001b0b] border border-red-900/30 p-4 text-xs text-left text-zinc-300 mb-6">
            <span className="font-semibold text-red-400 block mb-1">Motivo:</span>
            {profile.ban_reason || "Violação dos Termos de Serviço ou Diretrizes da Comunidade."}
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              navigate("/login")
            }}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-lg shadow-red-950/50"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    )
  }

  // Intercepta se o Onboarding não estiver completo (aceita false, nulo, undefined)
  // E também intercepta se o profile nem existir ainda!
  if (!profile || !profile.onboarding_completed) {
    return <OnboardingWizard user={user} profile={profile || {}} onComplete={() => setProfile({ ...(profile || {}), onboarding_completed: true })} />
  }

  return (
    <PinnedServersProvider userId={user?.id}>
      <PresenceProvider user={user} profile={profile}>
        <CallProvider user={user} profile={profile}>
          <div className="flex h-screen w-full bg-alura-background overflow-hidden text-alura-textPrimary">
            <GlobalRealtimeListener user={user} profile={profile} />
            <Sidebar
              user={user}
              profile={profile}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
            />
            <div className="flex flex-1 flex-col overflow-hidden h-full relative">
              <Topbar
                user={user}
                profile={profile}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
              />
              <Outlet context={{ user, profile }} />
            </div>

            <FloatingIncomingCallBar />
            <CallOverlayMount user={user} profile={profile} />
            <AppUpdateModal />
          </div>
        </CallProvider>
      </PresenceProvider>
    </PinnedServersProvider>
  )
}

