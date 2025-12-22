import { State } from '../types/routing.types';

class StateManager {
  private state: State;
  private listeners: Set<(state: State) => void>;

  constructor() {
    this.state = {
      currentSection: null,
      selectedSection: null,
      language: 'ko',
      appState: 'idle',
      portfolioSlug: undefined,
    };
    this.listeners = new Set();
  }

  getState(): Readonly<State> {
    return { ...this.state };
  }

  setState(partial: Partial<State>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: (state: State) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}

export const stateManager = new StateManager();
