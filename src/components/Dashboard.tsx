import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

const SLIDES = [
  { key: 'dashboard', src: '/images/dashboard-preview.png' },
  { key: 'metrics', src: '/images/org-metrics.png' },
  { key: 'monitoring', src: '/images/router-monitoring.png' },
];

export default function Dashboard() {
  const { t } = useTranslation('landing');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || !isVisible) return;
    const timer = setInterval(() => setActiveIdx((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [isPaused, isVisible]);

  const select = (i: number) => {
    setActiveIdx(i);
    setIsPaused(true);
  };

  return (
    <section className="dashboard-section" ref={sectionRef}>
      <div className="container">
        <h2 className="dashboard-title">{t('dashboard.title')}</h2>
        <p className="dashboard-description">
          {t('dashboard.description')}
        </p>

        {/* Image gallery */}
        <div className="dashboard-preview">
          {SLIDES.map((s, i) => (
            <img
              key={s.key}
              src={s.src}
              alt={t(`dashboard.slides.${s.key}`)}
              className={`dashboard-image ${activeIdx === i ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Dots + pause */}
        <div className="dash-controls">
          <div className="dash-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`dash-dot ${activeIdx === i ? 'on' : ''}`}
                onClick={() => select(i)}
                aria-label={t('dashboard.slideLabel', { number: i + 1 })}
              />
            ))}
          </div>
          <button
            className="dash-pause-btn"
            onClick={() => setIsPaused((p) => !p)}
            title={isPaused ? t('dashboard.resume') : t('dashboard.pause')}
          >
            {isPaused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
