import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const builtAt = new Date();

export default defineConfig({
  site: 'https://hourglyph.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', ru: 'ru' } },
      filter: (page) => !page.includes('/404'),
      serialize: (item) => ({ ...item, lastmod: builtAt.toISOString() }),
    }),
  ],
});
