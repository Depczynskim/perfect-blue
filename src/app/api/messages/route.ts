import { NextRequest, NextResponse } from 'next/server';
import { type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase';
import { requireAuth, checkSubscription, handleApiError, ValidationError } from '@/lib/api';
import { messagingRequiresSubscription } from '@/lib/messaging/config';

const MAX_MESSAGE_LENGTH = 3000;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function hasExistingDyad(
  supabase: SupabaseClient,
  listingId: string,
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .eq('listing_id', listingId)
    .or(
      `and(from_user_id.eq.${userIdA},to_user_id.eq.${userIdB}),and(from_user_id.eq.${userIdB},to_user_id.eq.${userIdA})`,
    )
    .limit(1);

  if (error) {
    console.error('Error checking message dyad:', error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);

    const body = await request.json();
    const { listing_id, body: messageBody, to_user_id } = body;

    if (!listing_id || typeof listing_id !== 'string') {
      throw new ValidationError('Brak listing_id lub treści wiadomości');
    }

    const trimmedBody =
      typeof messageBody === 'string' ? messageBody.trim() : '';

    if (!trimmedBody) {
      throw new ValidationError('Brak listing_id lub treści wiadomości');
    }

    if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
      throw new ValidationError('Wiadomość przekracza maksymalną długość');
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, owner_id, title')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 },
      );
    }

    const isOwner = listing.owner_id === user.id;
    let recipientId: string;

    if (to_user_id != null && to_user_id !== '') {
      if (typeof to_user_id !== 'string' || !UUID_RE.test(to_user_id)) {
        throw new ValidationError('Nieprawidłowy odbiorca wiadomości');
      }

      recipientId = to_user_id;

      if (recipientId === user.id) {
        return NextResponse.json(
          { error: 'Cannot send message to yourself' },
          { status: 400 },
        );
      }

      const dyadExists = await hasExistingDyad(
        supabase,
        listing_id,
        user.id,
        recipientId,
      );

      if (!dyadExists) {
        return NextResponse.json(
          {
            error:
              'No existing conversation with this recipient for this listing',
          },
          { status: 400 },
        );
      }
    } else {
      recipientId = listing.owner_id;

      if (recipientId === user.id) {
        return NextResponse.json(
          { error: 'Cannot send message to yourself' },
          { status: 400 },
        );
      }
    }

    if (!isOwner && messagingRequiresSubscription()) {
      const hasSubscription = await checkSubscription(supabase, user.id);
      if (!hasSubscription) {
        return NextResponse.json(
          { error: 'You need an active subscription to send messages' },
          { status: 403 },
        );
      }
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        to_user_id: recipientId,
        listing_id: listing.id,
        body: trimmedBody,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 },
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
        { status: 500 },
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}
