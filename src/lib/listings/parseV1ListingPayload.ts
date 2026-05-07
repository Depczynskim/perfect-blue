import { ValidationError } from '@/lib/api';
import { normalizeLocationInput } from './normalization';

export const VALID_TRANSACTION = ['sale', 'rent_long', 'rent_short'] as const;
export const VALID_PROPERTY = ['apartment', 'house', 'room', 'studio'] as const;

export type V1TransactionType = (typeof VALID_TRANSACTION)[number];
export type V1PropertyType = (typeof VALID_PROPERTY)[number];

function parseFiniteNumber(value: unknown, field: string): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) {
    throw new ValidationError(`${field} must be a valid number`);
  }
  return n;
}

export interface V1ListingParsed {
  transactionType: V1TransactionType;
  propertyType: V1PropertyType;
  price: number;
  sizeM2: number;
  rooms: number;
  bathrooms: number;
  cityValue: string;
  zoneValue: string | null;
  addressValue: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
}

/**
 * Validates the V1 listing JSON body (create / update).
 */
export function parseV1ListingPayload(body: Record<string, unknown>): V1ListingParsed {
  const {
    transactionType,
    propertyType,
    price,
    size_m2: sizeM2Raw,
    rooms: roomsRaw,
    bathrooms: bathroomsRaw,
    city,
    zone,
    address_text,
    address,
    latitude,
    longitude,
    description: descriptionRaw,
  } = body;

  const addressValue = normalizeLocationInput(
    (typeof address_text === 'string' ? address_text : '') ||
      (typeof address === 'string' ? address : ''),
  );

  const cityValue = normalizeLocationInput(typeof city === 'string' ? city : '');
  const zoneValue = normalizeLocationInput(typeof zone === 'string' ? zone : '');

  if (
    !transactionType ||
    typeof transactionType !== 'string' ||
    !VALID_TRANSACTION.includes(transactionType as V1TransactionType)
  ) {
    throw new ValidationError('Valid transactionType is required (sale | rent_long | rent_short)');
  }

  if (
    !propertyType ||
    typeof propertyType !== 'string' ||
    !VALID_PROPERTY.includes(propertyType as V1PropertyType)
  ) {
    throw new ValidationError('Valid propertyType is required');
  }

  if (typeof price !== 'number' || !Number.isInteger(price) || price <= 0) {
    throw new ValidationError('Price must be a positive integer (EUR)');
  }

  const sizeM2 = parseFiniteNumber(sizeM2Raw, 'size_m2');
  if (sizeM2 <= 0) {
    throw new ValidationError('size_m2 must be greater than zero');
  }

  const rooms = parseFiniteNumber(roomsRaw, 'rooms');
  if (!Number.isInteger(rooms) || rooms < 0) {
    throw new ValidationError('rooms must be a non-negative integer');
  }

  const bathrooms = parseFiniteNumber(bathroomsRaw, 'bathrooms');
  if (bathrooms < 0) {
    throw new ValidationError('bathrooms must be >= 0');
  }

  if (!cityValue) {
    throw new ValidationError('City is required');
  }

  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    throw new ValidationError('Invalid latitude');
  }

  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    throw new ValidationError('Invalid longitude');
  }

  let description: string | null = null;
  if (descriptionRaw !== undefined && descriptionRaw !== null) {
    if (typeof descriptionRaw !== 'string') {
      throw new ValidationError('Description must be a string');
    }
    const trimmed = descriptionRaw.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 500) {
        throw new ValidationError('Description must be at most 500 characters');
      }
      description = trimmed;
    }
  }

  return {
    transactionType: transactionType as V1TransactionType,
    propertyType: propertyType as V1PropertyType,
    price,
    sizeM2,
    rooms,
    bathrooms,
    cityValue,
    zoneValue,
    addressValue,
    latitude,
    longitude,
    description,
  };
}
