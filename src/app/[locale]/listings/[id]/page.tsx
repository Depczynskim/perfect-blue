import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';
import { formatDate } from '@/lib/format';
import { parseLocation } from '@/lib/map/parseLocation';
import { formatListingDisplayPrice, formatListingLocation } from '@/lib/listings';
import type { ListingPropertyType, ListingTransactionType } from '@/lib/supabase/types';
import dynamicImport from 'next/dynamic';
import { IconBath, IconBuilding, IconDoor, IconRuler2 } from '@tabler/icons-react';
import DescriptionActions from '@/components/listings/DescriptionActions';

export const dynamic = 'force-dynamic';

const ALLOWED_TRANSLATE_LOCALES = new Set(['pl', 'en', 'es', 'de', 'ar']);

function normalizeTranslateTargetLocale(
  preferred: string | null | undefined,
  routeLocale: string,
  isLoggedIn: boolean,
): string {
  if (
    isLoggedIn &&
    preferred != null &&
    preferred !== '' &&
    ALLOWED_TRANSLATE_LOCALES.has(preferred)
  ) {
    return preferred;
  }
  if (ALLOWED_TRANSLATE_LOCALES.has(routeLocale)) {
    return routeLocale;
  }
  return 'en';
}

function buildGoogleTranslateUrl(description: string, targetLocale: string): string {
  const encoded = encodeURIComponent(description);
  return `https://translate.google.com/?sl=auto&tl=${targetLocale}&text=${encoded}&op=translate`;
}

// Dynamiczny import mapy (bez SSR)
const ListingMap = dynamicImport(
  () => import('@/components/listings/ListingMap'),
  { ssr: false }
);

// Dynamiczny import galerii z lightboxem (bez SSR)
const PhotoGallery = dynamicImport(
  () => import('@/components/listings/PhotoGallery'),
  { ssr: false }
);

// Dynamiczny import przycisku kontaktu (bez SSR - używa client hooks)
const ContactButton = dynamicImport(
  () => import('@/components/listings/ContactButton'),
  { ssr: false }
);

const PROPERTY_TYPE_KEYS: Record<
  ListingPropertyType,
  'propertyApartment' | 'propertyHouse' | 'propertyRoom' | 'propertyStudio'
> = {
  apartment: 'propertyApartment',
  house: 'propertyHouse',
  room: 'propertyRoom',
  studio: 'propertyStudio',
};

function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

type CardTranslate = (key: string, values?: { count: number }) => string;

function propertySummaryTypeLine(propertyType: unknown, tCard: CardTranslate): string | null {
  if (propertyType == null || typeof propertyType !== 'string') return null;
  const key = PROPERTY_TYPE_KEYS[propertyType as ListingPropertyType];
  if (!key) return null;
  return tCard(key);
}

/** Use first segment when title repeats size/price after en dash or hyphen (sidebar shows price). */
function listingPageHeadingTitle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return raw;
  const enSegments = trimmed.split(' – ');
  if (enSegments.length > 1) {
    return enSegments[0].trim();
  }
  const hyphenSegments = trimmed.split(' - ');
  if (hyphenSegments.length > 1) {
    return hyphenSegments[0].trim();
  }
  return trimmed;
}

function listingDetailPriceHeadingKey(
  transactionType: ListingTransactionType,
): 'priceHeadingSale' | 'priceHeadingRentLong' | 'priceHeadingRentShort' {
  switch (transactionType) {
    case 'sale':
      return 'priceHeadingSale';
    case 'rent_long':
      return 'priceHeadingRentLong';
    case 'rent_short':
      return 'priceHeadingRentShort';
  }
}

