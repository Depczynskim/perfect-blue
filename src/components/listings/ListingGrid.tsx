import Link from 'next/link';
import { type ListingCardItem } from '@/lib/listings';
import ListingCard from './ListingCard';

interface ListingGridProps {
  locale: string;
  listings: ListingCardItem[];
  locationFallback: string;
  emptyState: {
    title: string;
    description: string;
    addFirstListing: string;
  };
  showAddButton: boolean;
}

export default function ListingGrid({
  locale,
  listings,
  locationFallback,
  emptyState,
  showAddButton,
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{emptyState.title}</h3>
        <p className="text-slate-600 mb-6">{emptyState.description}</p>
        {showAddButton && (
          <Link
            href={`/${locale}/listings/new`}
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {emptyState.addFirstListing}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          locale={locale}
          locationFallback={locationFallback}
        />
      ))}
    </div>
  );
}
