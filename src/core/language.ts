import { Language } from '../types/content.types';

export class LanguageManager {
  detectBrowserLanguage(): Language {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('ko') ? 'ko' : 'en';
  }

  getContent<T>(content: { ko: T; en: T }, lang: Language): T {
    return content[lang];
  }

  formatDate(isoDate: string, lang: Language): string {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
}

export const languageManager = new LanguageManager();
