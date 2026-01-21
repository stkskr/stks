# Mobile Scroll Bug Report - Team Profiles

## Summary

Two issues on mobile team profile cards:

1. **Scroll only works on first tap** - After the first profile card tap, subsequent taps don't scroll (or scroll barely)
2. **Expanded profile affects image position above** - When a profile card expands, it shifts the diamond image in the quadrant section above

---

## Issue 1: Scroll Only Works Once

### Expected Behavior
- Tap any profile card → card expands → page scrolls to show the expanded content with padding from bottom

### Actual Behavior
- First tap: scrolls (but barely enough)
- Second tap on different card: no scroll or tiny scroll
- Subsequent taps: scroll seems broken entirely

### Current Implementation

```javascript
// From src/components/TeamProfiles.js

scrollCardIntoView(card) {
  if (!this.isMobile()) return;

  // Wait for CSS transition to complete (400ms) plus a small buffer
  setTimeout(() => {
    const reveal = card.querySelector('.profile-reveal');
    if (reveal) {
      // Get position and calculate scroll in one go - no competing animations
      const rect = reveal.getBoundingClientRect();
      const targetY = window.scrollY + rect.bottom - window.innerHeight + 150;

      if (rect.bottom > window.innerHeight - 150) {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  }, 450);
}
```

### Debug Data from Device

When tapping cards, an alert showed:
```
bottom=1001, innerH=699, clientH=699, visualVP=699
```

Math: `scrollAmount = 1001 - (699 - 150) = 1001 - 549 = 452px`

This SHOULD scroll 452px, but it doesn't.

### What We've Tried

| Approach | Result |
|----------|--------|
| `window.scrollBy({ top: amount, behavior: 'smooth' })` | Works once, then stops |
| `window.scrollTo({ top: targetY, behavior: 'smooth' })` | Works once, then stops |
| `window.scrollBy(0, amount)` (no smooth) | Tiny scroll once |
| `element.scrollIntoView({ behavior: 'smooth', block: 'end' })` | Scrolls but not enough |
| `scrollIntoView` + `scrollBy` combo | Caused wiggle/jitter |
| `document.scrollingElement.scrollTo()` | Same as window.scrollTo |

### Hypotheses

1. **`e.preventDefault()` in pointer handler blocking scroll** - The tap handler calls `e.preventDefault()` which might be interfering with scroll on subsequent taps

2. **iOS Safari scroll locking** - Something about the first scroll creates a state that blocks future programmatic scrolls

3. **`window.innerHeight` changing** - iOS Safari's viewport height changes with address bar, might be returning wrong values after first scroll

4. **Smooth scroll not completing** - Maybe the smooth scroll animation is being interrupted or queued incorrectly

5. **Touch event state not resetting** - Some internal browser state related to touch/pointer events

### Potential Solutions to Explore

#### From usehooks.com

Consider using React-style hooks patterns even in vanilla JS:

1. **useScrollPosition** - Track scroll position changes
2. **useWindowSize** - Get reliable viewport dimensions
3. **useDebounce** - Debounce scroll calculations
4. **useEventListener** - Clean event listener management

#### Alternative Scroll Approaches

**1. Use `scrollIntoView` with a wrapper element**
Create a hidden spacer element at the desired scroll target:

```javascript
scrollCardIntoView(card) {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  // Create temporary scroll target below the reveal
  const scrollTarget = document.createElement('div');
  scrollTarget.style.cssText = 'height: 1px; margin-top: 150px;';
  reveal.appendChild(scrollTarget);

  scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'end' });

  // Remove after scroll completes
  setTimeout(() => scrollTarget.remove(), 1000);
}
```

**2. Use Intersection Observer instead of manual calculation**

```javascript
scrollCardIntoView(card) {
  const reveal = card.querySelector('.profile-reveal');
  if (!reveal) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        reveal.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
    observer.disconnect();
  }, { threshold: 1.0, rootMargin: '-150px' });

  observer.observe(reveal);
}
```

**3. Use CSS `scroll-margin-bottom`**

```css
.profile-reveal {
  scroll-margin-bottom: 150px;
}
```

Then just:
```javascript
reveal.scrollIntoView({ behavior: 'smooth', block: 'end' });
```

**4. Force layout recalculation before scroll**

