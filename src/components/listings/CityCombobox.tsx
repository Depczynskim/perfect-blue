'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { CityCount } from '@/lib/listings';

interface CityComboboxProps {
  cityCounts: CityCount[];
  selectedCity: string | null;
  locale?: string;
  targetPath?: string;
  labels: {
    city: string;
    placeholder: string;
    noResults: string;
    hint?: string;
    clear?: string;
  };
}

export default function CityCombobox({
  cityCounts,
  selectedCity,
  locale,
  targetPath,
  labels,
}: CityComboboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(selectedCity ?? '');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const numberFmt = useMemo(
    () => new Intl.NumberFormat(locale ?? 'en'),
    [locale],
  );

  useEffect(() => {
    setQuery(selectedCity ?? '');
  }, [selectedCity]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cityCounts;
    return cityCounts.filter((item) =>
      item.city.toLowerCase().includes(normalized),
    );
  }, [cityCounts, query]);

  useEffect(() => {
    setHighlightIdx(-1);
  }, [filtered]);

  useEffect(() => {
    if (highlightIdx < 0 || !listRef.current) return;
    const el = listRef.current.children[highlightIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  const navigate = (city: string) => {
    if (targetPath) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('city', city);
      router.push(`${targetPath}?${params.toString()}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('city', city);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const selectCity = (city: string) => {
    setQuery(city);
    setIsOpen(false);
    navigate(city);
  };

  const clearSelection = () => {
    setQuery('');
    setIsOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    const base = targetPath ?? pathname;
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setQuery(selectedCity ?? '');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightIdx((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setHighlightIdx((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1,
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filtered.length) {
        selectCity(filtered[highlightIdx].city);
      } else if (filtered.length === 1) {
        selectCity(filtered[0].city);
      }
    }
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsOpen(false);
      setQuery(selectedCity ?? '');
    }, 150);
  };

  return (
    <div className="relative">
      <label
        htmlFor="city-combobox"
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {labels.city}
      </label>

      <div className="relative">
        <input
          id="city-combobox"
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="city-listbox"
          value={query}
          placeholder={labels.placeholder}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
        />

        {query && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={labels.clear ?? 'Clear'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {labels.hint && (
        <p className="mt-1 text-xs text-slate-400">{labels.hint}</p>
      )}

      {isOpen && (
        <div
          id="city-listbox"
          role="listbox"
          ref={listRef}
          className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              {labels.noResults}
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.city}
                type="button"
                role="option"
                aria-selected={item.city === selectedCity}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCity(item.city)}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`w-full px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-b-0 ${
                  idx === highlightIdx
                    ? 'bg-primary-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900 truncate">
                      {item.city}
                    </span>
                    <span className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{labels.city}</span>
                    </span>
                  </span>
                  <span className="text-sm font-medium text-slate-500 tabular-nums flex-shrink-0">
                    {numberFmt.format(item.count)}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
