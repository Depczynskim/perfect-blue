'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('nav')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children || t('logout')}
    </button>
  )
}

