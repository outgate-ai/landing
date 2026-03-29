import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../env';
import './Footer.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function Footer() {
  const { t, i18n } = useTranslation('landing');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const changeLanguage = (lng: string) => {
    setOpen(false);
    if (lng === i18n.language) return;
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{t('footer.product')}</h4>
          <ul>
            <li><a href="#features">{t('footer.features')}</a></li>
            <li><a href="#pricing">{t('footer.pricing')}</a></li>
            <li><a href={env.consoleUrl}>{t('footer.console')}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>{t('footer.resources')}</h4>
          <ul>
            <li><a href={`${env.consoleUrl}/docs`}>{t('footer.documentation')}</a></li>
            <li><a href={`${env.consoleUrl}/support`}>{t('footer.support')}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>{t('footer.legal')}</h4>
          <ul>
            <li><a href="/privacy">{t('footer.privacyPolicy')}</a></li>
            <li><a href="/terms">{t('footer.termsOfService')}</a></li>
            <li><a href="/impressum">{t('footer.impressum')}</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>{t('footer.company')}</h4>
          <ul>
            <li><a href={`${env.consoleUrl}/support`}>{t('footer.contact')}</a></li>
            <li><a href="https://calendar.app.google/8X8uKdNYnmrgTfD3A" target="_blank" rel="noopener noreferrer">{t('footer.meetFounder')}</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('footer.copyright')}</p>
        <div className="footer-bottom-row">
          <p className="footer-tagline">{t('footer.tagline')}</p>
          <div className="footer-lang-picker" ref={ref}>
            <button className="footer-lang-trigger" onClick={() => setOpen(!open)}>
              <GlobeIcon />
              <span>{currentLang.code.toUpperCase()}</span>
            </button>
            {open && (
              <div className="footer-lang-dropdown">
                {LANGUAGES.map((lng) => (
                  <button
                    key={lng.code}
                    className={`footer-lang-option ${lng.code === currentLang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lng.code)}
                  >
                    {lng.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
