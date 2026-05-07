import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireAuth, checkSubscription, handleApiError, ValidationError } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);

    const body = await request.json();
    const { listing_id, body: messageBody, to_user_id } = body;

    if (!listing_id || !messageBody?.trim()) {
      throw new ValidationError('Brak listing_id lub treści wiadomości');
    }

    // Pobierz ogłoszenie
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, owner_id, title')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    const isOwner = listing.owner_id === user.id;
    
    // Ustal odbiorcę wiadomości
    let recipientId: string;
    
    if (to_user_id) {
      // Odpowiedź w konwersacji - użyj podanego odbiorcy
      recipientId = to_user_id;
    } else {
      // Nowa wiadomość do właściciela
      recipientId = listing.owner_id;
    }

    // Nie można wysłać wiadomości do siebie
    if (recipientId === user.id) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    // Sprawdź uprawnienia:
    // - Właściciel ogłoszenia może odpowiadać BEZ subskrypcji
    // - Inni użytkownicy potrzebują subskrypcji
    if (!isOwner) {
      const hasSubscription = await checkSubscription(supabase, user.id);
      if (!hasSubscription) {
        return NextResponse.json(
          { error: 'You need an active subscription to send messages' },
          { status: 403 }
        );
      }
    }

    // Wyślij wiadomość
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        to_user_id: recipientId,
        listing_id: listing_id,
        body: messageBody.trim(),
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      id: message.id,
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// GET - pobierz wiadomości użytkownika
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'received' or 'sent'

    let query = supabase
      .from('messages')
      .select(`
        id, body, is_read, created_at, from_user_id, to_user_id,
        listing:listings(id, title),
        from_user:users!messages_from_user_id_fkey(id),
        to_user:users!messages_to_user_id_fkey(id)
      `)
      .order('created_at', { ascending: false });

    if (type === 'received') {
      query = query.eq('to_user_id', user.id);
    } else {
      query = query.eq('from_user_id', user.id);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });

  } catch (error) {
    return handleApiError(error);
  }
}
