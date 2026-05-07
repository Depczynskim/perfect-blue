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
}

/**
 * Desktop-only hover map overlay for listing cards.
 * Rendered lazily (dynamic import) only for the hovered card.
 * pointer-events-none keeps the underlying card link clickable.
 */
export default function ListingCardMapPreview({ latitude, longitude }: ListingCardMapPreviewProps) {
  return (
    <div
      className="absolute inset-0 z-20 rounded-lg overflow-hidden shadow-2xl ring-2 ring-primary-300 pointer-events-none"
      aria-hidden="true"
    >
      <ListingMap latitude={latitude} longitude={longitude} />
    </div>
  );
}
