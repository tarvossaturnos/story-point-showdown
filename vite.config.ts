import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Set SITE_URL to the public production origin, never a preview deployment URL.
function searchMetadata(siteUrl: string | undefined): Plugin {
  let canonical: string | undefined;
  if (siteUrl) {
    const parsed = new URL(siteUrl);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
      throw new Error('SITE_URL must be an HTTPS origin, e.g. https://your-domain.com');
    }
    canonical = parsed.origin + '/';
  }
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return {
    name: 'search-metadata',
    transformIndexHtml(html) {
      const metadata = canonical ? `<link rel="canonical" href="${escape(canonical)}" />
    <meta property="og:url" content="${escape(canonical)}" />
    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Story Point Showdown', url: canonical, inLanguage: 'en' }).replace(/</g, '\\u003c')}</script>` : '';
      return html.replace('<!-- SITE_METADATA -->', metadata);
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${canonical ? `\nSitemap: ${canonical}sitemap.xml\n` : ''}` });
      if (canonical) {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(canonical)}</loc></url></urlset>\n` });
      } else {
        this.warn('SITE_URL is unset: canonical URL and sitemap are omitted. Set the production origin before publishing.');
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'SITE_');
  return { plugins: [react(), searchMetadata(process.env.SITE_URL || env.SITE_URL || 'https://storypointshowdown.witsensoft.com')] };
});
