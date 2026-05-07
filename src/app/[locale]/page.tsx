import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';

export const dynamic = 'force-dynamic';

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
                {t('hero.title')}
                <span className="text-primary-600"> {t('hero.titleHighlight')}</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                {t('hero.description')}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${locale}/listings`}
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25"
                >
                  {t('hero.browseListings')}
                </Link>
                <Link
                  href={`/${locale}/listings/new`}
                  className="bg-white text-slate-900 px-8 py-3 rounded-lg text-lg font-medium border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  {t('hero.addListing')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('features.mapSearch.title')}</h3>
                <p className="text-slate-600">{t('features.mapSearch.description')}</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('features.freeListings.title')}</h3>
                <p className="text-slate-600">{t('features.freeListings.description')}</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('features.securePayments.title')}</h3>
                <p className="text-slate-600">{t('features.securePayments.description')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PB</span>
              </div>
              <span className="font-semibold text-white">Perfect Blue</span>
            </div>
            <p className="text-sm">{t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
