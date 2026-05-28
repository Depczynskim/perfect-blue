import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getSiteUrl } from '@/lib/siteUrl';
import type { ListingPropertyType, ListingTransactionType } from '@/lib/supabase/types';
import { formatListingDisplayPrice } from './formatListingDisplayPrice';
import type { ListingDetailPhoto, ListingDetailRow } from './getListingDetailData';

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

function metaDescriptionKey(
  transactionType: ListingTransactionType,
): 'metaDescriptionSale' | 'metaDescriptionRentLong' | 'metaDescriptionRentShort' {
  switch (transactionType) {
    case 'sale':
      return 'metaDescriptionSale';
    case 'rent_long':
      return 'metaDescriptionRentLong';
    case 'rent_short':
      return 'metaDescriptionRentShort';
  }
}

function resolvePropertyTypeLabel(
  propertyType: unknown,
  tCard: (key: string) => string,
  tDetail: (key: string) => string,
): string {
  if (propertyType != null && typeof propertyType === 'string') {
    const key = PROPERTY_TYPE_KEYS[propertyType as ListingPropertyType];
    if (key) {
      return tCard(key);
    }
  }
  return tDetail('propertyGeneric');
}

function resolveCity(listing: ListingDetailRow): string {
  const city = listing.city?.trim();
  if (city) {
    return city;
  }
  return '';
}

function formatSizeLabel(sizeM2: number | null): string | null {
  if (sizeM2 == null || sizeM2 <= 0) {
    return null;
  }
  const display = Number.isInteger(sizeM2) ? String(Math.round(sizeM2)) : String(sizeM2);
  return `${display} m²`;
}

function truncateDescription(text: string, maxLength = 155): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function firstDisplayPhotoUrl(photos: ListingDetailPhoto[]): string | undefined {
  for (const photo of photos) {
    const url = photo.display_url?.trim();
    if (url) {
      return url;
    }
  }
  return undefined;
}

export async function buildListingDetailMetadata(options: {
  listing: ListingDetailRow;
  photos: ListingDetailPhoto[];
  locale: string;
  id: string;
}): Promise<Metadata> {
  const { listing, photos, locale, id } = options;
  const transactionType = listing.transaction_type as ListingTransactionType;
  const tSeo = await getTranslations({ locale, namespace: 'listingDetail.seo' });
  const tDetail = await getTranslations({ locale, namespace: 'listingDetail' });
  const tCard = await getTranslations({ locale, namespace: 'listings.card' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const propertyTypeLabel = resolvePropertyTypeLabel(listing.property_type, tCard, tDetail);
  const city = resolveCity(listing);

  const rooms = toFiniteNumber(listing.rooms);
  const roomsLabel =
    rooms != null && rooms >= 0
      ? tCard('roomsCount', { count: Math.round(rooms) })
      : null;

  const sizeLabel = formatSizeLabel(toFiniteNumber(listing.size_m2));

  const displayPrice = formatListingDisplayPrice({
    price: listing.price,
    currency: listing.currency,
    locale,
    transactionType,
    suffixes: {
      perMonth: tCard('priceSuffixPerMonth'),
      perNight: tCard('priceSuffixPerNight'),
    },
  });

  const titleSegments: string[] = [];
  if (city) {
    titleSegments.push(
      tSeo('metaTitleLead', {
        propertyType: propertyTypeLabel,
        city,
      }),
    );
  } else {
    titleSegments.push(propertyTypeLabel);
  }
  if (roomsLabel) titleSegments.push(roomsLabel);
  if (sizeLabel) titleSegments.push(sizeLabel);
  titleSegments.push(displayPrice);

  const metaTitle = titleSegments.join(' – ');
  const pageTitle = `${metaTitle} | ${tCommon('appName')}`;

  const specsParts: string[] = [];
  if (roomsLabel) specsParts.push(roomsLabel);
  if (sizeLabel) specsParts.push(sizeLabel);
  const specsSentence = specsParts.length > 0 ? `${specsParts.join(', ')}. ` : '';

  let metaDescription: string;
  if (city) {
    metaDescription = tSeo(metaDescriptionKey(transactionType), {
      propertyType: propertyTypeLabel,
      city,
      specs: specsSentence,
      cta: tSeo('metaDescriptionCta'),
    });
  } else {
    const userDescription = (listing.description ?? '').trim();
    metaDescription = userDescription
      ? truncateDescription(userDescription)
      : tSeo('metaDescriptionFallback', { propertyType: propertyTypeLabel });
  }

  const canonicalUrl = `${getSiteUrl()}/${locale}/listings/${id}`;
  const ogImage = firstDisplayPhotoUrl(photos);
  const isActive = listing.status === 'active';

  const metadata: Metadata = {
    title: pageTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isActive ? undefined : { index: false },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'website',
      locale,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      title: metaTitle,
      description: metaDescription,
      card: ogImage ? 'summary_large_image' : 'summary',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };

  return metadata;
}
