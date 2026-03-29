import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';
import './ToolsPage.css';

export default function ToolsPage() {
  const { t } = useTranslation('landing');
  const [version, setVersion] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedTool, setSelectedTool] = useState<'claude' | 'codex'>('claude');
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    fetch('https://outgate.ai/download/VERSION')
      .then(r => r.text())
      .then(v => setVersion(v.trim()))
      .catch(() => {});

    const ua = navigator.userAgent.toLowerCase();
    let detectedArch: 'arm64' | 'amd64' = 'amd64';
    if (ua.includes('arm64') || ua.includes('aarch64')) {
      detectedArch = 'arm64';
    } else if (ua.includes('mac')) {
      detectedArch = 'arm64';
    }
    const os = ua.includes('mac') ? 'darwin' : 'linux';
    setSelectedPlatform(`${os}-${detectedArch}`);
  }, []);

  const installCmd = 'curl -fsSL https://outgate.ai/download/install.sh | sh';
  const envCmd = `eval $(gw env ${selectedTool})`;
  const wrapCmd = `gw ${selectedTool}`;
  const toolLabel = selectedTool === 'claude' ? 'Claude Code' : 'Codex';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const getPlatformLabel = () => {
    const os = selectedPlatform.startsWith('darwin') ? t('tools.macOS') : t('tools.linux');
    let archLabel: string;
    if (selectedPlatform === 'darwin-arm64') archLabel = t('tools.appleSilicon');
    else if (selectedPlatform === 'darwin-amd64') archLabel = t('tools.intel');
    else if (selectedPlatform === 'linux-arm64') archLabel = 'ARM64';
    else archLabel = 'x86_64';
    return { os, archLabel };
  };

  return (
    <div className="tools-page">
      <header className="tools-header">
        <div className="tools-header-content">
          <a href="/" className="tools-logo">{t('nav.logo')}</a>
          <nav className="tools-nav">
            <a href="/#features" className="tools-nav-link">{t('nav.features')}</a>
            <a href="/#pricing" className="tools-nav-link">{t('nav.pricing')}</a>
            <a href="/tools" className="tools-nav-link active">{t('nav.tools')}</a>
          </nav>
        </div>
      </header>

      <main className="tools-main">
        <section className="tools-hero">
          <h1>{t('tools.title')} {version && <span className="tools-version">v{version}</span>}</h1>
        </section>

        <section className="tools-install">
          <div className="tools-terminal">
            <div className="tools-terminal-header">
              <span className="tools-terminal-dot red" />
              <span className="tools-terminal-dot yellow" />
              <span className="tools-terminal-dot green" />
              <span className="tools-terminal-title">Terminal</span>
            </div>
            <div className="tools-terminal-body">
              <div className="tools-terminal-line">
                <span className="tools-prompt">$</span>
                <code>{installCmd}</code>
                <button className="tools-copy-btn" onClick={() => copyToClipboard(installCmd, 'install')}>
                  {copiedId === 'install' ? t('tools.copied') : t('tools.copy')}
                </button>
              </div>
            </div>
          </div>

          <div className="tools-divider">
            <span>{t('tools.orDownload')}</span>
          </div>

          <div className="tools-downloads">
            <button
              className={`tools-download-card ${selectedPlatform === 'darwin-arm64' ? 'selected' : ''}`}
              onClick={() => setSelectedPlatform('darwin-arm64')}
            >
              <div className="tools-os-icon">&#63743;</div>
              <div className="tools-download-label">{t('tools.macOS')}</div>
              <div className="tools-download-arch">{t('tools.appleSilicon')}</div>
            </button>
            <button
              className={`tools-download-card ${selectedPlatform === 'darwin-amd64' ? 'selected' : ''}`}
              onClick={() => setSelectedPlatform('darwin-amd64')}
            >
              <div className="tools-os-icon">&#63743;</div>
              <div className="tools-download-label">{t('tools.macOS')}</div>
              <div className="tools-download-arch">{t('tools.intel')}</div>
            </button>
            <button
              className={`tools-download-card ${selectedPlatform === 'linux-amd64' ? 'selected' : ''}`}
              onClick={() => setSelectedPlatform('linux-amd64')}
            >
              <img src="/images/linux-logo.png" alt="Linux" className="tools-os-icon-img" />
              <div className="tools-download-label">{t('tools.linux')}</div>
              <div className="tools-download-arch">x86_64</div>
            </button>
            <button
              className={`tools-download-card ${selectedPlatform === 'linux-arm64' ? 'selected' : ''}`}
              onClick={() => setSelectedPlatform('linux-arm64')}
            >
              <img src="/images/linux-logo.png" alt="Linux" className="tools-os-icon-img" />
              <div className="tools-download-label">{t('tools.linux')}</div>
              <div className="tools-download-arch">ARM64</div>
            </button>
          </div>
          {selectedPlatform && (
            <div className="tools-download-btn-wrap">
              <a
                href={`https://outgate.ai/download/latest/gw-${selectedPlatform}`}
                className="tools-download-btn"
              >
                {t('tools.downloadBtn', getPlatformLabel())}
              </a>
            </div>
          )}
        </section>

        <section className="tools-quickstart">
          <div className="tools-section-header">
            <h2>{t('tools.quickStart')}</h2>
            <div className="tools-toggle">
              <button
                className={`tools-toggle-btn ${selectedTool === 'claude' ? 'active' : ''}`}
                onClick={() => setSelectedTool('claude')}
              >
                Claude Code
              </button>
              <button
                className={`tools-toggle-btn ${selectedTool === 'codex' ? 'active' : ''}`}
                onClick={() => setSelectedTool('codex')}
              >
                Codex
              </button>
            </div>
          </div>
          <div className="tools-steps-horizontal">
            <div className="tools-step-h">
              <div className="tools-step-num">1</div>
              <div className="tools-code">gw login</div>
              <p>{t('tools.step1')}</p>
            </div>
            <div className="tools-step-h">
              <div className="tools-step-num">2</div>
              <div className="tools-code">{wrapCmd}</div>
              <p>{t('tools.step2', { tool: toolLabel })}</p>
            </div>
            <div className="tools-step-h">
              <div className="tools-step-num">3</div>
              <div className="tools-code">gw status</div>
              <p>{t('tools.step3')}</p>
            </div>
          </div>
        </section>

        <section className="tools-ide">
          <h2>{t('tools.ideTitle')}</h2>
          <p className="tools-ide-subtitle">{t('tools.ideSubtitle', { tool: toolLabel })}</p>
          <div className="tools-terminal">
            <div className="tools-terminal-header">
              <span className="tools-terminal-dot red" />
              <span className="tools-terminal-dot yellow" />
              <span className="tools-terminal-dot green" />
              <span className="tools-terminal-title">~/.bash_profile</span>
            </div>
            <div className="tools-terminal-body">
              <div className="tools-terminal-line">
                <span className="tools-prompt">$</span>
                <code>{envCmd}</code>
                <button className="tools-copy-btn" onClick={() => copyToClipboard(envCmd, 'env')}>
                  {copiedId === 'env' ? t('tools.copied') : t('tools.copy')}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
