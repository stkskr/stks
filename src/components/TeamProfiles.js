import { teamData } from '../data/team.js';
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

  render() {
    // Clear existing profiles
    this.element.innerHTML = '';

    // Create profile card for each team member
    teamData.forEach((member) => {
      const profileCard = this.createProfileCard(member);
      this.element.appendChild(profileCard);
    });
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
