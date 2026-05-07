import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CreateListingForm } from '@/components/listings';
import { Header } from '@/components/layout';

export const metadata = {
  title: 'Add Listing | Perfect Blue',
  description: 'Add a new real estate listing',
};

export default async function NewListingPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createServerClient();
  const t = await getTranslations({ locale, namespace: 'createListing' });
  
  const { data: { user }, error } = await supabase.auth.getUser();

  // Przekieruj niezalogowanych użytkowników
  if (error || !user) {
    redirect(`/${locale}/auth/login?redirect=/${locale}/listings/new`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Nagłówek */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </div>

        {/* Formularz */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <CreateListingForm />
        </div>
      </div>
    </div>
  );
}
