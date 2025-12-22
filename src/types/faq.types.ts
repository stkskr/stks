import { LocalizedContent } from './content.types';

export type FaqCategory = 'services' | 'pricing' | 'process' | 'legal' | 'other';

export interface FaqItem {
  category: FaqCategory;
  question: LocalizedContent;
  answer: LocalizedContent;
}

export type FaqData = FaqItem[];
