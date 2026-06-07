import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { ContentPageShell, TrustPageCtas } from '@/components/layout';
import { getSiteUrl } from '@/lib/siteUrl';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'trustPages.about.seo' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const canonicalUrl = `${getSiteUrl()}/${locale}/about`;

  return {
    title: `${t('title')} | ${tCommon('appName')}`,
    description: t('description'),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonicalUrl,
      type: 'website',
      locale,
    },
  };
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'trustPages.about' });
  const tShared = await getTranslations({ locale, namespace: 'trustPages.shared' });

  return (
    <ContentPageShell locale={locale} user={user}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <article className="space-y-8 rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <header className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('title')}</h1>
            <p className="text-slate-600 leading-relaxed">{t('intro')}</p>
          </header>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('whatIs.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('whatIs.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('whatIsNot.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('whatIsNot.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('why.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('why.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('whoFor.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('whoFor.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('approach.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('approach.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('transparency.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('transparency.body')}</p>
          </section>

          <section className="space-y-2 rounded-lg border border-primary-100 bg-primary-50 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">{tShared('launchPricingTitle')}</h2>
            <p className="text-slate-600 leading-relaxed">{tShared('launchPricingBody')}</p>
          </section>

          <TrustPageCtas
            locale={locale}
            browseListings={tShared('browseListings')}
            addListing={tShared('addListing')}
            contactUs={tShared('contactUs')}
            showContact
          />
        </article>
      </div>
    </ContentPageShell>
  );
}
