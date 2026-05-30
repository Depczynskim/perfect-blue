'use client';

import dynamic from 'next/dynamic';

const ListingMap = dynamic(() => import('./ListingMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-100">
      <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface ListingCardMapPreviewProps {
  latitude: number;
  longitude: number;
  /** Touch mode: blocks link click-through and allows tap-to-dismiss. */
  dismissible?: boolean;
  onDismiss?: () => void;
  ariaLabel?: string;
}

/**
 * Map overlay for listing cards.
 * Desktop hover: pointer-events-none keeps the card link clickable.
 * Mobile/touch: dismissible mode blocks navigation and closes on tap.
 */
export default function ListingCardMapPreview({
  latitude,
  longitude,
  dismissible = false,
  onDismiss,
  ariaLabel,
}: ListingCardMapPreviewProps) {
  return (
    <div
      className={`absolute inset-0 z-20 rounded-lg overflow-hidden shadow-2xl ring-2 ring-primary-300 ${
        dismissible ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
      }`}
      aria-hidden={dismissible ? undefined : true}
      aria-label={dismissible ? ariaLabel : undefined}
      onClick={dismissible ? onDismiss : undefined}
    >
      <ListingMap latitude={latitude} longitude={longitude} interactive={false} />
    </div>
  );
}
