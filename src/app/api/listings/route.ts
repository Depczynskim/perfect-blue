import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';
import { requireAuth, handleApiError } from '@/lib/api';
import { locales } from '@/i18n';
import { normalizeLocationInput, parseTransactionTypeFilter } from '@/lib/listings';
import { generateListingTitle } from '@/lib/listings/generateListingTitle';
import { parseV1ListingPayload } from '@/lib/listings/parseV1ListingPayload';

/**
 * GET /api/listings
 * 
 * Pobiera listę aktywnych ogłoszeń
 * 
 * Query params:
 *   - page: number (domyślnie 1)
 *   - limit: number (domyślnie 20, max 100)
 *   - category: string (optional; sale | rent_long | rent_short; legacy long_term_rent / short_term_rent accepted)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    const categoryParam = searchParams.get('category');
    const city = normalizeLocationInput(searchParams.get('city'));
    const transactionType = parseTransactionTypeFilter(categoryParam);

    // Pobierz aktywne ogłoszenia (RLS automatycznie filtruje)
    let query = supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        currency,
        transaction_type,
        address_text,
        city,
        zone,
        location,
        status,
        created_at,
        owner_id
      `, { count: 'exact' })
      .eq('status', 'active');

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch listings: ${error.message}`);
    }

    return NextResponse.json({
      listings: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/listings — V1 create payload (transactionType, propertyType, price EUR integer, size_m2, rooms, bathrooms, city, map, optional zone/address/description).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);

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
    const locationWKT = `POINT(${parsed.longitude} ${parsed.latitude})`;

    const { data, error } = await supabase
      .from('listings')
      .insert({
        owner_id: user.id,
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
        location: locationWKT,
        status: 'active',
        ...(Object.prototype.hasOwnProperty.call(body, 'city_id') ? { city_id: city_id ?? null } : {}),
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create listing: ${error.message}`);
    }

    locales.forEach((locale) => {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/listings`);
      revalidatePath(`/${locale}/listings/${data.id}`);
    });

    return NextResponse.json({
      message: 'Listing created successfully',
      listing_id: data.id,
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}

