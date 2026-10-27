import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  MonitorPlay,
  Volume2,
  ShieldCheck,
  Cpu,
  Zap,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Radio,
  FileCode2,
} from 'lucide-react';

export const RecursosPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Glow de fundo */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-accent)]/10 blur-[140px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Hero da Página */}
      <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
        
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Projetado para quem exige clareza, velocidade e soberania.
        </h1>
        
        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          A Alura substitui o excesso de bloatware e consumo abusivo de recursos por uma engine 
          enxuta construída sobre WebRTC Mesh, Elixir Phoenix e processamento de áudio em tempo real.
        </p>

        {/* Métricas / Stats rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-white font-mono">&lt; 35ms</span>
            <span className="text-xs text-white/50 mt-1 uppercase tracking-wider">Latência de Voz</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-[var(--color-accent)] font-mono">60 FPS</span>
            <span className="text-xs text-white/50 mt-1 uppercase tracking-wider">Transmissão Nítida</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-white font-mono">48 kHz</span>
            <span className="text-xs text-white/50 mt-1 uppercase tracking-wider">Codec Opus HD</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-[var(--color-accent)] font-mono">&lt; 180MB</span>
            <span className="text-xs text-white/50 mt-1 uppercase tracking-wider">Memória em Repouso</span>
          </div>
        </div>
      </div>

      {/* Grid de Seções de Destaque */}
      <div className="space-y-16 md:space-y-24">
        
        {/* Bloco 1: Voz e Vídeo de Alta Performance */}
        <section className="rounded-3xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 sm:p-10 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] mb-6">
                <Mic className="w-6 h-6" />
              </div>
              <h2 
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Voz cristalina com cancelamento de ruído DSP ativo
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Comunique-se mesmo em ambientes barulhentos. O processador digital de sinal (DSP) integrado da Alura
                filtra cliques mecânicos de teclado, ventoinhas e ruídos de respiração sem truncar as frequências da sua voz.
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span><strong>Supressão acústica de eco (AEC):</strong> Elimina retornos de som mesmo jogando em caixas de som abertas.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span><strong>Controle Automático de Ganho (AGC):</strong> Equaliza o volume de todos os participantes automaticamente.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
                  <span><strong>Detecção de Atividade de Voz (VAD):</strong> Acionamento instantâneo por voz sem cortar a primeira sílaba.</span>
                </li>
              </ul>
            </div>

            {/* Simulação visual do analisador espectral */}
            <div className="rounded-2xl border border-white/10 bg-black/50 p-6 flex flex-col justify-between min-h-[280px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] animate-ping" />
                  <span className="text-xs font-mono text-white/90">DSP Filter: ACTIVE [CleanVoice Core]</span>
                </div>
                <span className="text-xs font-mono text-[var(--color-accent)]">Opus 128 kbps stereo</span>
              </div>

              {/* Barras de frequência animadas em CSS puro */}
              <div className="py-8 flex items-center justify-center gap-1.5 h-32">
                {[45, 78, 92, 60, 35, 88, 100, 65, 40, 85, 95, 70, 50, 90, 80, 55, 30, 75, 90, 60, 45, 80, 65, 40].map((h, i) => (
                  <div 
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-[var(--color-accent)]/20 via-[var(--color-accent)] to-white rounded-full transition-all duration-300"
                    style={{ 
                      height: `${h}%`,
                      opacity: (i % 3 === 0) ? 0.9 : 0.6 
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 pt-3 border-t border-white/5 font-mono">
                <span>20 Hz</span>
                <span>Sub-bass & Voice Profile</span>
                <span>20 kHz</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 2: Transmissão de Tela a 60 FPS */}
        <section className="rounded-3xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 sm:p-10 md:p-12 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            
            {/* Mockup visual de streaming */}
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5 relative overflow-hidden order-2 md:order-1">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs font-mono">
                <span className="flex items-center gap-2 text-white">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  AO VIVO • 1080p 60 FPS
                </span>
                <span className="text-white/40">H.264 / WebRTC Mesh</span>
              </div>
              
              <div className="aspect-video bg-gradient-to-br from-[#0B0D0F] to-[#16181D] rounded-xl flex flex-col items-center justify-center p-6 text-center border border-white/5 relative">
                <MonitorPlay className="w-12 h-12 text-[var(--color-accent)] mb-3 opacity-90" />
                <span className="text-white font-medium text-sm">Transmissão em Tempo Real sem Lag</span>
                <span className="text-xs text-white/40 mt-1 max-w-xs">
                  Captura de janelas isoladas de jogos, navegadores ou desktop com som nativo do sistema operacional.
                </span>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[11px] font-mono text-[var(--color-accent)]">
                  0 DROPPED FRAMES
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] mb-6">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <h2 
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Transmita gameplays e sessões colaborativas sem engasgos
              </h2>
              <p className="text-white/70 leading-relaxed mb-6">
                Chega de transmissões travadas a 30 FPS ou com áudio mudo. A Alura permite compartilhar 
                sua tela com suporte a 60 FPS e áudio estéreo de alta fidelidade sem exigir assinaturas caras.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-[var(--color-accent)]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Aceleração de Hardware por GPU</h3>
                    <p className="text-xs text-white/50 mt-0.5">Codificação NVENC, QuickSync e AMD VCN para poupar a CPU durante partidas intensas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-[var(--color-accent)]">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Captura de Áudio do Sistema</h3>
                    <p className="text-xs text-white/50 mt-0.5">Seus amigos ouvem a música e os efeitos do jogo exatamente como você escuta.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Bloco 3: Grid de 4 Grandes Recursos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Soundboard MyInstants */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[var(--color-accent)]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Soundboard & MyInstants</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Integração nativa de busca rápida no acervo do MyInstants. Toque efeitos sonoros em chamadas de voz com um clique.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
              <span>Sons customizados</span>
              <span className="text-[var(--color-accent)]">1-Click Play</span>
            </div>
          </div>

          {/* Card 2: Servidores & Hoisted Roles */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[var(--color-accent)]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cargos Hoisted & Espaços</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Agrupamento visual de membros por hierarquia, cores customizadas e separação elegante de canais por categorias temáticas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
              <span>Hierarquia visual</span>
              <span className="text-[var(--color-accent)]">Gestão total</span>
            </div>
          </div>

          {/* Card 3: Simulador de Permissões */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[var(--color-accent)]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-5">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simulador de Permissões</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Visualize seu servidor com os olhos de qualquer cargo antes de salvar alterações. Segurança garantida sem adivinhações.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
              <span>Modo Auditoria</span>
              <span className="text-[var(--color-accent)]">Sem riscos</span>
            </div>
          </div>

          {/* Card 4: Privacidade e Criptografia */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[var(--color-accent)]/40 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Privacidade sem Truques</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                DMs com canais autenticados e RLS rígido via Supabase PostgreSQL. Seus dados e mensagens nunca são vendidos a anunciantes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
              <span>Zero telemetry</span>
              <span className="text-[var(--color-accent)]">RLS Blindado</span>
            </div>
          </div>

        </div>

        {/* Bloco 4: Comparativo Técnico */}
        <section className="rounded-3xl border border-white/10 bg-[#111318]/80 backdrop-blur-md p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 
              className="text-2xl sm:text-3xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Alura vs Clientes Legados
            </h2>
            <p className="text-sm text-white/60">
              Veja por que comunidades competitivas e desenvolvedores estão migrando para a Alura.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/50 font-mono text-xs uppercase">
                  <th className="py-4 px-4 font-medium">Especificação Técnica</th>
                  <th className="py-4 px-4 font-semibold text-[var(--color-accent)]">Alura</th>
                  <th className="py-4 px-4 font-medium text-white/40">Plataformas Legadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Transmissão 1080p 60 FPS</td>
                  <td className="py-4 px-4 text-[var(--color-accent)] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> 100% Gratuito & Nativo
                  </td>
                  <td className="py-4 px-4 text-white/40">Bloqueado atrás de planos pagos</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Consumo de Memória RAM (Repouso)</td>
                  <td className="py-4 px-4 text-[var(--color-accent)] font-semibold">120 MB - 180 MB</td>
                  <td className="py-4 px-4 text-white/40">650 MB - 1.2 GB</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Arquitetura de Realtime</td>
                  <td className="py-4 px-4 text-[var(--color-accent)] font-semibold">Elixir Phoenix Channels (BEAM)</td>
                  <td className="py-4 px-4 text-white/40">Node.js Monolítico</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Soundboard Integrado</td>
                  <td className="py-4 px-4 text-[var(--color-accent)] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Busca MyInstants sem limites
                  </td>
                  <td className="py-4 px-4 text-white/40">Slots severamente limitados</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">Políticas de Rastreamento & Ads</td>
                  <td className="py-4 px-4 text-[var(--color-accent)] font-semibold">Zero rastreadores / Zero anúncios</td>
                  <td className="py-4 px-4 text-white/40">Monetização de dados de navegação</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA final da página de Recursos */}
        <div className="text-center py-12 rounded-3xl border border-[var(--color-accent)]/20 bg-gradient-to-b from-[#111318] to-[#0B0D0F] p-8">
          <h2 
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Pronto para experimentar a diferença?
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8 text-sm">
            Crie sua conta em 30 segundos ou baixe o executável para o seu computador.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/baixar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Baixar Alura Desktop
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://app.alura.net.br/web"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 active:scale-95 transition-all"
            >
              Abrir Web App no Navegador
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
