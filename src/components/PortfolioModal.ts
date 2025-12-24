import { Language } from '../types/content.types';
import { PortfolioItem } from '../types/portfolio.types';
import { portfolioData } from '../data/portfolio';
import { languageManager } from '../core/language';
import { createElement } from '../utils/dom';
import { getFullImages } from '../utils/portfolio';
import { stateManager } from '../core/state';
import { router } from '../core/router';

export class PortfolioModal {
  private element: HTMLDivElement;
  private currentIndex: number = -1;
  private language: Language = 'ko';

  constructor() {
    this.element = createElement('div', 'portfolio-modal');
    this.render();

    // Subscribe to state changes
    stateManager.subscribe((state) => {
      if (state.portfolioSlug && state.currentSection === 'portfolio') {
        this.openBySlug(state.portfolioSlug, state.language);
      } else if (!state.portfolioSlug && this.element.classList.contains('active')) {
        // Close modal without navigating
        this.element.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-nav">
            <button class="modal-nav-btn prev-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="modal-nav-btn next-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-language-toggle">
            <svg class="modal-globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="modal-lang-text"></span>
          </div>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body"></div>
      </div>
    `;

    const closeBtn = this.element.querySelector('.modal-close') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => this.close());

    const prevBtn = this.element.querySelector('.prev-btn') as HTMLButtonElement;
    prevBtn.addEventListener('click', () => this.navigate(-1));

    const nextBtn = this.element.querySelector('.next-btn') as HTMLButtonElement;
    nextBtn.addEventListener('click', () => this.navigate(1));

    // Language toggle handler
    const langToggle = this.element.querySelector('.modal-language-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        const newLang = this.language === 'ko' ? 'en' : 'ko';
        this.switchLanguage(newLang);
      });
    }

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });
  }

  private navigate(direction: number): void {
    const newIndex = this.currentIndex + direction;
    if (newIndex >= 0 && newIndex < portfolioData.length) {
      const item = portfolioData[newIndex];
      const newPath = router.buildPath('portfolio', this.language, item.id);
      router.navigate(newPath);
    }
  }

  private updateNavigationButtons(): void {
    const prevBtn = this.element.querySelector('.prev-btn') as HTMLButtonElement;
    const nextBtn = this.element.querySelector('.next-btn') as HTMLButtonElement;

    prevBtn.disabled = this.currentIndex <= 0;
    nextBtn.disabled = this.currentIndex >= portfolioData.length - 1;
  }

  private updateLanguageToggle(): void {
    const langText = this.element.querySelector('.modal-lang-text') as HTMLSpanElement;
    if (langText) {
      // Show the opposite language (the one you can switch to)
      langText.textContent = this.language === 'ko' ? 'EN' : 'KR';
    }
  }

  private switchLanguage(newLang: Language): void {
    this.language = newLang;
    router.switchLanguage(newLang);
  }

  async openBySlug(id: string, language: Language): Promise<void> {
    const index = portfolioData.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.currentIndex = index;
      this.language = language;
      const item = portfolioData[index];

      const modalBody = this.element.querySelector('.modal-body') as HTMLDivElement;
      const modalContent = this.element.querySelector('.modal-content') as HTMLDivElement;

      // If modal is already open, animate the content change
      const wasActive = this.element.classList.contains('active');
      if (wasActive) {
        await this.animateContentChange(modalBody, modalContent, item, language);
      } else {
        const content = await this.renderModalContentAsync(item, language);
        modalBody.innerHTML = content;
        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.attachCarouselListeners();
      }

      this.updateNavigationButtons();
      this.updateLanguageToggle();
    }
  }

  private async animateContentChange(
    modalBody: HTMLDivElement,
    modalContent: HTMLDivElement,
    item: PortfolioItem,
    language: Language
  ): Promise<void> {
    // Get current height
    const currentHeight = modalContent.offsetHeight;

    // Fade out current content
    modalBody.style.opacity = '0';

    await new Promise(resolve => setTimeout(resolve, 150));

    // Update content while invisible to measure new height
    const content = await this.renderModalContentAsync(item, language);
    modalBody.innerHTML = content;
    this.attachCarouselListeners();

    // Measure new height with new content
    const newHeight = modalContent.offsetHeight;

    // Set current height explicitly
    modalContent.style.height = `${currentHeight}px`;

    // Force reflow
    void modalContent.offsetHeight;

    // Animate to new height FIRST
    requestAnimationFrame(() => {
      modalContent.style.height = `${newHeight}px`;

      // Wait for height animation to mostly complete, then fade in content
      setTimeout(() => {
        modalBody.style.opacity = '1';
      }, 200);

      // Remove explicit height after all transitions complete
      setTimeout(() => {
        modalContent.style.height = '';
      }, 400);
    });
  }

  open(index: number, language: Language): void {
    const item = portfolioData[index];
    const newPath = router.buildPath('portfolio', language, item.id);
    router.navigate(newPath);
  }

  close(): void {
    this.element.classList.remove('active');
    document.body.style.overflow = '';
    // Navigate back to portfolio page without slug
    const { language } = stateManager.getState();
    const newPath = router.buildPath('portfolio', language);
    router.navigate(newPath);
  }

  private getMediaTypeLabels(mediaType: string, language: Language): string {
    const typeMap: Record<string, { ko: string; en: string }> = {
      all: { ko: 'ALL', en: 'ALL' },
      video: { ko: '영상', en: 'Video' },
      online: { ko: '온라인', en: 'Online' },
      branding: { ko: '브랜딩', en: 'Branding' },
      sns: { ko: 'SNS', en: 'SNS' },
      ooh: { ko: 'OOH', en: 'OOH' },
      script: { ko: '스크립트', en: 'Script' },
    };

    const types = mediaType.split(',').map(t => t.trim());
    return types.map(t => typeMap[t.toLowerCase()]?.[language] || t).join(', ');
  }

  private async renderModalContentAsync(item: PortfolioItem, language: Language): Promise<string> {
    const title = languageManager.getContent(item.title, language);
    const mission = languageManager.getContent(item.mission, language);
    const solution = languageManager.getContent(item.solution, language);
    const mediaTypeLabel = this.getMediaTypeLabels(item.mediaType, language);

    const missionLabel = language === 'ko' ? 'Mission' : 'Mission';
    const solutionLabel = language === 'ko' ? 'Solution' : 'Solution';
    const clientLabel = language === 'ko' ? 'Client' : 'Client';
    const mediaLabel = language === 'ko' ? 'Media Type' : 'Media Type';

    // Render media content (video or images)
    let mediaContent = '';

    if (item.videoUrl) {
      // Extract video ID from YouTube URL
      const videoId = this.extractVideoId(item.videoUrl);
      mediaContent = `
        <div class="modal-video-container">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            title="${title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      `;
    } else {
      // Get full images (carousel or single)
      const images = await getFullImages(item.id);

      if (images.length === 1) {
        // Single image
        mediaContent = `
          <div class="modal-image-container">
            <img src="${images[0]}" alt="${title}" loading="eager" decoding="async" />
          </div>
        `;
      } else if (images.length > 1) {
        // Carousel
        mediaContent = `
          <div class="modal-carousel-container">
            <div class="modal-carousel">
              ${images.map((img, idx) => `
                <div class="modal-carousel-item ${idx === 0 ? 'active' : ''}">
                  <img src="${img}" alt="${title} ${idx + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async" />
                </div>
              `).join('')}
            </div>
            ${images.length > 1 ? `
              <button class="modal-carousel-prev" aria-label="Previous image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="modal-carousel-next" aria-label="Next image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="modal-carousel-indicators">
                ${images.map((_, idx) => `
                  <button class="modal-carousel-indicator ${idx === 0 ? 'active' : ''}" data-index="${idx}"></button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }
    }

    return `
      ${mediaContent}
      <div class="modal-info">
        <div class="modal-info-item">
          <h3>${missionLabel}</h3>
          <p>${mission}</p>
        </div>
        <div class="modal-info-item">
          <h3>${solutionLabel}</h3>
          <p>${solution}</p>
        </div>
      </div>
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="modal-meta-label">${clientLabel}:</span>
          <span>${item.client}</span>
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">${mediaLabel}:</span>
          <span>${mediaTypeLabel}</span>
        </div>
      </div>
    `;
  }

  private extractVideoId(url: string): string {
    // Handle both youtube.com/watch?v=ID and youtu.be/ID formats
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
  }

  private attachCarouselListeners(): void {
    const carouselContainer = this.element.querySelector('.modal-carousel-container');
    if (!carouselContainer) return;

    const items = carouselContainer.querySelectorAll('.modal-carousel-item');
    const indicators = carouselContainer.querySelectorAll('.modal-carousel-indicator');
    const prevBtn = carouselContainer.querySelector('.modal-carousel-prev') as HTMLButtonElement;
    const nextBtn = carouselContainer.querySelector('.modal-carousel-next') as HTMLButtonElement;

    if (items.length <= 1) return;

    let currentIndex = 0;

    const showSlide = (index: number) => {
      items.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentIndex = index;
    };

    prevBtn?.addEventListener('click', () => {
      const newIndex = (currentIndex - 1 + items.length) % items.length;
      showSlide(newIndex);
    });

    nextBtn?.addEventListener('click', () => {
      const newIndex = (currentIndex + 1) % items.length;
      showSlide(newIndex);
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        showSlide(index);
      });
    });
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}
