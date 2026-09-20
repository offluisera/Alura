import React, { useState } from 'react';
import { NavDropdown } from './ui/dropdown-menu';
import { IconChevronDown, IconAlura } from './icons';

const navMenus = [
  {
    label: 'Produto',
    items: [
      { title: 'Recursos', description: 'Tudo que a Alura oferece hoje' },
      { title: 'Baixar', description: 'Web e app desktop nativo' },
      { title: 'Changelog', description: 'Últimas atualizações' },
    ],
  },
  {
    label: 'Comunidade',
    items: [
      { title: 'Servidores em destaque', description: 'Comunidades ativas agora' },
      { title: 'Guias', description: 'Como montar seu servidor' },
      { title: 'Eventos', description: 'Próximos encontros e lives' },
    ],
  },
  {
    label: 'Desenvolvedores',
    items: [
      { title: 'API', description: 'Integre com a plataforma' },
      { title: 'Documentação', description: 'Referência técnica completa' },
      { title: 'Bots', description: 'Crie automações para seu servidor' },
    ],
  },
  {
    label: 'Suporte',
    items: [
      { title: 'Central de Ajuda', description: 'Perguntas frequentes' },
      { title: 'Status', description: 'Saúde dos serviços em tempo real' },
      { title: 'Contato', description: 'Fale com a equipe' },
    ],
  },
];

const mobileLinks = [
  { label: 'Produto', desc: 'Recursos, Baixar, Changelog', href: '#' },
  { label: 'Comunidade', desc: 'Servidores, Guias, Eventos', href: '#' },
  { label: 'Desenvolvedores', desc: 'API, Docs, Bots', href: '#' },
  { label: 'Suporte', desc: 'Ajuda, Status, Contato', href: '#' },
];

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Wrapper externo */}
      <header className="fixed top-0 inset-x-0 z-20 px-4 sm:px-6 pt-4">
        {/* Container flutuante */}
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-5 sm:px-6 py-3 shadow-[0_0_30px_-10px_rgba(57,255,136,0.15)]">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg group"
            aria-label="Alura Início"
          >
            <IconAlura
              size={34}
              className="group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            />
          </a>

          {/* Nav desktop — dropdowns */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Navegação principal"
          >
            {navMenus.map((menu) => (
              <NavDropdown
                key={menu.label}
                label={menu.label}
                items={menu.items}
                chevron={IconChevronDown}
              />
            ))}
          </nav>

          {/* Área direita */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-[15px] text-white/80 hover:text-white transition-colors hidden sm:inline focus:outline-none focus-visible:text-white"
            >
              Entrar
            </a>
            <a
              href="#download"
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-black text-[15px] font-medium px-4 sm:px-5 py-2 rounded-full hover:brightness-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Baixar
            </a>

            {/* Hambúrguer mobile */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((p) => !p)}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              className="md:hidden flex flex-col gap-[5px] p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
            >
              <span
                className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`w-6 h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 bg-[#0B0D0F]/97 backdrop-blur-md flex flex-col justify-center px-8 gap-6 md:hidden transition-all duration-300 z-10 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <nav className="flex flex-col gap-5" aria-label="Navegação móvel">
          {mobileLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="group"
            >
              <span className="text-[30px] font-medium text-white group-hover:text-[var(--color-accent)] transition-colors block">
                {link.label}
              </span>
              <span className="text-sm text-white/50">{link.desc}</span>
            </a>
          ))}
          <a
            href="#download"
            onClick={() => setIsMenuOpen(false)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-black text-lg font-medium px-6 py-3 rounded-full hover:brightness-110 active:scale-95 transition-all mt-4"
          >
            Baixar
          </a>
        </nav>
      </div>
    </>
  );
};
