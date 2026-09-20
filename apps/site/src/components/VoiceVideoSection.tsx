import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const VoiceVideoSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const content = section.querySelector('.vv-content');
    if (content) {
      gsap.set(content, { y: 30, opacity: 0 });
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          gsap.to(content, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          });
        },
        onLeaveBack: () => {
          gsap.set(content, { y: 30, opacity: 0 });
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[var(--color-bg-alt)] py-24 md:py-32 px-5 sm:px-8 md:px-10 relative overflow-hidden z-10"
    >
      {/* Mockup desfocado ao fundo */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[350px] opacity-40 blur-[1px] pointer-events-none select-none" style={{ filter: 'blur(1px) grayscale(30%)' }} aria-hidden="true">
        <div className="w-full h-full bg-[var(--color-bg-soft)] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4">
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <div className="w-10 h-10 rounded-full bg-white/5" />
            <div className="w-10 h-10 rounded-full bg-red-500/20" />
            <div className="w-10 h-10 rounded-full bg-white/5" />
          </div>
        </div>
        {/* Selo central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-[var(--color-bg-alt)]/90 border border-white/10 text-white/60 text-xs uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-sm">
            Em construção
          </span>
        </div>
      </div>

      <div className="vv-content relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs uppercase tracking-wider rounded-full px-3 py-1 mb-6">
          Em breve
        </span>

        <h2
          className="text-3xl md:text-5xl tracking-tight max-w-2xl mb-6 text-white font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Chamadas de voz, vídeo e tela — em desenvolvimento
        </h2>

        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Estamos construindo a infraestrutura em WebRTC pra você chamar sua
          galera com baixa latência, direto de um canal de voz ou de uma DM.
        </p>
      </div>
    </section>
  );
};
