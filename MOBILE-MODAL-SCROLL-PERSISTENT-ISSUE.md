# Mobile Portfolio Modal Scroll - Persistent Issue

## Purpose of This Document

This document is structured as both:
1. A troubleshooting guide for a persistent mobile scroll issue
2. An LLM prompt to help investigate and fix the problem

The issue has persisted through multiple fix attempts. This document captures all context, code changes made, and the specific behavioral pattern observed.

---

## Instructions for LLM

You are debugging a **persistent mobile scroll issue** in a portfolio modal. Despite multiple rounds of fixes, users still cannot reliably scroll the modal content on mobile devices.

**Critical observation from user testing:**
> "The behaviour is very strange and unpredictable still with regards to where you need to tap to begin the scroll in order to get it to work."
>
> With some consistency a pattern seems to be:
> - Starting scroll with thumb on the **image** - ALLOWS scroll
> - Starting scroll with thumb on the **Mission** - ALLOWS scroll
> - Starting scroll with thumb on the **title** - DOES NOT allow scroll
> - Starting scroll with thumb on the **Solution** - DOES NOT allow scroll
> - Starting scroll with thumb on the **Client/Media type** - ALLOWS scroll

The user notes: *"I'm not sure if these things are connected to the elements themselves, or if it has to do with where they happen to be positioned relative to the screen height, or if it has to do with where those elements are relative to the elements behind the modal."*

---

## Project Architecture

This is a single-page application (SPA) with:
- Vanilla JavaScript components
- CSS with mobile-specific overrides
- A "quadrant" layout system where body scroll behavior changes based on state

### Key Files:
- `src/components/ModalPortfolio.js` - Modal component
- `src/styles/content.css` - Desktop modal styles
- `src/styles/mobile-fixes.css` - Mobile overrides
- `src/styles/global.css` - Global body/scroll behavior

---

## Modal HTML Structure

```html
<div class="portfolio-modal active">
  <div class="modal-content">
    <div class="modal-header">
      <!-- nav buttons, language toggle, close button -->
    </div>
    <div class="modal-body">
      <!-- Image or carousel -->
      <div class="modal-carousel-container">
        <div class="modal-carousel">
          <div class="modal-carousel-item active">
            <img src="..." alt="..." />
          </div>
        </div>
        <!-- nav buttons, indicators -->
      </div>

      <!-- Title - SCROLL DOESN'T WORK HERE -->
      <h2 class="modal-title">Project Title</h2>

      <!-- Mission/Solution grid -->
      <div class="modal-info">
        <div class="modal-info-item">
          <h3>Mission</h3>
          <p>Mission text...</p>  <!-- SCROLL WORKS HERE -->
        </div>
        <div class="modal-info-item">
          <h3>Solution</h3>
          <p>Solution text...</p>  <!-- SCROLL DOESN'T WORK HERE -->
        </div>
      </div>

      <!-- Meta info -->
      <div class="modal-meta">
        <div class="modal-meta-item">
          <span class="modal-meta-label">Client:</span>
          <span>Client Name</span>  <!-- SCROLL WORKS HERE -->
        </div>
        <div class="modal-meta-item">
          <span class="modal-meta-label">Media Type:</span>
          <span>Video, Script</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Fixes Already Attempted

### Fix 1: Class-based scroll lock (instead of inline styles)

**Problem:** The original `lockScroll()` used inline styles which couldn't beat `body.stateExpanding`'s `!important` rules.

**Change in global.css:**
```css
/* Modal scroll lock - must beat body.stateExpanding */
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

**Change in ModalPortfolio.js:**
```javascript
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;
  document.documentElement.classList.add('modal-open');
  document.body.style.top = `-${this.savedScrollY}px`;
}

unlockScroll() {
  document.documentElement.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, this.savedScrollY || 0);
  this.savedScrollY = 0;
}
```

**Result:** Did not fix the issue.

### Fix 2: Removed transform scaling on mobile

**Problem:** `transform: scale(0.9)` on `.modal-content` can break nested scroll containers on iOS.

**Change in mobile-fixes.css:**
```css
.modal-content {
  transform: none !important;
  will-change: auto !important;
  transition: opacity 300ms ease !important;
}
```

**Result:** Did not fix the issue.

### Fix 3: Removed scroll-behavior: smooth

**Problem:** `scroll-behavior: smooth` can interfere with touch scrolling.

**Change in mobile-fixes.css:**
```css
.modal-body {
  scroll-behavior: auto !important;
}
```

