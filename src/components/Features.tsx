import { useTranslation } from 'react-i18next';
import './Features.css';

export default function Features() {
  const { t } = useTranslation('landing');
  const items = t('features.items', { returnObjects: true }) as { number: string; title: string; description: string }[];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <h2 className="section-title">{t('features.sectionTitle')}</h2>
        <div className="features-list">
          {items.map((f) => (
            <div key={f.number} className="feature-item">
              <div className="feature-number">{f.number}</div>
              <div className="feature-content">
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
