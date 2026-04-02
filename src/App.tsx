import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from './env';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import RoutingVisualizer from './components/RoutingVisualizer';
import Features from './components/Features';
import GuardrailVisualizer from './components/GuardrailVisualizer';
// import Pricing from './components/Pricing';
import Dashboard from './components/Dashboard';
import Integration from './components/Integration';
import Footer from './components/Footer';
import EmailFooter from './components/EmailFooter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ImpressumPage from './pages/ImpressumPage';
import ToolsPage from './pages/ToolsPage';
import BrandExplorer from './pages/BrandExplorer';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

const ROUTES: Record<string, () => JSX.Element> = {
  '/t/e8f2a7d1c4b9': () => <EmailFooter />,
  '/privacy': () => <PrivacyPolicy />,
  '/terms': () => <TermsOfService />,
  '/impressum': () => <ImpressumPage />,
  '/tools': () => <ToolsPage />,
  '/brand': () => <BrandExplorer />,
};

/** Adds .reveal to text/card elements, observes them, adds .visible on entry */
function useScrollReveal() {
  useEffect(() => {
    const selectors = [
      // Hero is handled by CSS @keyframes (above the fold, no observer needed)
      // Headings and body text
      '.how-it-works-title', '.section-title', '.dashboard-title', '.gv-heading', '.rv-heading',
      '.dashboard-description', '.integration-subtitle', '.rv-subheading', '.gv-subheading',
      '.step-description', '.feature-description',
      '.integration-section h2',
      // Cards and list items
      '.feature-item', '.how-step', '.value-card', '.pricing-card',
      // Diagrams and visualizers
      '.gv-card', '.gv-progress',
      '.rv-tabs', '.rv-canvas',
      // Dashboard image gallery
      '.dashboard-preview',
      // Integration code terminal
      '.integration-terminal', '.integration-toggle',
    ].join(',');

    const els = document.querySelectorAll(selectors);
    els.forEach((el) => el.classList.add('reveal'));

    // Force a paint so the browser renders elements at opacity:0
    // before we start observing and adding .visible
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
        );
        els.forEach((el) => observer.observe(el));
      });
    });
  }, []);
}

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
  const { t, i18n } = useTranslation('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    setMenuOpen(false);
  };

  useScrollReveal();

  const route = ROUTES[window.location.pathname];
  if (route) return route();

  return (
    <div>
      <ScrollToHash />
      <header className="header" ref={menuRef}>
        <div className="header-content">
          <div className="header-logo">{t('nav.logo')}</div>
          <nav className="header-nav">
            <a href="#features" className="header-nav-link">{t('nav.features')}</a>
            {/* <a href="#pricing" className="header-nav-link">{t('nav.pricing')}</a> */}
            <a href="/tools" className="header-nav-link">{t('nav.tools')}</a>
          </nav>
          <a href={env.consoleUrl} className="header-console-btn">
            {t('nav.console')}
          </a>
          <button className="header-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label={t('nav.menu')}>
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="header-mobile-menu">
            <a href={env.consoleUrl} className="header-mobile-link header-mobile-console" onClick={() => setMenuOpen(false)}>
              {t('nav.console')}
            </a>
            <a href="#features" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
              {t('nav.features')}
            </a>
            <a href="/tools" className="header-mobile-link" onClick={() => setMenuOpen(false)}>
              {t('nav.tools')}
            </a>
            <div className="header-mobile-lang">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {LANGUAGES.map((lng) => (
                <button
                  key={lng.code}
                  className={`header-mobile-lang-btn ${lng.code === currentLang.code ? 'active' : ''}`}
                  onClick={() => changeLanguage(lng.code)}
                >
                  {lng.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <Hero />
      <ValueProposition />
      <GuardrailVisualizer />
      <Features />
      <RoutingVisualizer />
      {/* <Pricing /> */}
      <Dashboard />
      <Integration />
      <Footer />
    </div>
  );
}
