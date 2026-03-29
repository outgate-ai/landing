import LegalLayout from '../components/LegalLayout';
import { env } from '../env';
import { useTranslation, Trans } from 'react-i18next';
import { useDocumentMeta } from '../utils/useDocumentMeta';

export default function PrivacyPolicy() {
  const { t } = useTranslation('legal');

  useDocumentMeta({
    title: t('privacy.meta.title'),
    description: t('privacy.meta.description'),
    canonical: 'https://outgate.ai/privacy',
  });

  return (
    <LegalLayout>
      <style>{`
        .legal-content h1 { font-size: 24px; font-weight: 700; color: #16191f; margin-bottom: 8px; }
        .legal-content h2 { font-size: 18px; font-weight: 600; color: #16191f; margin-top: 32px; margin-bottom: 12px; }
        .legal-content h3 { font-size: 15px; font-weight: 600; color: #16191f; margin-top: 20px; margin-bottom: 8px; }
        .legal-content p, .legal-content li { font-size: 14px; line-height: 1.7; color: #374151; }
        .legal-content ul { padding-left: 20px; margin: 8px 0; }
        .legal-content li { margin-bottom: 4px; }
        .legal-content .updated { font-size: 13px; color: #687078; margin-bottom: 24px; }
        .legal-content a { color: #3b82f6; text-decoration: underline; }
        .legal-content table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
        .legal-content th, .legal-content td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
        .legal-content th { background: #f8fafc; font-weight: 600; color: #16191f; }
      `}</style>
      <div className="legal-content">
        <h1>{t('privacy.title')}</h1>
        <p className="updated">{t('privacy.lastUpdated')}</p>

        <p>
          <Trans
            i18nKey="privacy.intro"
            ns="legal"
            values={{ operatorName: env.operatorName }}
            components={{
              consoleLink: <a href="https://console.outgate.ai" />,
            }}
          />
        </p>

        <h2>{t('privacy.controller.heading')}</h2>
        <p>{t('privacy.controller.p1')}</p>
        <p>
          <Trans
            i18nKey="privacy.controller.address"
            ns="legal"
            values={{ operatorName: env.operatorName, supportEmail: env.supportEmail }}
            components={{
              br: <br />,
              emailLink: <a href={`mailto:${env.supportEmail}`} />,
            }}
          />
        </p>

        <h2>{t('privacy.dataWeCollect.heading')}</h2>

        <h3>{t('privacy.dataWeCollect.account.heading')}</h3>
        <p>{t('privacy.dataWeCollect.account.p1')}</p>
        <ul>
          {(t('privacy.dataWeCollect.account.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t('privacy.dataWeCollect.auth.heading')}</h3>
        <p>{t('privacy.dataWeCollect.auth.p1')}</p>
        <ul>
          {(t('privacy.dataWeCollect.auth.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>{t('privacy.dataWeCollect.auth.p2')}</p>

        <h3>{t('privacy.dataWeCollect.payment.heading')}</h3>
        <p>{t('privacy.dataWeCollect.payment.p1')}</p>
        <ul>
          {(t('privacy.dataWeCollect.payment.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>
          <Trans
            i18nKey="privacy.dataWeCollect.payment.p2"
            ns="legal"
            components={{
              stripeLink: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" />,
            }}
          />
        </p>

        <h3>{t('privacy.dataWeCollect.usage.heading')}</h3>
        <p>{t('privacy.dataWeCollect.usage.p1')}</p>
        <ul>
          {(t('privacy.dataWeCollect.usage.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>{t('privacy.dataWeCollect.support.heading')}</h3>
        <p>{t('privacy.dataWeCollect.support.p1')}</p>

        <h2>{t('privacy.legalBasis.heading')}</h2>
        <p>{t('privacy.legalBasis.p1')}</p>
        <table>
          <thead>
            <tr>
              <th>{t('privacy.legalBasis.table.purpose')}</th>
              <th>{t('privacy.legalBasis.table.legalBasis')}</th>
            </tr>
          </thead>
          <tbody>
            {(t('privacy.legalBasis.table.rows', { returnObjects: true }) as { purpose: string; basis: string }[]).map((row, i) => (
              <tr key={i}>
                <td>{row.purpose}</td>
                <td>{row.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>{t('privacy.processors.heading')}</h2>
        <p>{t('privacy.processors.p1')}</p>
        <table>
          <thead>
            <tr>
              <th>{t('privacy.processors.table.processor')}</th>
              <th>{t('privacy.processors.table.purpose')}</th>
              <th>{t('privacy.processors.table.location')}</th>
              <th>{t('privacy.processors.table.safeguards')}</th>
            </tr>
          </thead>
          <tbody>
            {(t('privacy.processors.table.rows', { returnObjects: true }) as { processor: string; purpose: string; location: string; safeguards: string }[]).map((row, i) => (
              <tr key={i}>
                <td>{row.processor}</td>
                <td>{row.purpose}</td>
                <td>{row.location}</td>
                <td>{row.safeguards}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{t('privacy.processors.p2')}</p>

        <h2>{t('privacy.retention.heading')}</h2>
        <ul>
          {(t('privacy.retention.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <h2>{t('privacy.cookies.heading')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('privacy.cookies.p1') }} />
        <p>{t('privacy.cookies.p2')}</p>
        <ul>
          {(t('privacy.cookies.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>{t('privacy.cookies.p3')}</p>

        <h2>{t('privacy.rights.heading')}</h2>
        <p>{t('privacy.rights.p1')}</p>
        <ul>
          {(t('privacy.rights.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
        <p>
          <Trans
            i18nKey="privacy.rights.p2"
            ns="legal"
            values={{ supportEmail: env.supportEmail }}
            components={{
              emailLink: <a href={`mailto:${env.supportEmail}`} />,
            }}
          />
        </p>

        <h2>{t('privacy.complaint.heading')}</h2>
        <p>{t('privacy.complaint.p1')}</p>
        <p>
          <Trans
            i18nKey="privacy.complaint.authority"
            ns="legal"
            components={{
              br: <br />,
              authorityLink: <a href="https://www.datenschutz-berlin.de" target="_blank" rel="noopener noreferrer" />,
            }}
          />
        </p>

        <h2>{t('privacy.security.heading')}</h2>
        <p>{t('privacy.security.p1')}</p>
        <ul>
          {(t('privacy.security.items', { returnObjects: true }) as string[]).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{t('privacy.children.heading')}</h2>
        <p>{t('privacy.children.p1')}</p>

        <h2>{t('privacy.changes.heading')}</h2>
        <p>{t('privacy.changes.p1')}</p>

        <h2>{t('privacy.contact.heading')}</h2>
        <p>{t('privacy.contact.p1')}</p>
        <p>
          <Trans
            i18nKey="privacy.contact.address"
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
