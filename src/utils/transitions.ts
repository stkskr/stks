export const TRANSITION_TIMINGS = {
  MAIN: 600,
  CLOSE: 400,
  CONTENT_FADE: 300,
  CONTENT_DELAY: 400,
} as const;

export function waitForMainTransition(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, TRANSITION_TIMINGS.MAIN)
  );
}

export function waitForCloseTransition(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, TRANSITION_TIMINGS.CLOSE)
  );
}
