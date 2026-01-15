# Mobile Portfolio Modal Scroll Issue - Complete Summary

## Problem Statement

The portfolio modal on mobile devices has an unpredictable scroll behavior. Users cannot reliably scroll the modal content - the scroll only works when touching specific areas of the modal.

### Observed Behavior Patterns

**Pattern 1 - Vertical Position:**
- Touching near the **top** of the modal body = scroll works more often
- Touching near the **bottom** of the modal body = scroll works more often
- Touching in the **middle** of the modal body = scroll fails most often

**Pattern 2 - Element-based:**
- Starting scroll on the **image** = allows scroll
- Starting scroll on **Mission section** = allows scroll
- Starting scroll on **title** = does NOT allow scroll
- Starting scroll on **Solution section** = does NOT allow scroll
- Starting scroll on **Client/Media type** = allows scroll

---

## Current Architecture

### DOM Structure (when modal is open)

```
document.body
├── .container[inert][aria-hidden="true"]
│   └── ... app content (completely disabled) ...
│
└── .portfolio-modal.active              ← PORTALED directly to body
    └── .modal-content
        ├── .modal-header (flex-shrink: 0)
        │   ├── .modal-nav (prev/next project buttons)
        │   ├── .modal-language-toggle
        │   └── .modal-header-actions (.modal-close)
        │
        └── .modal-body                  ← THE SCROLL CONTAINER
            ├── .modal-carousel-container (or .modal-image-container or .modal-video-container)
            │   ├── .modal-carousel
            │   │   └── .modal-carousel-item.active
            │   │       └── img
            │   ├── .modal-carousel-prev (position: absolute)
            │   ├── .modal-carousel-next (position: absolute)
            │   └── .modal-carousel-indicators (position: absolute)
            │
            ├── h2.modal-title
            │
            ├── .modal-info
            │   ├── .modal-info-item (Mission)
            │   │   ├── h3
            │   │   └── p
            │   └── .modal-info-item (Solution)
            │       ├── h3
            │       └── p
            │
            └── .modal-meta
                ├── .modal-meta-item (Client)
                └── .modal-meta-item (Media Type)
```

---

## Complete Current CSS

### Desktop Base Styles (src/styles/content.css)

```css
/* Lines 541-578 - Portfolio Modal */
.portfolio-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 300ms ease, visibility 0s linear 300ms;
  padding: 40px 20px;
}

.portfolio-modal.active {
  opacity: 1;
  visibility: visible;
  transition: opacity 300ms ease;
}

.modal-content {
  width: 90%;
  max-width: 1200px;
  max-height: calc(100vh - 80px);
  background: white;
  border-radius: 8px;
  position: relative;
  transform: scale(0.9);
  transition: transform 300ms ease, height 400ms ease;
  will-change: height;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.portfolio-modal.active .modal-content {
  transform: scale(1);
}

/* Lines 725-733 - Modal Body */
.modal-body {
  padding: 40px;
  transition: opacity 300ms ease;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

/* Lines 776-799 - Carousel Container */
.modal-carousel-container {
  width: 100%;
  margin-bottom: 40px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.modal-carousel-container::before {
  content: '';
  display: block;
  width: 100%;
  height: 550px;
  max-height: 550px;
}

.modal-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Lines 801-844 - Carousel Items */
.modal-carousel-item {
  display: none;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: translateX(0);
}

.modal-carousel-item.active {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  transform: translateX(0);
}

.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev,
.modal-carousel-item.enter-next,
.modal-carousel-item.enter-prev {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.modal-carousel-item img {
  max-width: 100%;
  max-height: 550px;
  min-height: 550px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Lines 912-942 - Carousel Navigation */
.modal-carousel-prev,
.modal-carousel-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 200ms ease;
  z-index: 10;
}

.modal-carousel-prev { left: 20px; }
.modal-carousel-next { right: 20px; }

/* Lines 944-972 - Carousel Indicators */
.modal-carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.modal-carousel-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 200ms ease;
}

.modal-carousel-indicator.active {
  background: white;
}
```

### Mobile Override Styles (src/styles/mobile-fixes.css)

