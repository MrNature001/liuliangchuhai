import type { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/constants/config';

export default function robots(): MetadataRoute.Robots {
  const base = APP_CONFIG.url.replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 搜索结果页是站内功能页，不让爬虫收录，避免重复内容
        disallow: ['/api/', '/admin/', '/*/search'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
