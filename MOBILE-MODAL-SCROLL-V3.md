# Mobile Portfolio Modal Scroll Issue - Deep Investigation V3

## Problem Statement

The portfolio modal on mobile devices has an unpredictable scroll behavior. Users cannot reliably scroll the modal content - the scroll only works when touching specific areas of the modal.

### Critical New Observation

**Scroll appears to work based on VERTICAL POSITION of touch on the modal:**
- Touching near the **top** of the modal body = scroll works more often
- Touching near the **bottom** of the modal body = scroll works more often
- Touching in the **middle** of the modal body = scroll fails most often

This suggests the issue may be related to:
1. An invisible element overlaying the middle portion
2. A flex/grid layout issue causing content in the middle to behave differently
3. Absolutely positioned elements (carousel nav, indicators) intercepting touches
4. The modal-body scroll container not properly receiving events in certain zones

### Previous Behavioral Pattern (Still Relevant)
- Starting scroll on the **image** = allows scroll
- Starting scroll on **Mission section** = allows scroll
- Starting scroll on **title** = does NOT allow scroll
- Starting scroll on **Solution section** = does NOT allow scroll
- Starting scroll on **Client/Media type** = allows scroll

---

## Structural Fixes Already Implemented (None Solved the Issue)

### 1. Portal Pattern
Modal is now mounted directly to `document.body` instead of inside the app container:
```javascript
// src/components/ModalPortfolio.js line 547-551
mount(parent) {
  // Portal modal to document.body to escape stacking context issues on mobile
  document.body.appendChild(this.element);
  this.hotkeyModal.mount(document.body);
}
```

### 2. Inert Attribute on Background
When modal opens, the background container gets `inert` attribute:
```javascript
// src/components/ModalPortfolio.js lines 141-167
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;
  document.documentElement.classList.add('modal-open');
  document.body.style.top = `-${this.savedScrollY}px`;

  // Inert the background to prevent ALL interaction
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

### 3. CSS Fallback for Inert
```css
/* src/styles/global.css lines 96-100 */
.container[inert] {
  pointer-events: none !important;
}
```

### 4. Class-based Scroll Lock
```css
/* src/styles/global.css lines 82-94 */
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
```

### 5. Touch-action and User-select
```css
/* src/styles/mobile-fixes.css */
.modal-body {
  touch-action: pan-y !important;
  -webkit-user-select: none !important;
  user-select: none !important;
}
```

### 6. Explicit Height Instead of Max-height
```css
/* src/styles/mobile-fixes.css lines 459-463 */
.modal-body {
  height: calc(100dvh - 230px) !important;
  max-height: none !important;
  flex: 1 1 auto !important;
}
```

### 7. Removed Transform on Mobile
```css
/* src/styles/mobile-fixes.css lines 177-181 */
.modal-content {
  transform: none !important;
  will-change: auto !important;
}
```

---

## Current DOM Structure

```
document.body
├── .container[inert][aria-hidden="true"]  (when modal open)
│   └── ... app content ...
│
└── .portfolio-modal.active
    └── .modal-content
        ├── .modal-header (flex-shrink: 0)
        │   ├── .modal-nav (prev/next buttons)
        │   ├── .modal-language-toggle
        │   └── .modal-header-actions (.modal-close)
        │
        └── .modal-body (overflow-y: auto - THE SCROLL CONTAINER)
            ├── .modal-carousel-container OR .modal-image-container OR .modal-video-container
            │   ├── .modal-carousel (position: relative on mobile)
            │   │   └── .modal-carousel-item.active (display: block, position: relative)
            │   │       └── img
            │   ├── .modal-carousel-prev (position: absolute, top: 50%)
            │   ├── .modal-carousel-next (position: absolute, top: 50%)
            │   └── .modal-carousel-indicators (position: absolute, bottom: 20px)
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

## Current CSS - Desktop Base (content.css)

```css
/* Portfolio Modal - lines 541-578 */
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
  transform: scale(0.9);  /* NOTE: This is overridden to none on mobile */
  transition: transform 300ms ease, height 400ms ease;
  will-change: height;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.portfolio-modal.active .modal-content {
  transform: scale(1);  /* NOTE: This may still apply on mobile! */
}

/* Modal body - lines 725-733 */
.modal-body {
  padding: 40px;
  transition: opacity 300ms ease;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

/* Carousel container - lines 776-799 */
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

/* Carousel navigation - lines 912-942 */
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
  z-index: 10;
}

.modal-carousel-prev { left: 20px; }
.modal-carousel-next { right: 20px; }

/* Carousel indicators - lines 944-972 */
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
```

---

## Current CSS - Mobile Overrides (mobile-fixes.css)

