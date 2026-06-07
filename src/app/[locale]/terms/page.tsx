import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import {
  ContentPageShell,
  LegalDocumentBody,
  LegalPageCrossLinks,
} from '@/components/layout';
import { getLegalDocument } from '@/content/legal/getLegalDocument';
import { getSiteUrl } from '@/lib/siteUrl';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legalPages.terms.seo' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const canonicalUrl = `${getSiteUrl()}/${locale}/terms`;

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

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'legalPages.terms' });
  const tShared = await getTranslations({ locale, namespace: 'legalPages.shared' });
  const document = getLegalDocument('terms', locale);

  return (
    <ContentPageShell locale={locale} user={user}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <article className="space-y-8 rounded-lg bg-white p-6 shadow-sm sm:p-8">
          <header className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('title')}</h1>
            <p className="text-sm text-slate-500">
              {tShared('lastUpdatedLabel')}:{' '}
              <time dateTime={document.lastUpdated} dir="ltr">
                {document.lastUpdated}
              </time>
            </p>
          </header>

          <LegalDocumentBody document={document} />

          <LegalPageCrossLinks
            locale={locale}
            privacyLabel={tShared('privacyLink')}
            termsLabel={tShared('termsLink')}
            contactLabel={tShared('contactLink')}
            currentPage="terms"
          />
        </article>
      </div>
    </ContentPageShell>
  );
}
