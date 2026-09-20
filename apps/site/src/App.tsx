import React from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MarqueeSection } from './components/MarqueeSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { VoiceVideoSection } from './components/VoiceVideoSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[#F5F5F5] selection:bg-[var(--color-accent)] selection:text-black">
      {/* Vídeo de fundo com controle de mouse */}
      <BackgroundVideo />

      {/* Barra de navegação fixa */}
      <Navbar />

      <main>
        {/* Hero com typewriter e pills */}
        <HeroSection />

        {/* Marquee infinito */}
        <MarqueeSection />

        {/* Segunda dobra — cards de features */}
        <FeaturesSection />

        {/* Showcase do produto — mockups */}
        <ShowcaseSection />

        {/* Voz e vídeo — em breve */}
        <VoiceVideoSection />

        {/* CTA final */}
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
