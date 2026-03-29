import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Integration.css';

export default function Integration() {
  const { t } = useTranslation('landing');
  const [tool, setTool] = useState<'claude' | 'codex'>('claude');

  const toolLabel = tool === 'claude' ? 'Claude Code' : 'Codex';
  const lines = tool === 'claude'
    ? [
        { prompt: true, text: 'og login' },
        { blank: true },
        { comment: true, text: '# Run Claude Code as usual — traffic routes through Outgate' },
        { prompt: true, text: 'og claude --resume 4a7f2e91' },
        { blank: true },
        { prompt: true, text: 'og status' },
        { output: true, text: 'Requests: 1.7K | Tokens: 569M | Top: claude-opus-4-6' },
      ]
    : [
        { prompt: true, text: 'og login' },
        { blank: true },
        { comment: true, text: '# Run Codex as usual — traffic routes through Outgate' },
        { prompt: true, text: 'og codex --model gpt-5' },
        { blank: true },
        { prompt: true, text: 'og status' },
        { output: true, text: 'Requests: 2.4K | Tokens: 120M | Top: gpt-5' },
      ];

  return (
    <section className="integration-section">
      <div className="integration-container">
        <div className="integration-header">
          <h2>{t('integration.title')}</h2>
          <p className="integration-subtitle">
            {t('integration.subtitle', { tool: toolLabel })}{' '}
            <a href="/tools" className="integration-link">{t('integration.downloadLink')}</a>
          </p>
        </div>

        <div className="integration-toggle">
          <button
            className={`integration-toggle-btn ${tool === 'claude' ? 'active' : ''}`}
            onClick={() => setTool('claude')}
          >
            Claude Code
          </button>
          <button
            className={`integration-toggle-btn ${tool === 'codex' ? 'active' : ''}`}
            onClick={() => setTool('codex')}
          >
            Codex
          </button>
        </div>

        <div className="integration-terminal">
          <div className="integration-terminal-header">
            <span className="integration-dot red" />
            <span className="integration-dot yellow" />
            <span className="integration-dot green" />
          </div>
          <div className="integration-terminal-body">
            {lines.map((line, i) => {
              if (line.blank) return <div key={i} className="integration-line blank" />;
              if (line.comment) return (
                <div key={i} className="integration-line">
                  <span className="integration-comment">{line.text}</span>
                </div>
              );
              return (
                <div key={i} className="integration-line">
                  {line.prompt && <span className="integration-prompt">$</span>}
                  <span className={line.output ? 'integration-output' : 'integration-cmd'}>
                    {line.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
