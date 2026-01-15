# Mobile Modal Scroll - Code Audit Diagnostic

## A) All `preventDefault()` Calls with Context

### 1. ModalPortfolio.js - TOUCHMOVE on backdrop (lines 106-111)
```javascript
// Prevent touch events on the backdrop from passing through to background
this.element.addEventListener('touchmove', (e) => {
  // Only prevent default if touch is on the backdrop itself, not on modal content
  if (e.target === this.element) {
    e.preventDefault();
  }
}, { passive: false });
```
**Event:** touchmove
**Listener Options:** `{ passive: false }`
**Risk:** LOW - only triggers when `e.target === this.element` (the backdrop)

### 2. ModalPortfolio.js - TOUCHMOVE scroll capture (lines 182-197)
```javascript
el.addEventListener('touchmove', (e) => {
  const y = e.touches[0].clientY;
  const dy = y - startY;

  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

  const pullingDown = dy > 0;
  const pushingUp = dy < 0;

  // Only preventDefault at the boundaries
  if ((atTop && pullingDown) || (atBottom && pushingUp)) {
    e.preventDefault();
  }
}, { passive: false });
```
**Event:** touchmove
**Listener Options:** `{ passive: false }`
**Risk:** LOW - only at scroll boundaries, but this listener is on `.modal-body`

### 3. keyboard.js - Multiple keydown handlers (lines 35-74)
```javascript
if (key === 'e') {
  e.preventDefault();
  router.switchLanguage('en');
} // ... etc
```
**Event:** keydown
**Listener Options:** none (default)
**Risk:** NONE - keyboard only

### 4. Content.js - CTA button click (lines 189-194)
```javascript
button.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  window.dispatchEvent(new CustomEvent('openContactTab'));
});
```
**Event:** click
**Listener Options:** none
**Risk:** NONE - click only, on specific buttons

### 5. HotkeyModal.js - Keydown (lines 106-115)
```javascript
this.handleKeyDown = (e) => {
  if (!this.isOpen) return;
  const key = e.key.toLowerCase();
  if (key === 'escape' || key === 'b') {
    e.preventDefault();
    e.stopPropagation();
    this.close();
  }
};
```
**Event:** keydown
**Listener Options:** none
**Risk:** NONE - keyboard only

### 6. TeamProfiles.js - touchend (lines 99-105)
```javascript
if (isMobile()) {
  const touchDuration = Date.now() - touchStartTime;
  if (!isTouchMoving && touchDuration < 200) {
    e.preventDefault();
    e.stopPropagation();
    // ... toggle profile
  }
}
```
**Event:** touchend
**Listener Options:** `{ passive: false }`
**Risk:** LOW - only on team profile cards, not in modal

### 7. QuoteCarousel.js - pointerup (lines 68-90)
```javascript
const onPrev = (e) => {
  if (e.pointerType && e.isPrimary === false) return;
  e.preventDefault();
  e.stopPropagation();
  this.moveToSlide(this.currentIndex - 1);
};
this.prevBtn.addEventListener('pointerup', onPrev, { passive: false });
this.nextBtn.addEventListener('pointerup', onNext, { passive: false });
// Prevent ghost clicks
this.prevBtn.addEventListener('click', (e) => e.preventDefault());
this.nextBtn.addEventListener('click', (e) => e.preventDefault());
```
**Event:** pointerup, click
**Listener Options:** `{ passive: false }`
**Risk:** LOW - only on quote carousel buttons, not in portfolio modal

---

## B) All Touch/Pointer Event Listeners

