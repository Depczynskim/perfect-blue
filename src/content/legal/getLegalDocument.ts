import type { Locale } from '@/i18n';
import type { LegalDocument, LegalDocumentId } from './types';
import { privacyEn } from './privacy/en';
import { privacyPl } from './privacy/pl';
import { privacyEs } from './privacy/es';
import { privacyDe } from './privacy/de';
import { privacyAr } from './privacy/ar';
import { termsEn } from './terms/en';
import { termsPl } from './terms/pl';
import { termsEs } from './terms/es';
import { termsDe } from './terms/de';
import { termsAr } from './terms/ar';

const privacyByLocale: Record<Locale, LegalDocument> = {
  en: privacyEn,
  pl: privacyPl,
  es: privacyEs,
  de: privacyDe,
  ar: privacyAr,
};

const termsByLocale: Record<Locale, LegalDocument> = {
  en: termsEn,
  pl: termsPl,
  es: termsEs,
  de: termsDe,
  ar: termsAr,
};

const documents: Record<LegalDocumentId, Record<Locale, LegalDocument>> = {
  privacy: privacyByLocale,
  terms: termsByLocale,
};

export function getLegalDocument(
  documentId: LegalDocumentId,
  locale: string,
): LegalDocument {
  const resolved = (locale in privacyByLocale ? locale : 'en') as Locale;
  return documents[documentId][resolved];
}
