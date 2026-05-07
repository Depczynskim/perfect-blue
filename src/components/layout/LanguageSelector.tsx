'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { locales, localeNames, type Locale } from '@/i18n';

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Wyciągnij obecny locale z pathname
  const currentLocale = pathname.split('/')[1] as Locale;

  const handleLanguageChange = (newLocale: Locale) => {
    setIsOpen(false);
    
    // Zamień locale w obecnym pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    startTransition(() => {
      router.push(newPathname);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-slate-50"
        aria-label="Select language"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">
          {localeNames[currentLocale]}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                disabled={isPending}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors
                  ${locale === currentLocale 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                  ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span className={locale === 'ar' ? 'block text-right' : ''}>
                  {localeNames[locale]}
                </span>
                {locale === currentLocale && (
                  <svg className="inline w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
