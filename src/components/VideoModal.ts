import { createElement } from '../utils/dom';

export class VideoModal {
  private modalElement: HTMLDivElement;
  private isOpen = false;

  constructor() {
    this.modalElement = createElement('div', 'video-modal');
    this.init();
  }

  private init(): void {
    this.modalElement.innerHTML = `
      <div class="video-modal-overlay"></div>
      <div class="video-modal-content">
        <iframe
          src=""
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    `;

    // Click overlay to close
    const overlay = this.modalElement.querySelector('.video-modal-overlay') as HTMLElement;
    overlay.addEventListener('click', () => this.close());

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(videoUrl: string): void {
    const iframe = this.modalElement.querySelector('iframe') as HTMLIFrameElement;
    // Convert regular YouTube URL to embed URL with autoplay
    const videoId = this.extractVideoId(videoUrl);
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    this.modalElement.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    const iframe = this.modalElement.querySelector('iframe') as HTMLIFrameElement;
    iframe.src = ''; // Stop video playback

    this.modalElement.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  private extractVideoId(url: string): string {
    // Handle both youtube.com/watch?v=ID and youtu.be/ID formats
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.modalElement);
  }
}
