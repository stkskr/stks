import { Language, Section } from '../types/content.types';
import { RouteParams } from '../types/routing.types';
import { stateManager } from './state';

class Router {
  private hasDetectedLanguage = false;

  init(): void {
    // Disable automatic scroll restoration - we'll handle it manually
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.handleInitialLanguageDetection();
    window.addEventListener('popstate', () => this.handleRoute());
    this.handleRoute();
  }

  private handleInitialLanguageDetection(): void {
    const currentPath = window.location.pathname;

    if (currentPath === '/' || currentPath === '') {
      const browserLang = navigator.language.toLowerCase();
      const isKorean = browserLang.startsWith('ko');

      if (!isKorean && !this.hasDetectedLanguage) {
        this.hasDetectedLanguage = true;
        this.navigate('/en/', true);
      }
    }
  }

  parseRoute(path: string): RouteParams {
    const segments = path.split('/').filter(Boolean);

    const hasEnPrefix = segments[0] === 'en';
    const language: Language = hasEnPrefix ? 'en' : 'ko';

    const sectionIndex = hasEnPrefix ? 1 : 0;
    const sectionStr = segments[sectionIndex];

    const validSections: Section[] = ['about', 'services', 'portfolio', 'clients'];
    const section = validSections.includes(sectionStr as Section)
      ? (sectionStr as Section)
      : null;

    // Check for portfolio item slug (e.g., /portfolio/samsung-brand-identity)
    const portfolioSlug =
      section === 'portfolio' && segments[sectionIndex + 1]
        ? segments[sectionIndex + 1]
        : undefined;

    return { section, language, portfolioSlug };
  }

  buildPath(
    section: Section | null,
    language: Language,
    portfolioSlug?: string
  ): string {
    const prefix = language === 'en' ? '/en' : '';
    if (!section) return `${prefix}/`;
    if (section === 'portfolio' && portfolioSlug) {
      return `${prefix}/${section}/${portfolioSlug}`;
    }
    return `${prefix}/${section}`;
  }

  navigate(path: string, replace = false): void {
    const route = this.parseRoute(path);

    if (replace) {
      history.replaceState(route, '', path);
    } else {
      history.pushState(route, '', path);
    }

    this.handleRoute();
  }

  private handleRoute(): void {
    const route = this.parseRoute(window.location.pathname);

    stateManager.setState({
      currentSection: route.section,
      language: route.language,
      appState: route.section ? 'expanding' : 'idle',
      portfolioSlug: route.portfolioSlug,
    });
  }

  switchLanguage(newLang: Language): void {
    const { currentSection, portfolioSlug } = stateManager.getState();
    const newPath = this.buildPath(currentSection, newLang, portfolioSlug);
    this.navigate(newPath);
  }
}

export const router = new Router();
