'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import type { ListingPhotoFilenameFields, PhotoItem } from './PhotoUpload';
import { createClient } from '@/lib/supabase/client';

function LoadingMap() {
  const tMap = useTranslations('createListing.map');
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">{tMap('loading')}</div>
    </div>
  );
}

function LoadingPhotos() {
  const tCommon = useTranslations('common');
  return (
    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">{tCommon('loading')}</div>
    </div>
  );
}

// Dynamiczny import LocationPicker (tylko po stronie klienta)
const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <LoadingMap />
});

// Dynamiczny import PhotoUpload (tylko po stronie klienta)
const PhotoUpload = dynamic(() => import('./PhotoUpload'), {
  ssr: false,
  loading: () => <LoadingPhotos />
});

interface FormState {
  description: string;
  price: string;
  city: string;
  zone: string;
  address: string;
  latitude: number;
  longitude: number;
  transactionType: 'sale' | 'rent_long' | 'rent_short';
  propertyType: 'apartment' | 'house' | 'room' | 'studio';
  size_m2: string;
  rooms: string;
  bathrooms: string;
}

const TRANSACTION_TYPE_ORDER: FormState['transactionType'][] = [
  'rent_long',
  'rent_short',
  'sale',
];

const TRANSACTION_TYPE_LABEL_KEY: Record<
  FormState['transactionType'],
  'categoryLongTermRent' | 'categoryShortTermRent' | 'categorySale'
> = {
  rent_long: 'categoryLongTermRent',
  rent_short: 'categoryShortTermRent',
  sale: 'categorySale',
};

const PROPERTY_OPTIONS: { value: FormState['propertyType']; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'room', label: 'Room' },
  { value: 'studio', label: 'Studio' },
];

function getInitialFormState(initialData?: Partial<FormState>): FormState {
  return {
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    city: initialData?.city ?? '',
    zone: initialData?.zone ?? '',
    address: initialData?.address ?? '',
    latitude: initialData?.latitude ?? 40.4168,
    longitude: initialData?.longitude ?? -3.7038,
    transactionType: initialData?.transactionType ?? 'rent_long',
    propertyType: initialData?.propertyType ?? 'apartment',
    size_m2: initialData?.size_m2 ?? '',
    rooms: initialData?.rooms ?? '0',
    bathrooms: initialData?.bathrooms ?? '0',
  };
}

interface ExistingPhoto {
  id: string;
  display_path: string;
  display_url: string;
  thumb_path: string;
  thumb_url: string;
  order_index: number;
}

interface CreateListingFormProps {
  listingId?: string;
  initialData?: Partial<FormState>;
  initialPhotos?: ExistingPhoto[];
  isEditMode?: boolean;
}

interface CityOption {
  name: string;
  comarca: string;
  lat: number;
  lng: number;
}

