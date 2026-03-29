import LegalLayout from '../components/LegalLayout';
import { useTranslation, Trans } from 'react-i18next';
import { useDocumentMeta } from '../utils/useDocumentMeta';

export default function ImpressumPage() {
  const { t } = useTranslation('legal');

  useDocumentMeta({
    title: t('impressum.meta.title'),
    description: t('impressum.meta.description'),
    canonical: 'https://outgate.ai/impressum',
  });

  return (
    <LegalLayout>
      <style>{`
        .legal-content h1 { font-size: 24px; font-weight: 700; color: #16191f; margin-bottom: 8px; }
        .legal-content h2 { font-size: 18px; font-weight: 600; color: #16191f; margin-top: 32px; margin-bottom: 12px; }
        .legal-content p { font-size: 14px; line-height: 1.7; color: #374151; }
      `}</style>
      <div className="legal-content">
        <h1>{t('impressum.title')}</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{t('impressum.subtitle')}</p>

        <h2>{t('impressum.company.heading')}</h2>
        <p>
          <Trans i18nKey="impressum.company.address" ns="legal" components={{ br: <br /> }} />
        </p>

        <h2>{t('impressum.representedBy.heading')}</h2>
        <p>{t('impressum.representedBy.p1')}</p>

        <h2>{t('impressum.contact.heading')}</h2>
        <p>
          <Trans
            i18nKey="impressum.contact.p1"
            ns="legal"
            components={{
              br: <br />,
              emailLink: <a href="mailto:support@outgate.ai" style={{ color: '#3b82f6' }} />,
              websiteLink: <a href="https://outgate.ai" style={{ color: '#3b82f6' }} />,
            }}
          />
        </p>

        <h2>{t('impressum.registration.heading')}</h2>
        <p>
          <Trans i18nKey="impressum.registration.p1" ns="legal" components={{ br: <br />, em: <em /> }} />
        </p>

        <h2>{t('impressum.vatId.heading')}</h2>
        <p>
          <Trans i18nKey="impressum.vatId.p1" ns="legal" components={{ br: <br />, em: <em /> }} />
        </p>

        <h2>{t('impressum.responsibleForContent.heading')}</h2>
        <p>
          <Trans i18nKey="impressum.responsibleForContent.address" ns="legal" components={{ br: <br /> }} />
        </p>

        <h2>{t('impressum.disputeResolution.heading')}</h2>
        <p>
          <Trans
            i18nKey="impressum.disputeResolution.p1"
            ns="legal"
            components={{
              odrLink: <a href="https://ec.europa.eu/consumers/odr" style={{ color: '#3b82f6' }} target="_blank" rel="noopener noreferrer" />,
            }}
          />
        </p>
        <p>{t('impressum.disputeResolution.p2')}</p>
      </div>
    </LegalLayout>
  );
}
