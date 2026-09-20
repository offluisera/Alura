import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IconHeart, IconComment, IconShare } from './icons';

gsap.registerPlugin(ScrollTrigger);

/* ——— Mock: Feed Social ——— */
const MockFeedPost: React.FC = () => (
  <div className="bg-[var(--color-bg-alt)] border border-white/10 rounded-2xl p-6 shadow-lg relative transform -rotate-1">
    <div className="flex items-center gap-3 mb-4">
      {/* Avatar with green ring */}
      <div className="w-10 h-10 rounded-full bg-white/10 ring-2 ring-[var(--color-accent)] flex items-center justify-center text-sm text-white/60 font-medium">
        LF
      </div>
      <div>
        <span className="text-white text-sm font-medium block">Lucas Faria</span>
        <span className="text-white/40 text-xs">@lucasfaria</span>
      </div>
    </div>
    <p className="text-white/70 text-sm mb-4 leading-relaxed">
      Acabei de configurar o servidor da comunidade de game dev. A interface da Alura é absurda 🎮
    </p>
    <div className="flex items-center gap-5 text-white/30">
      <button type="button" className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors text-xs">
        <IconHeart size={16} /> <span>24</span>
      </button>
      <button type="button" className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors text-xs">
        <IconComment size={16} /> <span>8</span>
      </button>
      <button type="button" className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors text-xs">
        <IconShare size={16} /> <span>3</span>
      </button>
    </div>
  </div>
);

