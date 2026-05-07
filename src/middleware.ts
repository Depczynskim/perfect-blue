import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from './i18n';

// Middleware next-intl dla obsługi locale
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

export async function middleware(request: NextRequest) {
  // 1. Obsłuż routing językowy (next-intl)
  const intlResponse = intlMiddleware(request);

  // 2. Obsłuż sesję Supabase (odświeżanie tokenów, cookies)
  const supabaseResponse = await updateSession(request);

  // Zawsze scal cookies sesji Supabase z odpowiedzią next-intl.
  // Gdy intl zwraca 200 (np. rewrite / → /pl), musimy zwrócić intlResponse —
  // zwrócenie tylko supabaseResponse gubi rewrite i skutkuje 404 na /.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Dopasuj wszystkie ścieżki żądań z wyjątkiem:
     * - _next/static (pliki statyczne)
     * - _next/image (optymalizacja obrazów)
     * - favicon.ico (ikona)
     * - obrazy (svg, png, jpg, jpeg, gif, webp)
     * - api routes (nie potrzebują locale)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
