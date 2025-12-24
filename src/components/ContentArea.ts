import { Section, Language } from '../types/content.types';
import { State } from '../types/routing.types';
import { siteContent } from '../data/content';
import { languageManager } from '../core/language';
import { createElement } from '../utils/dom';
import { PortfolioGrid } from './PortfolioGrid';
import { PortfolioModal } from './PortfolioModal';
import { ServicesGrid } from './ServicesGrid';
import { getYoutubeThumbnail, activateYoutubeFacade } from '../utils/youtube';

export class ContentArea {
  private element: HTMLDivElement;
  private innerElement: HTMLDivElement;
  private portfolioGrid: PortfolioGrid;
  private portfolioModal: PortfolioModal;
  private servicesGrid: ServicesGrid;

  constructor() {
    this.element = createElement('div', 'content-box');
    this.innerElement = createElement('div', 'content-inner');
    this.element.appendChild(this.innerElement);
    this.portfolioModal = new PortfolioModal();
    this.portfolioGrid = new PortfolioGrid(this.portfolioModal);
    this.servicesGrid = new ServicesGrid();
  }

  render(state: State): void {
    if (!state.currentSection) {
      this.innerElement.innerHTML = '';
      return;
    }

    const section = state.currentSection;
    const language = state.language;
    const content = siteContent[section];

    if (section === 'portfolio') {
      this.renderPortfolio(language);
    } else if (section === 'services') {
      this.renderServices(language);
    } else if (section === 'about') {
      this.renderAbout(language);
    } else {
      this.renderStandardContent(section, language);
    }
  }

  private renderAbout(language: Language): void {
    const content = siteContent.about;
    const body = languageManager.getContent(content.body, language);
    const lines = body.split('\n');

    this.innerElement.innerHTML = `
      <div class="about-content">
        <h2 class="about-title">${lines[0]}</h2>
        <p class="about-subtitle">${lines[1]}</p>

        <div class="about-video">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/OCWZ5-vivHk?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&controls=0&playsinline=1"
            title="Sticks & Stones Introduction"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>

        <a href="/assets/company-profile.pdf" download class="company-download-btn">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13L6 9H8V3H12V9H14L10 13Z" fill="currentColor"/>
            <path d="M17 15V17H3V15H1V17C1 18.1 1.9 19 3 19H17C18.1 19 19 18.1 19 17V15H17Z" fill="currentColor"/>
          </svg>
          <span>${language === 'ko' ? '회사소개서 Download' : 'Download Company Profile'}</span>
        </a>
      </div>
      ${this.renderCallToAction(language)}
    `;
  }

  private renderStandardContent(section: Section, language: Language): void {
    const content = siteContent[section];
    const body = languageManager.getContent(content.body, language);

    this.innerElement.innerHTML = `
      <div class="standard-content">
        <p>${body}</p>
      </div>
      ${this.renderCallToAction(language)}
    `;
  }

  private renderServices(language: Language): void {
    this.innerElement.innerHTML = '';
    this.servicesGrid.render();
    this.innerElement.appendChild(this.servicesGrid.getElement());

    // Add CTA after services grid
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
  }

  private renderPortfolio(language: Language): void {
    this.innerElement.innerHTML = '';
    this.portfolioGrid.render(language);
    this.innerElement.appendChild(this.portfolioGrid.getElement());

    // Add CTA after portfolio grid
    const ctaDiv = createElement('div');
    ctaDiv.innerHTML = this.renderCallToAction(language);
    this.innerElement.appendChild(ctaDiv);
  }

  private renderCallToAction(language: Language): string {
    return `
      <div class="cta-section">
        <h2 class="cta-heading">Have a project?</h2>
        <button class="cta-button">Let's talk</button>
      </div>
    `;
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
    this.portfolioModal.mount(document.body);
  }
}