```css
@media (max-width: 768px) {
  /* Modal content - lines 168-182 */
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

  /* Modal body - lines 444-464 */
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

  /* Carousel container - lines 241-262 */
  .modal-carousel-container::before {
    display: none !important;
    content: none !important;
    height: 0 !important;
    visibility: hidden !important;
    position: absolute !important;
  }

  .modal-carousel-container {
    margin-bottom: 15px !important;
    background: transparent !important;
    overflow: visible !important;
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
    touch-action: pan-y !important;
  }

  .modal-carousel-item img {
    width: 100% !important;
    height: auto !important;
    max-height: 60vh !important;
    min-height: 0 !important;
    object-fit: contain !important;
    display: block !important;
    touch-action: pan-y !important;
  }

  /* Text content - lines 499-510 */
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

---

## Key Hypotheses Based on New Observation

### Hypothesis 1: Transform Still Applying on `.active` State
The desktop CSS has:
```css
.portfolio-modal.active .modal-content {
  transform: scale(1);
}
```

While we override `.modal-content { transform: none !important; }`, we may NOT be overriding the `.active .modal-content` rule with sufficient specificity. This transform (even `scale(1)`) can break nested scroll on iOS Safari.

**Test:** Add explicit override:
```css
.portfolio-modal.active .modal-content {
  transform: none !important;
}
```

### Hypothesis 2: Carousel Navigation Buttons Overlaying Content
The carousel prev/next buttons are:
- `position: absolute`
- `top: 50%` with `transform: translateY(-50%)`
- They sit at the LEFT and RIGHT edges but extend into the content area
- On mobile with smaller screen, they may cover more of the scrollable area
- Their `z-index: 10` puts them above the carousel content

**Test:** Temporarily hide carousel nav buttons and test scroll:
```css
.modal-carousel-prev,
.modal-carousel-next {
  display: none !important;
}
```

### Hypothesis 3: Carousel Indicators Creating Dead Zone
The indicators are:
- `position: absolute`
- `bottom: 20px`
- `z-index: 10`

They're positioned INSIDE the carousel container, which on mobile is inside the scroll container. Even though they're visually at the bottom of the image, their hit area might extend upward.

**Test:** Temporarily hide indicators:
```css
.modal-carousel-indicators {
  display: none !important;
}
```

### Hypothesis 4: Grid Layout Creating Touch Dead Zones
The modal-info uses `grid-template-columns: 1fr` on mobile. The title and info items are direct children of modal-body. The gap between grid items might create areas where touch events behave differently.

**Test:** Change modal-body to use simple block layout:
```css
.modal-body {
  display: block !important;
}
.modal-body > * {
  display: block !important;
  width: 100% !important;
}
```

### Hypothesis 5: Flex Container Height Calculation Issue
With `height: calc(100dvh - 230px)`, the modal-body has an explicit height. But the content inside may be taller, creating an internal scroll. If any child has `overflow: hidden` or strange sizing, the scroll region might not cover the full visual area.

**Test:** Use `100%` height with parent constraints:
```css
.modal-body {
  height: 100% !important;
  /* Let parent .modal-content constrain it */
}
```

### Hypothesis 6: Touch Events Being Captured by Parent
The `.portfolio-modal` itself has `touch-action: none` on mobile (line 110 of mobile-fixes.css):
```css
.portfolio-modal {
  touch-action: none !important;
}
```

This might be creating issues where the modal backdrop captures events before they reach modal-body. The touchmove listener on the modal also prevents default on backdrop touches.

**Test:** Remove touch-action: none from modal:
```css
.portfolio-modal {
  touch-action: auto !important;
}
```

### Hypothesis 7: The "Middle Zone" is Exactly Where Text Content Lives
Looking at typical modal layout on mobile:
1. TOP: Image/Carousel (touch-action: pan-y on images)
2. MIDDLE: Title, Mission, Solution (text content)
3. BOTTOM: Client, Media Type (meta info)

The middle is all text. Even with `touch-action: pan-y`, iOS might still try to interpret touches on text as potential text selection or link activation before allowing scroll.

The fact that scroll works at top (image) and bottom (meta) but not middle (text) suggests something about text elements specifically.

**Test:** Make all text completely non-interactive:
```css
.modal-title,
.modal-info-item h3,
.modal-info-item p {
  pointer-events: none !important;
}
```

### Hypothesis 8: Hidden Content From Carousel Transition State
During carousel transitions, items get classes like `exit-next`, `enter-prev`. These items are:
```css
.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev,
.modal-carousel-item.enter-next,
.modal-carousel-item.enter-prev {
  display: block !important;
  position: absolute !important;
  /* ... */
}
```

If transition classes aren't being cleaned up properly, there might be invisible absolutely-positioned carousel items overlaying the scroll area.

**Test:** Force-hide non-active carousel items:
```css
.modal-carousel-item:not(.active) {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

---

## Diagnostic Steps

### Step 1: Visual Debug Overlay
Add this JavaScript to visualize where touch events actually land:

```javascript
// Add to console on mobile device or inject via JS
document.addEventListener('touchstart', function(e) {
  const touch = e.touches[0];
  const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
  console.log('Touch at', touch.clientX, touch.clientY);
  console.log('Elements:', elements.map(el => ({
    tag: el.tagName,
    class: el.className,
    id: el.id
  })));

  // Create visual indicator
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed;
    left: ${touch.clientX - 10}px;
    top: ${touch.clientY - 10}px;
    width: 20px;
    height: 20px;
    background: red;
    border-radius: 50%;
    pointer-events: none;
    z-index: 99999;
    opacity: 0.7;
  `;
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 2000);
}, { passive: true });
```

### Step 2: Check Element Stack at Touch Points
```javascript
// Touch the problem areas and run this
function debugTouchArea(x, y) {
  const elements = document.elementsFromPoint(x, y);
  console.table(elements.map(el => ({
    tag: el.tagName,
    class: el.className.substring(0, 50),
    touchAction: getComputedStyle(el).touchAction,
    pointerEvents: getComputedStyle(el).pointerEvents,
    overflow: getComputedStyle(el).overflow,
    position: getComputedStyle(el).position
  })));
}
```

### Step 3: Measure Modal Body Actual Scroll Area
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

### Step 4: Test Touch Event Propagation
```javascript
['touchstart', 'touchmove', 'touchend'].forEach(evt => {
  document.querySelector('.modal-body').addEventListener(evt, (e) => {
    console.log(`modal-body ${evt}:`, e.target.className);
  }, { passive: true });
});
```

---

## Questions for LLM Investigation

1. **Why would scroll work at top and bottom of modal-body but not middle?** What CSS properties or DOM structures create vertical "zones" of different behavior?

2. **Is there any difference between how iOS Safari handles touch events on text vs images?** Could contenteditable, user-select, or text-related properties affect scroll?

3. **Can absolutely positioned children inside a scroll container create touch dead zones?** The carousel nav/indicators are absolutely positioned inside modal-carousel-container, which is inside the scroll container.

4. **Does `touch-action: pan-y` behave differently when applied to different element types?** Text nodes vs replaced elements (img) vs container elements?

5. **Is the explicit `height: calc(100dvh - 230px)` on modal-body causing the scroll container to not fill its parent correctly?** Should we use `flex: 1` alone without explicit height?

6. **Could the `transition: opacity 300ms ease` on modal-body be affecting touch handling during/after animations?**

7. **Why doesn't the `inert` attribute completely solve this?** If background is inert and modal is portaled to body, there should be no interference. Is something inside the modal itself blocking touches?

---

## File Reference

| File | Lines | Description |
|------|-------|-------------|
| `src/components/ModalPortfolio.js` | 141-167 | lockScroll/unlockScroll with inert |
| `src/components/ModalPortfolio.js` | 547-551 | mount() portal to body |
| `src/components/ModalPortfolio.js` | 98-111 | touchmove event listener |
| `src/styles/content.css` | 541-578 | Desktop modal base styles |
| `src/styles/content.css` | 725-733 | Desktop modal-body styles |
| `src/styles/content.css` | 776-799 | Desktop carousel container |
| `src/styles/content.css` | 912-942 | Carousel nav buttons |
| `src/styles/content.css` | 944-972 | Carousel indicators |
| `src/styles/mobile-fixes.css` | 105-122 | Mobile modal touch-action |
| `src/styles/mobile-fixes.css` | 168-182 | Mobile modal-content override |
| `src/styles/mobile-fixes.css` | 238-380 | Mobile carousel overrides |
| `src/styles/mobile-fixes.css` | 444-528 | Mobile modal-body and text |
| `src/styles/global.css` | 82-100 | Modal-open scroll lock + inert fallback |

---

## Recommended Next Steps (in priority order)

1. **Add visual touch debugger** to see exactly which elements are under the touch point when scroll fails

2. **Test Hypothesis 1** - Add explicit transform override for `.portfolio-modal.active .modal-content`

3. **Test Hypothesis 8** - Force-hide non-active carousel items to eliminate any lingering transition elements

4. **Test Hypothesis 7** - Make text content completely non-interactive with pointer-events: none

5. **Test Hypothesis 6** - Remove touch-action: none from the modal backdrop

6. **Check if the modal-content's `transition: height 400ms ease` is creating issues** - height transitions can affect scroll containers unpredictably

7. **Simplify the modal structure** - Try removing all carousel-related absolutely positioned elements and see if scroll works everywhere
