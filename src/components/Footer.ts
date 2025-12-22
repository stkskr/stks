import { createElement } from '../utils/dom';

export class Footer {
  private element: HTMLDivElement;

  constructor() {
    this.element = createElement('div', 'site-footer');
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <p>© ${new Date().getFullYear()} Sticks & Stones. All rights reserved.</p>
    `;
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }
}
