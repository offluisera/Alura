import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { MarqueeSection } from '../components/MarqueeSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { ShowcaseSection } from '../components/ShowcaseSection';
import { VoiceVideoSection } from '../components/VoiceVideoSection';
import { CtaSection } from '../components/CtaSection';

export const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero com typewriter e pills */}
      <HeroSection />

      {/* Marquee infinito */}
      <MarqueeSection />

      {/* Segunda dobra — cards de features */}
      <FeaturesSection />

      {/* Showcase do produto — mockups */}
      <ShowcaseSection />

      {/* Voz e vídeo */}
      <VoiceVideoSection />

      {/* CTA final */}
      <CtaSection />
    </>
  );
};
