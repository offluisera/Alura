import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Wrench,
  Tag,
  Calendar,
  Search,
  CheckCircle2,
  GitCommit,
  ArrowUpRight,
} from 'lucide-react';

type ChangeType = 'novidade' | 'melhoria' | 'correcao';

interface ChangeItem {
  type: ChangeType;
  title: string;
  description: string;
}

interface Release {
  version: string;
  tagline: string;
  date: string;
  isLatest?: boolean;
  changes: ChangeItem[];
}

const initialReleases: Release[] = [
  {
    version: 'v1.0.0',
    tagline: 'Golden Release — WebRTC Mesh, Transmissão 60 FPS & App Windows',
    date: '19 de Outubro de 2026',
    isLatest: true,
    changes: [
      {
        type: 'novidade',
        title: 'Transmissão de tela fluida a 60 FPS',
        description:
          'Suporte nativo a compartilhamento de janelas e telas inteiras em 1080p 60 FPS com áudio do sistema capturado em estéreo.',
      },
      {
        type: 'novidade',
        title: 'Soundboard integrado com busca MyInstants',
        description:
          'Toque efeitos de som instantaneamente em qualquer canal de voz com o painel de busca integrado do acervo MyInstants.',
      },
      {
        type: 'melhoria',
        title: 'Processador de Sinal (DSP) CleanVoice ativo',
        description:
          'Cancelamento ativo de cliques de teclado mecânico e eco acústico de microfone com processamento em tempo real.',
      },
      {
        type: 'melhoria',
        title: 'Instalador nativo Desktop para Windows (.exe)',
        description:
          'Distribuição oficial em executável autônomo com aceleração gráfica de GPU e atalhos globais de teclado (Keybinds).',
      },
      {
        type: 'correcao',
        title: 'Desconexão síncrona ao desligar chamada',
        description:
          'Eliminado estado fantasma de streaming e presença ao desconectar de canais de voz através do botão vermelho.',
      },
      {
        type: 'correcao',
        title: 'Sincronização de transmissão entre Desktop e Web',
        description:
          'Corrigida a negociação de SDP e ICE candidates entre clientes web e o executável desktop.',
      },
    ],
  },
  {
    version: 'v0.9.5',
    tagline: 'Nuvem VPS Dedicada & Cluster Phoenix Elixir',
    date: '15 de Outubro de 2026',
    changes: [
      {
        type: 'novidade',
        title: 'Deploy em contêiner Docker de produção',
        description:
          'Cluster Phoenix Elixir orquestrado via Docker Compose no Debian Bookworm com OTP 27 e BEAM de alto desempenho.',
      },
      {
        type: 'melhoria',
        title: 'Proxy reverso Nginx com HTTP/2 e WebSocket upgrades',
        description:
          'Canal de sinalização de tempo real blindado contra timeouts de conexão e perda de pacotes.',
      },
      {
        type: 'correcao',
        title: 'Adequação de regras de CORS e roteamento de presença',
        description:
          'Normalização dos cabeçalhos de origem para conexões a partir de app.alura.net.br e clientes locais.',
      },
    ],
  },
  {
    version: 'v0.9.0',
    tagline: 'Cargos Hoisted & Simulador de Permissões',
    date: '28 de Setembro de 2026',
    changes: [
      {
        type: 'novidade',
        title: 'Cargos Hoisted com agrupamento visual',
        description:
          'Membros organizados por cargos destacados na barra lateral, com suporte a cores hexadecimais personalizadas.',
      },
      {
        type: 'novidade',
        title: 'Modo Simulador de Visualização de Servidor',
        description:
          'Permite que administradores inspecionem a comunidade exatamente como qualquer cargo enxerga antes de aplicar mudanças.',
      },
      {
        type: 'melhoria',
        title: 'Alura Design System com Paleta Dark Emerald',
        description:
          'Identidade visual autoral da Alura inspirada em tons profundos de esmeralda (#001609 a #005322 e #39FF88).',
      },
    ],
  },
  {
    version: 'v0.8.0',
    tagline: 'Fundação Realtime & Supabase PostgreSQL',
    date: '10 de Setembro de 2026',
    changes: [
      {
        type: 'novidade',
        title: 'Segurança RLS em nível de banco de dados',
        description:
          'Políticas estritas de Row Level Security (RLS) no PostgreSQL para garantir privacidade absoluta entre membros.',
      },
      {
        type: 'novidade',
        title: 'Canais de texto com markdown e uploads rápidos',
        description:
          'Suporte a blocos de código com syntax highlighting, anexos de mídia e reações interativas em mensagens.',
      },
      {
        type: 'melhoria',
        title: 'Desacoplamento modular de áudio e dados',
        description:
          'Separação arquitetural entre o servidor de sinalização WebRTC e o repositório de persistência.',
      },
    ],
  },
];

const SUPABASE_URL = 'https://xtfblkmufvgvsxzydzkl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmJsa211ZnZndnN4enlkemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAzODAsImV4cCI6MjEwNDgxNjM4MH0.2qjvwnsKBRmml16yu4Psbbw_wxqRRmyIDsvk3MkVEzI';

