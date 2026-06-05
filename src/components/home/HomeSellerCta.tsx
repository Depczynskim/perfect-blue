import Link from 'next/link';

export type HomeSellerCtaProps = {
  locale: string;
  title: string;
  description: string;
  cta: string;
};

function HouseIllustration() {
  return (
    <svg
      className="h-24 w-28 shrink-0 text-primary-600 sm:h-28 sm:w-32 lg:h-32 lg:w-36"
      viewBox="0 0 112 96"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 82h100" />
      <path d="M14 50L44 24l30 26" />
      <path d="M20 50v32h48V50" />
      <path d="M36 82V62h16v20" />
      <path d="M26 56h8v8h-8z" />
      <path d="M88 82V57" />
      <circle cx="88" cy="46" r="11" />
      <path d="M102 82V68" />
      <circle cx="102" cy="60" r="8" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

export function HomeSellerCta({ locale, title, description, cta }: HomeSellerCtaProps) {
  return (
    <section className="bg-white py-4 sm:py-6 md:pt-6 md:pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-5 rounded-2xl border border-primary-100 bg-primary-50 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-10 md:py-8">
          <HouseIllustration />
          <div className="max-w-xl flex-1 text-start">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
          </div>
          <Link
            href={`/${locale}/listings/new`}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start px-1 py-2 text-base font-medium text-primary-600 transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 md:self-auto md:justify-center md:rounded-lg md:border-2 md:border-primary-600 md:bg-white md:px-8 md:py-3 md:hover:bg-primary-50 md:hover:no-underline"
          >
            {cta}
            <ArrowRightIcon className="h-5 w-5 shrink-0 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
