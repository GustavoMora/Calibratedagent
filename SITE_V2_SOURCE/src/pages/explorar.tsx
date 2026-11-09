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
import { useStore } from '../store/navigation';
import { DICT } from '../app/i18n';

function App() {
  const lang = useStore((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'es' ? 'Calibrated Agent · Un agente capaz no siempre debería actuar' : 'Calibrated Agent · A capable agent should not always act';
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
      <Author />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
