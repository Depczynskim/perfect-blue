import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { defaultLocale, locales, type Locale } from '@/i18n'

function resolveLocale(raw: string | undefined): Locale {
  if (raw && locales.includes(raw as Locale)) {
    return raw as Locale
  }
  return defaultLocale
}

/**
 * Route Handler dla callback po potwierdzeniu email
 * Supabase przekierowuje tutaj po kliknięciu w link weryfikacyjny
 */
export async function GET(
  request: Request,
  { params }: { params: { locale: string } },
) {
  const locale = resolveLocale(params.locale)
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Błąd - przekieruj do strony błędu lub logowania
  return NextResponse.redirect(`${origin}/${locale}/auth/login?error=auth_callback_error`)
}

