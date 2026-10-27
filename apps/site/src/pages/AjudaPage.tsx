import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  HelpCircle,
  ChevronDown,
  Mail,
  User,
  Mic,
  Shield,
  Monitor,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
  category: string;
}

const faqsData: Faq[] = [
  {
    category: 'conta',
    question: 'Como crio minha conta na Alura?',
    answer:
      'Você pode criar sua conta em app.alura.net.br/web informando seu e-mail e senha. O sistema enviará um e-mail de confirmação seguro. Após confirmar, seu perfil estará ativo para acessar tanto no navegador quanto no aplicativo desktop Windows.',
  },
  {
    category: 'audio',
    question: 'Como funciona o cancelamento de ruído DSP (CleanVoice)?',
    answer:
      'O cancelamento de ruído DSP da Alura processa o sinal de áudio em tempo real antes de enviar para os outros participantes. Ele filtra cliques mecânicos de teclado, ventiladores e ruídos de fundo sem abafar ou robotizar sua voz. Você pode ativá-lo nas Configurações de Usuário > Voz e Vídeo.',
  },
  {
    category: 'audio',
    question: 'Como transmitir minha tela a 60 FPS com áudio do sistema?',
    answer:
      'Ao entrar em uma sala de voz, clique no botão de Compartilhar Tela. Selecione a janela do jogo ou sua tela inteira, marque a opção "Compartilhar áudio do sistema" e ajuste a taxa de quadros para 60 FPS. A codificação utiliza aceleração nativa por GPU para evitar perda de rendimento nos jogos.',
  },
  {
    category: 'desktop',
    question: 'O Windows SmartScreen alertou sobre o instalador .exe. É seguro?',
    answer:
      'Sim, 100% seguro. Como o instalador da Alura é recente, o SmartScreen pode exibir um aviso preventivo de reputação. Para instalar, basta clicar em "Mais informações" e depois em "Executar assim mesmo". O instalador não possui nenhum tipo de telemetria invasiva ou malware.',
  },
  {
    category: 'servidores',
    question: 'O que são Cargos Hoisted e como organizá-los?',
    answer:
      'Cargos Hoisted são cargos que separam visualmente os membros na lista lateral do servidor por hierarquia (ex: Administrador, Moderador, Membro). Para ativá-los, acesse Configurações do Servidor > Cargos e marque "Exibir membros deste cargo separadamente dos membros conectados".',
  },
  {
    category: 'servidores',
    question: 'Como utilizar o Soundboard com busca MyInstants?',
    answer:
      'Em qualquer canal de voz, clique no ícone de Soundboard. Digite o nome do som desejado no campo de busca para puxar áudios do acervo do MyInstants e clique para reproduzir instantaneamente para todos na chamada. Administradores podem limitar o cooldown anti-spam.',
  },
  {
    category: 'seguranca',
    question: 'Meus dados e conversas são vendidos para anunciantes?',
    answer:
      'Não. A Alura não vende dados para empresas de publicidade, não realiza mineração de conversas privadas e adota Row Level Security (RLS) estrito em nível de banco de dados PostgreSQL. Suas mensagens diretas são privadas e protegidas.',
  },
  {
    category: 'conta',
    question: 'Como redefinir minha senha caso tenha esquecido?',
    answer:
      'Na tela de login do Web App (app.alura.net.br), clique em "Esqueceu sua senha?". Digite o e-mail cadastrado e você receberá um link seguro de recuperação para definir uma nova senha.',
  },
];

const categories = [
  { id: 'all', label: 'Todas as Dúvidas', icon: HelpCircle },
  { id: 'conta', label: 'Conta & Acesso', icon: User },
  { id: 'audio', label: 'Voz & Transmissão', icon: Mic },
  { id: 'servidores', label: 'Servidores & Cargos', icon: MessageSquare },
  { id: 'desktop', label: 'App Desktop', icon: Monitor },
  { id: 'seguranca', label: 'Segurança & Dados', icon: Shield },
];

export const AjudaPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const filteredFaqs = useMemo(() => {
    return faqsData.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto relative z-10">
      {/* Hero Header limpo sem cápsula */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Central de Ajuda Alura
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Respostas claras e suporte técnico para sua conta, qualidade de voz e vídeo, 
          administração de servidores e instalação do cliente desktop.
        </p>
      </div>

      {/* Barra de Busca de Dúvidas */}
      <div className="max-w-2xl mx-auto mb-10 relative">
        <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Como podemos te ajudar? (ex: 60 FPS, microfone, cargos, senha)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#111318]/90 border border-white/10 rounded-full pl-12 pr-6 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-accent)] shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] transition-colors backdrop-blur-md"
        />
      </div>

      {/* Categorias Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-16">
        {categories.map((cat) => {
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

      {/* Lista Accordion de FAQs */}
      <div className="space-y-4 mb-20">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#111318]/70 backdrop-blur-md overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between text-white font-medium text-base hover:text-[var(--color-accent)] transition-colors focus:outline-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--color-accent)]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-white/70 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 rounded-3xl border border-white/10 bg-[#111318]/50 p-6">
            <p className="text-white/60 text-sm mb-3">
              Nenhuma resposta encontrada para sua pesquisa.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-mono text-[var(--color-accent)] hover:underline"
            >
              Limpar busca e ver todas as perguntas
            </button>
          </div>
        )}
      </div>

      {/* Card de Fale Conosco / Suporte Direto */}
      <div className="rounded-3xl border border-[var(--color-accent)]/20 bg-gradient-to-r from-[#001B0B] via-[#00220E] to-[#111318] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center md:text-left">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Ainda precisa de ajuda?
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Nossa equipe técnica responde rapidamente por e-mail ou diretamente na sala oficial de suporte da comunidade.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="mailto:suporte@alura.net.br"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-[0_0_20px_-5px_rgba(57,255,136,0.3)]"
          >
            <Mail className="w-4 h-4" />
            suporte@alura.net.br
          </a>
          <Link
            to="/contato"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 active:scale-95 transition-all"
          >
            Ver todos os canais
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
