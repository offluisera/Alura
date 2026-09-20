import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { useTypewriter } from '../hooks/useTypewriter';

export const HeroSection: React.FC = () => {
  const introText =
    'Que bom que você chegou. Servidores, canais e mensagens em tempo real, com uma interface que você vai querer mostrar pra todo mundo. E então, qual comunidade vamos construir?';

  const { displayed, done } = useTypewriter(introText, {
    speed: 38,
    startDelay: 600,
  });

  const [copied, setCopied] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  /* Pills staggered entrance with anime.js */
  useEffect(() => {
    if (animatedRef.current) return;
    const timer = window.setTimeout(() => {
      if (!pillsRef.current) return;
      const pills = pillsRef.current.querySelectorAll('.pill-item');
      if (pills.length === 0) return;
      animatedRef.current = true;
      anime({
        targets: pills,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        easing: 'easeOutQuad',
        delay: anime.stagger(40),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('contato@alura.net.br');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const pillTags = [
    'Chat em Tempo Real',
    'Servidores e Canais',
    'Perfis Personalizados',
    'Web & Desktop',
  ];

  return (
    <section className="relative z-10 w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
      <div className="max-w-xl relative z-10">
        {/* 1. Rótulo de introdução desfocado */}
        <div
          className="pointer-events-none select-none mb-5 sm:mb-6 text-white"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            filter: 'blur(4px)',
          }}
          aria-hidden="true"
        >
          Olá, bem-vindo à Alura,
          <br />
          Onde comunidades ganham vida
        </div>

        {/* 2. Texto com efeito de máquina de escrever */}
        <p
          className="text-white mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          <span>{displayed}</span>
          {!done && (
            <span
              className="inline-block w-[2px] h-[1.1em] align-middle ml-[2px] animate-cursor-blink"
              style={{ backgroundColor: 'var(--color-accent)' }}
              aria-hidden="true"
            />
          )}
        </p>

        {/* 3. Pills de ação — anime.js stagger */}
        <div ref={pillsRef} className="flex flex-wrap gap-y-1">
          {pillTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="pill-item inline-flex items-center justify-center bg-white/5 text-white border border-white/15 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap backdrop-blur-sm transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-black hover:border-[var(--color-accent)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{ opacity: 0 }}
            >
              {tag}
            </button>
          ))}

          {/* Pill outline — copiar e-mail */}
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Clique para copiar o e-mail"
            className="pill-item inline-flex items-center justify-center bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)] rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap backdrop-blur-sm gap-2 sm:gap-3 transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-black cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            style={{ opacity: 0 }}
          >
            <span>
              {copied ? (
                'Copiado!'
              ) : (
                <>
                  Fale com a gente:{' '}
                  <span className="underline underline-offset-1">
                    contato@alura.app
                  </span>
                </>
              )}
            </span>
            <svg
              className="w-3 h-3 flex-shrink-0"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="3.5"
                y="1"
                width="7"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <rect
                x="1.5"
                y="3"
                width="7"
                height="8"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