| File | Line | Element | Event | Options | Notes |
|------|------|---------|-------|---------|-------|
| BottomTabs.js | 125 | scrollContainer | touchstart | `{ passive: true }` | Safe |
| GridQuadrant.js | 178 | document.body | touchmove | `{ passive: true }` | **Empty handler** - passive, safe |
| GridQuadrant.js | 181 | window | touchmove | `{ passive: true }` | **Empty handler** - passive, safe |
| ModalPortfolio.js | 106 | this.element (backdrop) | touchmove | `{ passive: false }` | **Conditional preventDefault** |
| ModalPortfolio.js | 178 | .modal-body | touchstart | `{ passive: true }` | Safe |
| ModalPortfolio.js | 182 | .modal-body | touchmove | `{ passive: false }` | **Boundary preventDefault** |
| QuoteCarousel.js | 85-86 | prev/next buttons | pointerup | `{ passive: false }` | On buttons only |
| TeamProfiles.js | 124 | card | touchstart | `{ passive: true }` | Safe |
| TeamProfiles.js | 125 | card | touchmove | `{ passive: true }` | Safe |
| TeamProfiles.js | 126 | card | touchend | `{ passive: false }` | On team cards only |

---

## C) Absolutely/Fixed Positioned Elements in Modal

### Inside `.portfolio-modal` (content.css)

| Selector | Position | z-index | pointer-events | Dimensions |
|----------|----------|---------|----------------|------------|
| `.portfolio-modal` | fixed | 1000 | (default auto) | 100vw × 100vh |
| `.modal-header` | static | 10 | (default auto) | auto |
| `.modal-carousel` | absolute | (default auto) | (default auto) | 100% × 100% (of container) |
| `.modal-carousel-item.active` | absolute | (default auto) | (default auto) | 100% × 100% |
| `.modal-carousel-item.exit-*` | absolute | (default auto) | **none (mobile)** | 100% × auto |
| `.modal-carousel-item.enter-*` | absolute | (default auto) | **none (mobile)** | 100% × auto |
| `.modal-carousel-prev` | absolute | 10 | (default auto) | 40px × 40px (44px mobile) |
| `.modal-carousel-next` | absolute | 10 | (default auto) | 40px × 40px (44px mobile) |
| `.modal-carousel-indicators` | absolute | 10 | (default auto) | auto (centered) |
| `.youtube-play-btn` | absolute | 1 | (default auto) | 68px × 48px |

### Mobile Overrides (mobile-fixes.css)

| Selector | Changes |
|----------|---------|
| `.modal-carousel-container` | `overflow: hidden` (was visible) |
| `.modal-carousel` | `position: relative` (overrides absolute) |
| `.modal-carousel-item.active` | `position: relative`, `display: block` |
| `.modal-carousel-item:not(.active)` | `pointer-events: none` |
| `.modal-carousel-item.exit-*/.enter-*` | `pointer-events: none` |
| `.modal-carousel-prev/.next` | `touch-action: manipulation` |
| `.modal-carousel-indicators` | `touch-action: manipulation` |

---

## D) Potential Issues Identified

### Issue 1: Two touchmove listeners on modal with `{ passive: false }`

**Location:** ModalPortfolio.js lines 106-111 and 182-197

The backdrop listener (lines 106-111) is on `this.element` which is `.portfolio-modal`. Even though it checks `if (e.target === this.element)`, the listener is registered with `{ passive: false }`.

**Question:** Could this listener still affect event propagation even when it doesn't call preventDefault?

### Issue 2: GridQuadrant.js adds empty passive listeners to body/window

```javascript
// Lines 175-182
if (!document.body._scrollListenerAdded) {
  document.body.addEventListener('scroll', () => {}, { passive: true });
  document.body.addEventListener('wheel', () => {}, { passive: true });
  document.body.addEventListener('touchmove', () => {}, { passive: true });
  window.addEventListener('scroll', () => {}, { passive: true });
  window.addEventListener('wheel', () => {}, { passive: true });
  window.addEventListener('touchmove', () => {}, { passive: true });
  document.body._scrollListenerAdded = true;
}
```

**Question:** Why are these empty handlers added? They're passive so shouldn't block, but this is unusual.

### Issue 3: Carousel items with z-index: 10 on navigation

The carousel prev/next buttons and indicators all have `z-index: 10`. While mobile-fixes.css sets `touch-action: manipulation` on them, they still receive touch events.

**Question:** Even with `touch-action: manipulation`, could these elements be intercepting touches that should initiate scroll?

---

## E) CSS Load Order

