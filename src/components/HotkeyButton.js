import { createElement } from '../utils/dom.js';

export class HotkeyButton {
  constructor(hotkeyModal) {
    this.element = createElement('button', 'hotkey-button');
    this.hotkeyModal = hotkeyModal;
    this.render();
  }

  render() {
    this.element.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
      </svg>
    `;

    this.element.setAttribute('aria-label', 'Keyboard shortcuts');
    this.element.setAttribute('title', 'Keyboard shortcuts');

    this.element.addEventListener('click', () => {
      this.hotkeyModal.open();
    });
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}
