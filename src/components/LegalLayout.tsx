import Footer from './Footer';

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 24px' }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1rem', color: '#16191f', letterSpacing: '0.02em' }}>
          OG
        </a>
      </header>
      <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