function parseMarkdownNotes(text: string): ChangeItem[] {
  const items: ChangeItem[] = [];
  const lines = text.split('\n');
  let currentType: ChangeType = 'novidade';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().includes('novidade') || (trimmed.includes('###') && trimmed.includes('Chat'))) {
      currentType = 'novidade';
    } else if (trimmed.toLowerCase().includes('melhoria') || trimmed.includes('Otimiza')) {
      currentType = 'melhoria';
    } else if (trimmed.toLowerCase().includes('corre')) {
      currentType = 'correcao';
    } else if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
      const match = trimmed.match(/^[-*]\s*\*\*(.*?)\*\*:?\s*(.*)$/);
      if (match) {
        items.push({
          type: currentType,
          title: match[1],
          description: match[2] || '',
        });
      }
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const lineText = trimmed.substring(2);
      if (lineText.length > 4) {
        items.push({
          type: currentType,
          title: lineText.split(':')[0],
          description: lineText.includes(':') ? lineText.split(':').slice(1).join(':').trim() : '',
        });
      }
    }
  }

  return items;
}

export const ChangelogPage: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>(initialReleases);
  const [activeFilter, setActiveFilter] = useState<'all' | ChangeType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchReleases() {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/app_versions?is_active=eq.true&order=created_at.desc`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const liveReleases: Release[] = data.map((r: any, idx: number) => {
            let changes: ChangeItem[] = [];
            if (Array.isArray(r.changes) && r.changes.length > 0) {
              changes = r.changes;
            } else if (r.release_notes) {
              changes = parseMarkdownNotes(r.release_notes);
            }
            if (changes.length === 0) {
              changes = [{ type: 'melhoria', title: r.title, description: r.release_notes || '' }];
            }

            return {
              version: r.version.startsWith('v') ? r.version : `v${r.version}`,
              tagline: r.tagline || r.title || 'Atualização oficial da plataforma',
              date: new Date(r.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
              isLatest: idx === 0,
              changes,
            };
          });

          // Concatena mantendo versões do banco como prioridade
          const liveVersions = new Set(liveReleases.map((l) => l.version.toLowerCase()));
          const older = initialReleases.filter((h) => !liveVersions.has(h.version.toLowerCase()));
          setReleases([...liveReleases, ...older]);
        }
      } catch (err) {
        console.warn('Erro ao carregar changelog do Supabase:', err);
      }
    }

    fetchReleases();
  }, []);

  const filterBadges: { label: string; value: 'all' | ChangeType }[] = [
    { label: 'Todos os Registros', value: 'all' },
    { label: 'Novidades', value: 'novidade' },
    { label: 'Melhorias', value: 'melhoria' },
    { label: 'Correções', value: 'correcao' },
  ];

  const getTagBadge = (type: ChangeType) => {
    switch (type) {
      case 'novidade':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
            <Sparkles className="w-3 h-3" />
            Novidade
          </span>
        );
      case 'melhoria':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-3 h-3" />
            Melhoria
          </span>
        );
      case 'correcao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Wrench className="w-3 h-3" />
            Correção
          </span>
        );
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto relative z-10">
      {/* Glow de fundo */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-accent)]/10 blur-[150px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">

        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Evolução contínua, sem segredos.
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Documentamos com precisão de engenharia cada melhoria técnica, correção e novo recurso entregue à comunidade Alura.
        </p>
      </div>

      {/* Controles de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-16 p-4 rounded-2xl border border-white/10 bg-[#111318]/80 backdrop-blur-md">
        
        {/* Filtros em botões pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {filterBadges.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === f.value
                  ? 'bg-[var(--color-accent)] text-black font-semibold shadow-[0_0_15px_-3px_rgba(57,255,136,0.4)]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por termo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Timeline de Releases */}
      <div className="relative border-l border-white/10 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-16">
        {releases.map((release) => {
          // Filtrar mudanças da release
          const filteredChanges = release.changes.filter((c) => {
            const matchesType = activeFilter === 'all' || c.type === activeFilter;
            const matchesSearch =
              !searchQuery.trim() ||
              c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              release.version.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
          });

          if (filteredChanges.length === 0) return null;

          return (
            <div key={release.version} className="relative group">
              {/* Marcador na linha de tempo */}
              <div 
                className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 bg-[#0B0D0F] transition-transform group-hover:scale-125 ${
                  release.isLatest
                    ? 'border-[var(--color-accent)] shadow-[0_0_12px_rgba(57,255,136,0.6)]'
                    : 'border-white/40'
                }`}
              />

              {/* Cabeçalho da Release */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span 
                  className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {release.version}
                </span>

                {release.isLatest && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-black text-xs font-semibold uppercase tracking-wider">
                    Versão Atual
                  </span>
                )}

                <span className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {release.date}
                </span>
              </div>

              <h2 className="text-base sm:text-lg text-white/80 font-medium mb-6">
                {release.tagline}
              </h2>

              {/* Lista de Itens da Release */}
              <div className="space-y-4">
                {filteredChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-white/10 bg-[#111318]/70 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getTagBadge(change.type)}
                      <h3 className="text-sm sm:text-base font-semibold text-white">
                        {change.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed pl-1">
                      {change.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé do Changelog */}
      <div className="mt-20 p-8 rounded-3xl border border-white/10 bg-[#111318]/50 text-center">
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Deseja acompanhar os commits em tempo real?
        </h3>
        <p className="text-sm text-white/50 max-w-md mx-auto mb-6">
          Nosso repositório de desenvolvimento e pipeline de CI/CD publicam compilações noturnas para testadores da comunidade.
        </p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] hover:underline"
        >
          Ver commits no GitHub
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
};
