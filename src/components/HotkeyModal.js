import { createElement } from '../utils/dom.js';
import { stateManager } from '../core/state.js';
import { keyboardContent } from '../data/keyboard.js';
import { languageManager } from '../core/language.js';

export class HotkeyModal {
  constructor() {
    this.element = createElement('div', 'hotkey-modal');
    this.isOpen = false;
    this.language = 'ko';
    this.render();
    this.setupEventListeners();
    stateManager.subscribe((state) => {
      if (state.language !== this.language) {
        this.language = state.language;
        this.render();
      }
    });
  }

  render() {
    const lang = this.language;
    const t = keyboardContent;
    const s = t.sections;

    this.element.innerHTML = `
      <div class="hotkey-modal-overlay"></div>
      <div class="hotkey-modal-content">
        <button class="hotkey-modal-close">✕</button>
        <h2 class="hotkey-modal-title">${languageManager.getContent(t.title, lang)}</h2>

        <div class="hotkey-sections hotkey-sections-vertical">
          <div class="hotkey-column-left">
            <div class="hotkey-section">
              <h3>${languageManager.getContent(s.portfolio.title, lang)}</h3>
              <div class="hotkey-list">
                <div class="hotkey-item">
                  <kbd>←</kbd> <kbd>→</kbd>
                  <span>${languageManager.getContent(s.portfolio.shortcuts.navigateProjects, lang)}</span>
                </div>
                <div class="hotkey-item">
                  <kbd>Shift</kbd> + <kbd>←</kbd> <kbd>→</kbd>
                  <span>${languageManager.getContent(s.portfolio.shortcuts.navigateImages, lang)}</span>
                </div>
              </div>
            </div>

            <div class="hotkey-section">
              <h3>${languageManager.getContent(s.language.title, lang)}</h3>
              <div class="hotkey-list">
                <div class="hotkey-item hotkey-item-inline">
                  <div class="hotkey-inline-group">
                    <kbd>E</kbd>
                    <span>${languageManager.getContent(s.language.shortcuts.english, lang)}</span>
                  </div>
                  <div class="hotkey-inline-group">
                    <kbd>K</kbd>
                    <span>${languageManager.getContent(s.language.shortcuts.korean, lang)}</span>
                  </div>
                </div>
                <div class="hotkey-item">
                  <kbd>L</kbd>
                  <span>${languageManager.getContent(s.language.shortcuts.toggle, lang)}</span>
                </div>
              </div>
            </div>

            <div class="hotkey-section">
              <h3>${languageManager.getContent(s.audio.title, lang)}</h3>
              <div class="hotkey-list">
                <div class="hotkey-item">
                  <kbd>M</kbd>
                  <span>${languageManager.getContent(s.audio.shortcuts.mute, lang)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hotkey-column-right">
            <div class="hotkey-section">
              <h3>${languageManager.getContent(s.navigation.title, lang)}</h3>
              <div class="hotkey-list">
                <div class="hotkey-item">
                  <kbd>A</kbd>
                  <span>${languageManager.getContent(s.navigation.shortcuts.about, lang)}</span>
                </div>
                <div class="hotkey-item">
                  <kbd>S</kbd>
                  <span>${languageManager.getContent(s.navigation.shortcuts.services, lang)}</span>
                </div>
                <div class="hotkey-item">
                  <kbd>C</kbd>
                  <span>${languageManager.getContent(s.navigation.shortcuts.clientsSay, lang)}</span>
                </div>
                <div class="hotkey-item">
                  <kbd>P</kbd>
                  <span>${languageManager.getContent(s.navigation.shortcuts.portfolio, lang)}</span>
                </div>
                <div class="hotkey-item">
                  <kbd>B</kbd>
                  <span>${languageManager.getContent(s.navigation.shortcuts.back, lang)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Use event delegation so listeners survive re-renders
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('.hotkey-modal-close') || e.target.classList.contains('hotkey-modal-overlay')) {
        this.close();
      }
    });

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
