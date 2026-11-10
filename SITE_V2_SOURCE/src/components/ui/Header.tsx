import { useEffect, useState } from 'react';
import { useActiveSection } from '../../app/useActiveSection';
import { useStore, withLang } from '../../store/navigation';
import { useT } from '../../app/i18n';
import { RingMark } from './RingMark';
import './header.css';

interface Props {
  page: 'explorar' | 'investigacion';
}

export function Header({ page }: Props) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const active = useActiveSection(page === 'explorar');

  const base = page === 'explorar' ? '' : '../';
  const links: [string, string][] = [
    ['inicio', t.nav.home],
    ['casos', t.nav.cases],
    ['como-decide', t.nav.how],
    ['cerebro', t.nav.brain],
    ['evidencia', t.nav.evidence],
  ];

  // el tema elegido se refleja en <html data-theme> y en la barra del navegador
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F3EFE6' : '#0A0A0A');
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const href = (id: string) => withLang(page === 'explorar' ? `#${id}` : `${base}#${id}`, lang);

  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header className="site-header">
        <div className="hdr-inner">
          <a className="brand" href={withLang(page === 'explorar' ? '#inicio' : base || './', lang)}>
            <RingMark size={22} />
            <span>{t.brand}</span>
          </a>
          <nav className={`hdr-nav ${open ? 'is-open' : ''}`} id="hdr-nav" aria-label={t.menu}>
            <ul>
              {links.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={href(id)}
                    aria-current={page === 'explorar' && active === id ? 'true' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href={withLang(`${base || './'}laboratorio/`, lang)} onClick={() => setOpen(false)}>
                  {t.nav.lab}
                </a>
              </li>
              <li>
                <a
                  className="nav-research"
                  href={withLang(page === 'explorar' ? './investigacion/' : './', lang)}
                  aria-current={page === 'investigacion' ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {t.nav.research}
                </a>
              </li>
            </ul>
          </nav>
          <div className="hdr-tools">
            <button
              className="btn btn-sm theme-btn"
              type="button"
              aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
              title={theme === 'dark' ? t.themeToLight : t.themeToDark}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                {theme === 'dark' ? (
                  <>
                    <circle cx="12" cy="12" r="4.2" />
                    <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
                  </>
                ) : (
                  <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z" />
                )}
              </svg>
            </button>
            <button
              className="btn btn-sm lang"
              type="button"
              lang={lang === 'es' ? 'en' : 'es'}
              aria-label={t.langSwitchAria}
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <button
              className="btn btn-sm menu-btn"
              type="button"
              aria-expanded={open}
              aria-controls="hdr-nav"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? t.close : t.menu}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
