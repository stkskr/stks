import servicesData from '../data/services.json';
import { createElement } from '../utils/dom.js';

export class GridServices {
  constructor() {
    this.container = createElement('div', 'services-container');
    this.gridElement = createElement('div', 'services-grid');
  }

  render(language = 'ko') {
    this.gridElement.innerHTML = '';

    servicesData.forEach(service => {
      const item = createElement('div', 'service-item');
      const img = createElement('img');
      img.src = service.image[language] || service.image.ko;
      img.alt = service.label[language] || service.id;
      item.appendChild(img);
      this.gridElement.appendChild(item);
    });
  }

  getElement() {
    this.container.innerHTML = '';
    this.container.appendChild(this.gridElement);
    return this.container;
  }
}
