import LegalLayout from '../components/LegalLayout';
import { env } from '../env';
import { useTranslation, Trans } from 'react-i18next';
import { useDocumentMeta } from '../utils/useDocumentMeta';

export default function TermsOfService() {
  const { t } = useTranslation('legal');

  useDocumentMeta({
    title: t('terms.meta.title'),
    description: t('terms.meta.description'),
    canonical: 'https://outgate.ai/terms',
  });

  return (
    <LegalLayout>
      <style>{`
        .legal-content h1 { font-size: 24px; font-weight: 700; color: #16191f; margin-bottom: 8px; }
        .legal-content h2 { font-size: 18px; font-weight: 600; color: #16191f; margin-top: 32px; margin-bottom: 12px; }
        .legal-content h3 { font-size: 15px; font-weight: 600; color: #16191f; margin-top: 20px; margin-bottom: 8px; }
        .legal-content p, .legal-content li { font-size: 14px; line-height: 1.7; color: #374151; }
        .legal-content ul, .legal-content ol { padding-left: 20px; margin: 8px 0; }
        .legal-content li { margin-bottom: 4px; }
        .legal-content .updated { font-size: 13px; color: #687078; margin-bottom: 24px; }
        .legal-content a { color: #3b82f6; text-decoration: underline; }
        .legal-content strong { color: #16191f; }
      `}</style>
      <div className="legal-content">
        <h1>{t('terms.title')}</h1>
        <p className="updated">{t('terms.lastUpdated')}</p>

        <p>
          <Trans
            i18nKey="terms.intro"
            ns="legal"
            values={{ operatorName: env.operatorName }}
            components={{
              consoleLink: <a href="https://console.outgate.ai" />,
            }}
          />
        </p>
        <p dangerouslySetInnerHTML={{ __html: t('terms.introStrong') }} />

        <h2>{t('terms.section1.heading')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('terms.section1.p1') }} />

        <h2>{t('terms.section2.heading')}</h2>
        <ol>
          {(t('terms.section2.items', { returnObjects: true }) as string[]).map((_item, i) => (
            <li key={i}>
              <Trans
                i18nKey={`terms.section2.items.${i}`}
                ns="legal"
                values={{ supportEmail: env.supportEmail }}
                components={{
                  emailLink: <a href={`mailto:${env.supportEmail}`} />,
                }}
              />
            </li>
          ))}
        </ol>

        <h2>{t('terms.section3.heading')}</h2>
        <p>{t('terms.section3.p1')}</p>
        <ul>
          {(t('terms.section3.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>{t('terms.section3.p2')}</p>

        <h2>{t('terms.section4.heading')}</h2>
        <ol>
          {(t('terms.section4.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <h2>{t('terms.section5.heading')}</h2>
        <ol>
          {(t('terms.section5.items', { returnObjects: true }) as string[]).map((_item, i) => (
            <li key={i}>
              <Trans
                i18nKey={`terms.section5.items.${i}`}
                ns="legal"
                components={{
                  stripeLink: <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" />,
                  strong: <strong />,
                }}
              />
            </li>
          ))}
        </ol>

        <h2>{t('terms.section6.heading')}</h2>
        <ol>
          {(t('terms.section6.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <h2>{t('terms.section7.heading')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('terms.section7.preamble') }} />
        <ol>
          {(t('terms.section7.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>

        <h2>{t('terms.section8.heading')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('terms.section8.preamble') }} />
        <ol>
          {(t('terms.section8.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ol>

        <h2>{t('terms.section9.heading')}</h2>
        <p>{t('terms.section9.p1')}</p>
        <ul>
          {(t('terms.section9.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('terms.section10.heading')}</h2>
        <p>
          <Trans
            i18nKey="terms.section10.p1"
            ns="legal"
            components={{
              privacyLink: <a href="/privacy" />,
            }}
          />
        </p>

        <h2>{t('terms.section11.heading')}</h2>
        <ol>
          {(t('terms.section11.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <h2>{t('terms.section12.heading')}</h2>
        <p>{t('terms.section12.p1')}</p>
        <ul>
          {(t('terms.section12.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('terms.section13.heading')}</h2>
        <ol>
          {(t('terms.section13.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <h2>{t('terms.section14.heading')}</h2>
        <p>{t('terms.section14.p1')}</p>

        <h2>{t('terms.section15.heading')}</h2>
        <ol>
          {(t('terms.section15.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>

        <h2>{t('terms.section16.heading')}</h2>
        <p>{t('terms.section16.p1')}</p>

        <h2>{t('terms.section17.heading')}</h2>
        <p>
          <Trans
            i18nKey="terms.section17.p1"
            ns="legal"
            components={{
              privacyLink: <a href="/privacy" />,
            }}
          />
        </p>

        <h2>{t('terms.section18.heading')}</h2>
        <p>{t('terms.section18.p1')}</p>
        <p>
          <Trans
            i18nKey="terms.section18.address"
            ns="legal"
            values={{ operatorName: env.operatorName, supportEmail: env.supportEmail }}
            components={{
              br: <br />,
              emailLink: <a href={`mailto:${env.supportEmail}`} />,
              supportLink: <a href="/support" />,
            }}
          />
        </p>
      </div>
    </LegalLayout>
  );
}
