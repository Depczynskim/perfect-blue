import type { LegalDocument } from '@/content/legal/types';

const SUPPORT_EMAIL = 'hello@perfectblue.es';

function renderTextWithEmail(text: string) {
  if (!text.includes(SUPPORT_EMAIL)) {
    return text;
  }

  const parts = text.split(SUPPORT_EMAIL);
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? (
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-primary-600 transition-colors hover:text-primary-700"
          dir="ltr"
        >
          {SUPPORT_EMAIL}
        </a>
      ) : null}
    </span>
  ));
}

type LegalDocumentBodyProps = {
  document: LegalDocument;
};

export function LegalDocumentBody({ document }: LegalDocumentBodyProps) {
  return (
    <>
      <div className="space-y-3">
        {document.intro.map((paragraph, index) => (
          <p key={index} className="text-slate-600 leading-relaxed">
            {renderTextWithEmail(paragraph)}
          </p>
        ))}
      </div>

      {document.sections.map((section) => (
        <section key={section.heading} className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">{section.heading}</h2>
          {section.paragraphs?.map((paragraph, index) => (
            <p key={index} className="text-slate-600 leading-relaxed">
              {renderTextWithEmail(paragraph)}
            </p>
          ))}
          {section.listItems ? (
            <ul className="list-disc space-y-2 ps-5 text-slate-600 leading-relaxed">
              {section.listItems.map((item, index) => (
                <li key={index}>{renderTextWithEmail(item)}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </>
  );
}
