import { type SupabaseClient } from '@supabase/supabase-js';

/**
 * Sprawdza autoryzację użytkownika i zwraca użytkownika lub rzuca błąd
 * 
 * @param supabase - Klient Supabase (server)
 * @returns Zalogowany użytkownik
 * @throws Error jeśli użytkownik nie jest zalogowany
 */
export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new AuthenticationError('Wymagane logowanie');
  }
  
  return user;
}

/**
 * Błąd autoryzacji (401)
 */
export class AuthenticationError extends Error {
  statusCode = 401;
  
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Błąd uprawnień (403)
 */
export class ForbiddenError extends Error {
  statusCode = 403;
  
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Błąd walidacji (400)
 */
export class ValidationError extends Error {
  statusCode = 400;
  
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Błąd nie znaleziono (404)
 */
export class NotFoundError extends Error {
  statusCode = 404;
  
  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
