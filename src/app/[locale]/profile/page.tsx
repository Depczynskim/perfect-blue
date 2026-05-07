import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import type { UserPreferredLocale } from '@/lib/supabase/types';
import { Header } from '@/components/layout';
import ProfileForm from './ProfileForm';

const ALLOWED_LOCALES: readonly UserPreferredLocale[] = ['pl', 'en', 'es', 'de', 'ar'];

function normalizePreferredLocale(value: string | null | undefined): UserPreferredLocale {
  if (value && ALLOWED_LOCALES.includes(value as UserPreferredLocale)) {
    return value as UserPreferredLocale;
  }
  return 'pl';
}

export default async function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'profile' });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, preferred_locale')
    .eq('id', user.id)
    .single();

  const initialPreferredLocale = normalizePreferredLocale(profile?.preferred_locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-slate-600 mb-8">
            {t('description')}
          </p>

          <ProfileForm
            userEmail={user.email || ''}
            initialDisplayName={profile?.display_name ?? ''}
            initialPreferredLocale={initialPreferredLocale}
          />
        </div>
      </main>
    </div>
  );
}
