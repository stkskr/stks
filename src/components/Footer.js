import { createElement } from '../utils/dom.js';
import { uiContent } from '../data/ui.js';
import { languageManager } from '../core/language.js';
import { stateManager } from '../core/state.js';

export class Footer {
  constructor() {
    this.element = createElement('div', 'site-footer');
    this.language = 'ko';
    this.render();
    stateManager.subscribe((state) => {
      if (state.language !== this.language) {
        this.language = state.language;
        this.render();
      }
    });
  }

  render() {
    const year = new Date().getFullYear();
    const copyright = languageManager.getContent(uiContent.footer.copyright, this.language)
      .replace('{year}', year);
    this.element.innerHTML = `<p>${copyright}</p>`;
  }

  mount(parent) {
    parent.appendChild(this.element);
  }
}
