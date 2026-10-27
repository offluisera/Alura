import React, { useState, useEffect } from 'react';
import {
  Download,
  Monitor,
  Globe,
  Apple,
  Terminal,
  Smartphone,
  Check,
  ChevronDown,
  ShieldCheck,
  Zap,
  Volume2,
  Keyboard,
  Info,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'O Windows SmartScreen alertou sobre o instalador. O que fazer?',
    answer:
      'Como a Alura é um software recente e em fase ativa de evolução, o certificado de assinatura de código está em processo de maturação perante a Microsoft. Para prosseguir com segurança, clique em "Mais informações" e depois em "Executar assim mesmo". O instalador é 100% livre de malwares e você pode verificar o checksum SHA-256 no nosso GitHub.',
  },
  {
    question: 'Qual a diferença entre a versão Desktop e o Web App?',
    answer:
      'O Web App funciona em qualquer navegador sem necessidade de instalação. Já a versão Desktop (Windows) oferece vantagens essenciais para gamers e streamers: atalhos de teclado globais (Push-to-Talk enquanto joga em tela cheia), menor latência de áudio, aceleração total de GPU e transmissão de janelas com áudio nativo do sistema operacional.',
  },
  {
    question: 'Como funcionam as atualizações automáticas?',
    answer:
      'Ao abrir o cliente Desktop da Alura, ele verifica e atualiza automaticamente com uma tela rápida de progresso sem interromper sua sessão durante o uso. Ao entrar no app atualizado, um modal com as novidades da versão é exibido.',
  },
  {
    question: 'A Alura possui versão para celular (Android / iOS)?',
    answer:
      'O aplicativo móvel está em desenvolvimento ativo. No momento, você pode acessar a Alura pelo navegador do seu smartphone em app.alura.net.br com suporte completo a chat e leitura de mensagens.',
  },
];