function listingDetailTitleKey(
  transactionType: ListingTransactionType,
): 'titleSale' | 'titleRentLong' | 'titleRentShort' {
  switch (transactionType) {
    case 'sale':
      return 'titleSale';
    case 'rent_long':
      return 'titleRentLong';
    case 'rent_short':
      return 'titleRentShort';
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { locale } = params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'listingDetail' });
  const tCard = await getTranslations({ locale, namespace: 'listings.card' });

  // Pobierz ogłoszenie wraz z danymi właściciela
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      id, title, description, price, currency, transaction_type, property_type, size_m2, rooms, bathrooms,
      address_text, city, zone, location, status, created_at, owner_id
    `)
    .eq('id', params.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Pobierz zdjęcia z nowymi kolumnami (display + thumb)
  const { data: photos } = await supabase
    .from('listing_photos')
    .select('id, display_url, thumb_url, order_index')
    .eq('listing_id', params.id)
    .order('order_index', { ascending: true });

  // Profil przeglądającego: subskrypcja (dla nie-właściciela) + preferowany język (translate)
  let hasSubscription = false;
  let viewerPreferredLocale: string | null = null;
  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_paid, preferred_locale')
      .eq('id', user.id)
      .single();
    viewerPreferredLocale =
      typeof userProfile?.preferred_locale === 'string'
        ? userProfile.preferred_locale
        : null;
    if (user.id !== listing.owner_id) {
      hasSubscription = !!userProfile?.is_paid;
    }
  }

  // Mapowanie zdjęć do formatu dla PhotoGallery
  const galleryPhotos = (photos || [])
    .filter(photo => photo.display_url && photo.thumb_url)
    .map(photo => ({
      id: photo.id,
      displayUrl: photo.display_url!,
      thumbUrl: photo.thumb_url!,
    }));

  // Parsuj lokalizację z PostGIS (GeoJSON lub WKT)
  const parsedLocation = parseLocation(listing.location);
  const latitude = parsedLocation?.latitude ?? 40.4168; // fallback Madrid, Spain
  const longitude = parsedLocation?.longitude ?? -3.7038;

  const isOwner = user?.id === listing.owner_id;
  const listingLocationRaw = formatListingLocation(listing);
  const listingLocation = listingLocationRaw || t('locationNotSpecified');

  const featureTypeDisplay =
    propertySummaryTypeLine(listing.property_type, tCard) ?? '—';

  const sizeM2 = toFiniteNumber(listing.size_m2);
  const featureSizeDisplay =
    sizeM2 != null && sizeM2 > 0
      ? `${Number.isInteger(sizeM2) ? String(sizeM2) : String(sizeM2)} m²`
      : '—';

  const rooms = toFiniteNumber(listing.rooms);
  const featureRoomsDisplay =
    rooms != null && rooms >= 0
      ? String(Math.round(rooms))
      : '—';

  const bathrooms = toFiniteNumber(listing.bathrooms);
  const featureBathroomsDisplay =
    bathrooms != null && bathrooms >= 0
      ? String(Math.round(bathrooms))
      : '—';

  const pageHeadingTitle = listingPageHeadingTitle(listing.title);
  const headingPropertyType = propertySummaryTypeLine(listing.property_type, tCard) ?? t('propertyGeneric');
  const headingTitle = listingLocationRaw
    ? t(listingDetailTitleKey(listing.transaction_type as ListingTransactionType), {
      propertyType: headingPropertyType,
      location: listingLocationRaw,
    })
    : pageHeadingTitle;

  const priceSuffixes = {
    perMonth: tCard('priceSuffixPerMonth'),
    perNight: tCard('priceSuffixPerNight'),
  };
  const displayPrice = formatListingDisplayPrice({
    price: listing.price,
    currency: listing.currency,
    locale,
    transactionType: listing.transaction_type as ListingTransactionType,
    suffixes: priceSuffixes,
  });
  const priceHeading = t(listingDetailPriceHeadingKey(listing.transaction_type as ListingTransactionType));

  const descriptionText = listing.description ?? '';
  const showDescriptionActions = descriptionText.trim().length > 0;
  const translateTargetLocale = normalizeTranslateTargetLocale(
    viewerPreferredLocale,
    locale,
    !!user,
  );
  const translateHref = showDescriptionActions
    ? buildGoogleTranslateUrl(descriptionText, translateTargetLocale)
    : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lewa kolumna - zdjęcia i opis */}
          <div className="lg:col-span-2 space-y-7">
            {/* Galeria zdjęć z lightboxem */}
            <PhotoGallery photos={galleryPhotos} title={headingTitle} />

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{headingTitle}</h1>

            {/* Property summary — feature tiles */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('propertySummary')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 sm:px-4">
                  <div className="flex flex-col items-center text-center justify-center py-2 gap-1.5">
                    <IconBuilding size={32} stroke={1.8} className="text-slate-500" />
                    <div className="text-[11px] font-medium text-slate-500">
                      {t('featureType')}
                    </div>
                    <div className="text-base font-semibold text-slate-900 tabular-nums">
                      {featureTypeDisplay}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 sm:px-4">
                  <div className="flex flex-col items-center text-center justify-center py-2 gap-1.5">
                    <IconRuler2 size={32} stroke={1.8} className="text-slate-500" />
                    <div className="text-[11px] font-medium text-slate-500">
                      {t('featureSize')}
                    </div>
                    <div className="text-base font-semibold text-slate-900 tabular-nums">
                      {featureSizeDisplay}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 sm:px-4">
                  <div className="flex flex-col items-center text-center justify-center py-2 gap-1.5">
                    <IconDoor size={32} stroke={1.8} className="text-slate-500" />
                    <div className="text-[11px] font-medium text-slate-500">
                      {t('featureRooms')}
                    </div>
                    <div className="text-lg font-semibold text-slate-900 tabular-nums leading-tight">
                      {featureRoomsDisplay}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 sm:px-4">
                  <div className="flex flex-col items-center text-center justify-center py-2 gap-1.5">
                    <IconBath size={32} stroke={1.8} className="text-slate-500" />
                    <div className="text-[11px] font-medium text-slate-500">
                      {t('featureBathrooms')}
                    </div>
                    <div className="text-lg font-semibold text-slate-900 tabular-nums leading-tight">
                      {featureBathroomsDisplay}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Opis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="min-w-0 text-xl font-semibold text-slate-900">
                  {t('description')}
                </h2>
                {showDescriptionActions && (
                  <DescriptionActions
                    translateHref={translateHref}
                    translateLabel={t('translateDescription')}
                  />
                )}
              </div>
              <div className="max-w-none text-slate-700 leading-relaxed">
                <p>{listing.description}</p>
              </div>
            </div>

            {/* Lokalizacja */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('location')}</h2>
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{listingLocation}</span>
              </div>
              <div className="h-80 rounded-lg overflow-hidden border border-slate-200">
                <ListingMap latitude={latitude} longitude={longitude} />
              </div>
            </div>
          </div>

          {/* Prawa kolumna - cena i kontakt */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-slate-500 mb-1">{priceHeading}</div>
                <div className="text-3xl font-bold text-primary-600 tabular-nums">
                  {displayPrice}
                </div>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-primary-900 font-medium">
                      {t('yourListing')}
                    </p>
                  </div>
                  <Link
                    href={`/${locale}/listings/${params.id}/edit`}
                    className="block w-full bg-primary-600 text-white text-center px-4 py-3 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    {t('editListing')}
                  </Link>
                </div>
              ) : (
                <ContactButton
                  listingId={params.id}
                  hasAccess={hasSubscription}
                  isLoggedIn={!!user}
                />
              )}

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-500 mb-2">{t('addedOn')}</div>
                <div className="text-slate-900">
                  {formatDate(listing.created_at, locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
