import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FeatureCard {
  title: string;
  description: string;
  tag: string;
}

const features: FeatureCard[] = [
  {
    tag: 'Comunicação Realtime',
    title: 'Chat em Tempo Real',
    description:
      'Mensagens diretas e canais com entrega instantânea via WebSockets, feitos pra conversas que fluem sem travar e sem recarregar a página.',
  },
  {
    tag: 'Servidores e Canais',
    title: 'Servidores & Comunidades',
    description:
      'Espaços dedicados organizados por assunto, com canais de texto pensados para comunidades inteiras se encontrarem, dividirem e crescerem juntas.',

  },
  {
    tag: 'Multiplataforma',
    title: 'Web & Desktop',
    description:
      'Rode direto no navegador ou instale o app nativo no computador. Perfis ricos, avatares e status te acompanham em qualquer lugar que você entrar.',
  },
];

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.feature-card');

    gsap.set(cards, { y: 40, opacity: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
        });
      },
      onLeaveBack: () => {
        gsap.set(cards, { y: 40, opacity: 0 });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="bg-[var(--color-bg-alt)] text-white py-20 md:py-32 px-5 sm:px-8 md:px-10 relative z-10 w-full min-h-screen flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto w-full">
        <h2
          className="text-4xl md:text-6xl tracking-tight text-white mb-12 md:mb-16 font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Uma Plataforma Completa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="feature-card p-8 md:p-10 border border-white/10 rounded-3xl flex flex-col justify-start hover:border-[var(--color-accent)] transition-colors duration-300 relative overflow-hidden"
            >
              {/* Barra superior de destaque — linear e sem ângulos */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-2)] to-transparent opacity-80 pointer-events-none"
                aria-hidden="true"
              />
              <span className="text-[12px] uppercase tracking-wider text-gray-400 mb-3 font-medium">
                {feature.tag}
              </span>
              <h3 className="text-2xl font-medium mb-4 text-white">
                {feature.title}
              </h3>
              <p className="text-[17px] md:text-[19px] text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