```css
@media (max-width: 768px) {
  /* Lines 105-123 - Modal Touch Handling */
  .portfolio-modal {
    width: 100% !important;
    max-width: 100vw;
    touch-action: auto !important;
  }

  .portfolio-modal .modal-content {
    touch-action: pan-y !important;
  }

  .portfolio-modal.active .modal-content {
    transform: none !important;
  }

  /* Lines 168-182 - Modal Content */
  .modal-content {
    max-height: calc(100dvh - 150px) !important;
    width: 95% !important;
    max-width: calc(100vw - 20px) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    transform: none !important;
    will-change: auto !important;
    transition: opacity 300ms ease !important;
  }

  /* Lines 241-271 - Carousel Container */
  .modal-carousel-container::before {
    display: none !important;
    content: none !important;
    height: 0 !important;
    max-height: 0 !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    visibility: hidden !important;
    position: absolute !important;
  }

  .modal-carousel-container {
    margin-bottom: 15px !important;
    background: transparent !important;
    overflow: hidden !important;
    height: auto !important;
    min-height: 0 !important;
    touch-action: pan-y !important;
  }

  .modal-carousel {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    touch-action: pan-y !important;
  }

  /* Lines 280-321 - Carousel Items */
  .modal-carousel-item {
    display: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    align-items: initial !important;
    justify-content: initial !important;
  }

  .modal-carousel-item.active {
    display: block !important;
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    touch-action: pan-y !important;
  }

  .modal-carousel-item.exit-next,
  .modal-carousel-item.exit-prev,
  .modal-carousel-item.enter-next,
  .modal-carousel-item.enter-prev {
    display: block !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    pointer-events: none !important;
  }

  .modal-carousel-item:not(.active) {
    pointer-events: none !important;
  }

  .modal-carousel-item img {
    width: 100% !important;
    height: auto !important;
    max-height: 60vh !important;
    min-height: 0 !important;
    max-width: 100% !important;
    object-fit: contain !important;
    display: block !important;
    touch-action: pan-y !important;
  }

  /* Lines 326-357 - Single Image Container */
  .modal-image-container {
    margin-bottom: 15px !important;
    overflow: visible !important;
    height: auto !important;
    min-height: 0 !important;
    display: block !important;
    background: transparent !important;
    touch-action: pan-y !important;
  }

  .modal-image-container::before {
    display: none !important;
    content: none !important;
    height: 0 !important;
    visibility: hidden !important;
    position: absolute !important;
  }

  .modal-image-container img {
    width: 100% !important;
    height: auto !important;
    max-height: 60vh !important;
    min-height: 0 !important;
    object-fit: contain !important;
    display: block !important;
    touch-action: pan-y !important;
  }

  /* Lines 369-391 - Carousel Controls */
  .modal-carousel-prev,
  .modal-carousel-next {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    touch-action: manipulation !important;
  }

  .modal-carousel-prev {
    left: 10px !important;
  }

  .modal-carousel-next {
    right: 10px !important;
  }

  .modal-carousel-indicators {
    touch-action: manipulation !important;
  }

  /* Lines 444-473 - Modal Body (THE SCROLL CONTAINER) */
  .modal-body {
    padding: 15px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain !important;
    position: relative !important;
    min-height: 0 !important;
    scroll-behavior: auto !important;
    touch-action: pan-y !important;
    height: calc(100dvh - 230px) !important;
    max-height: none !important;
    flex: 1 1 auto !important;
    -webkit-user-select: none !important;
    user-select: none !important;
  }

  /* Lines 499-510 - Text Content Touch Handling */
  .modal-title,
  .modal-info,
  .modal-info-item,
  .modal-info-item h3,
  .modal-info-item p,
  .modal-meta,
  .modal-meta-item,
  .modal-meta-label {
    touch-action: pan-y !important;
    -webkit-touch-callout: none !important;
  }
}
```

### Global Scroll Lock Styles (src/styles/global.css)

```css
/* Lines 82-100 */
html.modal-open,
html.modal-open body {
  overflow: hidden !important;
  height: 100% !important;
}

html.modal-open body.stateExpanding {
  position: fixed !important;
  overflow: hidden !important;
  width: 100% !important;
}

.container[inert] {
  pointer-events: none !important;
}
```

---

## Complete Current JavaScript

### ModalPortfolio.js - Scroll Lock Implementation (Lines 141-167)

```javascript
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;
  // Use class-based lock that beats body.stateExpanding !important rules
  document.documentElement.classList.add('modal-open');
  document.body.style.top = `-${this.savedScrollY}px`;

  // Inert the background to prevent ALL interaction (structural fix for mobile scroll)
  const appContainer = document.getElementById('app') || document.querySelector('.container');
  if (appContainer) {
    appContainer.setAttribute('inert', '');
    appContainer.setAttribute('aria-hidden', 'true');
  }
}

unlockScroll() {
  document.documentElement.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, this.savedScrollY || 0);
  this.savedScrollY = 0;

  // Remove inert from background
  const appContainer = document.getElementById('app') || document.querySelector('.container');
  if (appContainer) {
    appContainer.removeAttribute('inert');
    appContainer.removeAttribute('aria-hidden');
  }
}
```

