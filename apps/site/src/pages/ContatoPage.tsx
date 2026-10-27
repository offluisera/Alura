import React, { useState } from 'react';
import {
  Mail,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Headphones,
  Briefcase,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ContactChannel {
  id: string;
  title: string;
  email: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const channelsData: ContactChannel[] = [
  {
    id: 'suporte',
    title: 'Suporte Técnico',
    email: 'suporte@alura.net.br',
    description:
      'Ajuda com voz e vídeo, transmissão a 60 FPS, cancelamento de ruído DSP, aplicativo desktop e recuperação de acesso.',
    icon: Headphones,
    badge: 'Atendimento Rápido',
  },
  {
    id: 'contato',
    title: 'Geral & Parcerias',
    email: 'contato@alura.net.br',
    description:
      'Parcerias com criadores de conteúdo, estúdios de games, comunidades competitivas, imprensa e propostas comerciais.',
    icon: Briefcase,
    badge: 'Comunidades & Negócios',
  },
  {
    id: 'seguranca',
    title: 'Segurança & Privacidade',
    email: 'seguranca@alura.net.br',
    description:
      'Relatórios responsáveis de vulnerabilidades técnicas, denúncias de abuso, conformidade de dados e solicitações de privacidade (LGPD).',
    icon: ShieldCheck,
    badge: 'Canal Criptografado',
  },
];

export const ContatoPage: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'suporte@alura.net.br',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto relative z-10">
      {/* Hero Header limpo sem cápsula */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Fale com a Equipe Alura
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Seja para tirar dúvidas técnicas, propor parcerias ou reportar questões de segurança, 
          estamos disponíveis através dos nossos canais diretos.
        </p>
      </div>

      {/* Grid de 3 Cards de E-mail */}
      <div className="grid md:grid-cols-3 gap-6 mb-20">
        {channelsData.map((channel) => {
          const Icon = channel.icon;
          const isCopied = copiedEmail === channel.email;

          return (
            <div
              key={channel.id}
              className="rounded-3xl border border-white/10 bg-[#111318]/80 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between hover:border-[var(--color-accent)]/40 hover:-translate-y-1 transition-all duration-300 group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/50">
                    {channel.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                  {channel.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-xs font-mono text-[var(--color-accent)] truncate mr-2">
                    {channel.email}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy(channel.email)}
                    title="Copiar e-mail"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-[var(--color-accent)]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <a
                  href={`mailto:${channel.email}`}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-[var(--color-accent)] hover:text-black text-white text-xs font-semibold transition-all border border-white/10 group-hover:border-transparent text-center"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Enviar E-mail Direto
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção de Formulário de Mensagem Rápida */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-8 sm:p-12 mb-20 max-w-3xl mx-auto shadow-2xl">
        <div className="text-center mb-8">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Envie uma Mensagem
          </h2>
          <p className="text-xs sm:text-sm text-white/50">
            Preencha os campos abaixo e nosso time direcionará sua solicitação para a área competente.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 text-[var(--color-accent)] flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mensagem Preparada!</h3>
            <p className="text-sm text-white/60 max-w-md mx-auto mb-6">
              Abrindo seu cliente de e-mail padrão para envio seguro diretamente para {formData.subject}.
            </p>
            <a
              href={`mailto:${formData.subject}?subject=${encodeURIComponent(
                `Contato via Site: ${formData.name}`
              )}&body=${encodeURIComponent(
                `Nome: ${formData.name}\nE-mail: ${formData.email}\n\nMensagem:\n${formData.message}`
              )}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-black font-semibold text-xs uppercase tracking-wider"
            >
              Abrir no seu E-mail
              <Send className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo ou apelido"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">
                  Seu E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">
                Destinatário / Assunto
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              >
                <option value="suporte@alura.net.br">Suporte Técnico — suporte@alura.net.br</option>
                <option value="contato@alura.net.br">Geral & Parcerias — contato@alura.net.br</option>
                <option value="seguranca@alura.net.br">Segurança & Privacidade — seguranca@alura.net.br</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">
                Sua Mensagem
              </label>
              <textarea
                rows={4}
                required
                placeholder="Descreva detalhadamente sua dúvida, proposta ou relato..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(57,255,136,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Enviar Mensagem
            </button>
          </form>
        )}
      </div>

      {/* Suporte em Tempo Real no Web App */}
      <div className="rounded-3xl border border-[var(--color-accent)]/20 bg-gradient-to-r from-[#001B0B] via-[#002A12] to-[#111318] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Prefere conversar em tempo real?
          </h2>
          <p className="text-sm text-white/60">
            Nossos moderadores e engenheiros estão ativos diariamente na sala oficial da Alura Central.
          </p>
        </div>

        <a
          href="https://app.alura.net.br/web"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-[0_0_20px_-5px_rgba(57,255,136,0.3)]"
        >
          <MessageSquare className="w-4 h-4" />
          Entrar na Alura Central
        </a>
      </div>
    </div>
  );
};
