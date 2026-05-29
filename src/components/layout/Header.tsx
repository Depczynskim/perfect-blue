'use client';

import { useEffect, useState, useCallback } from 'react';
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

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-xs font-medium leading-none shrink-0">
      {count > 9 ? '9+' : count}
    </span>
  );
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

  const mobileNavLinkClass = (active: boolean) =>
    active
      ? 'flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-start text-primary-600 font-medium transition-colors'
      : 'flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-start text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary-600';

  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!user || variant !== 'default') {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    fetch('/api/messages/unread-count')
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data: { count?: number }) => {
        if (!cancelled) {
          setUnreadCount(typeof data.count === 'number' ? data.count : 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUnreadCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, variant, pathname]);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  const desktopNav = (
    <>
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
                className={`${navLinkClass(messagesActive)} inline-flex items-center gap-1.5`}
                aria-current={messagesActive ? 'page' : undefined}
              >
                {t('messages')}
                <UnreadBadge count={unreadCount} />
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
    </>
  );

  const mobileMenuNav = (
    <nav
      id="header-mobile-nav"
      className="absolute inset-x-0 top-full z-[60] border-b border-slate-200 bg-white shadow-lg lg:hidden"
      aria-label={t('menuNav')}
    >
      <ul className="py-2">
        <li>
          <Link
            href={`/${locale}/listings`}
            className={mobileNavLinkClass(listingsActive)}
            aria-current={listingsActive ? 'page' : undefined}
            onClick={closeMenu}
          >
            <span>{t('listings')}</span>
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <Link
                href={`/${locale}/listings/new`}
                className={mobileNavLinkClass(addListingActive)}
                aria-current={addListingActive ? 'page' : undefined}
                onClick={closeMenu}
              >
                <span>{t('addListing')}</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/messages`}
                className={mobileNavLinkClass(messagesActive)}
                aria-current={messagesActive ? 'page' : undefined}
                onClick={closeMenu}
              >
                <span>{t('messages')}</span>
                <UnreadBadge count={unreadCount} />
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/profile`}
                className={mobileNavLinkClass(profileActive)}
                aria-current={profileActive ? 'page' : undefined}
                onClick={closeMenu}
              >
                <span>{t('profile')}</span>
              </Link>
            </li>
            <li className="border-t border-slate-100 px-4 py-2">
              <LogoutButton className="flex min-h-11 w-full items-center px-0 py-3 text-start text-slate-700 transition-colors hover:text-primary-600">
                {t('logout')}
              </LogoutButton>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href={`/${locale}/auth/login`}
                className={mobileNavLinkClass(false)}
                onClick={closeMenu}
              >
                <span>{t('login')}</span>
              </Link>
            </li>
            <li className="px-4 py-2">
              <Link
                href={`/${locale}/auth/register`}
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-primary-700"
                onClick={closeMenu}
              >
                {t('register')}
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PB</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">Perfect Blue</span>
          </Link>

          <div className="flex items-center gap-1">
            <LanguageSelector />

            {variant === 'default' ? (
              <>
                <div className="hidden lg:flex items-center gap-1">{desktopNav}</div>

                <button
                  type="button"
                  className="lg:hidden flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary-600"
                  aria-expanded={menuOpen}
                  aria-controls="header-mobile-nav"
                  aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {menuOpen ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[55] bg-black/20 lg:hidden"
                      aria-hidden
                      onClick={closeMenu}
                    />
                    {mobileMenuNav}
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">{desktopNav}</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
