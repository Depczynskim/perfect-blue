import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';
import { CategoryFilters, CityCombobox, ListingGrid } from '@/components/listings';
import { getActiveCityCounts, getActiveListings, normalizeLocationInput, parseCategoryFilter } from '@/lib/listings';

export const dynamic = 'force-dynamic';

export default async function ListingsPage({ 
  params: { locale },
  searchParams 
}: { 
  params: { locale: string };
  searchParams?: { category?: string; city?: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'listings' });

  const selectedTransaction = parseCategoryFilter(searchParams?.category);
  const requestedCity = normalizeLocationInput(searchParams?.city);
  const cityCounts = await getActiveCityCounts(supabase);
  const selectedCity = cityCounts.some((item) => item.city === requestedCity) ? requestedCity : null;
  const listings = await getActiveListings(supabase, {
    transactionType: selectedTransaction,
    city: selectedCity ?? undefined,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-600 mt-2">
            {t('activeListings', { count: listings.length })}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <CategoryFilters
            basePath={`/${locale}/listings`}
            selectedTransactionType={selectedTransaction}
            selectedCity={selectedCity}
            labels={{
              all: t('filterAll'),
              longTermRent: t('filterLongTermRent'),
              shortTermRent: t('filterShortTermRent'),
              sale: t('filterSale'),
            }}
          />
          <CityCombobox
            cityCounts={cityCounts}
            selectedCity={selectedCity}
            locale={locale}
            labels={{
              city: t('city'),
              placeholder: t('cityPlaceholder'),
              noResults: t('cityNoResults'),
              hint: t('cityHint'),
              clear: t('cityClear'),
            }}
          />
        </div>

        <ListingGrid
          locale={locale}
          listings={listings}
          locationFallback={t('locationNotSpecified')}
          showAddButton={!!user}
          emptyState={{
            title: t('noListings'),
            description: t('noListingsDescription'),
            addFirstListing: t('addFirstListing'),
          }}
        />
      </main>
    </div>
  );
}