function normalizeCityName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export default function CreateListingForm({ 
  listingId, 
  initialData,
  initialPhotos = [],
  isEditMode = false 
}: CreateListingFormProps = {}) {
  const router = useRouter();
  const t = useTranslations('createListing.form');
  const tValidation = useTranslations('createListing.validation');
  const tPhoto = useTranslations('photoUpload');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [formData, setFormData] = useState<FormState>(() => getInitialFormState(initialData));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(initialPhotos);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // --- City combobox state ---
  const [cityQuery, setCityQuery] = useState(initialData?.city || '');
  const [cityOpen, setCityOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [isNewCity, setIsNewCity] = useState(false);
  const cityListRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('cities')
      .select('name, comarca, lat, lng')
      .eq('status', 'approved')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setCitiesError(error.message);
        } else {
          setCities(data ?? []);
        }
        setIsLoadingCities(false);
      });
  }, []);

  // Client-side filtering: match against city name or comarca
  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.comarca.toLowerCase().includes(q),
    );
  }, [cities, cityQuery]);

  const priceFieldLabel = useMemo(() => {
    switch (formData.transactionType) {
      case 'sale':
        return t('priceLabelSale');
      case 'rent_long':
        return t('priceLabelRentLong');
      case 'rent_short':
        return t('priceLabelRentShort');
    }
  }, [formData.transactionType, t]);

  const priceFieldHelper = useMemo(() => {
    switch (formData.transactionType) {
      case 'sale':
        return t('priceHelperSale');
      case 'rent_long':
        return t('priceHelperRentLong');
      case 'rent_short':
        return t('priceHelperRentShort');
    }
  }, [formData.transactionType, t]);

  const normalizedQuery = useMemo(() => normalizeCityName(cityQuery), [cityQuery]);

  const canUploadPhotos = useMemo(() => {
    if (!formData.transactionType || !formData.propertyType) {
      return false;
    }
    if (!formData.city.trim()) {
      return false;
    }
    const roomsTrim = formData.rooms.trim();
    if (roomsTrim === '') {
      return false;
    }
    const rooms = Number(roomsTrim);
    if (!Number.isFinite(rooms) || !Number.isInteger(rooms) || rooms < 0) {
      return false;
    }
    const sizeTrim = formData.size_m2.trim();
    if (sizeTrim === '') {
      return false;
    }
    const sizeM2 = Number(sizeTrim);
    if (!Number.isFinite(sizeM2) || sizeM2 <= 0) {
      return false;
    }
    return true;
  }, [
    formData.transactionType,
    formData.propertyType,
    formData.city,
    formData.rooms,
    formData.size_m2,
  ]);

  const photoFilenameFields = useMemo((): ListingPhotoFilenameFields | null => {
    if (!canUploadPhotos) {
      return null;
    }
    return {
      transactionType: formData.transactionType,
      propertyType: formData.propertyType,
      city: formData.city.trim(),
      rooms: Number(formData.rooms),
      sizeM2: Number(formData.size_m2),
    };
  }, [
    canUploadPhotos,
    formData.transactionType,
    formData.propertyType,
    formData.city,
    formData.rooms,
    formData.size_m2,
  ]);

  // Show "Add new" option when the normalized name doesn't exactly match any existing city
  const showAddNew = useMemo(() => {
    if (normalizedQuery.length < 2) return false;
    const lower = normalizedQuery.toLowerCase();
    return !cities.some((c) => c.name.toLowerCase() === lower);
  }, [cities, normalizedQuery]);

  // Total interactive items in the dropdown (filtered cities + optional "add new" button)
  const totalItems = filteredCities.length + (showAddNew ? 1 : 0);

  // Clamp highlight index when the list shrinks so it never points beyond the last item
  useEffect(() => {
    setHighlightIdx((prev) => {
      if (totalItems === 0) return -1;
      if (prev < 0) return -1;
      return Math.min(prev, totalItems - 1);
    });
  }, [totalItems]);

  // Scroll the highlighted item into view
  useEffect(() => {
    if (highlightIdx < 0 || !cityListRef.current) return;
    const el = cityListRef.current.children[highlightIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  const selectCity = useCallback((city: CityOption) => {
    setFormData((prev) => ({
      ...prev,
      city: city.name,
      latitude: city.lat,
      longitude: city.lng,
    }));
    setCityQuery(city.name);
    setCityOpen(false);
    setIsNewCity(false);
  }, []);

  // Select a user-typed city that doesn't exist in the approved list.
  // Runs through normalizeCityName and re-checks against the approved list
  // to prevent duplicates caused by casing differences (e.g. "barcelona" → Barcelona).
  const selectNewCity = useCallback((raw: string) => {
    const name = normalizeCityName(raw);
    const match = cities.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) {
      selectCity(match);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      city: name,
      // Keep existing lat/lng if valid; otherwise fall back to Catalonia centroid
      latitude: Number.isFinite(prev.latitude) ? prev.latitude : 41.5912,
      longitude: Number.isFinite(prev.longitude) ? prev.longitude : 1.5209,
    }));
    setCityQuery(name);
    setCityOpen(false);
    setIsNewCity(true);
  }, [cities, selectCity]);

  const handleCityKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!cityOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setCityOpen(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightIdx((i) => Math.min(i + 1, totalItems - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightIdx((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIdx >= 0 && highlightIdx < filteredCities.length) {
            selectCity(filteredCities[highlightIdx]);
          } else if (highlightIdx === filteredCities.length && showAddNew) {
            selectNewCity(normalizedQuery);
          }
          break;
        case 'Escape':
          setCityOpen(false);
          setCityQuery(formData.city);
          break;
      }
    },
    [cityOpen, filteredCities, totalItems, highlightIdx, selectCity, selectNewCity, showAddNew, normalizedQuery, formData.city],
  );

  const handleCityBlur = useCallback(() => {
    // Delay to allow click on the dropdown to register
    window.setTimeout(() => {
      setCityOpen(false);
      // Revert to the selected city if the typed text doesn't match
      if (cityQuery !== formData.city) {
        setCityQuery(formData.city);
      }
    }, 150);
  }, [cityQuery, formData.city]);

  const combinedAddress = [formData.city, formData.zone, formData.address]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(', ');

  /**
   * Obsługa zmiany lokalizacji na mapie
   */
  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  /**
   * Obsługa usuwania istniejącego zdjęcia (w trybie edycji)
   */
  const handleDeleteExistingPhoto = (photoId: string) => {
    // Dodaj do listy usuniętych (zostanie usunięte z bazy przy zapisie)
    setDeletedPhotoIds(prev => [...prev, photoId]);
    // Usuń z widoku (optymistyczna aktualizacja UI)
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  /**
   * Obsługa wysłania formularza
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!formData.city.trim()) {
      setError(tValidation('cityRequired'));
      setIsSubmitting(false);
      return;
    }

    const priceTrim = formData.price.trim();
    if (!/^\d+$/.test(priceTrim)) {
      setError('Price must be a positive whole number (EUR).');
      setIsSubmitting(false);
      return;
    }
    const priceInt = parseInt(priceTrim, 10);
    if (priceInt <= 0) {
      setError('Price must be a positive whole number (EUR).');
      setIsSubmitting(false);
      return;
    }
    const sizeM2 = Number(formData.size_m2);
    if (!Number.isFinite(sizeM2) || sizeM2 <= 0) {
      setError('Size (m²) must be greater than zero.');
      setIsSubmitting(false);
      return;
    }
    const rooms = Number(formData.rooms);
    if (!Number.isFinite(rooms) || !Number.isInteger(rooms) || rooms < 0) {
      setError('Rooms must be a non-negative whole number.');
      setIsSubmitting(false);
      return;
    }
    const bathrooms = Number(formData.bathrooms);
    if (!Number.isFinite(bathrooms) || bathrooms < 0) {
      setError('Bathrooms must be zero or greater.');
      setIsSubmitting(false);
      return;
    }
    const descTrim = formData.description.trim();
    if (descTrim.length > 500) {
      setError('Description must be at most 500 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      // If the user typed a city not in the approved list, create it as pending.
      // Re-check against approved cities at submit time to prevent duplicates.
      let resolvedIsNew = isNewCity;
      if (resolvedIsNew) {
        const cityName = normalizeCityName(formData.city);
        const approvedMatch = cities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase(),
        );
        if (approvedMatch) {
          // Silently downgrade: the city exists, just use it
          resolvedIsNew = false;
          setFormData((prev) => ({
            ...prev,
            city: approvedMatch.name,
            latitude: approvedMatch.lat,
            longitude: approvedMatch.lng,
          }));
          setIsNewCity(false);
        }
      }

      if (resolvedIsNew) {
        const lat = formData.latitude;
        const lng = formData.longitude;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setError(tValidation('invalidCoordinates') ?? 'Invalid coordinates. Please set the location on the map.');
          setIsSubmitting(false);
          return;
        }

        const supabase = createClient();
        const { error: rpcError } = await supabase.rpc('create_pending_city', {
          p_name: normalizeCityName(formData.city),
          p_comarca: 'Pending',
          p_comarca_code: 0,
          p_lat: lat,
          p_lng: lng,
        });
        if (rpcError) {
          throw new Error(rpcError.message);
        }
      }

      // Sprawdzenie czy wszystkie zdjęcia są uploadowane
      const pendingPhotos = photos.filter(p => p.status !== 'done' && p.status !== 'error');
      if (pendingPhotos.length > 0) {
        setError(tValidation('photosUploading'));
        setIsSubmitting(false);
        return;
      }

      const uploadedPhotos = photos.filter(p => p.status === 'done' && p.displayPath);

      const v1Payload = {
        transactionType: formData.transactionType,
        propertyType: formData.propertyType,
        price: priceInt,
        size_m2: sizeM2,
        rooms,
        bathrooms,
        city: formData.city.trim(),
        zone: formData.zone.trim() || null,
        address: formData.address.trim() || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        description: descTrim.length > 0 ? descTrim : null,
      };

      let resultListingId: string | undefined;

      if (isEditMode) {
        const response = await fetch(`/api/listings/${listingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v1Payload),
        });
        resultListingId = listingId;
        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error((errBody as { message?: string }).message || tValidation('submitFailed'));
        }
        await response.json().catch(() => null);
      } else {
        const createResponse = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(v1Payload),
        });
        if (!createResponse.ok) {
          const errBody = await createResponse.json().catch(() => ({}));
          throw new Error((errBody as { message?: string }).message || tValidation('submitFailed'));
        }
        const data = (await createResponse.json()) as { listing_id?: string };
        resultListingId = data.listing_id;
      }
      
      // Operacje na zdjęciach
      if (resultListingId) {
        // W trybie edycji: usuń zdjęcia oznaczone do usunięcia
        if (isEditMode && deletedPhotoIds.length > 0) {
          for (const photoId of deletedPhotoIds) {
            try {
              await fetch(`/api/listings/${resultListingId}/photos?photo_id=${photoId}`, {
                method: 'DELETE',
              });
            } catch (photoError) {
              console.error('Error deleting photo:', photoError);
              // Kontynuujemy mimo błędu
            }
          }
        }

        // Zapisz metadane nowych zdjęć w bazie
        if (uploadedPhotos.length > 0) {
          // Oblicz startowy indeks dla nowych zdjęć
          // W trybie edycji: existingPhotos.length już uwzględnia usunięte (zostały usunięte ze stanu)
          const startIndex = isEditMode ? existingPhotos.length : 0;

          for (let i = 0; i < uploadedPhotos.length; i++) {
            const photo = uploadedPhotos[i];
            try {
              await fetch(`/api/listings/${resultListingId}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  display_path: photo.displayPath,
                  display_url: photo.displayUrl,
                  thumb_path: photo.thumbPath,
                  thumb_url: photo.thumbUrl,
                  order_index: startIndex + i,
                }),
              });
            } catch (photoError) {
              console.error('Error saving photo metadata:', photoError);
              // Kontynuujemy mimo błędu - ogłoszenie zostało utworzone/zaktualizowane
            }
          }
        }
      }
      
      // Przekierowanie do szczegółów ogłoszenia
      router.push(`/${locale}/listings/${resultListingId}`);
      router.refresh();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || tCommon('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <div>
        <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-2">
          Transaction <span className="text-slate-400">({t('required')})</span>
        </label>
        <select
          id="transactionType"
          value={formData.transactionType}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              transactionType: e.target.value as FormState['transactionType'],
            }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        >
          {TRANSACTION_TYPE_ORDER.map((value) => (
            <option key={value} value={value}>
              {t(TRANSACTION_TYPE_LABEL_KEY[value])}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
          Property type <span className="text-slate-400">({t('required')})</span>
        </label>
        <select
          id="propertyType"
          value={formData.propertyType}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              propertyType: e.target.value as FormState['propertyType'],
            }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        >
          {PROPERTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          {priceFieldLabel}{' '}
          <span className="text-slate-400">({t('required')})</span>
        </label>
        <input
          type="number"
          id="price"
          inputMode="numeric"
          value={formData.price}
          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. 220000"
          step={1}
          min={1}
          required
        />
        <p className="mt-1 text-sm text-slate-500">{priceFieldHelper}</p>
      </div>

      <div>
        <label htmlFor="size_m2" className="block text-sm font-medium text-gray-700 mb-2">
          Size (m²) <span className="text-slate-400">({t('required')})</span>
        </label>
        <input
          type="number"
          id="size_m2"
          value={formData.size_m2}
          onChange={(e) => setFormData((prev) => ({ ...prev, size_m2: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. 80"
          step="any"
          min={0.01}
          required
        />
      </div>

      <div>
        <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-2">
          Rooms <span className="text-slate-400">({t('required')})</span>
        </label>
        <input
          type="number"
          id="rooms"
          value={formData.rooms}
          onChange={(e) => setFormData((prev) => ({ ...prev, rooms: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="0"
          step={1}
          min={0}
          required
        />
      </div>

      <div>
        <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
          Bathrooms <span className="text-slate-400">({t('required')})</span>
        </label>
        <input
          type="number"
          id="bathrooms"
          value={formData.bathrooms}
          onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="0"
          step="any"
          min={0}
          required
        />
      </div>

      {/* Lokalizacja tekstowa — searchable city combobox */}
      <div className="relative">
        <label htmlFor="city-combobox" className="block text-sm font-medium text-gray-700 mb-2">
          {t('city')} <span className="text-slate-400">({t('required')})</span>
        </label>
        <input
          ref={cityInputRef}
          id="city-combobox"
          type="text"
          role="combobox"
          aria-expanded={cityOpen}
          aria-autocomplete="list"
          aria-controls="city-listbox"
          autoComplete="off"
          value={cityQuery}
          placeholder={isLoadingCities ? 'Loading cities…' : t('cityPlaceholder')}
          disabled={isLoadingCities}
          onFocus={() => setCityOpen(true)}
          onBlur={handleCityBlur}
          onKeyDown={handleCityKeyDown}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setCityOpen(true);
            if (formData.city) {
              setFormData((prev) => ({ ...prev, city: '' }));
              setIsNewCity(false);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
        />

        {/* Dropdown list — filtered client-side from already-loaded cities */}
        {cityOpen && !isLoadingCities && (
          <div
            ref={cityListRef}
            id="city-listbox"
            role="listbox"
            className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {filteredCities.map((city, idx) => (
              <button
                key={city.name}
                type="button"
                role="option"
                aria-selected={idx === highlightIdx}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCity(city)}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`w-full px-4 py-2.5 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                  idx === highlightIdx ? 'bg-primary-50 text-primary-900' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-900">{city.name}</span>{' '}
                <span className="text-sm text-gray-500">({city.comarca})</span>
              </button>
            ))}

            {/* "Add new city" option — shown when no exact match exists */}
            {showAddNew && (
              <button
                type="button"
                role="option"
                aria-selected={highlightIdx === filteredCities.length}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectNewCity(normalizedQuery)}
                onMouseEnter={() => setHighlightIdx(filteredCities.length)}
                className={`w-full px-4 py-2.5 text-left transition-colors border-t border-gray-200 ${
                  highlightIdx === filteredCities.length
                    ? 'bg-primary-50 text-primary-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-primary-600 font-medium">+ {t('cityAddNew', { name: normalizedQuery })}</span>
              </button>
            )}

            {filteredCities.length === 0 && !showAddNew && (
              <div className="px-4 py-3 text-sm text-gray-500">
                {t('cityNoResults')}
              </div>
            )}
          </div>
        )}

        {citiesError && (
          <p className="mt-1 text-sm text-red-600">{citiesError}</p>
        )}
      </div>

      <div>
        <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
          {t('zone')} <span className="text-slate-400">({t('optional')})</span>
        </label>
        <input
          type="text"
          id="zone"
          value={formData.zone}
          onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={t('zonePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          {t('addressLine')} <span className="text-slate-400">({t('optional')})</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t('addressLinePlaceholder')}
          />
        </div>
      </div>

      {/* Mapa — renders only after a city has been selected with valid coordinates.
         key={formData.city} forces MapContainer to remount and recenter on the new centroid. */}
      {formData.city && Number.isFinite(formData.latitude) && Number.isFinite(formData.longitude) ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('locationOnMap')} <span className="text-slate-400">({t('required')})</span>
          </label>
          <LocationPicker
            key={formData.city}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
            address={combinedAddress}
          />
        </div>
      ) : (
        <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-400 text-sm">{t('city')} — {t('required')}</p>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          {t('description')} <span className="text-slate-400">({t('optional')})</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={6}
          maxLength={500}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
          placeholder={t('descriptionPlaceholder')}
        />
        <p className="mt-1 text-sm text-slate-500">{formData.description.length}/500</p>
      </div>

      {/* Zdjęcia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('photos')}
        </label>

        {/* Istniejące zdjęcia (tylko w trybie edycji) */}
        {isEditMode && existingPhotos.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              {tCommon('existing')}: {existingPhotos.length}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {existingPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
                >
                  <img
                    src={photo.thumb_url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Order number */}
                  <div className="absolute bottom-2 left-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{index + 1}</span>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(tCommon('confirmDelete') || 'Are you sure you want to delete this photo?')) {
                        handleDeleteExistingPhoto(photo.id);
                      }
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Komponent do dodawania nowych zdjęć */}
        <PhotoUpload
          listingId={null}
          maxPhotos={10 - existingPhotos.length}
          onPhotosChange={setPhotos}
          canUploadPhotos={canUploadPhotos}
          photoFilenameFields={photoFilenameFields}
        />
        {photos.length > 0 && photos.some(p => p.status === 'error') && (
          <p className="mt-2 text-sm text-red-600">
            {tPhoto('somePhotosFailed')}
          </p>
        )}
      </div>

      {/* Błąd formularza */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Przyciski */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg"
        >
          {isEditMode 
            ? (isSubmitting ? t('updating') : t('update'))
            : (isSubmitting ? t('submitting') : t('submit'))
          }
        </button>
        
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          {tCommon('cancel')}
        </button>
      </div>
    </form>
  );
}

