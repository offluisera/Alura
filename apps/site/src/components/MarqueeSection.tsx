import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const words = ['conversar', 'jogar', 'criar', 'conectar', 'construir'];

const WordBlock: React.FC<{ word: string; accent: boolean }> = ({
  word,
  accent,
}) => (
  <>
    <span
      className={`marquee-word inline-block ${
        accent
          ? 'text-[var(--color-accent)]'
          : 'text-white/10'
      }`}
    >
      {word}
    </span>
    <span className="text-white/20 mx-4 select-none" aria-hidden="true">
      ✳︎
    </span>
  </>
);

export const MarqueeSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    /* Infinite loop with GSAP */
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 28,
      ease: 'none',
      repeat: -1,
    });

    /* Pause on hover */
    const handleEnter = () => tween.pause();
    const handleLeave = () => tween.resume();
    section.addEventListener('mouseenter', handleEnter);
    section.addEventListener('mouseleave', handleLeave);

    /* Kinetic entry: scaleY distortion + fade when entering viewport */
    const wordElements = section.querySelectorAll('.marquee-word');
    gsap.set(wordElements, { scaleY: 1.4, opacity: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      toggleActions: 'play none none reverse',
      onEnter: () => {
        gsap.to(wordElements, {
          scaleY: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.05,
        });
      },
      onLeaveBack: () => {
        gsap.set(wordElements, { scaleY: 1.4, opacity: 0 });
      },
    });

    return () => {
      tween.kill();
      section.removeEventListener('mouseenter', handleEnter);
      section.removeEventListener('mouseleave', handleLeave);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /* Render content 2x for seamless loop */
  const renderWords = () =>
    words.map((word, i) => (
      <WordBlock key={`${word}-${i}`} word={word} accent={i % 2 === 1} />
    ));

  return (
    <section
      ref={sectionRef}
      className="bg-[var(--color-bg)] border-y border-white/10 py-6 overflow-hidden relative z-10"
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        <div className="flex items-center text-4xl md:text-6xl font-medium">
          {renderWords()}
        </div>
        <div className="flex items-center text-4xl md:text-6xl font-medium">
          {renderWords()}
        </div>
      </div>
    </section>
  );
};