**Result:** Did not fix the issue.

### Fix 4: Added touch-action: pan-y everywhere

**Problem:** Elements without explicit `touch-action` might block scroll gestures.

**Changes in mobile-fixes.css:**
```css
.portfolio-modal {
  touch-action: none !important;  /* Backdrop blocks all */
}

.portfolio-modal .modal-content {
  touch-action: pan-y !important;
}

.modal-body {
  touch-action: pan-y !important;
}

.modal-body * {
  touch-action: pan-y !important;
}

/* Plus explicit rules for every text element */
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
```

**Result:** Did not fix the issue.

### Fix 5: Disabled text selection

**Problem:** Text selection gestures might be blocking scroll.

**Change in mobile-fixes.css:**
```css
.modal-body {
  -webkit-user-select: none !important;
  user-select: none !important;
}
```

**Result:** Did not fix the issue.

### Fix 6: Visibility instead of pointer-events

**Problem:** `pointer-events` toggling can cause touch passthrough during transitions.

**Change in content.css:**
```css
.portfolio-modal {
  visibility: hidden;
  transition: opacity 300ms ease, visibility 0s linear 300ms;
}

.portfolio-modal.active {
  visibility: visible;
  transition: opacity 300ms ease;
}
```

**Result:** Did not fix the issue.

### Fix 7: touchmove prevention on backdrop

**Problem:** Touch events on backdrop might pass through to background.

**Change in ModalPortfolio.js:**
```javascript
this.element.addEventListener('touchmove', (e) => {
  if (e.target === this.element) {
    e.preventDefault();
  }
}, { passive: false });
```

**Result:** Did not fix the issue.

---

## Current Complete CSS for Modal (Mobile)

### From mobile-fixes.css:

```css
@media (max-width: 768px) {
  /* Portfolio modal - capture all touch events */
  .portfolio-modal {
    width: 100% !important;
    max-width: 100vw;
    touch-action: none !important;
  }

  .portfolio-modal .modal-content {
    touch-action: pan-y !important;
  }

  /* Modal content sizing */
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

  /* Modal body - the scroll container */
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
    -webkit-user-select: none !important;
    user-select: none !important;
  }

  /* Force ALL children to allow vertical scroll */
  .modal-body * {
    touch-action: pan-y !important;
  }

  /* Explicit touch-action on text elements */
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

  /* Modal info grid - single column */
  .modal-info {
    grid-template-columns: 1fr !important;
    gap: 15px;
  }

  .modal-info-item {
    min-width: 0 !important;
  }

  /* Modal meta - stacked */
  .modal-meta {
    flex-direction: column !important;
    gap: 8px !important;
    font-size: 12px !important;
    padding-top: 20px !important;
  }
}
```

### From content.css (desktop base):

```css
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

.modal-body {
  padding: 40px;
  transition: opacity 300ms ease;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.modal-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 30px 0 40px 0;
  line-height: 1.3;
}

.modal-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.modal-info-item h3 {
  font-size: 14px;
  text-transform: uppercase;
  color: var(--color-gray);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.modal-info-item p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-dark);
}

.modal-meta {
  display: flex;
  gap: 30px;
  padding-top: 30px;
  border-top: 1px solid var(--color-border-gray);
  font-size: 14px;
  color: var(--color-gray);
}

.modal-meta-item {
  display: flex;
  gap: 8px;
}
```

### From global.css:

```css
body {
  margin: 0;
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

body.stateExpanding {
  position: static !important;
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  overscroll-behavior: none;
  height: auto !important;
  min-height: 100vh;
}

/* Modal scroll lock */
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

---

## Current ModalPortfolio.js Scroll-Related Code

```javascript
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;
  document.documentElement.classList.add('modal-open');
  document.body.style.top = `-${this.savedScrollY}px`;
}

unlockScroll() {
  document.documentElement.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, this.savedScrollY || 0);
  this.savedScrollY = 0;
}

