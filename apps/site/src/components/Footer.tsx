import React from 'react';
import { IconGitHub, IconDiscord, IconTwitch, IconYouTube } from './icons';

const footerColumns = [
  {
    title: 'Produto',
    links: ['Recursos', 'Baixar', 'Changelog', 'Status'],
  },
  {
    title: 'Comunidade',
    links: ['Servidores em destaque', 'Guias', 'Eventos'],
  },
  {
    title: 'Desenvolvedores',
    links: ['API', 'Documentação', 'Bots'],
  },
  {
    title: 'Empresa',
    links: ['Sobre', 'Carreiras', 'Imprensa', 'Contato'],
  },
];

const socialIcons = [
  { icon: IconGitHub, label: 'GitHub' },
  { icon: IconDiscord, label: 'Discord' },
  { icon: IconTwitch, label: 'Twitch' },
  { icon: IconYouTube, label: 'YouTube' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-bg-alt)] relative z-10 overflow-hidden">
      {/* Wordmark gigante preenchendo a section de ponta a ponta */}
      <div className="w-full overflow-hidden flex items-center justify-center py-6 sm:py-10 md:py-14 select-none">
        <h2
          className="text-[32vw] leading-[0.74] tracking-[-0.06em] text-center select-none bg-gradient-to-b from-white via-white/95 to-[var(--color-accent)] bg-clip-text text-transparent font-bold whitespace-nowrap block w-full"
          style={{ fontFamily: 'var(--font-heading)' }}
          aria-hidden="true"
        >
          ALURA
        </h2>
      </div>

      {/* Grid de links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 px-5 sm:px-8 md:px-10 border-t border-white/10 max-w-7xl mx-auto">
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h3 className="text-white text-sm font-medium mb-4">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 text-sm hover:text-[var(--color-accent)] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Linha final */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/10 text-gray-500 text-xs px-5 sm:px-8 md:px-10 pb-10 max-w-7xl mx-auto gap-4">
        <span>© 2026 Alura. Todos os direitos reservados.</span>
        <div className="flex items-center gap-4">
          {socialIcons.map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="text-gray-500 hover:text-[var(--color-accent)] transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};
