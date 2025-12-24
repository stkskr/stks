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

    // Scroll container to top before navigating
    const container = document.querySelector('.container');
    if (container) {
      container.scrollTop = 0;
    }

    router.navigate(path);
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}
