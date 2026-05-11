export interface DescriptionActionsProps {
  translateHref: string;
  translateLabel: string;
}

export default function DescriptionActions({
  translateHref,
  translateLabel,
}: DescriptionActionsProps) {
  const actionClass =
    'inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors';

  return (
    <a
      href={translateHref}
      target="_blank"
      rel="noopener noreferrer"
      className={actionClass}
    >
      {translateLabel}
    </a>
  );
}