### ModalPortfolio.js - Portal Mount (Lines 547-552)

```javascript
mount(parent) {
  // Portal modal to document.body to escape stacking context issues on mobile
  // This ensures the modal is completely outside the app container hierarchy
  document.body.appendChild(this.element);
  this.hotkeyModal.mount(document.body);
}
```

### ModalPortfolio.js - Touch Event Listener (Lines 106-111)

```javascript
// Prevent touch events on the backdrop from passing through to background
this.element.addEventListener('touchmove', (e) => {
  // Only prevent default if touch is on the backdrop itself, not on modal content
  if (e.target === this.element) {
    e.preventDefault();
  }
}, { passive: false });
```

### ModalPortfolio.js - Carousel Transition Logic (Lines 470-528)

```javascript
const showSlide = (index, explicitDirection = null) => {
  if (index === currentIndex) return;

  let direction;
  if (explicitDirection) {
    direction = explicitDirection;
  } else {
    const isWrappingForward = currentIndex === items.length - 1 && index === 0;
    const isWrappingBackward = currentIndex === 0 && index === items.length - 1;

    if (isWrappingForward) {
      direction = 'next';
    } else if (isWrappingBackward) {
      direction = 'prev';
    } else {
      direction = index > currentIndex ? 'next' : 'prev';
    }
  }

  const currentItem = items[currentIndex];
  const nextItem = items[index];

  // Remove all animation classes from all items first
  items.forEach((item) => {
    item.classList.remove('exit-next', 'exit-prev', 'enter-next', 'enter-prev');
  });

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

  // Clean up animation classes after transition completes
  setTimeout(() => {
    items.forEach((item) => {
      item.classList.remove('exit-next', 'exit-prev', 'enter-next', 'enter-prev');
    });
  }, 450);

  indicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === index);
  });
  currentIndex = index;
};
```

---

## Diagnostic JavaScript

### Touch Stack Debugger
```javascript
document.addEventListener("touchstart", (e) => {
  const t = e.touches?.[0];
  if (!t) return;

  const stack = document.elementsFromPoint(t.clientX, t.clientY).slice(0, 12);
  console.log("TOUCHSTACK", {
    x: t.clientX,
    y: t.clientY,
    top: stack[0]?.tagName,
    topClass: stack[0]?.className,
    stack: stack.map(el => ({
      tag: el.tagName,
      id: el.id,
      class: (el.className || "").toString().slice(0, 80),
      pe: getComputedStyle(el).pointerEvents,
      pos: getComputedStyle(el).position,
      z: getComputedStyle(el).zIndex
    }))
  });
}, { passive: true });
```

### Scroll Container Measurements
```javascript
const body = document.querySelector('.modal-body');
console.log({
  scrollHeight: body.scrollHeight,
  clientHeight: body.clientHeight,
  offsetHeight: body.offsetHeight,
  scrollTop: body.scrollTop,
  canScroll: body.scrollHeight > body.clientHeight
});
```

---

## All Attempted Fixes (None Have Worked)

### Structural Changes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 1 | Portal pattern | Modal mounted directly to `document.body` instead of app container | ModalPortfolio.js:547-552 | ❌ Did not fix |
| 2 | Inert attribute | Background container gets `inert` + `aria-hidden` when modal opens | ModalPortfolio.js:141-167 | ❌ Did not fix |
| 3 | CSS fallback for inert | `.container[inert] { pointer-events: none }` | global.css:96-100 | ❌ Did not fix |

### Scroll Lock Changes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 4 | Class-based scroll lock | Changed from inline styles to `html.modal-open` class | global.css:82-94, ModalPortfolio.js | ❌ Did not fix |
| 5 | Beat stateExpanding | Added `html.modal-open body.stateExpanding` override | global.css:89-94 | ❌ Did not fix |

### Transform Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 6 | Remove transform on mobile | `.modal-content { transform: none }` | mobile-fixes.css:178 | ❌ Did not fix |
| 7 | Override .active transform | `.portfolio-modal.active .modal-content { transform: none }` | mobile-fixes.css:119-123 | ❌ Did not fix |
| 8 | Remove will-change | `will-change: auto` on mobile | mobile-fixes.css:179 | ❌ Did not fix |

