import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * Route Handler dla callback po potwierdzeniu email
 * Supabase przekierowuje tutaj po kliknięciu w link weryfikacyjny
 */
export async function GET(request: Request) {
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
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}

