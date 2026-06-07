export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  listItems?: string[];
};

export type LegalDocument = {
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
};

export type LegalDocumentId = 'privacy' | 'terms';
