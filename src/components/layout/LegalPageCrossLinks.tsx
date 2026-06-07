import Link from 'next/link';

type LegalPageCrossLinksProps = {
  locale: string;
  privacyLabel: string;
  termsLabel: string;
  contactLabel: string;
  currentPage: 'privacy' | 'terms';
};

export function LegalPageCrossLinks({
  locale,
  privacyLabel,
  termsLabel,
  contactLabel,
  currentPage,
}: LegalPageCrossLinksProps) {
  const linkClass =
    'text-sm font-medium text-primary-600 transition-colors hover:text-primary-700';

  return (
    <nav
      className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 pt-6"
      aria-label="Legal pages"
    >
      {currentPage !== 'privacy' ? (
        <Link href={`/${locale}/privacy`} className={linkClass}>
          {privacyLabel}
        </Link>
      ) : null}
      {currentPage !== 'terms' ? (
        <Link href={`/${locale}/terms`} className={linkClass}>
          {termsLabel}
        </Link>
      ) : null}
      <Link href={`/${locale}/contact`} className={linkClass}>
        {contactLabel}
      </Link>
    </nav>
  );
}
