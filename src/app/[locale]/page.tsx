import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';
import { HomeHero, HomeFeatures, HomeSellerCta, HomeFooter } from '@/components/home';

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

      <main className="flex-1 overflow-x-hidden">
        <HomeHero
          locale={locale}
          brand={t('hero.brand')}
          subtitleBefore={t('hero.subtitleBefore')}
          subtitleHighlight={t('hero.subtitleHighlight')}
          description={t('hero.description')}
          imageAlt={t('hero.imageAlt')}
          browseListings={t('hero.browseListings')}
          addListing={t('hero.addListing')}
        />

        <section className="relative z-10 pt-6 pb-10 sm:pt-8 sm:pb-12 md:pb-14">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 md:-mt-24 md:pt-0 lg:-mt-28">
            <HomeFeatures
              activeListingsTitle={t('features.activeListings.title')}
              activeListingsDescription={t('features.activeListings.description')}
              multilingualTitle={t('features.multilingualPlatform.title')}
              multilingualDescription={t('features.multilingualPlatform.description')}
              directContactTitle={t('features.directContact.title')}
              directContactDescription={t('features.directContact.description')}
            />
          </div>
        </section>

        <HomeSellerCta
          locale={locale}
          title={t('sellerCta.title')}
          description={t('sellerCta.description')}
          cta={t('sellerCta.cta')}
        />
      </main>

      <HomeFooter
        locale={locale}
        brand={t('hero.brand')}
        tagline={t('footer.tagline')}
        about={t('footer.about')}
        howItWorks={t('footer.howItWorks')}
        contact={t('footer.contact')}
        privacy={t('footer.privacy')}
        terms={t('footer.terms')}
        rights={t('footer.rights')}
        socialFacebook={t('footer.socialFacebook')}
        socialInstagram={t('footer.socialInstagram')}
        socialEmail={t('footer.socialEmail')}
      />
    </div>
  );
}
