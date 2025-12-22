import { createElement } from '../utils/dom';

const serviceImages = [
  'onlinevideo.png',
  'brandstory.png',
  'naming.png',
  'slogan.png',
  'ceoscript.png',
  'website.png'
];

export class ServicesGrid {
  private container: HTMLDivElement;
  private gridElement: HTMLDivElement;

  constructor() {
    this.container = createElement('div', 'services-container');
    this.gridElement = createElement('div', 'services-grid');
  }

  render(): void {
    this.gridElement.innerHTML = '';

    serviceImages.forEach(imageName => {
      const item = createElement('div', 'service-item');
      const img = createElement('img');
      img.src = `/assets/images/${imageName}`;
      img.alt = imageName.replace('.png', '');
      item.appendChild(img);
      this.gridElement.appendChild(item);
    });
  }

  getElement(): HTMLDivElement {
    this.container.innerHTML = '';
    this.container.appendChild(this.gridElement);
    return this.container;
  }
}
