import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/config';
import { ASEAN_COUNTRY_CODES } from '@/lib/data/aseanProfiles';
import { APP_CONFIG } from '@/constants/config';

/** 静态展厅路线（不含语言前缀） */
const STATIC_PATHS = [
  '',
  '/guangxi',
  '/guilin',
  '/asean',
  '/exchange',
  '/archive',
  '/interactive',
  '/persona',
  '/about',
  '/accessibility',
  '/privacy',
  '/terms',
  '/contact',
  '/credits',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = APP_CONFIG.url.replace(/\/$/, '');
  const now = new Date();

  return LOCALES.flatMap((locale) => {
    const paths = [...STATIC_PATHS, ...ASEAN_COUNTRY_CODES.map((c) => `/asean/${c}`)];
    return paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : path.startsWith('/asean/') ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${base}/${l}${path}`])
        ),
      },
    }));
  });
}