### Touch-action Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 9 | touch-action: pan-y on modal-body | Allow vertical panning on scroll container | mobile-fixes.css:458 | ❌ Did not fix |
| 10 | touch-action: pan-y on all text | Applied to title, info, meta elements | mobile-fixes.css:499-510 | ❌ Did not fix |
| 11 | touch-action: pan-y on images | Applied to carousel and single images | mobile-fixes.css (various) | ❌ Did not fix |
| 12 | touch-action: none → auto on modal | Changed `.portfolio-modal` from none to auto | mobile-fixes.css:111 | ❌ Did not fix |
| 13 | touch-action: manipulation on controls | Applied to carousel prev/next/indicators | mobile-fixes.css:361,374 | ❌ Did not fix |
| 14 | Removed blanket touch-action rule | Removed `.modal-body * { touch-action: pan-y }` | mobile-fixes.css:466-467 | ❌ Did not fix |

### Overflow Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 15 | overflow: hidden on carousel container | Changed from `overflow: visible` to prevent controls bleeding out | mobile-fixes.css:259 | ❌ Did not fix |
| 16 | overscroll-behavior: contain | Prevent scroll chaining to background | mobile-fixes.css:451 | ❌ Did not fix |

### Height/Sizing Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 17 | Explicit height on modal-body | `height: calc(100dvh - 230px)` instead of max-height | mobile-fixes.css:461 | ❌ Did not fix |
| 18 | min-height: 0 everywhere | Kill desktop min-height: 550px on images/containers | mobile-fixes.css (various) | ❌ Did not fix |

### Selection/Interaction Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 19 | user-select: none on modal-body | Prevent text selection from blocking scroll | mobile-fixes.css:471-472 | ❌ Did not fix |
| 20 | -webkit-touch-callout: none | Disable iOS callout on text elements | mobile-fixes.css:508 | ❌ Did not fix |
| 21 | pointer-events: none on transition slides | Prevent exit/enter slides from blocking touches | mobile-fixes.css:306,311 | ❌ Did not fix |

### Scroll Behavior Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 22 | scroll-behavior: auto | Removed smooth scrolling that interferes with touch | mobile-fixes.css:456 | ❌ Did not fix |
| 23 | -webkit-overflow-scrolling: touch | Enable momentum scrolling on iOS | mobile-fixes.css:449 | ❌ Did not fix |

### Event Listener Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 24 | touchmove preventDefault on backdrop | Only prevent default when touching the backdrop itself | ModalPortfolio.js:106-111 | ❌ Did not fix |

### Visibility Fixes

| # | Fix | Description | File | Status |
|---|-----|-------------|------|--------|
| 25 | visibility instead of pointer-events | Changed inactive modal from `pointer-events: none` to `visibility: hidden` | content.css:554 | ❌ Did not fix |

---

## Key Questions Still Unanswered

1. **Why does the touch stack debugger show the correct elements but scroll still fails?**

2. **What is different about the middle zone of the modal that causes scroll to fail there?**

3. **Is there something specific to iOS Safari's touch handling that we're missing?**

4. **Could there be a timing issue where CSS properties are applied after touch events are already captured?**

5. **Is there interference from the carousel animation system even when no animation is occurring?**

6. **Does the flex layout of modal-content → modal-body create some invisible zone that captures touches?**

7. **Could the `transition: height 400ms ease` on modal-content be creating issues even when not animating?**

---

## File Reference

| File | Key Lines | Purpose |
|------|-----------|---------|
| `src/components/ModalPortfolio.js` | 106-111 | touchmove event listener |
| `src/components/ModalPortfolio.js` | 141-167 | lockScroll/unlockScroll |
| `src/components/ModalPortfolio.js` | 470-528 | carousel transition logic |
| `src/components/ModalPortfolio.js` | 547-552 | portal mount |
| `src/styles/content.css` | 541-578 | desktop modal base |
| `src/styles/content.css` | 725-733 | desktop modal-body |
| `src/styles/content.css` | 776-844 | desktop carousel |
| `src/styles/content.css` | 912-972 | carousel controls |
| `src/styles/mobile-fixes.css` | 105-123 | mobile modal touch |
| `src/styles/mobile-fixes.css` | 168-182 | mobile modal-content |
| `src/styles/mobile-fixes.css` | 241-321 | mobile carousel |
| `src/styles/mobile-fixes.css` | 369-391 | mobile carousel controls |
| `src/styles/mobile-fixes.css` | 444-510 | mobile modal-body |
| `src/styles/global.css` | 82-100 | scroll lock + inert |
