import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';
import { NotFoundError, ForbiddenError, handleApiError, requireAuth } from '@/lib/api';
import { locales } from '@/i18n';
import { generateListingTitle } from '@/lib/listings/generateListingTitle';
import { parseV1ListingPayload } from '@/lib/listings/parseV1ListingPayload';

/**
 * GET /api/listings/[id]
 * 
 * Pobiera szczegóły pojedynczego ogłoszenia
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const { id } = params;

    // Pobierz ogłoszenie (RLS sprawdzi czy użytkownik ma dostęp)
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        currency,
        transaction_type,
        property_type,
        size_m2,
        rooms,
        bathrooms,
        address_text,
        city,
        zone,
        location,
        status,
        created_at,
        owner_id
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Listing not found');
      }
      throw new Error(`Failed to fetch listing: ${error.message}`);
    }

    return NextResponse.json({ listing: data });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/listings/[id]
 * 
 * Aktualizuje ogłoszenie (tylko właściciel)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);
    const { id } = params;

    // Sprawdź czy użytkownik jest właścicielem
    const { data: existing, error: fetchError } = await supabase
      .from('listings')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError('Listing not found');
      }
      throw new Error(`Failed to fetch listing: ${fetchError.message}`);
    }

    if (existing.owner_id !== user.id) {
      throw new ForbiddenError('You can only edit your own listings');
    }

    const body = (await request.json()) as Record<string, unknown>;
    const { city_id, ...rest } = body;
    const parsed = parseV1ListingPayload(rest);

    const title = generateListingTitle(
      parsed.propertyType,
      parsed.cityValue,
      parsed.sizeM2,
      parsed.price,
      parsed.transactionType,
    );

    const updateData: Record<string, unknown> = {
      title,
      description: parsed.description,
      price: parsed.price,
      currency: 'EUR',
      transaction_type: parsed.transactionType,
      property_type: parsed.propertyType,
      size_m2: parsed.sizeM2,
      rooms: parsed.rooms,
      bathrooms: parsed.bathrooms,
      city: parsed.cityValue,
      zone: parsed.zoneValue,
      address_text: parsed.addressValue,
      location: `POINT(${parsed.longitude} ${parsed.latitude})`,
    };

    if (Object.prototype.hasOwnProperty.call(body, 'city_id')) {
      updateData.city_id = city_id ?? null;
    }

    // Aktualizuj ogłoszenie
    const { data, error } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update listing: ${error.message}`);
    }

    locales.forEach((locale) => {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/listings/${id}`);
      revalidatePath(`/${locale}/listings`);
    });

    return NextResponse.json({ listing: data });

  } catch (error) {
    return handleApiError(error);
  }
}

