import { NextResponse } from 'next/server';
import { 
  AuthenticationError, 
  ForbiddenError, 
  ValidationError, 
  NotFoundError 
} from './auth';

/**
 * Obsługuje błędy API i zwraca odpowiedni NextResponse
 * 
 * @param error - Błąd do obsłużenia
 * @returns NextResponse z odpowiednim statusem i komunikatem
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // Błędy z niestandardowymi kodami statusu
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
  
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
  
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
  
  // Ogólny błąd serwera
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  // Nieznany błąd
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
