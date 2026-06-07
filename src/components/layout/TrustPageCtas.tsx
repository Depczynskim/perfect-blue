import Link from 'next/link';

type TrustPageCtasProps = {
  locale: string;
  browseListings: string;
  addListing: string;
  contactUs?: string;
  showContact?: boolean;
};

export function TrustPageCtas({
  locale,
  browseListings,
  addListing,
  contactUs,
  showContact = false,
}: TrustPageCtasProps) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
      <Link
        href={`/${locale}/listings`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
      >
        {browseListings}
      </Link>
      <Link
        href={`/${locale}/listings/new`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-primary-600 bg-white px-6 py-3 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
      >
        {addListing}
      </Link>
      {showContact && contactUs ? (
        <Link
          href={`/${locale}/contact`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-primary-600 transition-colors hover:underline"
        >
          {contactUs}
        </Link>
      ) : null}
    </div>
  );
}
