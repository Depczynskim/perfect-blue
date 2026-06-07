import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { getSiteUrl } from '@/lib/siteUrl';
import { createServerClient } from '@/lib/supabase';
import { getActiveListingSitemapEntries } from '@/lib/listings/getActiveListingSitemapEntries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      changeFrequency: 'daily',
      priority: 1,
    });
    entries.push({
      url: `${baseUrl}/${locale}/listings`,
      changeFrequency: 'hourly',
      priority: 0.9,
    });
    entries.push({
      url: `${baseUrl}/${locale}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
    entries.push({
      url: `${baseUrl}/${locale}/how-it-works`,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
    entries.push({
      url: `${baseUrl}/${locale}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
    entries.push({
      url: `${baseUrl}/${locale}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
    entries.push({
      url: `${baseUrl}/${locale}/terms`,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  const supabase = await createServerClient();
  const activeListings = await getActiveListingSitemapEntries(supabase);

  for (const locale of locales) {
    for (const listing of activeListings) {
      entries.push({
        url: `${baseUrl}/${locale}/listings/${listing.id}`,
        lastModified: listing.created_at ? new Date(listing.created_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
