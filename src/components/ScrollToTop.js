import { createElement } from '../utils/dom.js';
import { stateManager } from '../core/state.js';

export class ScrollToTop {
  constructor() {
    this.button = this.createButton();
    this.currentSection = null;
    this.setupEventListeners();
    this.setupStateListener();
  }

  createButton() {
    const btn = createElement('button', 'scroll-to-top-btn');
    btn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.style.opacity = '0';
    btn.style.visibility = 'hidden';

    return btn;
  }

  setupEventListeners() {
    this.button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Also try scrolling body in case it's the scroll container
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Bind handler to preserve 'this' context
    this.boundHandleScroll = () => this.handleScroll();

    // Listen to all possible scroll containers
    window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
    document.addEventListener('scroll', this.boundHandleScroll, { passive: true });

    // Body might be the scroll container when stateExpanding
    if (document.body) {
      document.body.addEventListener('scroll', this.boundHandleScroll, { passive: true });
    }
  }

  setupStateListener() {
    // Get initial state
    const initialState = stateManager.getState();
    this.currentSection = initialState.currentSection;
    this.isModalOpen = !!initialState.portfolioSlug;

    console.log('[ScrollToTop] Initial state:', {
      currentSection: this.currentSection,
      portfolioSlug: initialState.portfolioSlug,
      isModalOpen: this.isModalOpen
    });

    // Listen to state changes to show/hide based on current section and modal state
    stateManager.subscribe((state) => {
      this.currentSection = state.currentSection;
      this.isModalOpen = !!state.portfolioSlug;
      console.log('[ScrollToTop] State changed:', {
        currentSection: this.currentSection,
        portfolioSlug: state.portfolioSlug,
        isModalOpen: this.isModalOpen
      });
      this.handleScroll();
    });
  }

  handleScroll() {
    // Only show on portfolio page and when no modal is open
    const isPortfolioPage = this.currentSection === 'portfolio';
    const isModalOpen = this.isModalOpen;

    if (!isPortfolioPage || isModalOpen) {
      this.button.style.opacity = '0';
      this.button.style.visibility = 'hidden';
      return;
    }

    // Check both window and body scroll positions
    const scrollY = window.scrollY || window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    const isMobile = window.innerWidth <= 768;

    // Show button after scrolling down (300px on mobile, 400px on desktop)
    const threshold = isMobile ? 300 : 400;

    if (scrollY > threshold) {
      this.button.style.opacity = '1';
      this.button.style.visibility = 'visible';
    } else {
      this.button.style.opacity = '0';
      this.button.style.visibility = 'hidden';
    }
  }

  mount(parent) {
    parent.appendChild(this.button);

    // Initial check in case page is already scrolled
    requestAnimationFrame(() => {
      this.handleScroll();
    });
  }
}
