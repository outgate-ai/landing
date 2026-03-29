import { useTranslation } from 'react-i18next';

export default function EmailFooter() {
  const { t } = useTranslation('landing');

  return (
    <div style={{
      maxWidth: 600,
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {/* Divider */}
          <tr>
            <td style={{ padding: '20px 0', borderTop: '2px solid #e2e8f0' }} />
          </tr>

          {/* Name + title */}
          <tr>
            <td style={{ paddingBottom: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>{t('email.founderName')}</span>
            </td>
          </tr>
          <tr>
            <td style={{ paddingBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{t('email.founderTitle')}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', padding: '0 6px' }}>·</span>
              <a href="mailto:ali@outgate.ai" style={{ fontSize: 13, color: '#6366f1', textDecoration: 'none' }}>ali@outgate.ai</a>
            </td>
          </tr>

          {/* Logo */}
          <tr>
            <td style={{ paddingBottom: 6 }}>
              <table cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#16191f',
                      border: '2px solid #16191f',
                      padding: '2px 6px',
                      lineHeight: 1,
                    }}>
                      {t('email.logoText')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Tagline */}
          <tr>
            <td style={{ fontSize: 12, color: '#64748b', paddingBottom: 14 }}>
              {t('email.tagline')}
            </td>
          </tr>

          {/* Links */}
          <tr>
            <td style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8, paddingBottom: 14 }}>
              <a href="https://outgate.ai" style={{ color: '#6366f1', textDecoration: 'none' }}>{t('email.website')}</a>
              {' · '}
              <a href="https://console.outgate.ai" style={{ color: '#6366f1', textDecoration: 'none' }}>{t('email.console')}</a>
              {' · '}
              <a href="https://console.outgate.ai/docs" style={{ color: '#6366f1', textDecoration: 'none' }}>{t('email.docs')}</a>
              {' · '}
              <a href="https://outgate.ai/privacy" style={{ color: '#6366f1', textDecoration: 'none' }}>{t('email.privacy')}</a>
              {' · '}
              <a href="https://outgate.ai/terms" style={{ color: '#6366f1', textDecoration: 'none' }}>{t('email.terms')}</a>
              {' · '}
              <a href="https://outgate.ai/impressum" style={{ color: '#6366f1', textDecoration: 'none' }}>{t('email.impressum')}</a>
            </td>
          </tr>

          {/* Company address */}
          <tr>
            <td style={{ fontSize: 11, color: '#94a3b8', paddingBottom: 8, lineHeight: 1.6 }}>
              {t('email.companyName')}<br />
              {t('email.managingDirector')}<br />
              {t('email.companyAddress')}
            </td>
          </tr>

          {/* Copyright */}
          <tr>
            <td style={{ fontSize: 11, color: '#94a3b8' }}>
              {t('email.copyright')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
