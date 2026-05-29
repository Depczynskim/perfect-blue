'use client';

import { useEffect, useState } from 'react';
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
  return `inline-flex shrink-0 items-center justify-center min-h-11 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors md:text-base md:whitespace-normal ${
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
  const [rentExpanded, setRentExpanded] = useState(false);

  const isRentLong = selectedTransactionType === 'rent_long';
  const isRentShort = selectedTransactionType === 'rent_short';
  const isRentActive = isRentLong || isRentShort;
  const rentExploring = rentExpanded && !isRentActive;
  const showRentSecondary = isRentActive || rentExpanded;
  const mobileAllActive = !selectedTransactionType && !rentExploring;
  const mobileSaleActive = selectedTransactionType === 'sale' && !rentExploring;

  useEffect(() => {
    if (!isRentActive) {
      setRentExpanded(false);
    }
  }, [isRentActive]);

  const mobileLabels = {
    all: t('filterAll'),
    rent: t('filterRent'),
    sale: t('filterSaleShort'),
    longTerm: t('filterLongTerm'),
    shortTerm: t('filterShortTerm'),
  };

  const rentPrimaryActive = isRentActive || rentExpanded;

  const closeRentSubmenu = () => setRentExpanded(false);

  return (
    <>
      {/* Mobile: two-level All / Rent / Sale */}
      <div className="space-y-2 md:hidden">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref(basePath, undefined, selectedCity)}
            className={`${getClassName(mobileAllActive)} flex-1 min-w-[5.5rem] sm:flex-none`}
            aria-current={mobileAllActive ? 'page' : undefined}
            onClick={closeRentSubmenu}
          >
            {mobileLabels.all}
          </Link>
          <button
            type="button"
            className={`${getClassName(rentPrimaryActive)} flex-1 min-w-[5.5rem] sm:flex-none`}
            aria-expanded={showRentSecondary}
            aria-controls="listings-rent-filters"
            onClick={() => {
              if (isRentActive) return;
              setRentExpanded((open) => !open);
            }}
          >
            {mobileLabels.rent}
          </button>
          <Link
            href={buildHref(basePath, 'sale', selectedCity)}
            className={`${getClassName(mobileSaleActive)} flex-1 min-w-[5.5rem] sm:flex-none`}
            aria-current={mobileSaleActive ? 'page' : undefined}
            onClick={closeRentSubmenu}
          >
            {mobileLabels.sale}
          </Link>
        </div>
        {showRentSecondary && (
          <div
            id="listings-rent-filters"
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={mobileLabels.rent}
          >
            <Link
              href={buildHref(basePath, 'rent_long', selectedCity)}
              className={`${getClassName(isRentLong)} flex-1 min-w-[7rem] sm:flex-none`}
              aria-current={isRentLong ? 'page' : undefined}
            >
              {mobileLabels.longTerm}
            </Link>
            <Link
              href={buildHref(basePath, 'rent_short', selectedCity)}
              className={`${getClassName(isRentShort)} flex-1 min-w-[7rem] sm:flex-none`}
              aria-current={isRentShort ? 'page' : undefined}
            >
              {mobileLabels.shortTerm}
            </Link>
          </div>
        )}
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
