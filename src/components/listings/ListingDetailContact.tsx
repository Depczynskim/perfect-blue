'use client';

import { useSyncExternalStore } from 'react';
import ContactButton from './ContactButton';

const LG_MEDIA_QUERY = '(min-width: 1024px)';

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(LG_MEDIA_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getIsDesktopSnapshot() {
  return window.matchMedia(LG_MEDIA_QUERY).matches;
}

function getIsDesktopServerSnapshot() {
  return false;
}

interface ListingDetailContactProps {
  listingId: string;
  hasAccess: boolean;
  isLoggedIn: boolean;
  requiresSubscription: boolean;
  placement: 'mobile-fixed' | 'desktop-sidebar';
}

export default function ListingDetailContact({
  placement,
  listingId,
  hasAccess,
  isLoggedIn,
  requiresSubscription,
}: ListingDetailContactProps) {
  const isDesktop = useSyncExternalStore(
    subscribe,
    getIsDesktopSnapshot,
    getIsDesktopServerSnapshot,
  );

  if (placement === 'mobile-fixed') {
    if (isDesktop) {
      return null;
    }

    return (
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-h-[70vh] max-w-7xl overflow-y-auto px-4 pt-3">
          <ContactButton
            listingId={listingId}
            hasAccess={hasAccess}
            isLoggedIn={isLoggedIn}
            requiresSubscription={requiresSubscription}
            variant="plain"
          />
        </div>
      </div>
    );
  }

  if (!isDesktop) {
    return null;
  }

  return (
    <ContactButton
      listingId={listingId}
      hasAccess={hasAccess}
      isLoggedIn={isLoggedIn}
      requiresSubscription={requiresSubscription}
    />
  );
}
