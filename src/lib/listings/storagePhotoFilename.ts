/**
 * Builds Supabase Storage object paths for listing photos (display + thumb WebP).
 * Folder prefix must remain `{user_id}/` for storage RLS.
 */

const CITY_SLUG_MAX_LEN = 80;

export interface ListingPhotoStorageFilenameInput {
  userId: string;
  transactionType?: string | null;
  propertyType?: string | null;
  city?: string | null;
  rooms?: number | null;
  sizeM2?: number | null;
}

function transactionTypeSlug(value: string | null | undefined): string {
  switch (value) {
    case 'sale':
      return 'sale';
    case 'rent_long':
      return 'rent-long';
    case 'rent_short':
      return 'rent-short';
    default:
      return 'unknown-transaction';
  }
}

function propertyTypeSlug(value: string | null | undefined): string {
  if (value === 'apartment' || value === 'house' || value === 'room' || value === 'studio') {
    return value;
  }
  return 'unknown-property';
}

/** Slugify city name for URL-safe storage keys (defensive fallbacks). */
export function slugifyCitySegment(raw: string | null | undefined): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) {
    return 'unknown-city';
  }
  const ascii = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, CITY_SLUG_MAX_LEN);
  return slug || 'unknown-city';
}

function roomsSegment(rooms: number | null | undefined): string {
  if (rooms == null || !Number.isFinite(rooms)) {
    return '0br';
  }
  const n = Math.floor(rooms);
  const safe = n >= 0 ? n : 0;
  return `${safe}br`;
}

function sizeSegment(sizeM2: number | null | undefined): string {
  if (sizeM2 == null || !Number.isFinite(sizeM2) || sizeM2 <= 0) {
    return '0m2';
  }
  const rounded = Math.max(1, Math.round(sizeM2));
  return `${rounded}m2`;
}

function shortId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 6);
}

/**
 * Returns `{user_id}/{transaction}-{property}-{city}-{rooms}br-{size}m2-{shortid}_display.webp`
 * (and `_thumb.webp`). Defensive segments apply when inputs are missing; UI should gate uploads
 * so normal flows use real listing fields.
 */
export function buildListingPhotoStoragePaths(
  input: ListingPhotoStorageFilenameInput,
): { displayPath: string; thumbPath: string } {
  const tx = transactionTypeSlug(input.transactionType);
  const prop = propertyTypeSlug(input.propertyType);
  const city = slugifyCitySegment(input.city);
  const rooms = roomsSegment(input.rooms);
  const size = sizeSegment(input.sizeM2);
  const id = shortId();
  const base = `${tx}-${prop}-${city}-${rooms}-${size}-${id}`;
  return {
    displayPath: `${input.userId}/${base}_display.webp`,
    thumbPath: `${input.userId}/${base}_thumb.webp`,
  };
}
