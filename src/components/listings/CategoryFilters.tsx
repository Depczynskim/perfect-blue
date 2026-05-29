'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
  return `inline-flex w-full items-center justify-center min-h-11 px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors md:text-base md:w-auto md:whitespace-normal ${
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
  const t = useTranslations('listings');

  const isRentLong = selectedTransactionType === 'rent_long';
  const isRentShort = selectedTransactionType === 'rent_short';

  const mobileFilters = [
    {
      key: 'all',
      href: buildHref(basePath, undefined, selectedCity),
      active: !selectedTransactionType,
      label: t('filterAll'),
    },
    {
      key: 'rent_long',
      href: buildHref(basePath, 'rent_long', selectedCity),
      active: isRentLong,
      label: t('filterLongTerm'),
    },
    {
      key: 'rent_short',
      href: buildHref(basePath, 'rent_short', selectedCity),
      active: isRentShort,
      label: t('filterShortTerm'),
    },
    {
      key: 'sale',
      href: buildHref(basePath, 'sale', selectedCity),
      active: selectedTransactionType === 'sale',
      label: t('filterSaleShort'),
    },
  ] as const;

  return (
    <>
      {/* Mobile: four direct links (URL-only active state) */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {mobileFilters.map(({ key, href, active, label }) => (
          <Link
            key={key}
            href={href}
            className={getClassName(active)}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Desktop/tablet: four options unchanged */}
      <div className="hidden md:flex md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 gap-2">
        <Link
          href={buildHref(basePath, undefined, selectedCity)}
          className={getClassName(!selectedTransactionType)}
          aria-current={!selectedTransactionType ? 'page' : undefined}
        >
          {labels.all}
        </Link>
        <Link
          href={buildHref(basePath, 'rent_long', selectedCity)}
          className={getClassName(isRentLong)}
          aria-current={isRentLong ? 'page' : undefined}
        >
          {labels.longTermRent}
        </Link>
        <Link
          href={buildHref(basePath, 'rent_short', selectedCity)}
          className={getClassName(isRentShort)}
          aria-current={isRentShort ? 'page' : undefined}
        >
          {labels.shortTermRent}
        </Link>
        <Link
          href={buildHref(basePath, 'sale', selectedCity)}
          className={getClassName(selectedTransactionType === 'sale')}
          aria-current={selectedTransactionType === 'sale' ? 'page' : undefined}
        >
          {labels.sale}
        </Link>
      </div>
    </>
  );
}
