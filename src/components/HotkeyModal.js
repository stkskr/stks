import { createElement } from '../utils/dom.js';
import { stateManager } from '../core/state.js';

export class HotkeyModal {
  constructor() {
    this.element = createElement('div', 'hotkey-modal');
    this.isOpen = false;
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.element.innerHTML = `
      <div class="hotkey-modal-overlay"></div>
      <div class="hotkey-modal-content">
        <button class="hotkey-modal-close">✕</button>
        <h2 class="hotkey-modal-title">Keyboard Shortcuts</h2>

        <div class="hotkey-sections hotkey-sections-vertical">
          <div class="hotkey-column-left">
            <div class="hotkey-section">
              <h3>Portfolio</h3>
              <div class="hotkey-list">
                <div class="hotkey-item">
                  <kbd>←</kbd> <kbd>→</kbd>
                  <span>Navigate Projects</span>
                </div>
                <div class="hotkey-item">
                  <kbd>Shift</kbd> + <kbd>←</kbd> <kbd>→</kbd>
                  <span>Navigate Images</span>
                </div>
              </div>
            </div>

            <div class="hotkey-section">
              <h3>Language</h3>
              <div class="hotkey-list">
                <div class="hotkey-item hotkey-item-inline">
                  <div class="hotkey-inline-group">
                    <kbd>E</kbd>
                    <span>English</span>
                  </div>
                  <div class="hotkey-inline-group">
                    <kbd>K</kbd>
                    <span>Korean</span>
                  </div>
                </div>
                <div class="hotkey-item">
                  <kbd>L</kbd>
                  <span>Toggle Language</span>
                </div>
              </div>
            </div>

            <div class="hotkey-section">
              <h3>Audio</h3>
              <div class="hotkey-list">
                <div class="hotkey-item">
                  <kbd>M</kbd>
                  <span>Mute / Unmute</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hotkey-column-right">
            <div class="hotkey-section">
              <h3>Site Navigation</h3>
              <div class="hotkey-list">
                <div class="hotkey-item">
                  <kbd>A</kbd>
                  <span>About</span>
                </div>
                <div class="hotkey-item">
                  <kbd>S</kbd>
                  <span>Services</span>
                </div>
                <div class="hotkey-item">
                  <kbd>C</kbd>
                  <span>Clients Say</span>
                </div>
                <div class="hotkey-item">
                  <kbd>P</kbd>
                  <span>Portfolio</span>
                </div>
                <div class="hotkey-item">
                  <kbd>B</kbd>
                  <span>Back (Close)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const closeBtn = this.element.querySelector('.hotkey-modal-close');
    closeBtn.addEventListener('click', () => this.close());

    const overlay = this.element.querySelector('.hotkey-modal-overlay');
    overlay.addEventListener('click', () => this.close());

    // Keyboard handler
    this.handleKeyDown = (e) => {
      if (!this.isOpen) return;

      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'b') {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from reaching portfolio modal
        this.close();
      }
    };

    // Use capture phase to handle the event before it reaches other handlers
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  open() {
    this.isOpen = true;
    this.element.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.element.classList.remove('active');
    document.body.style.overflow = '';
  }

  mount(parent) {
    parent.appendChild(this.element);
  }

  destroy() {
    if (this.handleKeyDown) {
      document.removeEventListener('keydown', this.handleKeyDown, true);
    }
  }
}
