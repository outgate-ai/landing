import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from './env';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import RoutingVisualizer from './components/RoutingVisualizer';
import Features from './components/Features';
import GuardrailVisualizer from './components/GuardrailVisualizer';
import Pricing from './components/Pricing';
import Dashboard from './components/Dashboard';
import Integration from './components/Integration';
import Footer from './components/Footer';
import EmailFooter from './components/EmailFooter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ImpressumPage from './pages/ImpressumPage';
import ToolsPage from './pages/ToolsPage';

const ROUTES: Record<string, () => JSX.Element> = {
  '/t/e8f2a7d1c4b9': () => <EmailFooter />,
  '/privacy': () => <PrivacyPolicy />,
  '/terms': () => <TermsOfService />,
  '/impressum': () => <ImpressumPage />,
  '/tools': () => <ToolsPage />,
};

function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);
  return null;
}

export default function App() {
  const { t } = useTranslation('landing');
  const route = ROUTES[window.location.pathname];
  if (route) return route();

  return (
    <div>
      <ScrollToHash />
      <header className="header">
        <div className="header-content">
          <div className="header-logo">{t('nav.logo')}</div>
          <nav className="header-nav">
            <a href="#features" className="header-nav-link">{t('nav.features')}</a>
            <a href="#pricing" className="header-nav-link">{t('nav.pricing')}</a>
            <a href="/tools" className="header-nav-link">{t('nav.tools')}</a>
          </nav>
          <a href={env.consoleUrl} className="header-console-btn">
            {t('nav.console')}
          </a>
        </div>
      </header>

      <Hero />
      <ValueProposition />
      <GuardrailVisualizer />
      <Features />
      <RoutingVisualizer />
      <Pricing />
      <Dashboard />
      <Integration />
      <Footer />
    </div>
  );
}
