import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/*/messages/',
        '/*/profile',
        '/*/listings/new',
        '/*/listings/*/edit',
        '/*/auth/',
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
