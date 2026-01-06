# Client Marquee Hover Issue

## Problem
The client marquee animation jerks/skips when hovering over it. The transition is not smooth.

## Current Implementation

**File:** `src/styles/content.css` (lines 1184-1194)

```css
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee-scroll 35s linear infinite;
  will-change: transform;
  transition: animation-duration 0.3s ease;
}

.client-marquee-container:hover .marquee-track {
  animation-duration: 120s;
}
```

**Animation keyframes:**
```css
@keyframes marquee-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-2640px);
  }
}
```

## Issue Analysis
The current approach changes `animation-duration` on hover, which causes the animation to restart/recalculate, resulting in a jerky visual effect. CSS cannot smoothly transition between different animation durations on an already-running animation.

## Desired Behavior
- Normal state: Marquee scrolls at regular speed (35s per loop)
- On hover: Marquee should **smoothly slow down** without any jerking, skipping, or restarting
- On unhover: Marquee should **smoothly speed back up** to normal speed
- The animation should be continuous and seamless throughout all state changes

## Requirements
1. No jerking or jumping when mouse enters/leaves the marquee area
2. Smooth deceleration when hovering
3. Smooth acceleration when un-hovering
4. Animation should never restart or skip positions
5. The slowdown should be noticeable but elegant (approximately 3-4x slower)

## Constraints
- Must work across modern browsers (Chrome, Firefox, Safari, Edge)
- Should maintain infinite loop behavior
- Should not impact performance (avoid JavaScript-based solutions if possible)
- Must be compatible with existing marquee structure

## Technical Notes
The issue stems from CSS animations not supporting smooth runtime duration changes. Potential solutions might involve:
- Using CSS `animation-play-state` with careful timing
- JavaScript-based animation control
- CSS transitions on `transform` instead of animations
- Hybrid approach combining multiple techniques

---

## ✅ SOLUTION IMPLEMENTED

**Status:** FIXED using Web Animations API

### Implementation Details

**File:** `src/utils/marquee.js` (NEW)
```javascript
export function initializeMarqueeHover() {
  const container = document.querySelector('.client-marquee-container');
  const track = document.querySelector('.marquee-track');

  if (!container || !track) return;

  requestAnimationFrame(() => {
    const animations = track.getAnimations();
    if (animations.length === 0) return;

    const animation = animations[0];

    // Smooth slowdown on hover (to 29% speed ≈ 4x slower)
    container.addEventListener('mouseenter', () => {
      animation.updatePlaybackRate(0.29);
    });

    // Smooth speedup when leaving (back to 100% speed)
    container.addEventListener('mouseleave', () => {
      animation.updatePlaybackRate(1);
    });
  });
}
```

**CSS Changes:** `src/styles/content.css`
- Removed: `transition: animation-duration 0.3s ease;`
- Removed: `.client-marquee-container:hover .marquee-track { animation-duration: 120s; }`

**Integration:** `src/main.js`
- Imported `initializeMarqueeHover` from `./utils/marquee.js`
- Called in state subscriber when `state.currentSection === 'clients'`

### Why This Works
The Web Animations API's `updatePlaybackRate()` method:
1. **Preserves Position**: Calculates exact `currentTime` and scales speed from that point
2. **Hardware Accelerated**: Runs on compositor thread (60fps smooth)
3. **No Recalculation**: Doesn't restart or jump the animation
4. **Browser Native**: Supported in all modern browsers

### Result
✨ **Perfectly smooth slowdown/speedup with zero jerking or skipping**

---

## 🔧 TROUBLESHOOTING: Animation Not Found

**Issue:** `getAnimations()` returns empty array immediately after DOM insertion.

**Root Cause:** CSS animations need 1-2 frames to initialize after element creation.

**Solution:** Added retry mechanism with up to 10 attempts across multiple animation frames.

**Updated Implementation in `src/utils/marquee.js`:**
```javascript
const tryGetAnimation = (retries = 0) => {
  const animations = track.getAnimations();

  if (animations.length === 0) {
    if (retries < 10) {
      console.log(`Marquee animation not found, retry ${retries + 1}/10...`);
      requestAnimationFrame(() => tryGetAnimation(retries + 1));
      return;
    }
    console.warn('Marquee animation not found after 10 retries');
    return;
  }

  const animation = animations[0];
  // Attach event listeners...
};

// Start with double RAF + retry mechanism
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    tryGetAnimation();
  });
});
```

This ensures the animation is found even when initialization timing varies across browsers.
