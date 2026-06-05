import type { ReactNode } from 'react';

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_4px_14px_rgba(15,23,42,0.05)] sm:p-8 md:p-10 md:shadow-[0_2px_6px_rgba(15,23,42,0.08),0_10px_28px_rgba(15,23,42,0.10)]">
      <div className="flex flex-row items-start gap-4 text-start md:flex-col md:items-center md:gap-0 md:text-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 md:mx-auto md:mb-4 md:h-16 md:w-16">
          {icon}
        </div>
        <div className="min-w-0 flex-1 md:flex-none">
          <h3 className="mb-2 text-lg font-semibold text-primary-600 md:text-slate-900">{title}</h3>
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
  const iconClass = 'h-7 w-7 text-primary-600 md:h-8 md:w-8';

  return (
    <div className="grid gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
      <FeatureCard
        title={activeListingsTitle}
        description={activeListingsDescription}
        icon={
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
      />
      <FeatureCard
        title={multilingualTitle}
        description={multilingualDescription}
        icon={
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        }
      />
      <FeatureCard
        title={directContactTitle}
        description={directContactDescription}
        icon={
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l3.586-3.586z" />
          </svg>
        }
      />
    </div>
  );
}
