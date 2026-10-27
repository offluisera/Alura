import React from 'react';
import { Link } from 'react-router-dom';
import { IconInstagram } from './icons';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Recursos', href: '/recursos' },
      { label: 'Baixar', href: '/baixar' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Comunidade',
    links: [
      { label: 'Servidores em destaque', href: '/servidores' },
      { label: 'Guias', href: '/guias' },
      { label: 'Eventos', href: '/eventos' },
      { label: 'Web App', href: 'https://app.alura.net.br/web' },
    ],
  },
  {
    title: 'Desenvolvedores',
    links: [
      { label: 'API', href: '#' },
      { label: 'Documentação', href: '#' },
      { label: 'Bots', href: '#' },
    ],
  },
  {
    title: 'Suporte & Contato',
    links: [
      { label: 'Central de Ajuda', href: '/ajuda' },
      { label: 'Status dos Serviços', href: '/status' },
      { label: 'Fale Conosco', href: '/contato' },
    ],
  },
];

const socialIcons = [
  { icon: IconInstagram, label: 'Instagram', href: 'https://www.instagram.com/app.alura/' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-bg-alt)] relative z-10 overflow-hidden">
      {/* Wordmark gigante preenchendo a section de ponta a ponta */}
      <div className="w-full overflow-hidden flex items-center justify-center py-6 sm:py-10 md:py-14 select-none">
        <Link
          to="/"
          className="text-[32vw] leading-[0.74] tracking-[-0.06em] text-center select-none bg-gradient-to-b from-white via-white/95 to-[var(--color-accent)] bg-clip-text text-transparent font-bold whitespace-nowrap block w-full hover:opacity-95 transition-opacity"
          style={{ fontFamily: 'var(--font-heading)' }}
          aria-label="Alura Início"
        >
          ALURA
        </Link>
      </div>

      {/* Grid de links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 px-5 sm:px-8 md:px-10 border-t border-white/10 max-w-7xl mx-auto">
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h3 className="text-white text-sm font-medium mb-4">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((link) => {
                const isInternal = link.href.startsWith('/');
                return (
                  <li key={link.label}>
                    {isInternal ? (
                      <Link
                        to={link.href}
                        className="text-gray-400 text-sm hover:text-[var(--color-accent)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                        className="text-gray-400 text-sm hover:text-[var(--color-accent)] transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Linha final */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/10 text-gray-500 text-xs px-5 sm:px-8 md:px-10 pb-10 max-w-7xl mx-auto gap-4">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-center sm:text-left">
          <span>© 2026 Alura. Todos os direitos reservados.</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span>
            Desenvolvido por:{' '}
            <a
              href="https://alura.net.br"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-[var(--color-accent)] transition-colors font-medium underline underline-offset-4 decoration-white/20 hover:decoration-[var(--color-accent)]"
            >
              alura.net.br
            </a>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {socialIcons.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noreferrer"
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
