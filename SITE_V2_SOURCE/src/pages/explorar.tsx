import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';
import { Header } from '../components/ui/Header';
import { Hero } from '../components/sections/Hero';
import { Cases } from '../components/sections/Cases';
import { HowItDecides } from '../components/sections/HowItDecides';
import { BrainSection } from '../components/brain/BrainSection';
import { Author, Evidence } from '../components/sections/Evidence';
import { DataErrors } from '../components/ui/DataErrors';
import { Rail } from '../components/ui/Rail';
import { useStore } from '../store/navigation';
import { DICT } from '../app/i18n';

function App() {
  const lang = useStore((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'es' ? 'Calibrated Agent · Un agente capaz no siempre debería actuar' : 'Calibrated Agent · A capable agent should not always act';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        lang === 'es'
          ? 'Propuesta de investigación (preprint v4.2 candidata, sin revisión por pares): cuándo un agente debería actuar, preguntar o abstenerse según su confianza calibrada y el costo de equivocarse. Experimentos no ejecutados.'
          : 'Research proposal (preprint v4.2 candidate, not peer reviewed): when an agent should act, ask or abstain given its calibrated confidence and the cost of being wrong. Experiments not run.',
      );
  }, [lang]);
  void DICT;
  return (
    <>
      <Header page="explorar" />
      <main id="main">
        <DataErrors />
        <Hero />
        <Cases />
        <HowItDecides />
        <BrainSection />
        <Evidence />
      </main>
      <Author page="explorar" />
      <Rail />
    </>
  );
}

export { App };

if (typeof document !== 'undefined') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