/* ——— Mock: Friends List ——— */
const MockFriendsList: React.FC = () => {
  const friends = [
    { name: 'Ana Beatriz', status: 'Online', role: 'Admin' },
    { name: 'Pedro Henrique', status: 'Offline', role: 'Membro' },
    { name: 'Marina Costa', status: 'Online', role: 'Moderador' },
  ];

  return (
    <div className="bg-[var(--color-bg-alt)] border border-white/10 rounded-2xl p-6 shadow-lg relative transform rotate-1">
      <div className="space-y-3">
        {friends.map((f) => (
          <div
            key={f.name}
            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50 font-medium">
                {f.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <span className="text-white text-sm">{f.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">{f.role}</span>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  f.status === 'Online'
                    ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {f.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ——— Mock: Profile Card ——— */
const MockProfileCard: React.FC = () => (
  <div className="bg-[var(--color-bg-alt)] border border-white/10 rounded-2xl overflow-hidden shadow-xl relative transform -rotate-1">
    {/* Banner */}
    <div className="h-24 bg-gradient-to-r from-[var(--color-accent)]/30 to-[var(--color-accent-2)]/20 relative">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
    </div>

    <div className="p-6 pt-0 relative">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] border-4 border-[var(--color-bg-alt)] -mt-8 flex items-center justify-center text-lg text-white/70 font-semibold relative shadow-md">
        MR
        {/* Badge */}
        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-bg-alt)] flex items-center justify-center shadow-sm">
          <span className="text-[8px] text-black font-bold">✓</span>
        </span>
      </div>

      <div className="mt-3 mb-4">
        <h4 className="text-white text-base font-semibold leading-tight">Mariana Reis</h4>
        <p className="text-white/40 text-xs mt-0.5">Designer de Interfaces</p>
      </div>

      {/* Grid com Stats, Jogos Favoritos e Hobbies */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 items-stretch">
        {/* Quadro 1: Stats */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 grid grid-cols-3 divide-x divide-white/5 text-center">
          {[
            { label: 'Amigos', value: '142' },
            { label: 'Servidores', value: '8' },
            { label: 'Mensagens', value: '3.2k' },
          ].map((stat) => (
            <div key={stat.label} className="px-1 flex flex-col justify-center">
              <span className="text-white text-sm font-semibold block leading-tight">{stat.value}</span>
              <span className="text-white/45 text-[10px] font-medium mt-1 block tracking-normal">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Quadro 2: Jogos favoritos */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider block mb-2">
            Jogos favoritos
          </span>
          <div className="flex items-center gap-2">
            <div className="group relative overflow-hidden rounded-md border border-white/10 shadow-sm transition-all hover:scale-105 hover:border-[var(--color-accent)]" title="Minecraft">
              <img
                src="/games/minecraft.jpg"
                alt="Minecraft"
                className="w-9 h-13 sm:w-10 sm:h-14 object-cover"
                loading="lazy"
              />
            </div>
            <div className="group relative overflow-hidden rounded-md border border-white/10 shadow-sm transition-all hover:scale-105 hover:border-[var(--color-accent)]" title="GTA">
              <img
                src="/games/gta.png"
                alt="GTA"
                className="w-9 h-13 sm:w-10 sm:h-14 object-cover"
                loading="lazy"
              />
            </div>
            <div className="group relative overflow-hidden rounded-md border border-white/10 shadow-sm transition-all hover:scale-105 hover:border-[var(--color-accent)]" title="Counter-Strike 2">
              <img
                src="/games/cs.png"
                alt="Counter-Strike 2"
                className="w-9 h-13 sm:w-10 sm:h-14 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Quadro 3: Hobbies */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider block mb-2">
            Hobbies
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-[11px] font-medium leading-none hover:border-[var(--color-accent)]/40 transition-colors">
              Jogos
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-[11px] font-medium leading-none hover:border-[var(--color-accent)]/40 transition-colors">
              Desenvolvimento
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80 text-[11px] font-medium leading-none hover:border-[var(--color-accent)]/40 transition-colors">
              Academia
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ——— Showcase blocks data ——— */
const blocks = [
  {
    title: 'Feed Social',
    text: 'Publique, curta e comente. Seu feed, sua comunidade reagindo em tempo real.',
    mock: <MockFeedPost />,
    reverse: false,
  },
  {
    title: 'Amigos & Status',
    text: 'Veja quem tá online, gerencie solicitações e organize sua lista de amigos sem fricção.',
    mock: <MockFriendsList />,
    reverse: true,
  },
  {
    title: 'Perfil Rico',
    text: 'Banner customizado, estatísticas, redes sociais e jogos favoritos — seu cantinho na Alura.',
    mock: <MockProfileCard />,
    reverse: false,
  },
];

export const ShowcaseSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = section.querySelectorAll('.showcase-block');

    items.forEach((item, i) => {
      const textEl = item.querySelector('.showcase-text');
      const mockEl = item.querySelector('.showcase-mock');

      /* Different easing per block for variety */
      const easings = ['power2.out', 'back.out(1.2)', 'power3.out'];

      if (textEl) {
        gsap.set(textEl, { x: i % 2 === 0 ? -30 : 30, opacity: 0 });
        ScrollTrigger.create({
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          onEnter: () => {
            gsap.to(textEl, {
              x: 0,
              opacity: 1,
              duration: 0.8,
              ease: easings[i],
            });
          },
          onLeaveBack: () => {
            gsap.set(textEl, { x: i % 2 === 0 ? -30 : 30, opacity: 0 });
          },
        });
      }

      if (mockEl) {
        gsap.set(mockEl, { y: 30, opacity: 0 });
        ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
          onEnter: () => {
            gsap.to(mockEl, {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: easings[i],
              delay: 0.15,
            });
          },
          onLeaveBack: () => {
            gsap.set(mockEl, { y: 30, opacity: 0 });
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[var(--color-bg)] text-white py-24 md:py-36 px-5 sm:px-8 md:px-10 relative z-10 w-full"
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-4xl md:text-6xl tracking-tight mb-6 font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Feito para quem vive de comunidade
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-16">
          Um feed pra compartilhar, amigos online em tempo real, e um perfil que
          mostra quem você é.
        </p>

        <div className="flex flex-col gap-24 md:gap-32">
          {blocks.map((block, i) => (
            <div
              key={block.title}
              className={`showcase-block md:grid md:grid-cols-2 md:gap-12 items-center ${
                block.reverse ? 'md:direction-rtl' : ''
              }`}
              style={block.reverse ? { direction: 'rtl' } : undefined}
            >
              <div
                className="showcase-text mb-8 md:mb-0"
                style={block.reverse ? { direction: 'ltr' } : undefined}
              >
                <h3
                  className="text-2xl md:text-3xl font-medium mb-4 text-white"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {block.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  {block.text}
                </p>
              </div>
              <div
                className="showcase-mock"
                style={block.reverse ? { direction: 'ltr' } : undefined}
              >
                {block.mock}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
