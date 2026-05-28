import type { SupabaseClient } from '@supabase/supabase-js';

const PAGE_SIZE = 100;

export interface ListingSitemapEntry {
  id: string;
  created_at: string;
}

export async function getActiveListingSitemapEntries(
  supabase: SupabaseClient,
): Promise<ListingSitemapEntry[]> {
  const results: ListingSitemapEntry[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('listings')
      .select('id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch sitemap listings: ${error.message}`);
    }

    const batch = (data ?? []) as ListingSitemapEntry[];
    results.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return results;
}
