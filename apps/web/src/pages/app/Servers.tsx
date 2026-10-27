import React, { useState, useEffect } from 'react'
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Compass, 
  ShieldCheck, 
  Users, 
  Plus, 
  Search, 
  Layers, 
  AlertCircle,
  Sparkles,
  Inbox
} from 'lucide-react'
import { useServers } from '../../lib/hooks/useServers'
import type { ServerTab, ServerItem } from '../../lib/hooks/useServers'
import { usePinnedServers } from '../../lib/hooks/usePinnedServers'
import { ServerHeroBanner } from '../../components/servers/ServerHeroBanner'
import { ServerCategoryFilter } from '../../components/servers/ServerCategoryFilter'
import { ServerCard } from '../../components/servers/ServerCard'
import { ServerPreviewPanel } from '../../components/servers/ServerPreviewPanel'
import { CreateServerModal } from '../../components/servers/CreateServerModal'

export function Servers() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const context = useOutletContext<{ user?: any; profile?: any }>()
  const user = context?.user
  const userId = user?.id

  // Se vier com ?id=..., redireciona para o workspace do servidor
  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam) {
      navigate(`/servers/${idParam}`, { replace: true })
    }
  }, [searchParams, navigate])

  // Hook dos Servidores
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    servers,
    selectedServer,
    setSelectedServer,
    loading,
    joinServer,
    leaveServer,
    refetch,
  } = useServers(userId)

  // Hook dos Servidores Fixados
  const { isPinned, togglePin } = usePinnedServers(userId)

  // Modal de Criação de Servidor
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  // Controle de painel de visualização em mobile
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  const handleSelectServer = (server: ServerItem) => {
    setSelectedServer(server)
    setMobilePreviewOpen(true)
  }

  const handleCreated = (newServerId: string) => {
    setIsCreateOpen(false)
    setActiveTab('owned')
    refetch()
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-alura-background text-alura-textPrimary">
      {/* Container Principal com Scroll */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 custom-scrollbar">
        
        {/* Hero Banner Temático */}
        <ServerHeroBanner
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateClick={() => setIsCreateOpen(true)}
          totalCount={servers.length}
        />

        {/* Barra de Controles: Abas & Filtros de Categorias */}
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3 border-b border-alura-border pb-4 w-full">
          
          {/* Navegação de Abas */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-alura-surface1 border border-alura-border select-none shrink-0 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'discover'
                  ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm'
                  : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover'
              }`}
            >
              <Compass size={14} className={activeTab === 'discover' ? 'text-alura-accent' : 'text-alura-textMuted'} />
              <span>Descobrir</span>
            </button>

            <button
              onClick={() => setActiveTab('owned')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'owned'
                  ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm'
                  : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover'
              }`}
            >
              <ShieldCheck size={14} className={activeTab === 'owned' ? 'text-alura-accent' : 'text-alura-textMuted'} />
              <span>Meus Servidores</span>
            </button>

            <button
              onClick={() => setActiveTab('joined')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'joined'
                  ? 'bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm'
                  : 'text-alura-textSecondary hover:text-alura-textPrimary hover:bg-alura-hover'
              }`}
            >
              <Users size={14} className={activeTab === 'joined' ? 'text-alura-accent' : 'text-alura-textMuted'} />
              <span>Servidores que Faço Parte</span>
            </button>
          </div>

          {/* Categorias por Tags com scroll suave horizontal */}
          <div className="w-full 2xl:flex-1 min-w-0 overflow-x-auto custom-scrollbar">
            <ServerCategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Layout Master-Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-8">
          
          {/* Master: Grid de Cards de Servidores */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            
            {loading ? (
              // Skeleton Loading State
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl bg-alura-surface1/60 border border-alura-border animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="h-24 bg-alura-surface2 rounded-xl" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-alura-surface2 rounded w-3/4" />
                      <div className="h-3 bg-alura-surface2 rounded w-full" />
                    </div>
                    <div className="h-8 bg-alura-surface2 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : servers.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-alura-border bg-alura-surface1/40">
                <div className="w-14 h-14 rounded-2xl bg-alura-surface2 border border-alura-border flex items-center justify-center mb-4 text-alura-textMuted">
                  <Inbox size={26} />
                </div>
                <h3 className="text-base font-bold text-alura-textPrimary">Nenhum servidor encontrado</h3>
                <p className="text-xs text-alura-textSecondary mt-1 max-w-sm">
                  {searchQuery
                    ? `Nenhum resultado para "${searchQuery}". Tente pesquisar por outros termos ou categorias.`
                    : activeTab === 'owned'
                    ? 'Você ainda não criou nenhum servidor na Alura. Seja o pioneiro de uma nova comunidade!'
                    : activeTab === 'joined'
                    ? 'Você ainda não entrou em nenhum servidor. Explore a aba Descobrir para se conectar.'
                    : 'Não há comunidades registradas nesta categoria no momento.'}
                </p>
                {activeTab === 'owned' && (
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-alura-accent text-alura-background hover:brightness-110 transition-all cursor-pointer shadow-md"
                  >
                    <Plus size={14} /> Criar meu primeiro servidor
                  </button>
                )}
              </div>
            ) : (
              // Cards Grid
              <div className={`grid gap-4 ${servers.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                {servers.map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    isSelected={selectedServer?.id === server.id}
                    isPinned={isPinned(server.id)}
                    onSelect={() => handleSelectServer(server)}
                    onJoin={() => joinServer(server.id)}
                    onLeave={async () => {
                      await leaveServer(server.id)
                      window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId: server.id } }))
                    }}
                    onTogglePin={() =>
                      togglePin({
                        id: server.id,
                        name: server.name,
                        icon_url: server.icon_url,
                      })
                    }
                    onTagClick={(tag) => setSearchQuery(tag)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detail: Painel Lateral de Live Preview (Desktop Fixo / Mobile Opcional) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6">
            <ServerPreviewPanel
              server={selectedServer}
              isPinned={selectedServer ? isPinned(selectedServer.id) : false}
              onTogglePin={() => {
                if (selectedServer) {
                  togglePin({
                    id: selectedServer.id,
                    name: selectedServer.name,
                    icon_url: selectedServer.icon_url,
                  })
                }
              }}
              onJoin={async () => {
                if (selectedServer) {
                  if (selectedServer.is_member) {
                    await leaveServer(selectedServer.id)
                    window.dispatchEvent(new CustomEvent('alura:server_deleted', { detail: { serverId: selectedServer.id } }))
                  } else {
                    joinServer(selectedServer.id)
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Modal / Gaveta de Preview Mobile */}
      {mobilePreviewOpen && selectedServer && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] h-[600px] overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl">
            <ServerPreviewPanel
              server={selectedServer}
              isPinned={isPinned(selectedServer.id)}
              onTogglePin={() =>
                togglePin({
                  id: selectedServer.id,
                  name: selectedServer.name,
                  icon_url: selectedServer.icon_url,
                })
              }
              onJoin={() => {
                if (selectedServer.is_member) {
                  leaveServer(selectedServer.id)
                } else {
                  joinServer(selectedServer.id)
                }
              }}
              onClose={() => setMobilePreviewOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de Criação de Servidor */}
      <CreateServerModal
        isOpen={isCreateOpen}
        userId={userId || ''}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
export default Servers
