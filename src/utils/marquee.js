/**
 * Smooth marquee hover slowdown using Web Animations API
 *
 * This provides a buttery-smooth speed transition by using updatePlaybackRate(),
 * which preserves the animation's current position and smoothly scales the speed
 * without any jerking or jumping.
 */

let isInitialized = false;

export function initializeMarqueeHover() {
  // Prevent multiple initializations
  if (isInitialized) return;

  const container = document.querySelector('.client-marquee-container');
  const track = document.querySelector('.marquee-track');

  if (!container || !track) {
    console.warn('Marquee elements not found');
    return;
  }

  // Helper to try getting animation with retries
  const tryGetAnimation = (retries = 0) => {
    const animations = track.getAnimations();

    if (animations.length === 0) {
      if (retries < 10) {
        // Retry up to 10 times with increasing delays
        console.log(`Marquee animation not found, retry ${retries + 1}/10...`);
        requestAnimationFrame(() => tryGetAnimation(retries + 1));
        return;
      }
      console.warn('Marquee animation not found after 10 retries - CSS animation may not have started');
      return;
    }

    const animation = animations[0];
    console.log('Marquee animation found:', animation);

    // Smooth slowdown on hover (to ~29% speed = 3.4x slower)
    container.addEventListener('mouseenter', () => {
      console.log('Hover enter - slowing down to 0.29x speed');
      animation.updatePlaybackRate(0.29);
    });

    // Smooth speedup when leaving (back to 100% speed)
    container.addEventListener('mouseleave', () => {
      console.log('Hover leave - speeding up to 1x speed');
      animation.updatePlaybackRate(1);
    });

    isInitialized = true;
    console.log('Marquee hover initialized successfully');
  };

  // Start trying to get the animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tryGetAnimation();
    });
  });
}
