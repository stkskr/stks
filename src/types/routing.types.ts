import { Language, Section } from './content.types';

export interface RouteParams {
  section: Section | null;
  language: Language;
  portfolioSlug?: string; // Optional portfolio item slug
}

export interface Route {
  path: string;
  section: Section | null;
  language: Language;
  portfolioSlug?: string;
}

export type AppState = 'idle' | 'expanding' | 'expanded';

export interface State {
  currentSection: Section | null;
  selectedSection: Section | null;
  language: Language;
  appState: AppState;
  portfolioSlug?: string; // Currently open portfolio item
}
