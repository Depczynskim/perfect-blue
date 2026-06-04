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
      className="h-24 w-28 shrink-0 text-primary-600 sm:h-28 sm:w-32"
      viewBox="0 0 112 96"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 44L56 12l48 32v40H8V44z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 84V56h32v28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="88" cy="72" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M84 72h8M88 68v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
    <section className="bg-primary-50/80 py-10 sm:py-12 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-primary-100 bg-primary-50 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-10 md:py-10">
          <HouseIllustration />
          <div className="max-w-xl flex-1 text-center md:text-start">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p>
          </div>
          <Link
            href={`/${locale}/listings/new`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-primary-600 bg-white px-6 py-3 text-base font-medium text-primary-600 transition-colors hover:bg-primary-50 sm:px-8"
          >
            {cta}
            <ArrowRightIcon className="h-5 w-5 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
