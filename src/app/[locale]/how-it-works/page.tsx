import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { ContentPageShell, TrustPageCtas } from '@/components/layout';
import { getSiteUrl } from '@/lib/siteUrl';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'trustPages.howItWorks.seo' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const canonicalUrl = `${getSiteUrl()}/${locale}/how-it-works`;

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

export default async function HowItWorksPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'trustPages.howItWorks' });
  const tShared = await getTranslations({ locale, namespace: 'trustPages.shared' });

  return (
    <ContentPageShell locale={locale} user={user}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <article className="space-y-8 rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <header className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('title')}</h1>
            <p className="text-slate-600 leading-relaxed">{t('intro')}</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">{t('seekers.heading')}</h2>
            <ol className="list-decimal space-y-2 ps-5 text-slate-600 leading-relaxed">
              <li>{t('seekers.step1')}</li>
              <li>{t('seekers.step2')}</li>
              <li>{t('seekers.step3')}</li>
              <li>{t('seekers.step4')}</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">{t('advertisers.heading')}</h2>
            <ol className="list-decimal space-y-2 ps-5 text-slate-600 leading-relaxed">
              <li>{t('advertisers.step1')}</li>
              <li>{t('advertisers.step2')}</li>
              <li>{t('advertisers.step3')}</li>
              <li>{t('advertisers.step4')}</li>
              <li>{t('advertisers.step5')}</li>
            </ol>
            <p className="text-sm text-slate-500 leading-relaxed">{t('advertisers.note')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('onPlatform.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('onPlatform.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('offPlatform.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('offPlatform.body')}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('important.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('important.body')}</p>
          </section>

          <section className="space-y-2">
            <p className="text-slate-600 leading-relaxed">{t('reportNote')}</p>
          </section>

          <section className="space-y-2 rounded-lg border border-primary-100 bg-primary-50 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">{tShared('launchPricingTitle')}</h2>
            <p className="text-slate-600 leading-relaxed">{tShared('launchPricingBody')}</p>
          </section>

          <p className="text-slate-600 leading-relaxed">
            {t('contactPrompt')}{' '}
            <Link
              href={`/${locale}/contact`}
              className="font-medium text-primary-600 transition-colors hover:text-primary-700"
            >
              {t('contactLink')}
            </Link>
          </p>

          <TrustPageCtas
            locale={locale}
            browseListings={tShared('browseListings')}
            addListing={tShared('addListing')}
          />
        </article>
      </div>
    </ContentPageShell>
  );
}