Based on imports, the likely order is:
1. `variables.css` (CSS custom properties)
2. `global.css` (base styles)
3. `content.css` (component styles)
4. `mobile-fixes.css` (media query overrides)

**Question:** Is there any dynamic CSS injection that could alter this order?

---

## F) Scroll Container Analysis

### Elements with `overflow: auto|scroll`

| File | Selector | Property | Notes |
|------|----------|----------|-------|
| global.css | `body.stateExpanding` | `overflow-y: scroll` | When page is expanded |
| global.css | `html.modal-open body` | `overflow: hidden` | When modal is open |
| content.css | `.modal-body` | `overflow-y: auto` | Desktop default |
| mobile-fixes.css | `.modal-body` | `overflow-y: scroll` | **Mobile forces scroll** |
| content.css | `.content-box` | `overflow-x: hidden` | Content area |

### Elements with `-webkit-overflow-scrolling: touch`

| File | Selector |
|------|----------|
| content.css | `.modal-body` |
| mobile-fixes.css | `.modal-body` |

**Only `.modal-body` should be scrollable when modal is open on mobile.**

---

## G) Carousel Transition Lifecycle

### Where classes are added (ModalPortfolio.js lines 500-515):
```javascript
// Add exit animation to current item
if (currentItem) {
  currentItem.classList.remove('active');
  requestAnimationFrame(() => {
    currentItem.classList.add(`exit-${direction}`);
  });
}

// Add enter animation to next item
if (nextItem) {
  nextItem.classList.add('active');
  requestAnimationFrame(() => {
    nextItem.classList.add(`enter-${direction}`);
  });
}
```

### Where classes are removed (lines 518-522):
```javascript
// Clean up animation classes after transition completes
setTimeout(() => {
  items.forEach((item) => {
    item.classList.remove('exit-next', 'exit-prev', 'enter-next', 'enter-prev');
  });
}, 450);
```

### Potential Issue:
If `showSlide` is called again before the 450ms timeout, the old timeout still fires and removes classes. But the new transition also adds classes. This could cause:
- Multiple items with `active` class briefly
- Classes being removed from new active item

**However:** mobile-fixes.css sets `pointer-events: none` on all non-active items, so this shouldn't create touch blockers.

---

## H) Key Findings Summary

1. **Two non-passive touchmove listeners in ModalPortfolio.js** - One on backdrop, one on modal-body. Both are conditional about preventDefault, but both are `{ passive: false }`.

2. **Empty touchmove listeners on body/window** in GridQuadrant.js - Passive, but unusual pattern.

3. **Carousel controls have z-index: 10** - Higher than carousel content, could intercept touches.

4. **Carousel transitions use setTimeout cleanup** - Could have race conditions but pointer-events: none should protect.

5. **Only one scroll container** on mobile when modal is open - `.modal-body` with `overflow-y: scroll`.

---

## I) Recommended Tests

### Test 1: Remove backdrop touchmove listener
Comment out lines 104-111 in ModalPortfolio.js and test if scroll works everywhere.

### Test 2: Remove scroll capture listener
Comment out `this.setupMobileScrollCapture()` call (line 229) and test if scroll works (but may have edge scrolling issues).

### Test 3: Hide carousel controls completely
```css
@media (max-width: 768px) {
  .modal-carousel-prev,
  .modal-carousel-next,
  .modal-carousel-indicators {
    display: none !important;
  }
}
```

### Test 4: Force pointer-events none on carousel controls
```css
@media (max-width: 768px) {
  .modal-carousel-prev,
  .modal-carousel-next,
  .modal-carousel-indicators {
    pointer-events: none !important;
  }
}
```

### Test 5: Log touch events to see if modal-body receives them
```javascript
const mb = document.querySelector('.modal-body');
['touchstart', 'touchmove', 'touchend'].forEach(evt => {
  mb.addEventListener(evt, (e) => {
    console.log(`modal-body ${evt}:`, e.target.className, 'defaultPrevented:', e.defaultPrevented);
  }, { passive: true, capture: true });
});
```
