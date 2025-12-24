import { Language } from '../types/content.types';

export class LanguageManager {
  detectBrowserLanguage(): Language {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('ko') ? 'ko' : 'en';
  }

  getContent<T>(content: { ko: T; en: T }, lang: Language): T {
    return content[lang];
  }
}

export const languageManager = new LanguageManager();
