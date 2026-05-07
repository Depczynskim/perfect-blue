import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { parseLocation } from '@/lib/map/parseLocation';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const { locale, id } = params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'createListing' });

  // Sprawdź czy użytkownik jest zalogowany
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Pobierz ogłoszenie
  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      `
      id,
      description,
      price,
      transaction_type,
      property_type,
      size_m2,
      rooms,
      bathrooms,
      address_text,
      city,
      zone,
      location,
      owner_id
    `,
    )
    .eq('id', id)
    .single();

  if (error || !listing) {
    notFound();
  }

  // Sprawdź czy użytkownik jest właścicielem
  if (listing.owner_id !== user.id) {
    redirect(`/${locale}/listings/${id}`);
  }

  // Pobierz istniejące zdjęcia
  const { data: photos } = await supabase
    .from('listing_photos')
    .select('id, display_path, display_url, thumb_path, thumb_url, order_index')
    .eq('listing_id', id)
    .order('order_index', { ascending: true });

  // Parsuj lokalizację z PostGIS (GeoJSON lub WKT)
  const parsedLocation = parseLocation(listing.location);
  const latitude = parsedLocation?.latitude ?? 40.4168; // fallback Madrid, Spain
  const longitude = parsedLocation?.longitude ?? -3.7038;

  const initialData = {
    description: listing.description ?? '',
    price: String(listing.price),
    transactionType: listing.transaction_type as 'sale' | 'rent_long' | 'rent_short',
    propertyType: listing.property_type as 'apartment' | 'house' | 'room' | 'studio',
    size_m2: listing.size_m2 != null ? String(listing.size_m2) : '',
    rooms: listing.rooms != null ? String(Math.round(Number(listing.rooms))) : '0',
    bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : '0',
    address: listing.address_text || '',
    city: listing.city || '',
    zone: listing.zone || '',
    latitude,
    longitude,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('editTitle')}</h1>
          <p className="text-slate-600 mt-2">{t('editDescription')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <CreateListingForm 
            listingId={id}
            initialData={initialData}
            initialPhotos={photos || []}
            isEditMode={true}
          />
        </div>
      </main>
    </div>
  );
}
