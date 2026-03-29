import './BrandExplorer.css';

// ── Logo Components ──────────────────────────────────────────

function LogoFull({ color = '#1a1f2e', size = 20 }: { color?: string; size?: number }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.05em',
      color,
      whiteSpace: 'nowrap',
    }}>
      OUTGATE<span style={{ opacity: 0.45 }}>.ai</span>
    </span>
  );
}

function LogoShort({ color = '#1a1f2e', size = 32 }: { color?: string; size?: number }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.02em',
      color,
    }}>
      OG
    </span>
  );
}

// ── Color Palette ────────────────────────────────────────────

const colors = {
  primary: [
    { name: 'Purple', hex: '#667eea', usage: 'Primary brand, buttons, links, accents' },
    { name: 'Deep Purple', hex: '#764ba2', usage: 'Gradient end, hover states' },
  ],
  dark: [
    { name: 'Navy', hex: '#1a1a3e', usage: 'Dark backgrounds, landing sections' },
    { name: 'Deep Navy', hex: '#0f0f23', usage: 'Darkest backgrounds' },
    { name: 'Charcoal', hex: '#1a1f2e', usage: 'Text on light, logo dark variant' },
  ],
  light: [
    { name: 'White', hex: '#ffffff', usage: 'Cards, light backgrounds' },
    { name: 'Off White', hex: '#fafbfc', usage: 'Page backgrounds (tools, console)' },
    { name: 'Light Grey', hex: '#f1f5f9', usage: 'Code blocks, input backgrounds' },
    { name: 'Border', hex: '#e2e8f0', usage: 'Borders, dividers' },
  ],
  text: [
    { name: 'Primary Text', hex: '#1a202c', usage: 'Headings on light' },
    { name: 'Body Text', hex: '#334155', usage: 'Body copy on light' },
    { name: 'Muted', hex: '#64748b', usage: 'Secondary text, placeholders' },
    { name: 'Light Muted', hex: '#94a3b8', usage: 'Hints, timestamps' },
  ],
  semantic: [
    { name: 'Success', hex: '#48bb78', usage: 'Active, online, success states' },
    { name: 'Error', hex: '#dc3545', usage: 'Danger, delete, error states' },
    { name: 'Warning', hex: '#febc2e', usage: 'Warnings, caution' },
  ],
};

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const isLight = hex === '#ffffff' || hex === '#fafbfc' || hex === '#f1f5f9' || hex === '#e2e8f0';
  return (
    <div className="color-swatch" onClick={() => navigator.clipboard.writeText(hex)}>
      <div
        className="color-box"
        style={{ background: hex, border: isLight ? '1px solid #e2e8f0' : 'none' }}
      />
      <div className="color-info">
        <div className="color-name">{name}</div>
        <div className="color-hex">{hex}</div>
        <div className="color-usage">{usage}</div>
      </div>
    </div>
  );
}

// ── Download Helpers ─────────────────────────────────────────

type LogoType = 'full' | 'short';

