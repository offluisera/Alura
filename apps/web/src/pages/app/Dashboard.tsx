import { useEffect, useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Sidebar } from "../../components/layout/Sidebar"
import { Topbar } from "../../components/layout/Topbar"
import { OnboardingWizard } from "../onboarding/OnboardingWizard"
import { GlobalRealtimeListener } from "../../components/shared/GlobalRealtimeListener"
import { SpotifyService } from "../../lib/services/SpotifyService"
import { useNotification } from "../../contexts/NotificationContext"
import { CallProvider } from "../../contexts/CallContext"
import { FloatingIncomingCallBar } from "../../components/call/FloatingIncomingCallBar"
import { CallOverlay } from "../../components/call/CallOverlay"
import { useCall } from "../../contexts/CallContext"

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
    noiseFilter,
    setNoiseFilter,
    hangUp,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    startScreenShareWithSource,
    stopScreenShare,
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
      remoteParticipant={remoteParticipant}
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
        setProfile((prev: any) => ({ ...prev, ...payload.new }))
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

  // Intercepta se o Onboarding não estiver completo (aceita false, nulo, undefined)
  // E também intercepta se o profile nem existir ainda!
  if (!profile || !profile.onboarding_completed) {
    return <OnboardingWizard user={user} profile={profile || {}} onComplete={() => setProfile({ ...(profile || {}), onboarding_completed: true })} />
  }

  return (
    <CallProvider user={user} profile={profile}>
      <div className="flex h-screen w-full bg-alura-background overflow-hidden text-alura-textPrimary">
        <GlobalRealtimeListener user={user} profile={profile} />
        <Sidebar user={user} profile={profile} />
        <div className="flex flex-1 flex-col overflow-hidden h-full">
          <Topbar user={user} profile={profile} />
          <Outlet context={{ user, profile }} />
        </div>
        <FloatingIncomingCallBar />
        <CallOverlayMount user={user} profile={profile} />
      </div>
    </CallProvider>
  )
}

