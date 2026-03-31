import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { env } from '../env';
import Globe from './Globe';
import './Hero.css';

export default function Hero() {
  const { t } = useTranslation('landing');
  const rotatingWords = t('hero.rotatingWords', { returnObjects: true }) as string[];
  const trustBadges = t('hero.trustBadges', { returnObjects: true }) as string[];

  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'flipping' | 'reset'>('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase('flipping');
      setTimeout(() => {
        // Disable transition, swap word, snap to top
        setPhase('reset');
        setWordIdx((prev) => (prev + 1) % rotatingWords.length);
        // Re-enable transition after a frame
        requestAnimationFrame(() => {
          setPhase('idle');
        });
      }, 450);
    }, 3000);
    return () => clearInterval(timer);
  }, [rotatingWords.length]);

  const current = rotatingWords[wordIdx];
  const next = rotatingWords[(wordIdx + 1) % rotatingWords.length];

  return (
    <section className="hero-earth">
      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-brand">
            <h1 className="hero-title">{t('hero.title')}</h1>
          </div>
          <p className="hero-description">
            {t('hero.descriptionPrefix')}{' '}
            <span className="hero-flip-container">
              <span className={`hero-flip-card ${phase === 'flipping' ? 'flipping' : ''} ${phase === 'reset' ? 'no-transition' : ''}`}>
                <span className="hero-flip-front">{current}</span>
                <span className="hero-flip-back">{next}</span>
              </span>
            </span>
            {' '}{t('hero.descriptionSuffix')}{' '}
            <span className="hero-magic-word">{t('hero.descriptionHighlight')}</span>.
          </p>
          <p className="hero-description hero-description-secondary">
            {t('hero.secondary')}
          </p>
          <div className="hero-trust">
            {trustBadges.map((badge, i) => (
              <span key={i}>
                {i > 0 && <span className="hero-trust-dot" />}
                <span>{badge}</span>
              </span>
            ))}
          </div>
          <div className="hero-actions">
            <a href={env.consoleUrl} className="btn-primary">{t('hero.ctaGetStarted')}</a>
            {/* <a href="#pricing" className="btn-secondary">{t('hero.ctaViewPricing')}</a> */}
            <a href="https://calendar.app.google/8X8uKdNYnmrgTfD3A" target="_blank" rel="noopener noreferrer" className="btn-secondary">{t('hero.ctaMeetFounder')}</a>
          </div>
        </div>
        <div className="hero-right">
          <Globe />
        </div>
      </div>
    </section>
  );
}