// In render():
this.element.addEventListener('touchmove', (e) => {
  if (e.target === this.element) {
    e.preventDefault();
  }
}, { passive: false });
```

---

## Analysis of the Behavioral Pattern

The user reports:
- **Image** - works
- **Mission (first grid item)** - works
- **Title** - DOESN'T work
- **Solution (second grid item)** - DOESN'T work
- **Client/Media Type** - works

### Observations:

1. **Not purely element-based**: Both Mission and Solution are `.modal-info-item p` elements, but one works and one doesn't.

2. **Not purely positional**: The title is near the top, Solution is in the middle, but both fail. Mission (also middle-ish) works.

3. **Possibly related to grid layout**: Mission is the first grid child, Solution is the second. On mobile, the grid should be single-column (`grid-template-columns: 1fr`), so this shouldn't matter... unless there's a specificity issue.

4. **Could be related to elements behind the modal**: The portfolio page has interactive quadrants. Despite `html.modal-open` locking scroll, pointer/touch events might still reach background elements at certain positions.

---

## Hypotheses to Investigate

### Hypothesis 1: Grid layout specificity issue

The `.modal-info` grid has `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` on desktop. The mobile override sets `grid-template-columns: 1fr !important`.

**Check:** Is the mobile override actually being applied? The `minmax(300px, 1fr)` might still be in effect, potentially causing overflow or positioning issues.

**Diagnostic:**
```javascript
const info = document.querySelector('.modal-info');
console.log('modal-info grid:', getComputedStyle(info).gridTemplateColumns);
```

### Hypothesis 2: Background elements intercepting touches at specific Y positions

The portfolio page has quadrants that might be at specific viewport positions. If the `html.modal-open` class isn't fully preventing interaction, touches at certain Y coordinates might hit background elements.

**Check:** What elements exist behind the modal at the Y positions of the title and Solution?

**Diagnostic:** Open DevTools, position your finger where scroll fails, and check what elements exist at those coordinates using:
```javascript
document.elementsFromPoint(x, y);
```

### Hypothesis 3: The modal-info-item p has user-select: text re-enabled

In mobile-fixes.css:
```css
.modal-body .modal-info-item p {
  -webkit-user-select: text !important;
  user-select: text !important;
}
```

This re-enables text selection on paragraph content. But Mission works and Solution doesn't - both are `<p>` elements. So this alone isn't the issue.

### Hypothesis 4: Event listeners on specific elements

Are there any event listeners attached to the title or Solution elements that might be calling `preventDefault()` or `stopPropagation()`?

**Check:** Look for any event listeners in the component code or global scripts.

### Hypothesis 5: The `.modal-info-item p` selector specificity

The first `.modal-info-item` (Mission) might have different computed styles than the second (Solution) due to CSS specificity or cascade order.

**Diagnostic:**
```javascript
const items = document.querySelectorAll('.modal-info-item');
items.forEach((item, i) => {
  const p = item.querySelector('p');
  console.log(`Item ${i} p:`, {
    touchAction: getComputedStyle(p).touchAction,
    userSelect: getComputedStyle(p).userSelect,
    pointerEvents: getComputedStyle(p).pointerEvents
  });
});
```

### Hypothesis 6: Flexbox `min-height: 0` cascade issue

The modal structure uses flexbox with `min-height: 0` on `.modal-body`. If this isn't properly cascading, internal elements might have implicit height that affects touch behavior.

### Hypothesis 7: iOS Safari scroll container bug

iOS Safari has known bugs where:
- Scroll containers inside `position: fixed` elements can misbehave
- Scroll only works if you start the gesture in very specific areas
- The scroll container must have explicit height less than content height

**Check:** Is `.modal-body` actually scrollable? Does it have `scrollHeight > clientHeight`?

**Diagnostic:**
```javascript
const body = document.querySelector('.modal-body');
console.log('Modal body scroll:', {
  scrollHeight: body.scrollHeight,
  clientHeight: body.clientHeight,
  isScrollable: body.scrollHeight > body.clientHeight,
  overflow: getComputedStyle(body).overflowY
});
```

### Hypothesis 8: The stacking context or z-index issue

Elements might be rendering in unexpected layers. The modal has `z-index: 1000`, but internal stacking contexts could cause touch event issues.

---

## Suggested Diagnostic Steps

### Step 1: Verify CSS is actually being applied

On mobile, with modal open:
```javascript
const modal = document.querySelector('.portfolio-modal.active');
const content = modal.querySelector('.modal-content');
const body = modal.querySelector('.modal-body');
const title = modal.querySelector('.modal-title');
const missionP = modal.querySelectorAll('.modal-info-item p')[0];
const solutionP = modal.querySelectorAll('.modal-info-item p')[1];

