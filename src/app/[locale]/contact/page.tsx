import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { ContentPageShell, TrustPageCtas } from '@/components/layout';
import { CONTACT_EMAIL } from '@/lib/contactEmail';
import { getSiteUrl } from '@/lib/siteUrl';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'trustPages.contactPage.seo' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const canonicalUrl = `${getSiteUrl()}/${locale}/contact`;

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

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'trustPages.contactPage' });
  const tShared = await getTranslations({ locale, namespace: 'trustPages.shared' });

  return (
    <ContentPageShell locale={locale} user={user}>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <article className="space-y-8 rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <header className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('title')}</h1>
            <p className="text-slate-600 leading-relaxed">{t('intro')}</p>
          </header>

          <section className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">{t('beforeContact.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('beforeContact.body')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">{t('contactAbout.heading')}</h2>
            <ul className="list-disc space-y-2 ps-5 text-slate-600 leading-relaxed">
              <li>{t('contactAbout.topic1')}</li>
              <li>{t('contactAbout.topic2')}</li>
              <li>{t('contactAbout.topic3')}</li>
              <li>{t('contactAbout.topic4')}</li>
              <li>{t('contactAbout.topic5')}</li>
              <li>{t('contactAbout.topic6')}</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('getInTouch.heading')}</h2>
            <p className="text-slate-600">
              {t('getInTouch.emailLabel')}{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-primary-600 transition-colors hover:text-primary-700"
                dir="ltr"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">{t('report.heading')}</h2>
            <p className="text-slate-600 leading-relaxed">{t('report.body')}</p>
          </section>

          <section className="space-y-2">
            <p className="text-slate-600 leading-relaxed">{t('platformRole')}</p>
          </section>

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
