import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavDropdown } from './ui/dropdown-menu';
import { IconChevronDown, IconAlura, IconInstagram } from './icons';

const navMenus = [
  {
    label: 'Produto',
    items: [
      { title: 'Recursos', description: 'Tudo que a Alura oferece hoje', href: '/recursos' },
      { title: 'Baixar', description: 'Web e app desktop nativo', href: '/baixar' },
      { title: 'Changelog', description: 'Últimas atualizações', href: '/changelog' },
    ],
  },
  {
    label: 'Comunidade',
    items: [
      { title: 'Servidores em destaque', description: 'Comunidades ativas agora', href: '/servidores' },
      { title: 'Guias', description: 'Como montar seu servidor', href: '/guias' },
      { title: 'Eventos', description: 'Próximos encontros e lives', href: '/eventos' },
    ],
  },
  {
    label: 'Desenvolvedores',
    items: [
      { title: 'API', description: 'Integre com a plataforma', href: '#' },
      { title: 'Documentação', description: 'Referência técnica completa', href: '#' },
      { title: 'Bots', description: 'Crie automações para seu servidor', href: '#' },
    ],
  },
  {
    label: 'Suporte',
    items: [
      { title: 'Central de Ajuda', description: 'Perguntas frequentes', href: '/ajuda' },
      { title: 'Status', description: 'Saúde dos serviços em tempo real', href: '/status' },
      { title: 'Contato', description: 'Fale com a equipe', href: '/contato' },
    ],
  },
];

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Produto: true,
    Comunidade: false,
    Desenvolvedores: false,
    Suporte: false,
  });

  // Trava a rolagem do body quando o menu mobile está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {/* Wrapper externo do Cabeçalho */}
      <header className="fixed top-0 inset-x-0 z-40 px-4 sm:px-6 pt-4 pointer-events-none">
        {/* Container flutuante */}
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-5 sm:px-6 py-3 shadow-[0_0_30px_-10px_rgba(57,255,136,0.15)] pointer-events-auto">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg group"
            aria-label="Alura Início"
          >
            <IconAlura
              size={34}
              className="group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            />
          </Link>

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
              href="https://app.alura.net.br/web"
              target="_blank"
              rel="noreferrer"
              className="text-[15px] text-white/80 hover:text-white transition-colors hidden sm:inline focus:outline-none focus-visible:text-white"
            >
              Entrar
            </a>
            <Link
              to="/baixar"
              className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-black text-[15px] font-medium px-4 sm:px-5 py-2 rounded-full hover:brightness-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Baixar
            </Link>

            {/* Hambúrguer mobile */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((p) => !p)}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              className="md:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded-lg cursor-pointer select-none"
            >
              <span
                className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                }`}
              />
              <span
                className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay mobile responsivo */}
      <div
        className={`fixed inset-0 bg-[#07090C]/98 backdrop-blur-2xl md:hidden transition-all duration-300 z-30 flex flex-col ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 pt-24 pb-8 flex flex-col justify-between max-w-lg mx-auto w-full gap-6">
          {/* Seções em Acordeão */}
          <div className="space-y-3">
            <div className="px-1 pb-1">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                Navegação
              </span>
            </div>

            {navMenus.map((menu) => {
              const isOpen = openSections[menu.label] ?? false;
              return (
                <div
                  key={menu.label}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-white/20 bg-white/[0.04]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(menu.label)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-white hover:text-[var(--color-accent)] transition-colors cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[16px] tracking-wide flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          isOpen
                            ? 'bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]'
                            : 'bg-white/30'
                        }`}
                      />
                      {menu.label}
                    </span>
                    <IconChevronDown
                      size={18}
                      className={`transition-transform duration-200 text-white/50 ${
                        isOpen ? 'rotate-180 text-[var(--color-accent)]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-white/5 animate-in fade-in duration-200">
                      {menu.items.map((item) => {
                        const isInternal = item.href.startsWith('/');
                        const content = (
                          <>
                            <span className="text-[15px] font-medium text-white group-hover:text-[var(--color-accent)] transition-colors block">
                              {item.title}
                            </span>
                            <span className="text-xs text-white/50 block mt-0.5 leading-snug">
                              {item.description}
                            </span>
                          </>
                        );

                        return isInternal ? (
                          <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all group"
                          >
                            {content}
                          </Link>
                        ) : (
                          <a
                            key={item.title}
                            href={item.href}
                            target={item.href.startsWith('http') ? '_blank' : undefined}
                            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                            onClick={() => setIsMenuOpen(false)}
                            className="block p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all group"
                          >
                            {content}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botões de Ação no Rodapé do Menu */}
          <div className="pt-4 border-t border-white/10 space-y-3 shrink-0">
            <a
              href="https://app.alura.net.br/web"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 text-white text-[15px] font-semibold px-6 py-3.5 rounded-full hover:bg-white/10 active:scale-95 transition-all shadow-sm"
            >
              Entrar no Web App
            </a>
            <Link
              to="/baixar"
              onClick={() => setIsMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-black text-[15px] font-bold px-6 py-3.5 rounded-full hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,136,0.25)]"
            >
              Baixar para Windows
            </Link>

            <div className="pt-2 flex items-center justify-between text-xs text-white/40 px-2">
              <span>Alura © 2026</span>
              <a
                href="https://www.instagram.com/app.alura/"
                target="_blank"
                rel="noreferrer"
                className="text-white/60 hover:text-[var(--color-accent)] transition-colors flex items-center gap-1.5"
              >
                <IconInstagram size={14} />
                <span>@app.alura</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
