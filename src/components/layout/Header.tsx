'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { LogoutButton } from '@/components/auth';
import { LanguageSelector } from './LanguageSelector';

interface User {
  id: string;
  email?: string;
}

interface HeaderProps {
  user: User | null;
  variant?: 'default' | 'minimal';
}

export function Header({ user, variant = 'default' }: HeaderProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const prefix = `/${locale}`;
  const listingsActive =
    pathname === `${prefix}/listings` ||
    (pathname.startsWith(`${prefix}/listings/`) &&
      !pathname.startsWith(`${prefix}/listings/new`));
  const addListingActive = pathname === `${prefix}/listings/new`;
  const messagesActive =
    pathname === `${prefix}/messages` ||
    pathname.startsWith(`${prefix}/messages/`);
  const profileActive = pathname === `${prefix}/profile`;

  const navLinkClass = (active: boolean) =>
    active
      ? 'text-primary-600 transition-colors px-3 py-2'
      : 'text-slate-600 hover:text-primary-600 transition-colors px-3 py-2';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PB</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">Perfect Blue</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {/* Language Selector */}
            <LanguageSelector />

            {variant === 'default' && (
              <Link
                href={`/${locale}/listings`}
                className={navLinkClass(listingsActive)}
                aria-current={listingsActive ? 'page' : undefined}
              >
                {t('listings')}
              </Link>
            )}

            {user ? (
              <>
                {variant === 'default' && (
                  <>
                    <Link
                      href={`/${locale}/listings/new`}
                      className={navLinkClass(addListingActive)}
                      aria-current={addListingActive ? 'page' : undefined}
                    >
                      {t('addListing')}
                    </Link>
                    <Link
                      href={`/${locale}/messages`}
                      className={navLinkClass(messagesActive)}
                      aria-current={messagesActive ? 'page' : undefined}
                    >
                      {t('messages')}
                    </Link>
                  </>
                )}
                <Link
                  href={`/${locale}/profile`}
                  className={`${navLinkClass(profileActive)} hidden sm:inline`}
                  aria-current={profileActive ? 'page' : undefined}
                >
                  {t('profile')}
                </Link>
                <LogoutButton className="text-slate-600 hover:text-primary-600 transition-colors px-3 py-2">
                  {t('logout')}
                </LogoutButton>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className="text-slate-600 hover:text-primary-600 transition-colors px-3 py-2"
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
