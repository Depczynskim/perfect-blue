'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { locales } from '@/i18n'

const LOCALE_SET = new Set<string>(locales)

function normalizePreferredLocale(
  value: string | null | undefined,
  fallback: string
): string {
  if (value && LOCALE_SET.has(value)) return value
  return fallback
}

/** Same-origin path-only redirects; rejects protocol-relative and external URLs. */
function parseSafeInternalPath(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null
  if (/^[a-zA-Z][a-zA-Z+\-.]*:/.test(trimmed)) return null
  try {
    const url = new URL(trimmed, window.location.origin)
    if (url.origin !== window.location.origin) return null
    return url.pathname + url.search + url.hash
  } catch {
    return null
  }
}

/** Replaces leading locale segment when present; otherwise prefixes preferred locale. */
function applyPreferredLocaleToPath(fullPath: string, preferred: string): string {
  const url = new URL(fullPath, window.location.origin)
  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length > 0 && LOCALE_SET.has(segments[0])) {
    segments[0] = preferred
    url.pathname = '/' + segments.join('/')
  } else {
    url.pathname = '/' + [preferred, ...segments].join('/')
  }
  return url.pathname + url.search + url.hash
}

export function LoginForm() {
  const router = useRouter()
  const t = useTranslations('auth.login')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    let preferredLocale = locale
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('preferred_locale')
        .eq('id', user.id)
        .single()
      preferredLocale = normalizePreferredLocale(
        profile?.preferred_locale ?? null,
        locale
      )
    }

    const redirectRaw =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null
    const safePath = parseSafeInternalPath(redirectRaw)

    const target = safePath
      ? applyPreferredLocaleToPath(safePath, preferredLocale)
      : `/${preferredLocale}`

    router.replace(target)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder={t('emailPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          placeholder={t('passwordPlaceholder')}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? t('submitting') : t('submit')}
      </button>

      <p className="text-center text-sm text-gray-600">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/auth/register`} className="text-primary-600 hover:text-primary-700 font-medium">
          {t('registerLink')}
        </Link>
      </p>
    </form>
  )
}
