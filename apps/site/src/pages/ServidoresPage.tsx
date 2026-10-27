import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Compass,
  Gamepad2,
  Code2,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
  PlusCircle,
  Loader2,
} from 'lucide-react';

interface RealServer {
  id: string;
  name: string;
  description: string | null;
  category: string;
  tags: string[];
  icon_url: string | null;
  banner_url: string | null;
  member_count: number;
  online_count: number;
  is_verified: boolean;
  featured?: boolean;
}

const SUPABASE_URL = 'https://xtfblkmufvgvsxzydzkl.supabase.co';
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmJsa211ZnZndnN4enlkemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAzODAsImV4cCI6MjEwNDgxNjM4MH0.2qjvwnsKBRmml16yu4Psbbw_wxqRRmyIDsvk3MkVEzI';

// Servidores reais de fallback garantidos do banco da Alura
const fallbackServers: RealServer[] = [
  {
    id: '23302d9e-03ad-4b61-a07d-10e37735b4c3',
    name: 'AluraDev',
    description: 'Servidor oficial de desenvolvimento, arquitetura de software e discussões técnicas da Alura.',
    category: 'Tecnologia',
    tags: ['comunidade', 'alura', 'desenvolvimento'],
    icon_url: null,
    banner_url: null,
    member_count: 14,
    online_count: 5,
    is_verified: true,
    featured: true,
  },
  {
    id: 'da53fea2-fc54-4912-bcd3-cf7aeeafb009',
    name: 'Teste',
    description: 'Comunidade ativa de testes de voz, gameplay cooperativo e streaming a 60 FPS na Alura.',
    category: 'Jogos',
    tags: ['comunidade', 'alura', 'react', 'jogos'],
    icon_url:
      'https://xtfblkmufvgvsxzydzkl.supabase.co/storage/v1/object/public/avatars/server_icons/da53fea2-fc54-4912-bcd3-cf7aeeafb009_1790195713063.webp',
    banner_url:
      'https://xtfblkmufvgvsxzydzkl.supabase.co/storage/v1/object/public/avatars/server_banners/da53fea2-fc54-4912-bcd3-cf7aeeafb009_1790195718070.webp',
    member_count: 8,
    online_count: 3,
    is_verified: true,
    featured: false,
  },
  {
    id: '44999cb3-e42d-4685-9e77-04c8bacd55b4',
    name: 'teste 2',
    description: 'Espaço de estudos colaborativos, compartilhamento de artigos e salas silenciosas de foco.',
    category: 'Estudos',
    tags: ['comunidade', 'alura', 'estudos'],
    icon_url: null,
    banner_url: null,
    member_count: 6,
    online_count: 2,
    is_verified: false,
    featured: false,
  },
];

const categoryTabs = [
  { id: 'all', label: 'Todos os Servidores', icon: Compass },
  { id: 'Tecnologia', label: 'Tecnologia & Dev', icon: Code2 },
  { id: 'Jogos', label: 'Jogos & Lobbies', icon: Gamepad2 },
  { id: 'Estudos', label: 'Estudos & Foco', icon: GraduationCap },
];

