import type { ReactNode } from 'react';

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_14px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="flex flex-row items-start gap-4 text-start md:flex-col md:items-center md:gap-0 md:text-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 md:mx-auto md:mb-4">
          {icon}
        </div>
        <div className="min-w-0 flex-1 md:flex-none">
          <h3 className="mb-2 text-lg font-semibold text-primary-600">{title}</h3>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}

export type HomeFeaturesProps = {
  activeListingsTitle: string;
  activeListingsDescription: string;
  multilingualTitle: string;
  multilingualDescription: string;
  directContactTitle: string;
  directContactDescription: string;
};

export function HomeFeatures({
  activeListingsTitle,
  activeListingsDescription,
  multilingualTitle,
  multilingualDescription,
  directContactTitle,
  directContactDescription,
}: HomeFeaturesProps) {
  const iconClass = 'h-7 w-7 text-primary-600';

  return (
    <div className="grid gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
      <FeatureCard
        title={activeListingsTitle}
        description={activeListingsDescription}
        icon={
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />
      <FeatureCard
        title={multilingualTitle}
        description={multilingualDescription}
        icon={
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
        }
      />
      <FeatureCard
        title={directContactTitle}
        description={directContactDescription}
        icon={
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
      />
    </div>
  );
}
