import { launch } from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join, extname } from 'path';

const DIST_DIR = resolve(import.meta.dirname, '..', 'dist');
const OUTPUT_DIR = join(DIST_DIR, '_prerendered');

// Routes to prerender: root page + legal pages
const ROUTES = [
  { path: '/', output: 'index.html', waitFor: '.header' },
  { path: '/privacy', output: 'privacy.html', waitFor: 'main' },
  { path: '/terms', output: 'terms.html', waitFor: 'main' },
  { path: '/impressum', output: 'impressum.html', waitFor: 'main' },
  { path: '/tools', output: 'tools.html', waitFor: '.tools-main' },
];

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function startServer() {
  return new Promise((res) => {
    const server = createServer((req, reply) => {
      const filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      try {
        const data = readFileSync(filePath);
        reply.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
        reply.end(data);
      } catch {
        // SPA fallback
        reply.writeHead(200, { 'Content-Type': 'text/html' });
        reply.end(readFileSync(join(DIST_DIR, 'index.html')));
      }
    });
    server.listen(0, '127.0.0.1', () => res({ server, port: server.address().port }));
  });
}

async function prerender() {
  const { server, port } = await startServer();
  const browser = await launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    mkdirSync(OUTPUT_DIR, { recursive: true });

    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for React to mount
      await page.waitForFunction(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0;
      }, { timeout: 10000 });

      if (route.waitFor) {
        await page.waitForSelector(route.waitFor, { timeout: 10000 }).catch(() => {});
      }

      // Remove JS bundles. Keep ld+json structured data.
      await page.evaluate(() => {
        document.querySelectorAll('script[src], script[type="module"]').forEach((s) => s.remove());
      });

      const html = await page.content();
      writeFileSync(join(OUTPUT_DIR, route.output), html, 'utf-8');
      console.log(`  ${route.path} -> _prerendered/${route.output} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
      await page.close();
    }

    console.log(`\nPrerendered ${ROUTES.length} pages.`);
  } finally {
    await browser.close();
    server.close();
  }
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
