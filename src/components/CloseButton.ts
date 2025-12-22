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
    router.navigate(path);
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}
