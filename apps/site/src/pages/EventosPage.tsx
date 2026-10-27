import React, { useState } from 'react';
import {
  Calendar,
  Radio,
  Clock,
  Users,
  MapPin,
  ExternalLink,
  Bell,
  Check,
  PlusCircle,
} from 'lucide-react';

interface RealEventItem {
  id: string;
  title: string;
  serverId: string;
  serverName: string;
  category: 'games' | 'tech' | 'study';
  categoryLabel: string;
  date: string;
  time: string;
  isLive?: boolean;
  isFeatured?: boolean;
  attendeesCount: number;
  stageType: 'Transmissão 60 FPS' | 'Canal de Voz' | 'Canal de Texto';
  description: string;
}

// Eventos reais vinculados aos servidores existentes na plataforma Alura
const realEventsData: RealEventItem[] = [
  {
    id: 'webrtc-stream-test',
    title: 'Sessão ao Vivo de Transmissão 60 FPS & Jogos',
    serverId: 'da53fea2-fc54-4912-bcd3-cf7aeeafb009',
    serverName: 'Teste',
    category: 'games',
    categoryLabel: 'Jogos & Transmissão',
    date: 'Hoje',
    time: '21:00 BRT',
    isLive: true,
    isFeatured: true,
    attendeesCount: 3,
    stageType: 'Transmissão 60 FPS',
    description:
      'Transmissão ao vivo de testes de tela em 1080p 60 FPS com áudio nativo de jogos e cancelamento de ruído DSP ativo no servidor Teste.',
  },
  {
    id: 'aluradev-meetup',
    title: 'Meetup de Arquitetura & Engenharia AluraDev',
    serverId: '23302d9e-03ad-4b61-a07d-10e37735b4c3',
    serverName: 'AluraDev',
    category: 'tech',
    categoryLabel: 'Tecnologia & Dev',
    date: 'Amanhã, 20 de Outubro',
    time: '19:30 BRT',
    attendeesCount: 5,
    stageType: 'Canal de Voz',
    description:
      'Roda de conversa sobre o cluster Phoenix Elixir, otimização de latência e novas funcionalidades da Alura com os criadores da plataforma.',
  },
  {
    id: 'study-pomodoro-group',
    title: 'Sessão Noturna de Estudos & Foco',
    serverId: '44999cb3-e42d-4685-9e77-04c8bacd55b4',
    serverName: 'teste 2',
    category: 'study',
    categoryLabel: 'Estudos & Foco',
    date: 'Quarta-feira, 21 de Outubro',
    time: '20:00 BRT',
    attendeesCount: 2,
    stageType: 'Canal de Voz',
    description:
      'Sala de estudo colaborativo com ciclos de pomodoro e troca de links técnicos na comunidade teste 2.',
  },
];

export const EventosPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [remindedEvents, setRemindedEvents] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'Todos os Eventos' },
    { id: 'live', label: 'Ao Vivo Agora' },
    { id: 'games', label: 'Jogos & Transmissão' },
    { id: 'tech', label: 'Tecnologia & Dev' },
    { id: 'study', label: 'Estudos & Foco' },
  ];

  const toggleReminder = (id: string) => {
    setRemindedEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredEvents = realEventsData.filter((ev) => {
    if (activeCategory === 'live') return ev.isLive;
    if (activeCategory === 'all') return true;
    return ev.category === activeCategory;
  });

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto relative z-10">
      {/* Hero Header sem o subtítulo em cápsula */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Eventos e Encontros ao Vivo
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Participe de transmissões de tela a 60 FPS, rodas de conversa técnica e salas de estudo 
          acontecendo em tempo real nos servidores da Alura.
        </p>
      </div>

      {/* Evento em Destaque — Ao Vivo */}
      {realEventsData.find((e) => e.isFeatured) && (
        <div className="mb-16 rounded-3xl border-2 border-[var(--color-accent)]/40 bg-gradient-to-r from-[#001B0B] via-[#00220E] to-[#111318] p-8 sm:p-12 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(57,255,136,0.2)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Ao Vivo Agora
                </span>
                <span className="text-xs font-mono text-[var(--color-accent)]">
                  {realEventsData[0].stageType}
                </span>
                <span className="text-xs text-white/40 font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Servidor {realEventsData[0].serverName}
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {realEventsData[0].title}
              </h2>

              <p className="text-white/70 text-base leading-relaxed mb-6">
                {realEventsData[0].description}
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5 text-white">
                  <Users className="w-4 h-4 text-[var(--color-accent)]" />
                  {realEventsData[0].attendeesCount} conectados
                </span>
                <span>•</span>
                <span>Iniciado às {realEventsData[0].time}</span>
              </div>
            </div>

            <div className="shrink-0">
              <a
                href={`https://app.alura.net.br/web/#/servers/${realEventsData[0].serverId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[var(--color-accent)] text-black font-semibold text-base hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_-5px_rgba(57,255,136,0.3)]"
              >
                <Radio className="w-5 h-5 text-black animate-pulse" />
                Assistir no Servidor
              </a>
            </div>
          </div>
        </div>
      )}

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

      {/* Grid de Eventos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {filteredEvents.map((ev) => {
          const isReminded = remindedEvents[ev.id];
          const serverUrl = `https://app.alura.net.br/web/#/servers/${ev.serverId}`;

          return (
            <div
              key={ev.id}
              className="rounded-3xl border border-white/10 bg-[#111318]/70 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[var(--color-accent)]/40 hover:-translate-y-1 transition-all duration-300 group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {ev.isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Ao Vivo
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--color-accent)]">
                        {ev.categoryLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-white/40">
                    {ev.stageType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{ev.date}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ev.time}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                  {ev.title}
                </h3>

                <div className="text-xs font-mono text-[var(--color-accent)] mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Servidor: {ev.serverName}</span>
                </div>

                <p className="text-xs text-white/60 leading-relaxed mb-6">
                  {ev.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-white/40 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {ev.attendeesCount}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReminder(ev.id)}
                    title={isReminded ? 'Lembrete ativado' : 'Definir lembrete'}
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      isReminded
                        ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-white/10'
                    }`}
                  >
                    {isReminded ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={serverUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-[var(--color-accent)] hover:text-black text-white text-xs font-semibold transition-all border border-white/10 group-hover:border-transparent"
                  >
                    Participar
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA para Promover Eventos na Plataforma */}
      <div className="rounded-3xl border border-[var(--color-accent)]/20 bg-gradient-to-r from-[#001B0B] via-[#002A12] to-[#111318] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center md:text-left">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Organize sua live ou torneio na Alura
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Crie canais de transmissão a 60 FPS e palcos de voz com microfones moderados dentro do seu servidor Alura.
          </p>
        </div>

        <a
          href="https://app.alura.net.br/web"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-[0_0_20px_-5px_rgba(57,255,136,0.3)]"
        >
          <PlusCircle className="w-4 h-4" />
          Abrir Web App
        </a>
      </div>
    </div>
  );
};
