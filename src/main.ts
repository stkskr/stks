import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/quadrants.css';
import './styles/content.css';
import './styles/bottomtabs.css';
import './styles/videomodal.css';

import { router } from './core/router';
import { stateManager } from './core/state';
import { QuadrantGrid } from './components/QuadrantGrid';
import { ContentArea } from './components/ContentArea';
import { LanguageToggle } from './components/LanguageToggle';
import { CloseButton } from './components/CloseButton';
import { BottomTabs } from './components/BottomTabs';

class App {
  private quadrantGrid: QuadrantGrid;
  private contentArea: ContentArea;
  private languageToggle: LanguageToggle;
  private closeButton: CloseButton;
  private bottomTabs: BottomTabs;

  constructor() {
    this.quadrantGrid = new QuadrantGrid('app');
    this.contentArea = new ContentArea();
    this.languageToggle = new LanguageToggle();
    this.closeButton = new CloseButton();
    this.bottomTabs = new BottomTabs();

    this.mount();
    this.init();
  }

  private mount(): void {
    const appContainer = document.getElementById('app')!;
    this.contentArea.mount(appContainer);
    this.closeButton.mount(appContainer);
    this.languageToggle.mount(document.body);
    this.bottomTabs.mount(document.body);
  }

  private init(): void {
    stateManager.subscribe((state) => {
      this.contentArea.render(state);
    });

    router.init();
  }
}

new App();