```javascript
scrollCardIntoView(card) {
  setTimeout(() => {
    const reveal = card.querySelector('.profile-reveal');
    if (!reveal) return;

    // Force layout recalc
    void reveal.offsetHeight;

    const rect = reveal.getBoundingClientRect();
    // ... rest of calculation
  }, 450);
}
```

**5. Use `requestAnimationFrame` to ensure we're in the right frame**

```javascript
scrollCardIntoView(card) {
  setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const reveal = card.querySelector('.profile-reveal');
        if (!reveal) return;

        reveal.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    });
  }, 450);
}
```

**6. Check if smooth scroll is supported and fallback**

```javascript
const smoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

scrollCardIntoView(card) {
  setTimeout(() => {
    const reveal = card.querySelector('.profile-reveal');
    if (!reveal) return;

    if (smoothScrollSupported) {
      reveal.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      // Polyfill or instant scroll
      reveal.scrollIntoView(false);
    }
  }, 450);
}
```

---

## Issue 2: Expanded Profile Shifts Image Above

### Expected Behavior
- Expanding a profile card should only affect content below it
- The diamond images in the quadrant section above should stay fixed

### Actual Behavior
- When a profile expands, it somehow shifts the position of images in the section above

### Likely Cause

This is probably a CSS layout issue:

1. **Flexbox reflow** - The `.team-grid` uses flexbox, and expanding content might be triggering a reflow that affects items above

2. **`position: relative` on parent** - If a parent container has `position: relative`, the expanding content might be affecting its siblings

3. **Margin collapse** - The expanding `margin-top` on `.profile-reveal` might be collapsing with margins above

### Things to Check

1. What is the "quadrant section" element? Need to identify the exact element being affected.

2. Does the quadrant section share a parent with the team grid?

3. Is there any CSS that uses `vh` units that might be recalculating?

4. Check if any `position: sticky` or `position: fixed` elements are involved.

### Potential CSS Fixes

**1. Isolate the team grid from affecting content above**

```css
.team-grid {
  contain: layout;
}
```

**2. Ensure the section above has its own stacking context**

```css
.quadrant-section {
  position: relative;
  z-index: 1;
  isolation: isolate;
}
```

**3. Use `will-change` to hint at animations**

```css
.profile-reveal {
  will-change: max-height, opacity;
}
```

---

## File References

| File | Purpose |
|------|---------|
| `src/components/TeamProfiles.js` | Contains `scrollCardIntoView()` and event handlers |
| `src/styles/content.css` | Contains `.team-member`, `.profile-reveal`, `.team-grid` styles |

---

## Current Event Handler Code

```javascript
bindMobileCardToggle() {
  const grid = this.element;

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
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const interactive = e.target.closest('a, button, input, textarea, select, label');
    if (interactive) return;

    const card = e.target.closest('.team-member');
    if (!card || !grid.contains(card)) return;

    e.preventDefault();  // <-- MIGHT BE BLOCKING SCROLL?
    e.stopPropagation();

    const wasActive = card.classList.contains('mobile-active');

    closeAll();
    if (!wasActive) openCard(card);
  };

  grid.addEventListener('pointerup', onPointerUpCapture, { capture: true });

  document.addEventListener('pointerup', (e) => {
    if (!this.isMobile()) return;
    if (!grid.contains(e.target)) closeAll();
  }, { capture: true });
}
```

---

## CSS for Profile Reveal

```css
.profile-reveal {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease,
              margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 20px;
  margin-top: 0;
  /* ... other styles */
}

.team-member.mobile-active .profile-reveal {
  max-height: 500px;
  opacity: 1;
  padding: 20px;
  margin-top: 20px;
}
```

---

## Questions for Debugging

1. Does removing `e.preventDefault()` from the pointer handler fix the scroll issue?

2. What is the exact element/section being affected by the "image shift" issue?

3. Does using `contain: layout` on `.team-grid` isolate it from affecting content above?

4. Does the scroll work if we use `scrollIntoView` without any custom calculation?

5. Is there a scroll container OTHER than `document` that we should be scrolling?

---

## Environment

- **Framework:** Vanilla JavaScript (ES6 modules)
- **Build:** Vite
- **Primary Target:** iOS Safari, Chrome Mobile
- **Mobile Breakpoint:** `window.innerWidth <= 768`