export const BaixarPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [appVersion, setAppVersion] = useState<string>('1.0.3');

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch(
          'https://xtfblkmufvgvsxzydzkl.supabase.co/rest/v1/app_versions?is_active=eq.true&order=created_at.desc&limit=1',
          {
            headers: {
              apikey:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmJsa211ZnZndnN4enlkemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAzODAsImV4cCI6MjEwNDgxNjM4MH0.2qjvwnsKBRmml16yu4Psbbw_wxqRRmyIDsvk3MkVEzI',
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZmJsa211ZnZndnN4enlkemtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDAzODAsImV4cCI6MjEwNDgxNjM4MH0.2qjvwnsKBRmml16yu4Psbbw_wxqRRmyIDsvk3MkVEzI',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].version) {
            setAppVersion(data[0].version.replace(/^v/, ''));
          }
        }
      } catch (e) {
        // Fallback para versão padrão
      }
    }
    fetchLatest();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Glow de fundo */}
      <div 
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--color-accent)]/10 blur-[150px] pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Baixe a Alura para qualquer uma das suas telas.
        </h1>
        
        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Disponível com suporte completo a aceleração de hardware no Windows, 
          acesso imediato via Web App no navegador e novas plataformas a caminho.
        </p>
      </div>

      {/* Grid Principal de Downloads */}
      <div className="grid lg:grid-cols-3 gap-8 mb-20 items-stretch">
        
        {/* Card Destaque: Windows Desktop (Ocupa 2 colunas no desktop) */}
        <div className="lg:col-span-2 rounded-3xl border-2 border-[var(--color-accent)]/40 bg-gradient-to-b from-[#111318] via-[#111318]/90 to-[#0B0D0F] p-8 sm:p-10 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(57,255,136,0.15)] flex flex-col justify-between">
          <div className="absolute top-0 right-0 px-6 py-2 rounded-bl-2xl bg-[var(--color-accent)] text-black font-semibold text-xs tracking-wider uppercase">
            Recomendado
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <h2 
                  className="text-2xl sm:text-3xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Alura para Windows
                </h2>
                <span className="text-xs font-mono text-[var(--color-accent)]">
                  Versão {appVersion} Stable • 64-bit • 83.3 MB
                </span>
              </div>
            </div>

            <p className="text-white/70 text-base leading-relaxed mb-8 max-w-xl">
              A melhor experiência para jogadores e criadores. Push-to-Talk em segundo plano, 
              transmissão de tela fluida a 60 FPS com áudio do sistema e aceleração nativa de hardware.
            </p>

            {/* Checklist de vantagens */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Atalhos globais de teclado (Keybinds)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Transmissão 1080p 60 FPS sem engasgos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>DSP Ativo contra cliques e ruídos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Ícone discreto na bandeja do sistema</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <a
              href="/downloads/setup_alura.exe"
              download="setup_alura.exe"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[var(--color-accent)] text-black font-semibold text-base hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_-5px_rgba(57,255,136,0.3)]"
            >
              <Download className="w-5 h-5" />
              Baixar para Windows (64-bit)
            </a>

            <div className="text-xs text-white/40 font-mono text-center sm:text-right">
              Compatível com Windows 10 e Windows 11
            </div>
          </div>
        </div>

        {/* Card: Web App */}
        <div className="rounded-3xl border border-white/10 bg-[#111318]/80 backdrop-blur-md p-8 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
              <Globe className="w-7 h-7" />
            </div>

            <h2 
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Alura Web
            </h2>
            <span className="text-xs font-mono text-white/40 block mb-4">
              Navegadores Modernos • Zero Instalação
            </span>

            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Acesse suas comunidades instantaneamente direto de qualquer navegador compatível com WebRTC. Perfeito para computadores compartilhados ou de trabalho.
            </p>

            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Chrome, Edge, Brave, Firefox, Safari</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Canais de voz, vídeo e chat completos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Atualizado continuamente na nuvem</span>
              </div>
            </div>
          </div>

          <a
            href="https://app.alura.net.br/web"
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 active:scale-95 transition-all text-center"
          >
            Abrir Web App no Navegador
          </a>
        </div>

      </div>

      {/* Outras Plataformas (Cards Informativos) */}
      <div className="mb-20">
        <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-6 text-center">
          Outros Sistemas Operacionais
        </h3>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* macOS */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                <Apple className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">macOS</h4>
                <p className="text-xs text-white/40">Apple Silicon & Intel</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
              Em Breve
            </span>
          </div>

          {/* Linux */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Linux</h4>
                <p className="text-xs text-white/40">.AppImage / .deb</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
              Em Breve
            </span>
          </div>

          {/* Mobile */}
          <div className="rounded-2xl border border-white/10 bg-[#111318]/50 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Mobile</h4>
                <p className="text-xs text-white/40">iOS & Android</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
              Desenvolvimento
            </span>
          </div>
        </div>
      </div>

      {/* Requisitos de Sistema */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/60 p-8 sm:p-10 mb-20">
        <h3 
          className="text-xl font-bold text-white mb-6 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <Info className="w-5 h-5 text-[var(--color-accent)]" />
          Requisitos de Sistema Recomendados (Windows)
        </h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-xs text-white/40 uppercase font-mono block mb-1">Sistema Operacional</span>
            <p className="text-white font-medium">Windows 10 / 11 (64-bit)</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase font-mono block mb-1">Processador</span>
            <p className="text-white font-medium">Intel Core i3 / AMD Ryzen 3 ou superior</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase font-mono block mb-1">Memória RAM</span>
            <p className="text-white font-medium">4 GB RAM (8 GB recomendado)</p>
          </div>
          <div>
            <span className="text-xs text-white/40 uppercase font-mono block mb-1">Espaço em Disco</span>
            <p className="text-white font-medium">250 MB disponíveis</p>
          </div>
        </div>
      </div>

      {/* FAQ de Instalação */}
      <div className="max-w-3xl mx-auto">
        <h3 
          className="text-2xl font-bold text-white text-center mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Perguntas Frequentes sobre Download
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div 
                key={i}
                className="rounded-2xl border border-white/10 bg-[#111318]/70 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full py-4 px-6 text-left flex items-center justify-between text-white font-medium text-sm sm:text-base focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--color-accent)]' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-white/60 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
