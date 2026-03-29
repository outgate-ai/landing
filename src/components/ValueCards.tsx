import { useTranslation } from 'react-i18next';
import './ValueCards.css';

const CARDS = [
  { key: 'useAnyLlm', image: '/images/use-any-llm.png' },
  { key: 'ownYourData', image: '/images/own-your-data.png' },
  { key: 'enforcePolicies', image: '/images/enforce-policies.png' },
] as const;

export default function ValueCards() {
  const { t } = useTranslation('landing');

  return (
    <section className="value-cards">
      <div className="container">
        <div className="cards-grid">
          {CARDS.map((card) => (
            <div key={card.key} className="value-card">
              <div className="card-icon">
                <img src={card.image} alt={t(`valueCards.${card.key}.alt`)} />
              </div>
              <h3 className="card-title">{t(`valueCards.${card.key}.title`)}</h3>
              <p className="card-description">{t(`valueCards.${card.key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