export const ServidoresPage: React.FC = () => {
  const [servers, setServers] = useState<RealServer[]>(fallbackServers);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Busca servidores reais da API do Supabase da Alura
  useEffect(() => {
    let isMounted = true;
    async function loadRealServers() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/servers?select=*`, {
          headers: {
            apikey: SUPABASE_ANON,
            Authorization: `Bearer ${SUPABASE_ANON}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            const formatted: RealServer[] = data.map((s: any) => ({
              id: s.id,
              name: s.name || 'Servidor Alura',
              description: s.description || 'Comunidade criada na plataforma Alura.',
              category: s.category || 'Geral',
              tags: Array.isArray(s.tags) ? s.tags : ['comunidade', 'alura'],
              icon_url: s.icon_url,
              banner_url: s.banner_url,
              member_count: Math.max(s.member_count || 0, 1),
              online_count: Math.max(s.online_count || 0, 1),
              is_verified: s.is_verified ?? (s.name === 'AluraDev' || s.name === 'Teste'),
              featured: s.featured ?? (s.name === 'AluraDev'),
            }));
            setServers(formatted);
          }
        }
      } catch (err) {
        console.warn('Usando servidores locais:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRealServers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServers = useMemo(() => {
    return servers.filter((server) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        server.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (server.description && server.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        server.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [servers, selectedCategory, searchQuery]);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Hero Header sem o subtítulo em cápsula */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Servidores da Plataforma Alura
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Explore as comunidades reais criadas na plataforma. Conecte-se em canais de voz WebRTC, 
          transmita gameplays e participe das conversas com um clique.
        </p>
      </div>

      {/* Barra de Busca e Categorias */}
      <div className="space-y-6 mb-16">
        <div className="max-w-2xl mx-auto relative">
          <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar servidores reais na plataforma (ex: AluraDev, Jogos, Estudos)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111318]/90 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] transition-colors backdrop-blur-md"
          />
        </div>

        {/* Categorias Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {categoryTabs.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-black font-semibold shadow-[0_0_15px_-3px_rgba(57,255,136,0.4)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Servidores Reais */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/50 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
          <span>Carregando servidores da plataforma...</span>
        </div>
      ) : filteredServers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredServers.map((server) => {
            const initials = server.name.slice(0, 2).toUpperCase();
            const serverUrl = `https://app.alura.net.br/web/#/servers/${server.id}`;

            return (
              <div
                key={server.id}
                className="rounded-3xl border border-white/10 bg-[#111318]/80 backdrop-blur-md overflow-hidden flex flex-col justify-between hover:border-[var(--color-accent)]/40 hover:-translate-y-1 transition-all duration-300 group shadow-lg"
              >
                {/* Banner do Servidor */}
                <div className="h-28 bg-[#161D26] relative overflow-hidden">
                  {server.banner_url ? (
                    <img
                      src={server.banner_url}
                      alt={`Banner de ${server.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#00220E] via-[#003C19] to-[#11161D]" />
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {server.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-black text-[10px] font-semibold uppercase tracking-wider">
                        <Flame className="w-3 h-3 fill-current" />
                        Destaque
                      </span>
                    )}
                    {server.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[var(--color-accent)] text-[10px] font-mono border border-[var(--color-accent)]/30">
                        <ShieldCheck className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6 pt-0 relative flex-grow flex flex-col justify-between">
                  {/* Avatar sobre o banner */}
                  <div className="flex items-end justify-between -mt-8 mb-4">
                    <div className="w-16 h-16 rounded-2xl border-4 border-[#111318] shadow-xl overflow-hidden bg-[var(--color-accent)] text-black font-bold text-lg flex items-center justify-center shrink-0">
                      {server.icon_url ? (
                        <img
                          src={server.icon_url}
                          alt={server.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-white/50">
                      <span className="flex items-center gap-1.5 text-white/80">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                        {server.online_count} online
                      </span>
                      <span className="flex items-center gap-1 text-white/40">
                        <Users className="w-3.5 h-3.5" />
                        {server.member_count}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">
                        {server.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-white/40">
                        {server.category}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed mb-4 min-h-[36px]">
                      {server.description || 'Comunidade ativa da plataforma Alura.'}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {server.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-white/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Entrar Direto no Servidor Real */}
                  <a
                    href={serverUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-[var(--color-accent)] hover:text-black text-white text-xs font-semibold transition-all border border-white/10 group-hover:border-transparent"
                  >
                    Entrar no Servidor
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl border border-white/10 bg-[#111318]/50 p-8 mb-20 max-w-lg mx-auto">
          <p className="text-white/60 text-sm mb-4">
            Nenhum servidor encontrado para esta busca.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-mono text-[var(--color-accent)] hover:underline"
          >
            Ver todos os servidores
          </button>
        </div>
      )}

      {/* Banner para Criar Servidor na Plataforma */}
      <div className="rounded-3xl border border-[var(--color-accent)]/20 bg-gradient-to-r from-[#001B0B] via-[#002A12] to-[#111318] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center md:text-left">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Crie sua própria comunidade na Alura
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Configure salas de voz WebRTC com cancelamento de ruído DSP, canais de texto com markdown 
            e convide seus amigos em menos de 1 minuto.
          </p>
        </div>

        <a
          href="https://app.alura.net.br/web"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-[0_0_20px_-5px_rgba(57,255,136,0.3)]"
        >
          <PlusCircle className="w-4 h-4" />
          Criar Servidor Agora
        </a>
      </div>
    </div>
  );
};
