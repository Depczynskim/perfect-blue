/**
 * API Endpoint: POST /api/listings/[id]/photos
 * 
 * Zapisuje metadane zdjęcia w bazie danych po udanym uploadzie do Supabase Storage.
 * Obsługuje dwie wersje: display (pełne) i thumb (miniatura).
 * 
 * Request body:
 * {
 *   "display_path": "user_id/uuid_display.webp",
 *   "display_url": "https://xxx.supabase.co/storage/v1/object/public/..._display.webp",
 *   "thumb_path": "user_id/uuid_thumb.webp",
 *   "thumb_url": "https://xxx.supabase.co/storage/v1/object/public/..._thumb.webp",
 *   "order_index": 0
 * }
 * 
 * Response (201):
 * {
 *   "message": "Photo added successfully",
 *   "photo_id": "uuid"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireAuth, ValidationError, NotFoundError, ForbiddenError, handleApiError } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);

    // Sprawdzenie czy użytkownik jest właścicielem ogłoszenia
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, owner_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.owner_id !== user.id) {
      throw new ForbiddenError('You are not the owner of this listing');
    }

    // Parsowanie body
    const body = await request.json();
    const { 
      display_path, display_url, 
      thumb_path, thumb_url, 
      order_index = 0 
    } = body;

    // Walidacja - wymagane są obie wersje
    if (!display_path || !display_url) {
      throw new ValidationError('display_path and display_url are required');
    }

    if (!thumb_path || !thumb_url) {
      throw new ValidationError('thumb_path and thumb_url are required');
    }

    // Zapis do bazy danych
    const { data: photo, error: insertError } = await supabase
      .from('listing_photos')
      .insert({
        listing_id: listingId,
        display_path: display_path,
        display_url: display_url,
        thumb_path: thumb_path,
        thumb_url: thumb_url,
        order_index: order_index,
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Failed to save photo metadata: ${insertError.message}`);
    }

    return NextResponse.json(
      {
        message: 'Photo added successfully',
        photo_id: photo.id,
      },
      { status: 201 }
    );

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/listings/[id]/photos
 * 
 * Pobiera listę zdjęć dla ogłoszenia (display + thumb URLs).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;
    const supabase = await createServerClient();

    // Pobierz zdjęcia z nowymi kolumnami
    const { data: photos, error } = await supabase
      .from('listing_photos')
      .select('id, display_path, display_url, thumb_path, thumb_url, order_index, created_at')
      .eq('listing_id', listingId)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch photos: ${error.message}`);
    }

    return NextResponse.json({
      photos: photos || [],
    });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/listings/[id]/photos
 * 
 * Usuwa zdjęcie z ogłoszenia (z bazy i ze storage).
 * Query params: ?photo_id=uuid
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photo_id');

    if (!photoId) {
      throw new ValidationError('photo_id is required');
    }

    const supabase = await createServerClient();
    const user = await requireAuth(supabase);

    // Sprawdzenie czy użytkownik jest właścicielem ogłoszenia
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, owner_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.owner_id !== user.id) {
      throw new ForbiddenError('You are not the owner of this listing');
    }

    // Pobierz dane zdjęcia przed usunięciem (dla ścieżek storage)
    const { data: photo } = await supabase
      .from('listing_photos')
      .select('display_path, thumb_path')
      .eq('id', photoId)
      .eq('listing_id', listingId)
      .single();

    // Usuń zdjęcie z bazy
    const { error: deleteError } = await supabase
      .from('listing_photos')
      .delete()
      .eq('id', photoId)
      .eq('listing_id', listingId);

    if (deleteError) {
      throw new Error(`Failed to delete photo: ${deleteError.message}`);
    }

    // Usuń pliki ze storage (oba: display i thumb)
    const pathsToDelete: string[] = [];
    if (photo?.display_path) pathsToDelete.push(photo.display_path);
    if (photo?.thumb_path) pathsToDelete.push(photo.thumb_path);

    if (pathsToDelete.length > 0) {
      try {
        await supabase.storage
          .from('listing-photos')
          .remove(pathsToDelete);
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Kontynuujemy mimo błędu - rekord w bazie został usunięty
      }
    }

    return NextResponse.json({
      message: 'Photo deleted successfully',
    });

  } catch (error) {
    return handleApiError(error);
  }
}
