import { type SupabaseClient } from '@supabase/supabase-js';

export async function getUnreadMessageCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error counting unread messages:', error);
    return 0;
  }

  return count ?? 0;
}
