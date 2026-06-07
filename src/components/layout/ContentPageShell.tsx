import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Header } from './Header';
import { HomeFooter } from '@/components/home';

interface ContentPageShellUser {
  id: string;
  email?: string;
}

export type ContentPageShellProps = {
  locale: string;
  user: ContentPageShellUser | null;
  children: ReactNode;
};

export async function ContentPageShell({
  locale,
  user,
  children,
}: ContentPageShellProps) {
  const tHome = await getTranslations({ locale, namespace: 'home' });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user} />

      <main className="flex-1">{children}</main>

      <HomeFooter
        locale={locale}
        brand={tHome('hero.brand')}
        tagline={tHome('footer.tagline')}
        about={tHome('footer.about')}
        howItWorks={tHome('footer.howItWorks')}
        contact={tHome('footer.contact')}
        privacy={tHome('footer.privacy')}
        terms={tHome('footer.terms')}
        rights={tHome('footer.rights')}
        socialFacebook={tHome('footer.socialFacebook')}
        socialInstagram={tHome('footer.socialInstagram')}
        socialEmail={tHome('footer.socialEmail')}
      />
    </div>
  );
}
