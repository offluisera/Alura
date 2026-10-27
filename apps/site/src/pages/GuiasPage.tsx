import React, { useState } from 'react';
import {
  BookOpen,
  Sliders,
  Mic,
  MonitorPlay,
  ShieldAlert,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Keyboard,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface Guide {
  id: string;
  category: 'quickstart' | 'audio' | 'permissions' | 'security';
  categoryLabel: string;
  title: string;
  summary: string;
  readTime: string;
  steps: string[];
  tips: string[];
}

const guidesData: Guide[] = [
  {
    id: 'setup-server',
    category: 'quickstart',
    categoryLabel: 'Início Rápido',
    title: 'Como criar e estruturar seu servidor Alura do zero',
    summary:
      'Aprenda a organizar categorias temáticas, canais de texto com markdown e salas de voz de ultrabaixa latência para sua comunidade.',
    readTime: '4 min',
    steps: [
      'Clique no botão "+" na barra lateral de servidores para iniciar a criação.',
      'Defina um nome marcante e faça o upload de um avatar com contraste nítido.',
      'Crie pelo menos 3 categorias essenciais: "Boas-vindas & Regras", "Geral / Bate-papo" e "Salas de Voz".',
      'Configure os canais de texto iniciais (#anúncios, #chat-geral, #links-úteis) e defina permissões de leitura.',
      'Adicione canais de voz com limites de usuários para lobbies competitivos ou canais livres.',
    ],
    tips: [
      'Mantenha a lista de canais enxuta no início: o excesso de canais dispersa o engajamento.',
      'Fixe uma mensagem com as regras de convivência logo na entrada.',
    ],
  },
  {
    id: 'hoisted-roles',
    category: 'permissions',
    categoryLabel: 'Cargos & Permissões',
    title: 'Dominando Cargos Hoisted e Hierarquia Visual',
    summary:
      'Descubra como agrupar membros na barra lateral com cores exclusivas e garantir que moderadores se destaquem.',
    readTime: '5 min',
    steps: [
      'Acesse as Configurações do Servidor > aba "Cargos".',
      'Crie os cargos em ordem decrescente de poder (ex: Administrador, Moderador, Membro VIP, Membro).',
      'Ative a opção "Exibir membros deste cargo separadamente dos membros conectados" (Hoisted).',
      'Escolha uma paleta de cores harmoniosa em hexadecimal para não poluir a barra lateral.',
      'Organize a ordem de arrasto: o cargo mais alto na lista sobrepõe a cor dos cargos abaixo.',
    ],
    tips: [
      'Cargos mais altos sempre têm precedência sobre os mais baixos em caso de conflito de permissão.',
      'Utilize o Simulador de Visualização para checar o resultado sem precisar de outra conta.',
    ],
  },
  {
    id: 'dsp-audio',
    category: 'audio',
    categoryLabel: 'Áudio & Vídeo',
    title: 'Calibrando o Cancelamento de Ruído DSP (CleanVoice)',
    summary:
      'Configure a supressão de eco, ganho automático e filtre cliques mecânicos de teclado sem abafar sua voz.',
    readTime: '3 min',
    steps: [
      'Vá em Configurações de Usuário > "Voz e Vídeo".',
      'Selecione seu dispositivo correto de Entrada (Microfone) e Saída (Fones).',
      'Ative a chave "Cancelamento de Ruído DSP (CleanVoice)".',
      'Ajuste o limiar de Sensibilidade de Ativação de Voz: fale naturalmente enquanto observa a barra verde.',
      'Marque "Supressão Acústica de Eco" caso utilize caixas de som abertas.',
    ],
    tips: [
      'Se você tem teclado mecânico barulhento, aumente a sensibilidade de corte em +5dB.',
      'Prefira utilizar fones de ouvido fechados para garantir fidelidade sonora absoluta.',
    ],
  },
  {
    id: 'streaming-60fps',
    category: 'audio',
    categoryLabel: 'Áudio & Vídeo',
    title: 'Transmissão 1080p 60 FPS: Melhores Práticas',
    summary:
      'Transmita gameplays e sessões colaborativas com taxa de quadros suave e áudio nativo do jogo.',
    readTime: '4 min',
    steps: [
      'Conecte-se a qualquer canal de voz da Alura.',
      'Clique no ícone de "Compartilhar Tela" na barra de controle de chamada.',
      'Escolha entre compartilhar uma "Janela de Aplicativo" específica ou a "Tela Inteira".',
      'Defina a resolução para 1080p e a taxa de quadros para 60 FPS.',
      'Certifique-se de marcar "Compartilhar áudio do sistema" para transmitir o som do jogo.',
    ],
    tips: [
      'Compartilhar apenas a janela do jogo consome menos GPU e protege sua privacidade se você alternar de tela.',
      'A aceleração por hardware requer GPU compatível com NVENC, QuickSync ou AMD VCN.',
    ],
  },
  {
    id: 'soundboard-myinstants',
    category: 'quickstart',
    categoryLabel: 'Início Rápido',
    title: 'Como Usar o Soundboard com Busca MyInstants',
    summary:
      'Adicione toques cômicos e efeitos sonoros às conversas de voz com o buscador nativo de áudios da Alura.',
    readTime: '3 min',
    steps: [
      'Durante uma chamada de voz, clique no ícone de Soundboard (efeitos sonoros).',
      'Utilize o campo de busca integrado para pesquisar memes, vinhetas e sons no MyInstants.',
      'Clique sobre o efeito desejado para tocar instantaneamente para todos no canal.',
      'Favorite os sons que você mais usa clicando na estrela para acesso em um clique.',
      'Administradores podem definir limites de cooldown anti-spam nas configurações do servidor.',
    ],
    tips: [
      'Usuários individuais podem regular o volume do Soundboard separadamente nas configurações de voz.',
      'Moderação tem o poder de silenciar o soundboard de usuários específicos com 1 clique.',
    ],
  },
  {
    id: 'server-security',
    category: 'security',
    categoryLabel: 'Segurança & Moderação',
    title: 'Blindando sua Comunidade Contra Raids e Spam',
    summary:
      'Políticas essenciais de moderação, auditoria de logs e configuração de cargos padrão seguros.',
    readTime: '6 min',
    steps: [
      'Configure o cargo padrão (@everyone) sem permissão de mencionar @everyone ou @here.',
      'Desative o envio de links nos canais de texto públicos para novos membros.',
      'Crie um canal de logs exclusivo visível apenas para os moderadores.',
      'Adicione um cargo de "Verificado" atribuído após o membro ler e aceitar as regras.',
      'Utilize links de convite com data de expiração e limite máximo de usos para eventos restritos.',
    ],
    tips: [
      'Nunca conceda a permissão "Administrador" a bots ou moderadores que não façam parte do núcleo central.',
      'O banco PostgreSQL da Alura possui Row Level Security (RLS) protegendo os canais de dados.',
    ],
  },
];

export const GuiasPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Guias' },
    { id: 'quickstart', label: 'Início Rápido' },
    { id: 'audio', label: 'Áudio & Vídeo' },
    { id: 'permissions', label: 'Cargos & Permissões' },
    { id: 'security', label: 'Segurança & Moderação' },
  ];

  const filteredGuides = guidesData.filter((guide) => {
    return activeCategory === 'all' || guide.category === activeCategory;
  });

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Glow de fundo */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[340px] bg-[var(--color-accent)]/10 blur-[150px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Guias e Manuais da Alura.
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Tutoriais práticos, dicas de afinação de áudio, arquitetura de servidores e boas práticas 
          para você extrair o potencial máximo da sua comunidade.
        </p>
      </div>

      {/* Guia em Destaque (Editorial Hero Guide) */}
      <div className="mb-16 rounded-3xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[#001B0B] via-[#00220E] to-[#111318] p-8 sm:p-12 relative overflow-hidden shadow-[0_0_50px_-20px_rgba(57,255,136,0.15)]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[var(--color-accent)] text-black text-xs font-semibold uppercase tracking-wider">
              Guia em Destaque
            </span>
            <span className="text-xs text-white/50 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              6 min de leitura
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            O Guia Completo para Estruturar um Servidor de Sucesso
          </h2>

          <p className="text-white/70 text-base leading-relaxed mb-6">
            Aprenda os segredos de organização de canais, hierarquia visual com cargos hoisted, 
            políticas de boas-vindas e automação para fazer sua comunidade prosperar sem sobrecarregar a moderação.
          </p>

          <button
            type="button"
            onClick={() => setSelectedGuide(guidesData[0])}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
          >
            Ler Guia Completo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-[var(--color-accent)] text-black font-semibold shadow-[0_0_15px_-3px_rgba(57,255,136,0.4)]'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Guias */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="rounded-3xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[var(--color-accent)]/40 hover:-translate-y-1 transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-[var(--color-accent)]">
                  {guide.categoryLabel}
                </span>
                <span className="text-xs font-mono text-white/40 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {guide.readTime}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[var(--color-accent)] transition-colors">
                {guide.title}
              </h3>

              <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
                {guide.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-white/40">
                {guide.steps.length} passos práticos
              </span>
              <button
                type="button"
                onClick={() => setSelectedGuide(guide)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
              >
                Abrir manual
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Leitura do Guia */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="rounded-3xl border border-white/15 bg-[#111318] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedGuide(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              aria-label="Fechar guia"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-mono">
                {selectedGuide.categoryLabel}
              </span>
              <span className="text-xs text-white/40 font-mono">
                {selectedGuide.readTime} de leitura
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-4 pr-8"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {selectedGuide.title}
            </h2>

            <p className="text-sm text-white/70 leading-relaxed mb-8 pb-6 border-b border-white/10">
              {selectedGuide.summary}
            </p>

            <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--color-accent)] mb-4">
              Passo a Passo Recomendado
            </h3>

            <div className="space-y-4 mb-8">
              {selectedGuide.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            {selectedGuide.tips.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <span className="text-xs font-mono uppercase text-white/40 block mb-2">
                  Dicas do Especialista
                </span>
                <ul className="space-y-2">
                  {selectedGuide.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedGuide(null)}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all"
            >
              Concluir Leitura
            </button>
          </div>
        </div>
      )}

      {/* Rodapé de Dúvidas */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/50 p-8 text-center max-w-2xl mx-auto">
        <HelpCircle className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-3" />
        <h3
          className="text-xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Não encontrou o que procurava?
        </h3>
        <p className="text-sm text-white/50 mb-6">
          Nossa equipe e comunidade estão online todos os dias na Alura Central para tirar dúvidas e ajudar com configurações avançadas.
        </p>
        <a
          href="https://app.alura.net.br/web"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] hover:underline"
        >
          Entrar na Sala de Suporte Comunitário
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
