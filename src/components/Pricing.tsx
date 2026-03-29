import { useTranslation } from 'react-i18next';
import { env } from '../env';
import './Pricing.css';

interface PlanFeature {
  labelKey: string;
  included: boolean;
}

interface Plan {
  key: string;
  highlighted?: boolean;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    key: 'free',
    features: [
      { labelKey: 'upTo5Providers', included: true },
      { labelKey: 'rate100hr1kDay', included: true },
      { labelKey: 'analyticsLogs', included: true },
      { labelKey: 'apiKeyMgmt', included: true },
      { labelKey: 'failoverLbRouters', included: true },
      { labelKey: 'accessPolicies', included: true },
      { labelKey: 'smartRouter', included: false },
      { labelKey: 'guardrails', included: false },
      { labelKey: 'selfManaged', included: false },
    ],
  },
  {
    key: 'plus',
    highlighted: true,
    features: [
      { labelKey: 'upTo20Providers', included: true },
      { labelKey: 'rate100khr1mDay', included: true },
      { labelKey: 'analyticsLogs', included: true },
      { labelKey: 'apiKeyMgmt', included: true },
      { labelKey: 'failoverLbRouters', included: true },
      { labelKey: 'accessPolicies', included: true },
      { labelKey: 'smartRouter', included: true },
      { labelKey: 'guardrails', included: true },
      { labelKey: 'selfManaged', included: false },
    ],
  },
  {
    key: 'pro',
    features: [
      { labelKey: 'unlimitedProviders', included: true },
      { labelKey: 'unlimitedRateLimits', included: true },
      { labelKey: 'analyticsLogs', included: true },
      { labelKey: 'apiKeyMgmt', included: true },
      { labelKey: 'failoverLbRouters', included: true },
      { labelKey: 'accessPolicies', included: true },
      { labelKey: 'smartRouter', included: true },
      { labelKey: 'guardrails', included: true },
      { labelKey: 'selfManaged', included: true },
    ],
  },
];

export default function Pricing() {
  const { t } = useTranslation('landing');

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <h2 className="pricing-title">{t('pricing.title')}</h2>
        <div className="pricing-grid">
          {plans.map((plan) => {
            const name = t(`pricing.plans.${plan.key}.name`);
            const price = t(`pricing.plans.${plan.key}.price`);
            const period = t(`pricing.plans.${plan.key}.period`);
            const description = t(`pricing.plans.${plan.key}.description`);
            const cta = t(`pricing.plans.${plan.key}.cta`);
            const footnote = t(`pricing.plans.${plan.key}.footnote`, { defaultValue: '' });

            return (
              <div
                key={plan.key}
                className={`pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}`}
              >
                {plan.highlighted && <div className="pricing-badge">{t('pricing.popularBadge')}</div>}
                <div className="pricing-header">
                  <h3 className="plan-name">{name}</h3>
                  <div className="plan-price">
                    <span className="price-currency">{t('pricing.currency')}</span>
                    <span className="price-amount">{price}</span>
                    <span className="price-period">{period}</span>
                  </div>
                  <p className="plan-description">{description}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((f) => (
                    <li key={f.labelKey} className={f.included ? 'included' : 'excluded'}>
                      <span className="feature-check">{f.included ? '\u2713' : '\u2715'}</span>
                      {t(`pricing.features.${f.labelKey}`)}
                    </li>
                  ))}
                </ul>
                {footnote && (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 12px', padding: '0 4px' }}>
                    {footnote}
                  </p>
                )}
                <a href={env.consoleUrl} className="plan-cta">
                  {cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
