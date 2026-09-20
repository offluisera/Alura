import React, { useRef, useEffect, useCallback } from 'react';
import anime from 'animejs';

interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}

/* ——— Minimal custom dropdown built on Radix primitives ——— */
/* Using vanilla state + anime.js instead of full Radix to keep bundle lean.
   Radix overlay primitives only needed if portal/focus-trap becomes essential. */

interface DropdownItem {
  title: string;
  description: string;
  href?: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  chevron: React.FC<IconProps>;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  label,
  items,
  chevron: ChevronIcon,
}) => {
  const [open, setOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const show = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 120);
  }, []);

  /* Animate panel in/out */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open) {
      panel.style.display = 'block';
      panel.style.pointerEvents = 'auto';
      anime({
        targets: panel,
        opacity: [0, 1],
        translateY: [-4, 0],
        duration: 150,
        easing: 'easeOutQuad',
      });
    } else {
      anime({
        targets: panel,
        opacity: [1, 0],
        translateY: [0, -4],
        duration: 100,
        easing: 'easeInQuad',
        complete: () => {
          if (panel) {
            panel.style.display = 'none';
            panel.style.pointerEvents = 'none';
          }
        },
      });
    }
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onFocus={show}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-white/5 hover:text-white transition-colors text-[15px] text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] cursor-pointer"
      >
        {label}
        <ChevronIcon
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={panelRef}
        role="menu"
        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[220px] rounded-2xl border border-white/10 bg-[#111318]/95 backdrop-blur-md p-2 shadow-xl z-50"
        style={{ display: 'none', opacity: 0, pointerEvents: 'none' }}
      >
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href || '#'}
            role="menuitem"
            className="flex flex-col px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="text-sm text-white">{item.title}</span>
            <span className="text-xs text-white/50">{item.description}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
