import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { RecursosPage } from './pages/RecursosPage';
import { BaixarPage } from './pages/BaixarPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { ServidoresPage } from './pages/ServidoresPage';
import { GuiasPage } from './pages/GuiasPage';
import { EventosPage } from './pages/EventosPage';
import { AjudaPage } from './pages/AjudaPage';
import { StatusPage } from './pages/StatusPage';
import { ContatoPage } from './pages/ContatoPage';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[#F5F5F5] selection:bg-[var(--color-accent)] selection:text-black flex flex-col justify-between">
      {/* Scroll restoration no topo a cada rota */}
      <ScrollToTop />

      {/* Fundo cinza azulado unificado em todas as páginas */}
      <BackgroundVideo />

      {/* Barra de navegação fixa */}
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Produto */}
          <Route path="/recursos" element={<RecursosPage />} />
          <Route path="/baixar" element={<BaixarPage />} />
          <Route path="/download" element={<BaixarPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />

          {/* Comunidade */}
          <Route path="/servidores" element={<ServidoresPage />} />
          <Route path="/comunidade/servidores" element={<ServidoresPage />} />
          <Route path="/guias" element={<GuiasPage />} />
          <Route path="/comunidade/guias" element={<GuiasPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/comunidade/eventos" element={<EventosPage />} />

          {/* Suporte */}
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="/suporte/ajuda" element={<AjudaPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/suporte/status" element={<StatusPage />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/suporte/contato" element={<ContatoPage />} />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
