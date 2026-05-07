import { type SupabaseClient } from '@supabase/supabase-js';

/**
 * Sprawdza czy użytkownik ma aktywną subskrypcję
 * 
 * @param supabase - Klient Supabase (server)
 * @param userId - ID użytkownika
 * @returns true jeśli użytkownik ma aktywną subskrypcję, false w przeciwnym razie
 */
export async function checkSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('is_paid')
    .eq('id', userId)
    .single();
  
  return !!data?.is_paid;
}

/**
 * Sprawdza czy użytkownik ma aktywną subskrypcję i rzuca błąd jeśli nie
 * 
 * @param supabase - Klient Supabase (server)
 * @param userId - ID użytkownika
 * @throws Error jeśli użytkownik nie ma subskrypcji
 */
export async function requireSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const hasSubscription = await checkSubscription(supabase, userId);
  
  if (!hasSubscription) {
    throw new Error('Wymagana aktywna subskrypcja Premium');
  }
}
