import Image from 'next/image';
import Link from 'next/link';

export type HomeHeroProps = {
  locale: string;
  brand: string;
  subtitleBefore: string;
  subtitleHighlight: string;
  description: string;
  imageAlt: string;
  browseListings: string;
  addListing: string;
};

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

export function HomeHero({
  locale,
  brand,
  subtitleBefore,
  subtitleHighlight,
  description,
  imageAlt,
  browseListings,
  addListing,
}: HomeHeroProps) {
  return (
    <section className="relative w-full overflow-hidden min-h-[400px] h-[420px] sm:min-h-[420px] sm:h-[440px] md:min-h-[520px] md:h-[560px] lg:min-h-[560px] lg:h-[600px] xl:h-[640px]">
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/images/home-hero-blue-coast-mobile.webp"
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 767px) 100vw"
          className="object-cover object-center md:hidden"
        />
        <Image
          src="/images/home-hero-blue-coast-desktop.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw"
          className="hidden object-cover object-[center_35%] md:block"
          aria-hidden
        />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-950/[0.65] via-slate-900/[0.52] via-30% via-slate-900/[0.26] via-50% to-transparent to-[78%] md:from-slate-950/[0.05] md:via-slate-900/[0.03] md:via-28% md:via-slate-900/[0.01] md:via-45% md:to-transparent md:to-[62%]"
        aria-hidden
      />
      <div
        className="absolute inset-y-0 left-0 w-full max-w-2xl bg-gradient-to-r from-slate-950/[0.18] to-transparent md:max-w-3xl md:from-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex h-full w-full flex-col justify-center pt-12 pb-8 sm:pt-14 sm:pb-9 md:justify-start md:pt-20 md:pb-10 lg:pt-24 lg:pb-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-start [text-shadow:0_1px_2px_rgb(2_6_23/0.4),0_2px_12px_rgb(2_6_23/0.25)]">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              {brand}
            </h1>
            <p className="mt-3 text-xl font-semibold leading-snug text-white sm:text-2xl md:mt-4 md:text-3xl lg:text-4xl xl:text-5xl">
              {subtitleBefore}
              <span className="text-primary-300">{subtitleHighlight}</span>
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed text-white sm:text-lg sm:leading-relaxed md:mx-0 md:mt-5 md:text-xl md:leading-relaxed lg:max-w-2xl">
              {description}
            </p>
          </div>
          <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-8 md:mx-0 md:max-w-none md:flex-row md:gap-4">
            <Link
              href={`/${locale}/listings`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-lg font-medium text-white shadow-lg shadow-primary-900/30 transition-colors hover:bg-primary-700 md:w-auto"
            >
              {browseListings}
              <ArrowRightIcon className="h-5 w-5 shrink-0" />
            </Link>
            <Link
              href={`/${locale}/listings/new`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-white/10 md:w-auto"
            >
              {addListing}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