console.log('=== Modal CSS Debug ===');
console.log('modal:', {
  touchAction: getComputedStyle(modal).touchAction,
  visibility: getComputedStyle(modal).visibility
});
console.log('content:', {
  touchAction: getComputedStyle(content).touchAction,
  transform: getComputedStyle(content).transform,
  maxHeight: getComputedStyle(content).maxHeight
});
console.log('body:', {
  touchAction: getComputedStyle(body).touchAction,
  overflow: getComputedStyle(body).overflowY,
  userSelect: getComputedStyle(body).userSelect,
  scrollHeight: body.scrollHeight,
  clientHeight: body.clientHeight
});
console.log('title:', {
  touchAction: getComputedStyle(title).touchAction
});
console.log('missionP:', {
  touchAction: getComputedStyle(missionP).touchAction,
  userSelect: getComputedStyle(missionP).userSelect
});
console.log('solutionP:', {
  touchAction: getComputedStyle(solutionP).touchAction,
  userSelect: getComputedStyle(solutionP).userSelect
});
```

### Step 2: Check what elements are at specific touch points

```javascript
// Call this from console while touching problem areas
function checkTouchPoint(x, y) {
  const elements = document.elementsFromPoint(x, y);
  console.log('Elements at point:', elements.map(el => ({
    tag: el.tagName,
    class: el.className,
    id: el.id
  })));
}
```

### Step 3: Add visual debug borders

```css
/* Add temporarily to see element boundaries */
.modal-title { border: 3px solid red !important; }
.modal-info-item:first-child { border: 3px solid green !important; }
.modal-info-item:last-child { border: 3px solid blue !important; }
.modal-meta { border: 3px solid orange !important; }
```

### Step 4: Test with all modal content as a simple div

Create a test case with minimal structure:
```javascript
// Temporarily replace modal body content
const body = document.querySelector('.modal-body');
body.innerHTML = `
  <div style="height: 2000px; background: linear-gradient(to bottom, red, blue);">
    <p style="padding: 20px;">Scroll test - can you scroll by touching anywhere?</p>
  </div>
`;
```

If this scrolls fine, the issue is with specific element CSS. If it still fails in certain areas, the issue is structural.

### Step 5: Check for event listeners

```javascript
// Get all event listeners (requires Chrome DevTools)
// Right-click element > Inspect > Event Listeners tab
// Or use getEventListeners() in console
```

---

## Questions for LLM to Answer

1. **Why would Mission (first grid item) work but Solution (second grid item) not work** when they have identical HTML structure and should have identical CSS?

2. **What could cause position-specific touch failures** in a scroll container where the CSS is uniform?

3. **Are there any iOS Safari-specific scroll container bugs** that match this pattern (works in some areas, not others)?

4. **Could the background elements behind the modal** still be intercepting touches despite `html.modal-open` setting `overflow: hidden`?

5. **Is there something about the flexbox layout** (`flex: 1 1 auto`, `min-height: 0`) that could cause this behavior?

6. **Should we try a completely different scroll lock approach**, such as:
   - Moving modal outside the main container
   - Using `inert` attribute on background content
   - Using a portal pattern

7. **Are there any browser-specific workarounds** for this type of nested scroll container issue?

---

## Potential Alternative Approaches

### Approach A: Move modal to document.body root

Instead of mounting inside the app container, mount directly on `document.body`:
```javascript
mount(parent) {
  document.body.appendChild(this.element);  // Instead of parent
}
```

### Approach B: Use `inert` attribute on background

```javascript
lockScroll() {
  document.querySelector('.container').setAttribute('inert', '');
}
unlockScroll() {
  document.querySelector('.container').removeAttribute('inert');
}
```

### Approach C: Full-page overlay with isolation

```css
.portfolio-modal {
  isolation: isolate;
  contain: layout style paint;
}
```

### Approach D: Remove modal from DOM flow entirely

Use a portal/teleport pattern to render the modal completely outside the normal DOM hierarchy.

### Approach E: Native `<dialog>` element

Replace the custom modal with a native `<dialog>` element which has better browser support for modal behavior.

---

## Summary

Despite implementing 7+ different fixes targeting:
- Scroll lock mechanism
- CSS touch-action
- Text selection
- Transform properties
- Visibility vs pointer-events
- Touch event handlers

...the issue persists with a specific pattern where certain areas of the modal allow scroll and others don't. The pattern doesn't clearly correlate with element type, CSS properties, or vertical position.

The next investigation should focus on:
1. Verifying CSS is actually being applied as expected
2. Checking for background element interference
3. Testing with minimal content to isolate the issue
4. Considering structural changes (moving modal in DOM, using `inert`, etc.)
