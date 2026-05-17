import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { requireAuth, handleApiError } from '@/lib/api';
import { getUnreadMessageCount } from '@/lib/messaging/unreadCount';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const user = await requireAuth(supabase);
    const count = await getUnreadMessageCount(supabase, user.id);

    return NextResponse.json({ count });
  } catch (error) {
    return handleApiError(error);
  }
}
