import { Section } from '../types/content.types';
import { State } from '../types/routing.types';
import { stateManager } from '../core/state';
import { router } from '../core/router';
import { siteContent } from '../data/content';
import { languageManager } from '../core/language';
import { createElement, setHTML } from '../utils/dom';
import { VideoModal } from './VideoModal';

export class QuadrantGrid {
  private container: HTMLElement;
  private isAnimating = false;
  private quadrants: Map<Section, HTMLDivElement> = new Map();
  private blueSubText: HTMLSpanElement;
  private whiteSubText: HTMLSpanElement;
  private videoModal: VideoModal;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    this.blueSubText = createElement('span');
    this.whiteSubText = createElement('span');
    this.videoModal = new VideoModal();
    this.init();
  }

  private init(): void {
    const sections: Section[] = ['about', 'services', 'portfolio', 'clients'];
    const imageMap: Record<Section, string> = {
      about: 'about',
      services: 'services',
      portfolio: 'portfolio',
      clients: 'clientssay',
    };

    // Preload all GIF images to prevent flash on hover
    this.preloadImages(imageMap);

    sections.forEach((section) => {
      const quadrant = createElement('div', `quadrant ${section}`);
      quadrant.dataset.section = section;

      const staticImg = createElement('img', 'static-img');
      const imageName = imageMap[section];
      const ext = imageName === 'services' ? 'png' : 'jpg';
      staticImg.src = `/assets/images/${imageName}.${ext}`;
      staticImg.alt = section;

      const hoverImg = createElement('img', 'hover-img');
      hoverImg.src = `/assets/images/${imageName}.gif`;
      hoverImg.alt = section;

      quadrant.appendChild(staticImg);
      quadrant.appendChild(hoverImg);

      quadrant.addEventListener('click', () => {
        if (!this.isAnimating && !quadrant.classList.contains('selected')) {
          this.handleQuadrantClick(section);
        }
      });
      this.quadrants.set(section, quadrant);
      this.container.appendChild(quadrant);
    });

    const blueSub = createElement('div', 'sub-quadrant blue-sub');
    blueSub.appendChild(this.blueSubText);
    this.container.appendChild(blueSub);

    const whiteSub = createElement('div', 'sub-quadrant white-sub');
    whiteSub.appendChild(this.whiteSubText);
    this.container.appendChild(whiteSub);

    const centerCircle = createElement('div', 'center-circle');
    const logoStatic = createElement('img', 'static-img');
    logoStatic.src = '/assets/images/logo.png';
    logoStatic.alt = 'STKS Logo';

    const logoHover = createElement('img', 'hover-img');
    logoHover.src = '/assets/images/logo.gif';
    logoHover.alt = 'STKS Logo';

    centerCircle.appendChild(logoStatic);
    centerCircle.appendChild(logoHover);

    centerCircle.addEventListener('click', () => {
      const { currentSection } = stateManager.getState();

      // Only open video modal when on home page (no section selected)
      if (!currentSection) {
        this.videoModal.open('https://www.youtube.com/watch?v=OCWZ5-vivHk');
      } else {
        // Navigate to home when clicked from a section
        const { language } = stateManager.getState();
        const path = language === 'en' ? '/en/' : '/';
        router.navigate(path);
      }
    });

    this.container.appendChild(centerCircle);
    this.videoModal.mount(document.body);

    stateManager.subscribe((state) => this.render(state));
  }

  private preloadImages(imageMap: Record<Section, string>): void {
    // Preload all GIF images (quadrants + logo)
    const sections: Section[] = ['about', 'services', 'portfolio', 'clients'];
    sections.forEach((section) => {
      const img = new Image();
      img.src = `/assets/images/${imageMap[section]}.gif`;
    });

    // Preload logo GIF
    const logoImg = new Image();
    logoImg.src = '/assets/images/logo.gif';
  }

  private handleQuadrantClick(section: Section): void {
    const { language } = stateManager.getState();
    const path = router.buildPath(section, language);
    router.navigate(path);
  }

  private render(state: State): void {
    const { currentSection, language, appState } = state;

    this.container.className = 'container';
    document.body.className = '';

    if (appState === 'expanding' && currentSection) {
      this.container.classList.add('stateExpanding');
      this.container.classList.add(`${currentSection}Selected`);
      document.body.classList.add('stateExpanding');
      document.body.classList.add(`${currentSection}Selected`);
    }

    const sections: Section[] = ['about', 'services', 'portfolio', 'clients'];
    sections.forEach((section) => {
      const element = this.quadrants.get(section);
      if (element) {
        if (section === currentSection) {
          element.classList.add('selected');
        } else {
          element.classList.remove('selected');
        }
      }
    });

    if (currentSection) {
      const subtitle = siteContent[currentSection].subtitle;
      const lines = languageManager.getContent(subtitle, language);
      const subtitleHTML = lines.join('<br>');

      setHTML(this.blueSubText, subtitleHTML);
      setHTML(this.whiteSubText, subtitleHTML);
    }
  }
}
