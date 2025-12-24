import { createElement } from '../utils/dom';
import { router } from '../core/router';
import { stateManager } from '../core/state';

export class CloseButton {
  private element: HTMLButtonElement;

  constructor() {
    this.element = createElement('button', 'close-button');
    this.element.innerHTML = '✕';

    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleClose();
    });
  }

  private handleClose(): void {
    const { language } = stateManager.getState();
    const path = language === 'en' ? '/en/' : '/';

    // iOS Safari scroll reset fix
    const container = document.querySelector('.container') as HTMLElement;
    if (container) {
      // 1. Disable smooth scrolling to prevent conflict
      container.style.scrollBehavior = 'auto';

      // 2. Force scroll to top BEFORE navigation
      container.scrollTop = 0;
      window.scrollTo(0, 0);

      // 3. Use requestAnimationFrame to ensure scroll reset is painted before layout shift
      requestAnimationFrame(() => {
        router.navigate(path);

        // 4. Restore smooth scroll after navigation
        setTimeout(() => {
          container.style.scrollBehavior = 'smooth';
        }, 100);
      });
    } else {
      router.navigate(path);
    }
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}
