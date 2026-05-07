import Link from 'next/link';
import type { ListingTransactionType } from '@/lib/supabase/types';

interface CategoryFiltersProps {
  basePath: string;
  selectedTransactionType?: ListingTransactionType;
  selectedCity?: string | null;
  labels: {
    all: string;
    longTermRent: string;
    shortTermRent: string;
    sale: string;
  };
}

function buildHref(
  basePath: string,
  transactionType?: ListingTransactionType,
  city?: string | null,
) {
  const params = new URLSearchParams();

  if (transactionType) {
    params.set('category', transactionType);
  }

  if (city) {
    params.set('city', city);
  }

  const query = params.toString();
  return query.length > 0 ? `${basePath}?${query}` : basePath;
}

function getClassName(isActive: boolean) {
  return `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-primary-600 text-white'
      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
  }`;
}

export default function CategoryFilters({
  basePath,
  selectedTransactionType,
  selectedCity,
  labels,
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref(basePath, undefined, selectedCity)}
        className={getClassName(!selectedTransactionType)}
      >
        {labels.all}
      </Link>
      <Link
        href={buildHref(basePath, 'rent_long', selectedCity)}
        className={getClassName(selectedTransactionType === 'rent_long')}
      >
        {labels.longTermRent}
      </Link>
      <Link
        href={buildHref(basePath, 'rent_short', selectedCity)}
        className={getClassName(selectedTransactionType === 'rent_short')}
      >
        {labels.shortTermRent}
      </Link>
      <Link
        href={buildHref(basePath, 'sale', selectedCity)}
        className={getClassName(selectedTransactionType === 'sale')}
      >
        {labels.sale}
      </Link>
    </div>
  );
}
