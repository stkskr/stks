import teamData from '../data/team.json';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { stateManager } from '../core/state.js';

export class TeamProfiles {
  constructor() {
    this.element = createElement('div', 'team-grid');
    this.language = 'ko';

    // Subscribe to state changes for language updates
    stateManager.subscribe((state) => {
      if (state.language !== this.language) {
        this.language = state.language;
        this.render();
      }
    });
  }

  isMobile() {
    return window.innerWidth <= 768;
  }

  getViewportHeight() {
    // iOS Safari address bar changes window.innerHeight during scroll
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  scrollCardIntoView(card) {
    const reveal = card.querySelector('.profile-reveal');
    if (!reveal) return;

    // Wait for CSS transition to complete (400ms), then check if scroll is needed
    setTimeout(() => {
      const rect = reveal.getBoundingClientRect();
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

      // Only scroll if the bottom of the reveal is below the viewport
      if (rect.bottom > viewportHeight - 50) {
        reveal.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 450);
  }

  bindMobileCardToggle() {
    const grid = this.element;

    // Only bind once, even if render() is called multiple times
    if (!grid || grid.dataset.mobileToggleBound === '1') return;
    grid.dataset.mobileToggleBound = '1';

    const closeAll = () => {
      grid.querySelectorAll('.team-member.mobile-active').forEach(c => {
        c.classList.remove('mobile-active');
      });
    };

    const openCard = (card) => {
      card.classList.add('mobile-active');
      this.scrollCardIntoView(card);
    };

    const onPointerUpCapture = (e) => {
      if (!this.isMobile()) return;

      // Only left click or touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // Do not hijack taps on actual interactive elements
      const interactive = e.target.closest('a, button, input, textarea, select, label');
      if (interactive) return;

      const card = e.target.closest('.team-member');
      if (!card || !grid.contains(card)) return;

      // Don't use preventDefault - it can block iOS scroll
      // touch-action: manipulation in CSS handles double-tap zoom
      e.stopPropagation();

      const wasActive = card.classList.contains('mobile-active');

      closeAll();

      if (!wasActive) {
        openCard(card);
      }
    };

    // Capture phase is critical - cannot be blocked by child elements
    grid.addEventListener('pointerup', onPointerUpCapture, { capture: true });

    // Close when tapping outside cards
    document.addEventListener('pointerup', (e) => {
      if (!this.isMobile()) return;
      if (!grid.contains(e.target)) {
        closeAll();
      }
    }, { capture: true });

    // Desktop: scroll on hover
    grid.addEventListener('mouseenter', (e) => {
      if (this.isMobile()) return;
      const card = e.target.closest('.team-member');
      if (card) {
        this.scrollCardIntoView(card);
      }
    }, { capture: true });
  }

  render() {
    // Clear existing profiles
    this.element.innerHTML = '';

    // Create profile card for each team member
    teamData.forEach((member) => {
      const profileCard = this.createProfileCard(member);
      this.element.appendChild(profileCard);
    });

    // Setup delegated mobile handler (only once)
    this.bindMobileCardToggle();
  }

  createProfileCard(member) {
    const card = createElement('div', 'team-member');

    const name = typeof member.name === 'string' ? member.name : languageManager.getContent(member.name, this.language);
    const role = languageManager.getContent(member.role, this.language);
    const education = languageManager.getContent(member.education, this.language);
    const experience = languageManager.getContent(member.experience, this.language);

    // Build education HTML
    const educationHTML = education.map(edu =>
      `<strong>${edu.school}</strong><br>${edu.degree}`
    ).join('<br>');

    // Build experience HTML
    const experienceHTML = experience.map(exp =>
      `<li>${exp}</li>`
    ).join('');

    card.innerHTML = `
      <div class="diamond-wrapper">
        <div class="initial-overlay">${member.initial}</div>
        <div class="diamond-shape">
          <img src="${member.image}" alt="${name}" class="diamond-image">
        </div>
      </div>
      <div class="member-info">
        <h3 class="name">${name}</h3>
        <p class="role">${role}</p>
        <div class="profile-reveal">
          <div class="edu-section">
            ${educationHTML}
          </div>
          <ul class="exp-list">
            ${experienceHTML}
          </ul>
        </div>
      </div>
    `;

    // Desktop only: scroll into view on hover
    card.addEventListener('mouseenter', () => {
      if (!this.isMobile()) {
        this.scrollCardIntoView(card);
      }
    });

    return card;
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.render();
  }

  unmount() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
