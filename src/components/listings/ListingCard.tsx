'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatListingDisplayPrice, formatListingLocation, type ListingCardItem } from '@/lib/listings';
import type { ListingPropertyType } from '@/lib/supabase/types';
import { parseLocation } from '@/lib/map/parseLocation';
import ListingCardMapPreview from './ListingCardMapPreview';

interface ListingCardProps {
  listing: ListingCardItem;
  locale: string;
  locationFallback: string;
}

const isRealHoverDevice = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

function buildListingCardDetailsLine(listing: ListingCardItem, t: CardTranslate): string | null {
  const parts: string[] = [];

  const pt = listing.property_type;
  const typeKey = pt ? PROPERTY_TYPE_KEYS[pt] : undefined;
  if (typeKey) {
    parts.push(t(typeKey));
  }

  const sizeM2 = toFiniteNumber(listing.size_m2);
  if (sizeM2 != null && sizeM2 > 0) {
    const display = Number.isInteger(sizeM2) ? String(sizeM2) : String(sizeM2);
    parts.push(`${display} m²`);
  }

  const rooms = toFiniteNumber(listing.rooms);
  if (rooms != null && rooms >= 0) {
    parts.push(t('roomsCount', { count: Math.round(rooms) }));
  }

  const bathrooms = toFiniteNumber(listing.bathrooms);
  if (bathrooms != null && bathrooms >= 0) {
    parts.push(t('bathroomsCount', { count: Math.round(bathrooms) }));
  }

  if (parts.length === 0) return null;
  return parts.join(' · ');
}

/**
 * Single listing card with desktop-only hover map preview on the location row
 * and per-card photo gallery (desktop hover arrows + touch swipe).
 */
export default function ListingCard({ listing, locale, locationFallback }: ListingCardProps) {
  const t = useTranslations('listings.card');
  const [mapVisible, setMapVisible] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [imageHovered, setImageHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const parsedLocation = parseLocation(listing.location);
  const hasCoords = !!parsedLocation;

  const photos = listing.photoUrls;
  const hasMultiplePhotos = photos.length > 1;
  const currentPhotoUrl = photos[photoIndex] ?? listing.thumbnailUrl;
  const detailsLine = useMemo(() => buildListingCardDetailsLine(listing, t), [listing, t]);

  const displayPrice = useMemo(
    () =>
      formatListingDisplayPrice({
        price: listing.price,
        currency: listing.currency,
        locale,
        transactionType: listing.transaction_type,
        suffixes: {
          perMonth: t('priceSuffixPerMonth'),
          perNight: t('priceSuffixPerNight'),
        },
      }),
    [listing.price, listing.currency, listing.transaction_type, locale, t],
  );

  const goPrev = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => setPhotoIndex((i) => (i + 1) % photos.length);

  const handleLocationMouseEnter = () => {
    if (!hasCoords) return;
    if (!isRealHoverDevice()) return;
    setMapVisible(true);
  };

  const handleCardMouseLeave = () => {
    setMapVisible(false);
    setImageHovered(false);
  };

  const handleImageMouseEnter = () => {
    if (!hasMultiplePhotos) return;
    if (!isRealHoverDevice()) return;
    setImageHovered(true);
  };

  const handleImageMouseLeave = () => {
    setImageHovered(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiplePhotos) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    delta < 0 ? goNext() : goPrev();
  };

  const handleArrowClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div
      className="relative"
      style={{ zIndex: mapVisible ? 10 : undefined }}
      onMouseLeave={handleCardMouseLeave}
    >
      <Link
        href={`/${locale}/listings/${listing.id}`}
        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200"
      >
        <div
          className="relative aspect-[4/3] bg-gray-100"
          onMouseEnter={handleImageMouseEnter}
          onMouseLeave={handleImageMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt={listing.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          )}

          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                aria-label={t('ariaPreviousPhoto')}
                onClick={(e) => handleArrowClick(e, goPrev)}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white transition-opacity duration-200 ${
                  imageHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                aria-label={t('ariaNextPhoto')}
                onClick={(e) => handleArrowClick(e, goNext)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 text-white transition-opacity duration-200 ${
                  imageHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-medium tabular-nums select-none">
                {photoIndex + 1}/{photos.length}
              </div>
            </>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="text-2xl font-bold text-primary-600 tabular-nums">
            {displayPrice}
          </div>
          {detailsLine ? (
            <p className="text-sm text-slate-600 line-clamp-2">{detailsLine}</p>
          ) : null}
          <div className="flex items-center gap-1 text-sm text-slate-500 pt-0.5">
            <span
              className={
                hasCoords
                  ? 'group p-0.5 -m-0.5 rounded transition-colors'
                  : undefined
              }
              onMouseEnter={handleLocationMouseEnter}
            >
              <svg
                className={`w-4 h-4 flex-shrink-0 text-primary-600 ${hasCoords ? 'transition-colors group-hover:text-primary-700' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="line-clamp-1">{formatListingLocation(listing) || locationFallback}</span>
          </div>
        </div>
      </Link>

      {mapVisible && parsedLocation && (
        <ListingCardMapPreview latitude={parsedLocation.latitude} longitude={parsedLocation.longitude} />
      )}
    </div>
  );
}