function exportLogo(previewEl: HTMLElement | null, filename: string, format: 'svg' | 'png') {
  if (!previewEl) return;
  // Find the logo span inside the background div
  const bgDiv = previewEl.querySelector('div > div') as HTMLElement;
  const logoSpan = bgDiv?.querySelector('span') as HTMLElement;
  if (!logoSpan) return;

  // Measure actual rendered size
  const rect = logoSpan.getBoundingClientRect();
  const w = Math.ceil(rect.width);
  const h = Math.ceil(rect.height);
  const style = window.getComputedStyle(logoSpan);
  const color = style.color;
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = style.fontWeight;
  const letterSpacing = style.letterSpacing;
  const text = logoSpan.textContent || '';
  const isFull = text.includes('.ai');

  // Shared render function for both PNG and SVG
  function renderToCanvas(scale: number) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const font = `${fontWeight} ${fontSize}px 'JetBrains Mono', monospace`;
    ctx.font = font;

    // Measure actual text bounds using font metrics
    const metrics = ctx.measureText(isFull ? 'OUTGATE.ai' : text);
    const textW = Math.ceil(metrics.width);
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent);
    const descent = Math.ceil(metrics.actualBoundingBoxDescent);
    const textH = ascent + descent;

    canvas.width = textW * scale;
    canvas.height = textH * scale;
    ctx.scale(scale, scale);
    ctx.font = font;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color;

    if (isFull) {
      const main = 'OUTGATE';
      ctx.fillText(main, 0, ascent);
      const mw = ctx.measureText(main).width;
      ctx.globalAlpha = 0.45;
      ctx.fillText('.ai', mw, ascent);
    } else {
      ctx.fillText(text, 0, ascent);
    }

    return { canvas, w: textW, h: textH };
  }

  if (format === 'png') {
    const { canvas } = renderToCanvas(4);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${filename}.png`;
      a.click();
    }, 'image/png');
  } else {
    const { canvas, w: cw, h: ch } = renderToCanvas(4);
    const dataUrl = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${cw}" height="${ch}">
<image width="${cw}" height="${ch}" xlink:href="${dataUrl}"/>
</svg>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    a.download = `${filename}.svg`;
    a.click();
  }
}

function LogoAsset({ label, children, filename }: {
  label: string; children: React.ReactNode; filename: string; logoType: LogoType; color: string;
}) {
  let ref: HTMLDivElement | null = null;
  return (
    <div className="asset-card">
      <div className="asset-preview" ref={(el) => { ref = el; }}>
        {children}
      </div>
      <div className="asset-footer">
        <span className="asset-label">{label}</span>
        <div className="asset-actions">
          <button onClick={() => exportLogo(ref, filename, 'svg')}>SVG</button>
          <button onClick={() => exportLogo(ref, filename, 'png')}>PNG</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function BrandExplorer() {
  return (
    <div className="brand-page">
      <h1>Outgate Brand Guide</h1>
      <p className="brand-subtitle">Logo assets, color palette, typography, and usage guidelines.</p>

      {/* ── Logos ── */}
      <section className="brand-section">
        <h2>1. Logo</h2>
        <p className="section-desc">Two variants: full wordmark for headers and marketing, short mark for icons and compact spaces.</p>

        <h3>Primary — OUTGATE.ai</h3>
        <div className="asset-grid">
          <LogoAsset label="Dark on light" filename="outgate-dark-on-light" logoType="full" color="#1a1f2e">
            <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <LogoFull color="#1a1f2e" size={24} />
            </div>
          </LogoAsset>
          <LogoAsset label="Light on dark" filename="outgate-light-on-dark" logoType="full" color="#ffffff">
            <div style={{ background: '#1a1a3e', padding: '12px 16px', borderRadius: 8 }}>
              <LogoFull color="#ffffff" size={24} />
            </div>
          </LogoAsset>
          <LogoAsset label="Purple on dark" filename="outgate-purple-on-dark" logoType="full" color="#667eea">
            <div style={{ background: '#1a1a3e', padding: '12px 16px', borderRadius: 8 }}>
              <LogoFull color="#667eea" size={24} />
            </div>
          </LogoAsset>
        </div>

        <h3>Short Mark — OG</h3>
        <div className="asset-grid">
          <LogoAsset label="Dark on light" filename="og-dark-on-light" logoType="short" color="#1a1f2e">
            <div style={{ background: '#fff', padding: '5px 8px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <LogoShort color="#1a1f2e" size={28} />
            </div>
          </LogoAsset>
          <LogoAsset label="Light on dark" filename="og-light-on-dark" logoType="short" color="#ffffff">
            <div style={{ background: '#1a1a3e', padding: '5px 8px', borderRadius: 8 }}>
              <LogoShort color="#ffffff" size={28} />
            </div>
          </LogoAsset>
          <LogoAsset label="Purple on dark" filename="og-purple-on-dark" logoType="short" color="#667eea">
            <div style={{ background: '#1a1a3e', padding: '5px 8px', borderRadius: 8 }}>
              <LogoShort color="#667eea" size={28} />
            </div>
          </LogoAsset>
        </div>
      </section>

      {/* ── Colors ── */}
      <section className="brand-section">
        <h2>2. Color Palette</h2>
        <p className="section-desc">Click any swatch to copy the hex value.</p>

        <h3>Primary / Brand</h3>
        <div className="color-row">
          {colors.primary.map(c => <ColorSwatch key={c.hex} {...c} />)}
        </div>
        <div className="gradient-preview">
          <div className="gradient-bar" />
          <span>Primary gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)</span>
        </div>

        <h3>Dark Backgrounds</h3>
        <div className="color-row">
          {colors.dark.map(c => <ColorSwatch key={c.hex} {...c} />)}
        </div>

        <h3>Light Backgrounds</h3>
        <div className="color-row">
          {colors.light.map(c => <ColorSwatch key={c.hex} {...c} />)}
        </div>

        <h3>Text</h3>
        <div className="color-row">
          {colors.text.map(c => <ColorSwatch key={c.hex} {...c} />)}
        </div>

        <h3>Semantic</h3>
        <div className="color-row">
          {colors.semantic.map(c => <ColorSwatch key={c.hex} {...c} />)}
        </div>
      </section>

      {/* ── Typography ── */}
      <section className="brand-section">
        <h2>3. Typography</h2>

        <div className="type-sample">
          <h3>Logo / Code — JetBrains Mono</h3>
          <div className="type-row">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1.5rem' }}>OUTGATE.ai</span>
            <span className="type-meta">800 — Logo, hero headings</span>
          </div>
          <div className="type-row">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1rem' }}>og login</span>
            <span className="type-meta">700 — Nav links, code snippets, badges</span>
          </div>
          <div className="type-row">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: '0.875rem' }}>0.0.0-dev.abc1234</span>
            <span className="type-meta">600 — Terminal output, version numbers</span>
          </div>
        </div>

        <div className="type-sample">
          <h3>Body — System Font Stack</h3>
          <p className="type-stack">-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif</p>
          <div className="type-row">
            <span style={{ fontWeight: 800, fontSize: '2rem' }}>Instant Integration</span>
            <span className="type-meta">800 — Section headings</span>
          </div>
          <div className="type-row">
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Quick Start</span>
            <span className="type-meta">700 — Subsection headings</span>
          </div>
          <div className="type-row">
            <span style={{ fontWeight: 400, fontSize: '1rem', color: '#334155' }}>Route AI traffic through your gateway from the terminal.</span>
            <span className="type-meta">400 — Body text</span>
          </div>
          <div className="type-row">
            <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#64748b' }}>Default subdomain based on your region name.</span>
            <span className="type-meta">400 — Helper text, descriptions</span>
          </div>
        </div>
      </section>

      {/* ── Usage ── */}
      <section className="brand-section">
        <h2>4. Usage in Context</h2>

        <h3>Landing Header (dark)</h3>
        <div className="context-demo dark">
          <LogoFull color="#ffffff" size={18} />
          <div className="context-nav">
            <span>Features</span><span>Pricing</span><span>Tools</span>
          </div>
          <div className="context-btn">Console</div>
        </div>

        <h3>Console Header (light)</h3>
        <div className="context-demo light">
          <LogoShort color="#1a1f2e" size={20} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#64748b' }}>Gateway</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>eu-central-1</span>
        </div>

        <h3>CLI Output</h3>
        <div className="context-cli">
          <div><span className="cli-prompt">$</span> og --version</div>
          <div className="cli-output">og version 0.0.0-dev.abc1234</div>
          <div>&nbsp;</div>
          <div><span className="cli-prompt">$</span> og status</div>
          <div className="cli-output">Account</div>
          <div className="cli-output">--------------------------------------------------</div>
          <div className="cli-output">  Name:   Ali Khoramshahi</div>
        </div>
      </section>

      {/* ── Guidelines ── */}
      <section className="brand-section">
        <h2>5. Guidelines</h2>
        <div className="guidelines-grid">
          <div className="guideline do">
            <h4>Do</h4>
            <ul>
              <li>Use OUTGATE.ai as the full brand name</li>
              <li>Use OG for icons, favicons, compact spaces</li>
              <li>Maintain clear space equal to the height of "O" around the logo</li>
              <li>Use the purple gradient for primary CTAs</li>
              <li>Use JetBrains Mono for logo rendering</li>
            </ul>
          </div>
          <div className="guideline dont">
            <h4>Don't</h4>
            <ul>
              <li>Don't stretch or distort the logo</li>
              <li>Don't use colors other than the defined palette</li>
              <li>Don't use the logo smaller than 16px height</li>
              <li>Don't add effects (shadows, glows, outlines)</li>
              <li>Don't mix casing (OutGate, outGate, OUTgate)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
