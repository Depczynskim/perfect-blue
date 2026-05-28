import { getSiteUrl } from '@/lib/siteUrl';
import type { ListingDetailPhoto, ListingDetailRow } from './getListingDetailData';

const SCHEMA_CONTEXT = 'https://schema.org';
const AVAILABILITY_IN_STOCK = 'https://schema.org/InStock';

function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function collectDisplayPhotoUrls(photos: ListingDetailPhoto[]): string[] {
  const urls: string[] = [];
  for (const photo of photos) {
    const url = photo.display_url?.trim();
    if (url) {
      urls.push(url);
    }
  }
  return urls;
}

function resolvePriceCurrency(currency: string | null | undefined): string {
  const normalized = currency?.trim().toUpperCase();
  return normalized || 'EUR';
}

export type ListingJsonLd = Record<string, unknown>;

export function buildListingJsonLd(options: {
  listing: ListingDetailRow;
  photos: ListingDetailPhoto[];
  locale: string;
  id: string;
}): ListingJsonLd | null {
  const { listing, photos, locale, id } = options;

  if (listing.status !== 'active') {
    return null;
  }

  const canonicalUrl = `${getSiteUrl()}/${locale}/listings/${id}`;
  const city = listing.city?.trim();
  const descriptionText = (listing.description ?? '').trim();
  const name = listing.title?.trim() || descriptionText || 'Property listing';
  const description = descriptionText || name;

  const data: ListingJsonLd = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'RealEstateListing',
    name,
    description,
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      price: toFiniteNumber(listing.price) ?? listing.price,
      priceCurrency: resolvePriceCurrency(listing.currency),
      availability: AVAILABILITY_IN_STOCK,
      url: canonicalUrl,
    },
  };

  if (listing.created_at) {
    data.datePosted = listing.created_at;
  }

  const imageUrls = collectDisplayPhotoUrls(photos);
  if (imageUrls.length === 1) {
    data.image = imageUrls[0];
  } else if (imageUrls.length > 1) {
    data.image = imageUrls;
  }

  if (city) {
    data.address = {
      '@type': 'PostalAddress',
      addressLocality: city,
    };
  }

  const sizeM2 = toFiniteNumber(listing.size_m2);
  if (sizeM2 != null && sizeM2 > 0) {
    data.floorSize = {
      '@type': 'QuantitativeValue',
      value: sizeM2,
      unitCode: 'MTK',
    };
  }

  const rooms = toFiniteNumber(listing.rooms);
  if (rooms != null && rooms >= 0) {
    data.numberOfRooms = Math.round(rooms);
  }

  const bathrooms = toFiniteNumber(listing.bathrooms);
  if (bathrooms != null && bathrooms >= 0) {
    data.numberOfBathroomsTotal = Math.round(bathrooms);
  }

  return data;
}
