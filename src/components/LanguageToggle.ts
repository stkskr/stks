import { Language } from '../types/content.types';
import { State } from '../types/routing.types';
import { stateManager } from '../core/state';
import { router } from '../core/router';
import { createElement } from '../utils/dom';

export class LanguageToggle {
  private element: HTMLDivElement;
  private koOption: HTMLSpanElement;
  private enOption: HTMLSpanElement;
  private scrollContainer: HTMLElement | null = null;

  constructor() {
    this.element = createElement('div', 'language-toggle');

    // Create globe icon and language text
    this.element.innerHTML = `
      <svg class="globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span class="lang-text"></span>
    `;

    this.koOption = this.element.querySelector('.lang-text') as HTMLSpanElement;
    this.enOption = this.element.querySelector('.lang-text') as HTMLSpanElement;

    this.element.addEventListener('click', () => {
      const currentLang = stateManager.getState().language;
      const newLang = currentLang === 'ko' ? 'en' : 'ko';
      this.handleLanguageChange(newLang);
    });

    stateManager.subscribe((state) => this.render(state));

    // Add scroll listener to handle color changes
    this.setupScrollListener();
  }

  private setupScrollListener(): void {
    // Listen to scroll on both window and container
    window.addEventListener('scroll', () => {
      this.updateScrollState();
    }, true); // Use capture phase to catch all scroll events
  }

  private updateScrollState(): void {
    // Get the container element
    const container = document.querySelector('.container.stateExpanding') as HTMLElement;

    // If scrolled past the header, add scrolled class
    // Use a threshold slightly before 50vh to trigger color change as soon as white content appears
    const threshold = (window.innerHeight / 2) - 35; // 35px before the content area
    const scrollY = container ? container.scrollTop : window.scrollY;

    if (scrollY > threshold) {
      this.element.classList.add('scrolled');
    } else {
      this.element.classList.remove('scrolled');
    }
  }

  private handleLanguageChange(lang: Language): void {
    router.switchLanguage(lang);
  }

  private render(state: State): void {
    // Show the opposite language (the one you can switch to)
    const langText = this.element.querySelector('.lang-text') as HTMLSpanElement;
    if (langText) {
      langText.textContent = state.language === 'ko' ? 'EN' : 'KR';
    }

    // Update scroll state when state changes (e.g., when navigating to/from sections)
    this.updateScrollState();

    // When entering a section, attach scroll listener to the container
    if (state.currentSection) {
      // Wait for container to be updated with stateExpanding class
      setTimeout(() => {
        const container = document.querySelector('.container.stateExpanding') as HTMLElement;
        if (container && container !== this.scrollContainer) {
          this.scrollContainer = container;
          container.addEventListener('scroll', () => {
            this.updateScrollState();
          });
        }
      }, 50);
    } else {
      this.scrollContainer = null;
    }
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}
