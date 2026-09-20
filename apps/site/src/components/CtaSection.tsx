import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CtaSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const title = section.querySelector('.cta-title');
    const button = section.querySelector('.cta-button');
    const glow = section.querySelector('.cta-glow');

    const elements = [title, button].filter(Boolean);

    gsap.set(elements, { scale: 0.92, opacity: 0 });
    if (glow) gsap.set(glow, { scale: 0.6, opacity: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        if (glow) {
          gsap.to(glow, {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
          });
        }
        gsap.to(elements, {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          stagger: 0.15,
        });
      },
      onLeaveBack: () => {
        gsap.set(elements, { scale: 0.92, opacity: 0 });
        if (glow) gsap.set(glow, { scale: 0.6, opacity: 0 });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[var(--color-bg)] py-32 md:py-48 px-5 sm:px-8 md:px-10 relative overflow-hidden flex flex-col items-center text-center z-10"
    >
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="cta-glow w-[500px] h-[500px] rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
      </div>

      <h2
        className="cta-title text-4xl md:text-7xl tracking-tight text-white relative z-10 max-w-3xl mb-8 font-bold"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Sua comunidade merece um lugar assim.
      </h2>

      <a
        href="#"
        className="cta-button bg-[var(--color-accent)] text-black text-lg font-medium px-8 py-4 rounded-full hover:brightness-110 active:scale-95 transition-all relative z-10 inline-flex items-center gap-2"
      >
        Criar minha conta grátis
      </a>
    </section>
  );
};
