export interface LocalizedContent {
  ko: string;
  en: string;
}

export interface LocalizedMultiline {
  ko: string[];
  en: string[];
}

export interface SectionContent {
  subtitle: LocalizedMultiline;
  body: LocalizedContent;
}

export interface SiteContent {
  about: SectionContent;
  services: SectionContent;
  portfolio: SectionContent;
  clients: SectionContent;
}

export type Language = 'ko' | 'en';
export type Section = 'about' | 'services' | 'portfolio' | 'clients';
