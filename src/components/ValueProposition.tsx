import { useTranslation } from 'react-i18next';
import './ValueProposition.css';

export default function ValueProposition() {
  const { t } = useTranslation('landing');
  const steps = t('howItWorks.steps', { returnObjects: true }) as { title: string; description: string }[];

  return (
    <section className="value-proposition">
      <div className="container">
        <h2 className="how-it-works-title">{t('howItWorks.title')}</h2>
        <div className="how-it-works-grid">
          {steps.map((step, i) => (
            <div key={i} className="how-step">
              <div className="step-number">{i + 1}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
