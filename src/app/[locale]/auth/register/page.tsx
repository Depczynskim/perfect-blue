import { RegisterForm } from '@/components/auth'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export const metadata = {
  title: 'Register | Perfect Blue',
  description: 'Create a new account',
}

export default async function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'auth.register' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Tytuł */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <h1 className="text-3xl font-bold text-primary-600">{tCommon('appName')}</h1>
          </Link>
        </div>

        {/* Karta formularza */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            {t('title')}
          </h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

