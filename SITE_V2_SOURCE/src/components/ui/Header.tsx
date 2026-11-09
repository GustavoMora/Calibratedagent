import { useEffect, useState } from 'react';
import { useStore } from '../../store/navigation';
import { useT } from '../../app/i18n';
import { RingMark } from './RingMark';
import './header.css';

interface Props {
  page: 'explorar' | 'investigacion';
}

const SECTIONS = ['inicio', 'casos', 'como-decide', 'cerebro', 'evidencia'] as const;

export function Header({ page }: Props) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('inicio');

  const base = page === 'explorar' ? '' : '../';
  const links: [string, string][] = [
    ['inicio', t.nav.home],
    ['casos', t.nav.cases],
    ['como-decide', t.nav.how],
    ['cerebro', t.nav.brain],
    ['evidencia', t.nav.evidence],
  ];

  // sección activa (solo en Explorar)
  useEffect(() => {
    if (page !== 'explorar' || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [page]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const href = (id: string) => (page === 'explorar' ? `#${id}` : `${base}#${id}`);

  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header className="site-header">
        <div className="hdr-inner">
          <a className="brand" href={page === 'explorar' ? '#inicio' : base || './'}>
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
                <a
                  className="nav-research"
                  href={page === 'explorar' ? './investigacion/' : './'}
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
      {page === 'explorar' && active !== 'cerebro' && active !== 'casos' && (
        <a className="btn btn-primary fab" href="#casos">
          {t.tryCase}
        </a>
      )}
    </>
  );
}
