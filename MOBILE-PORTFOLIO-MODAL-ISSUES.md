# Mobile Portfolio Modal Issues - Comprehensive Troubleshooting Guide

## Purpose of This Document

This document serves two purposes:
1. **Troubleshooting guide** for debugging persistent mobile modal issues
2. **LLM prompt** - This document is structured to be fed to an AI assistant to help investigate and fix the problems

---

## Instructions for LLM

You are being asked to help debug two persistent issues in a portfolio modal on a mobile web application. The issues are:

1. **Scroll Issue**: On mobile devices, scrolling within the portfolio modal is extremely difficult. Users must precisely position their finger to get the modal to scroll. Sometimes the page behind the modal scrolls instead, and on some browsers the modal doesn't scroll at all.

2. **Image Padding Issue**: Portfolio images in the modal have excessive white space (padding) above and below them, making the images appear smaller than they should be.

Please thoroughly analyze all the code provided below and identify:
- All possible root causes for each issue
- CSS conflicts or specificity problems
- JavaScript behavior that might interfere
- Browser-specific quirks (especially iOS Safari, Chrome Android, Samsung Internet)
- Interaction between different CSS rules across files

---

## Project Structure

This is a single-page application (SPA) built with vanilla JavaScript and CSS. The modal is rendered dynamically and mounted to the DOM.

### Relevant Files:
- `src/components/ModalPortfolio.js` - Modal component (JavaScript)
- `src/styles/content.css` - Desktop modal styles (lines 540-1031 are modal-related)
- `src/styles/mobile-fixes.css` - Mobile-specific overrides (lines 160-465 are modal-related)
- `src/styles/global.css` - Global body/html styles (affects scroll behavior)
- `src/styles/variables.css` - CSS custom properties

---

## ISSUE 1: Mobile Modal Scroll Problem

### Problem Description

On mobile devices (tested on iPhone Safari, Chrome Android, Samsung Internet):
- Scrolling the modal content requires very precise finger placement
- Sometimes touch events pass through to the page behind the modal
- Sometimes the modal content doesn't scroll at all
- The experience is "glitchy" and inconsistent

### Current Scroll Lock Implementation

The modal uses a JavaScript scroll lock pattern in `ModalPortfolio.js`:

```javascript
// ModalPortfolio.js lines 132-150
lockScroll() {
  this.savedScrollY = window.scrollY || window.pageYOffset;
  document.body.style.position = "fixed";
  document.body.style.top = `-${this.savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
}

unlockScroll() {
  const y = this.savedScrollY || 0;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, y);
  this.savedScrollY = 0;
}
```

**Why this is called:**
- `lockScroll()` is called in `openBySlug()` before adding the `active` class
- `unlockScroll()` is called in `close()` and when modal is deactivated via state change

### Global Body Styles (global.css)

```css
/* global.css lines 47-59 */
body {
  margin: 0;
  background: var(--color-content-white);
  font-family: 'Poppins', 'Pretendard', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Prevent rubber-banding on iOS */
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* global.css lines 72-80 */
/* When expanded, body becomes the scroll container */
body.stateExpanding {
  position: static !important;
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  overscroll-behavior: none;
  height: auto !important;
  min-height: 100vh;
}
```

**CRITICAL OBSERVATION:**
- Body starts as `position: fixed; overflow: hidden`
- When a section expands (portfolio page), it becomes `position: static; overflow-y: scroll`
- The modal's `lockScroll()` tries to set `position: fixed` again
- This creates a conflict: body has `!important` on some properties in `.stateExpanding`

### Modal Container CSS (content.css)

```css
/* content.css lines 540-576 */
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
  pointer-events: none;
  transition: opacity 300ms ease;
  padding: 40px 20px;
}

.portfolio-modal.active {
  opacity: 1;
  pointer-events: auto;
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

.modal-body {
  padding: 40px;
  transition: opacity 300ms ease;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
  position: relative;
}
```

### Mobile Modal Overrides (mobile-fixes.css)

```css
/* mobile-fixes.css lines 160-170 */
/* Modal content: Adjust for mobile address bar and ensure proper scrolling */
.modal-content {
  max-height: calc(100dvh - 150px) !important;
  width: 95% !important;
  max-width: calc(100vw - 20px) !important;
  /* Ensure flexbox layout for scrollable body */
  display: flex !important;
  flex-direction: column !important;
  /* Prevent the modal itself from scrolling */
  overflow: hidden !important;
}

/* mobile-fixes.css lines 396-408 */
/* Modal body: Minimal padding and improved scrolling */
.modal-body {
  padding: 15px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  /* Prevent scroll chaining to background */
  overscroll-behavior: contain !important;
  /* Ensure it's a scroll container */
  position: relative !important;
  /* Add momentum scrolling for smoother feel */
  scroll-behavior: smooth;
}
```

### Potential Root Causes for Scroll Issue

#### Cause 1: Scroll Lock Conflicts with `.stateExpanding`

When the portfolio page is open:
- `body` has class `stateExpanding` with `position: static !important`
- `lockScroll()` tries to set `position: fixed` via inline style
- Inline styles normally beat class styles, BUT `!important` on the class wins
- Result: Body may not be properly locked, allowing page scroll

**Test:** Check if body actually gets `position: fixed` when modal opens on mobile.

#### Cause 2: `pointer-events` Toggle Issue

```css
.portfolio-modal {
  pointer-events: none;  /* When inactive */
}
.portfolio-modal.active {
  pointer-events: auto;  /* When active */
}
```

On mobile, toggling `pointer-events` can cause "passthrough" where:
- The modal receives the touch event
- But `pointer-events: auto` hasn't fully propagated
- Touch ends up on the element behind

**Better pattern:** Use `visibility: hidden/visible` instead of `pointer-events`

#### Cause 3: Fixed Position Body Breaks Scroll Context

The `lockScroll()` pattern:
```javascript
document.body.style.position = "fixed";
document.body.style.top = `-${this.savedScrollY}px`;
```

This works on desktop but on iOS Safari:
- Setting `position: fixed` on body can break nested scroll containers
- The modal's `.modal-body` may lose its scroll context
- iOS has special handling for fixed elements

#### Cause 4: Competing `overflow` Properties

Multiple elements are trying to control scroll:
1. `body` - `overflow: hidden` (global) or `overflow-y: scroll !important` (stateExpanding)
2. `.portfolio-modal` - no explicit overflow
3. `.modal-content` - `overflow: hidden !important` (mobile)
4. `.modal-body` - `overflow-y: auto !important` (mobile)

On iOS, when parent has `overflow: hidden`, nested scroll containers can behave unpredictably.

#### Cause 5: Touch Event Handling Missing

There are no explicit touch event handlers for:
- Preventing touchmove on the modal backdrop
- Ensuring touch events stay within `.modal-body`
- Preventing scroll chaining

The CSS `overscroll-behavior: contain` helps but doesn't fully solve the problem on all browsers.

#### Cause 6: `100vh` vs `100dvh` Inconsistency

```css
/* Desktop (content.css) */
.portfolio-modal {
  height: 100vh;  /* Includes mobile browser UI height */
}

/* Mobile (mobile-fixes.css) */
.modal-content {
  max-height: calc(100dvh - 150px) !important;  /* Dynamic viewport height */
}
```

The parent uses `vh` while the child uses `dvh`. When the mobile browser UI (address bar) shows/hides:
- `100vh` stays constant
- `100dvh` changes
- This can cause layout shifts that affect scroll behavior

#### Cause 7: iOS Scroll Boundary Problem

iOS Safari has a known issue where when a scroll container reaches its boundary:
- The browser tries to scroll the parent element
- This causes "scroll chaining" to the body
- The page behind the modal scrolls instead

The `overscroll-behavior: contain` should prevent this but doesn't work in all iOS versions.

**Known fix:** Add a 1px padding trick:
```css
.modal-body {
  padding-top: 1px;
  padding-bottom: 1px;
}
```
This ensures the scroll container never truly reaches its boundary.

#### Cause 8: `scroll-behavior: smooth` Issue

```css
.modal-body {
  scroll-behavior: smooth;
}
```

On some mobile browsers, `scroll-behavior: smooth` interferes with touch scrolling by:
- Adding artificial lag to scroll response
- Making the scroll feel "stuck"
- Conflicting with `-webkit-overflow-scrolling: touch`

### Testing Strategy for Scroll Issue

```javascript
// Add to ModalPortfolio.js temporarily for debugging
openBySlug(id, language) {
  // ... existing code ...

  // Debug logging
  setTimeout(() => {
    const body = document.body;
    const modal = this.element;
    const content = modal.querySelector('.modal-content');
    const modalBody = modal.querySelector('.modal-body');

    console.log('=== Modal Scroll Debug ===');
    console.log('Body computed style:', {
      position: getComputedStyle(body).position,
      overflow: getComputedStyle(body).overflow,
      overflowY: getComputedStyle(body).overflowY,
      top: getComputedStyle(body).top
    });
    console.log('Modal computed style:', {
      position: getComputedStyle(modal).position,
      pointerEvents: getComputedStyle(modal).pointerEvents
    });
    console.log('Modal content:', {
      maxHeight: getComputedStyle(content).maxHeight,
      overflow: getComputedStyle(content).overflow
    });
    console.log('Modal body:', {
      overflowY: getComputedStyle(modalBody).overflowY,
      webkitOverflowScrolling: getComputedStyle(modalBody).webkitOverflowScrolling,
      overscrollBehavior: getComputedStyle(modalBody).overscrollBehavior,
      scrollHeight: modalBody.scrollHeight,
      clientHeight: modalBody.clientHeight,
      isScrollable: modalBody.scrollHeight > modalBody.clientHeight
    });
  }, 500);
}
```

---

## ISSUE 2: Excessive Image Padding/White Space

### Problem Description

Portfolio images in the modal carousel have too much white space above and below them on mobile. The images appear smaller than they should be, leaving large gaps.

### Desktop Image/Carousel CSS (content.css)

```css
/* content.css lines 733-753 */
.modal-image-container {
  width: 100%;
  margin-bottom: 40px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
  min-height: 550px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image-container img {
  width: 100%;
  height: auto;
  max-height: 550px;
  min-height: 550px;  /* FORCES 550px height */
  object-fit: contain;
  display: block;
}

/* content.css lines 774-842 */
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
  height: 550px;      /* FIXED 550px height spacer */
  max-height: 550px;
}

.modal-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;       /* Fills the 550px from ::before */
}

.modal-carousel-item img {
  max-width: 100%;
  max-height: 550px;
  min-height: 550px;  /* FORCES 550px */
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}
```

**Desktop Logic:**
- Uses `::before` pseudo-element with fixed 550px height as spacer
- Carousel/images absolutely positioned within this 550px space
- Images have `min-height: 550px` to fill the space
- `object-fit: contain` scales image to fit while maintaining aspect ratio

### Mobile Image/Carousel CSS (mobile-fixes.css)

```css
/* mobile-fixes.css lines 226-303 */

/* Kill the desktop spacer */
.modal-carousel-container::before {
  display: none !important;
  content: none !important;
}

/* Let the container size naturally */
.modal-carousel-container {
  margin-bottom: 15px !important;
  background: transparent !important;
  overflow: visible !important;
  height: auto !important;
}

/* Stop absolutely filling a fake height */
.modal-carousel {
  position: relative !important;
  width: 100% !important;
  height: auto !important;
}

/* Only active slide participates in layout */
.modal-carousel-item {
  display: none !important;
  height: auto !important;
}

.modal-carousel-item.active {
  display: block !important;
  position: relative !important;
  width: 100% !important;
}

/* Transitioning slides can overlay without affecting height */
.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev,
.modal-carousel-item.enter-next,
.modal-carousel-item.enter-prev {
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
}

/* Make images fill width, cap height, and remove desktop min-height */
.modal-carousel-item img {
  width: 100% !important;
  height: auto !important;
  max-height: 60vh !important;
  min-height: 0 !important;
  max-width: 100% !important;
  object-fit: contain !important;
  display: block !important;
}

/* Also fix single image container */
.modal-image-container {
  margin-bottom: 15px !important;
  overflow: visible !important;
  height: auto !important;
}

.modal-image-container::before {
  display: none !important;
  content: none !important;
}

.modal-image-container img {
  width: 100% !important;
  height: auto !important;
  max-height: 60vh !important;
  min-height: 0 !important;
  object-fit: contain !important;
  display: block !important;
}
```

**Mobile Intention:**
- Remove the 550px spacer
- Let images determine their own height naturally
- Use `width: 100%` and `height: auto` for responsive sizing
- Cap height at `60vh` to prevent overly tall images

### Potential Root Causes for Padding Issue

#### Cause 1: CSS Specificity - Desktop Rules May Still Apply

The desktop rules in content.css:
```css
.modal-carousel-item {
  display: none;
  width: 100%;
  height: 100%;  /* This might still apply */
  opacity: 0;
  transform: translateX(0);
}

.modal-carousel-item.active {
  display: flex;               /* FLEX vs BLOCK */
  align-items: center;         /* CENTERING */
  justify-content: center;     /* CENTERING */
  position: absolute;          /* ABSOLUTE */
  /* ... */
}
```

The mobile overrides set:
```css
.modal-carousel-item.active {
  display: block !important;      /* Changes from flex */
  position: relative !important;  /* Changes from absolute */
}
```

**Problem:** The desktop `.modal-carousel-item.active` has:
- `align-items: center` and `justify-content: center`
- These only work with `display: flex`
- BUT they may cause issues if the element gets `height: 100%` from somewhere

If `.modal-carousel-item.active` inherits `height: 100%` from the non-active rule, and the parent has extra height, the image will be centered in that extra space, creating padding.

#### Cause 2: Parent Container Height Not Actually Auto

Check if `.modal-carousel` actually gets `height: auto`:
```css
.modal-carousel {
  position: relative !important;
  width: 100% !important;
  height: auto !important;  /* IS THIS ACTUALLY WORKING? */
}
```

If the parent `.modal-carousel-container` has any height set (from inline styles, other CSS rules), the carousel inside may still reference that height.

#### Cause 3: `object-fit: contain` Creates Letterboxing

```css
.modal-carousel-item img {
  width: 100% !important;
  height: auto !important;
  object-fit: contain !important;
}
```

With `width: 100%` and `height: auto`:
- The image should naturally size to its aspect ratio
- `object-fit: contain` shouldn't matter because the image box matches the image

BUT if `height` is somehow constrained or the parent forces a height:
- `object-fit: contain` will fit the image inside and add letterboxing

#### Cause 4: The Desktop `min-height: 550px` May Leak Through

Check computed styles to see if the mobile `min-height: 0 !important` actually overrides the desktop `min-height: 550px`:

```css
/* Desktop */
.modal-carousel-item img {
  min-height: 550px;
}

/* Mobile override */
.modal-carousel-item img {
  min-height: 0 !important;
}
```

If both are within `@media` blocks with equal specificity, the later one should win. But if the desktop one is NOT in a media query and mobile one IS, there could be issues.

**Looking at the actual code:**
- Desktop rules in content.css are NOT inside a media query
- Mobile rules in mobile-fixes.css ARE inside `@media (max-width: 768px)`
- Both have the same selector specificity
- The `!important` on mobile should win

**BUT** if there's a CSS loading order issue or browser caching, this could fail.

#### Cause 5: `.modal-image-container` Has `min-height: 550px`

Looking at content.css:
```css
.modal-image-container {
  /* ... */
  min-height: 550px;  /* THIS LINE */
  /* ... */
}
```

The mobile override:
```css
.modal-image-container {
  margin-bottom: 15px !important;
  overflow: visible !important;
  height: auto !important;
}
```

**PROBLEM:** The mobile override DOES NOT include `min-height: 0 !important`!

This means `.modal-image-container` (for single images, not carousel) still has `min-height: 550px` on mobile!

**FIX NEEDED:**
```css
.modal-image-container {
  margin-bottom: 15px !important;
  overflow: visible !important;
  height: auto !important;
  min-height: 0 !important;  /* ADD THIS */
}
```

#### Cause 6: `.modal-carousel-container::before` May Not Be Fully Killed

```css
.modal-carousel-container::before {
  display: none !important;
  content: none !important;
}
```

Some browsers (especially older Safari) may still reserve space for `::before` even with `display: none`. Try also setting:
```css
.modal-carousel-container::before {
  display: none !important;
  content: none !important;
  height: 0 !important;
  max-height: 0 !important;
  visibility: hidden !important;
}
```

#### Cause 7: Flexbox on Parent Containers

```css
/* content.css */
.modal-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-body {
  flex: 1 1 auto;
  min-height: 0;
}
```

The `.modal-body` has `flex: 1 1 auto` which means it can grow to fill available space. If `.modal-content` has extra height, `.modal-body` will grow, and the carousel inside may try to center within that extra space.

#### Cause 8: Carousel Item Image Width vs Container Width

If the carousel item image has a different width than its container:
```css
.modal-carousel-item img {
  width: 100% !important;      /* 100% of what? */
  max-width: 100% !important;  /* These may conflict */
}
```

If `.modal-carousel-item` doesn't have `width: 100%` explicitly, the image's `width: 100%` may not be what you expect.

The mobile CSS does set:
```css
.modal-carousel-item.active {
  /* ... */
  width: 100% !important;
}
```

But what about non-active items during transitions? They have:
```css
.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev,
.modal-carousel-item.enter-next,
.modal-carousel-item.enter-prev {
  /* ... */
  width: 100% !important;
}
```

This looks correct, but verify with DevTools.

### Testing Strategy for Image Padding Issue

```javascript
// Add to ModalPortfolio.js temporarily for debugging
attachCarouselListeners() {
  // ... existing code ...

  // Debug logging for image sizing
  setTimeout(() => {
    const container = this.element.querySelector('.modal-carousel-container');
    const carousel = this.element.querySelector('.modal-carousel');
    const activeItem = this.element.querySelector('.modal-carousel-item.active');
    const img = activeItem?.querySelector('img');

    console.log('=== Image Sizing Debug ===');

    if (container) {
      const containerStyle = getComputedStyle(container);
      console.log('Container:', {
        offsetHeight: container.offsetHeight,
        offsetWidth: container.offsetWidth,
        minHeight: containerStyle.minHeight,
        height: containerStyle.height
      });

      // Check ::before
      const beforeStyle = getComputedStyle(container, '::before');
      console.log('Container ::before:', {
        display: beforeStyle.display,
        height: beforeStyle.height,
        content: beforeStyle.content
      });
    }

    if (carousel) {
      const carouselStyle = getComputedStyle(carousel);
      console.log('Carousel:', {
        offsetHeight: carousel.offsetHeight,
        position: carouselStyle.position,
        height: carouselStyle.height
      });
    }

    if (activeItem) {
      const itemStyle = getComputedStyle(activeItem);
      console.log('Active Item:', {
        offsetHeight: activeItem.offsetHeight,
        display: itemStyle.display,
        position: itemStyle.position,
        height: itemStyle.height
      });
    }

    if (img) {
      const imgStyle = getComputedStyle(img);
      console.log('Image:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        offsetWidth: img.offsetWidth,
        offsetHeight: img.offsetHeight,
        minHeight: imgStyle.minHeight,
        maxHeight: imgStyle.maxHeight,
        objectFit: imgStyle.objectFit
      });
    }

    // Also check single image container
    const singleContainer = this.element.querySelector('.modal-image-container');
    if (singleContainer) {
      const singleStyle = getComputedStyle(singleContainer);
      console.log('Single Image Container:', {
        offsetHeight: singleContainer.offsetHeight,
        minHeight: singleStyle.minHeight,
        height: singleStyle.height
      });
    }
  }, 500);
}
```

### Visual Debug CSS

Add this temporarily to see container boundaries:

```css
/* Temporary debug styles - add to mobile-fixes.css */
@media (max-width: 768px) {
  .modal-carousel-container {
    border: 3px solid red !important;
  }

  .modal-carousel {
    border: 3px solid blue !important;
  }

  .modal-carousel-item.active {
    border: 3px solid green !important;
  }

  .modal-carousel-item img {
    border: 3px solid orange !important;
  }

  .modal-image-container {
    border: 3px solid purple !important;
  }

  .modal-image-container img {
    border: 3px solid cyan !important;
  }
}
```

---

## Complete Relevant Code Files

### ModalPortfolio.js (Full Modal Component)

```javascript
import { portfolioData } from '../data/portfolio.js';
import { languageManager } from '../core/language.js';
import { createElement } from '../utils/dom.js';
import { getFullImages } from '../utils/portfolio.js';
import { stateManager } from '../core/state.js';
import { router } from '../core/router.js';
import { extractVideoId, extractTimestamp, getYoutubeThumbnail, resolveYoutubeThumbnail, activateYoutubeFacade } from '../utils/youtube.js';
import { HotkeyModal } from './HotkeyModal.js';

export class ModalPortfolio {
  constructor() {
    this.element = createElement('div', 'portfolio-modal');
    this.currentIndex = -1;
    this.language = 'ko';
    this.hotkeyModal = new HotkeyModal();
    this.savedScrollY = 0;
    this.render();

    // Subscribe to state changes
    stateManager.subscribe((state) => {
      if (state.portfolioSlug && state.currentSection === 'portfolio') {
        this.openBySlug(state.portfolioSlug, state.language);
      } else if (!state.portfolioSlug && this.element.classList.contains('active')) {
        // Close modal without navigating
        this.element.classList.remove('active');
        this.unlockScroll();
      }
    });
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-nav">
            <button class="modal-nav-btn prev-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="modal-nav-btn next-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-language-toggle">
            <svg class="modal-globe-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="modal-lang-options">
              <span class="modal-lang-option modal-lang-en">EN</span>
              <span class="modal-lang-separator">|</span>
              <span class="modal-lang-option modal-lang-kr">KR</span>
            </span>
          </div>
          <div class="modal-header-actions">
            <button class="modal-hotkey-btn" title="Keyboard shortcuts">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
              </svg>
            </button>
            <button class="modal-close">✕</button>
          </div>
        </div>
        <div class="modal-body"></div>
      </div>
    `;

    // Event listeners setup...
    const closeBtn = this.element.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.close());

    const prevBtn = this.element.querySelector('.prev-btn');
    prevBtn.addEventListener('click', () => this.navigate(-1));

    const nextBtn = this.element.querySelector('.next-btn');
    nextBtn.addEventListener('click', () => this.navigate(1));

    // Language toggle handler
    const langToggle = this.element.querySelector('.modal-language-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        const newLang = this.language === 'ko' ? 'en' : 'ko';
        this.switchLanguage(newLang);
      });
    }

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });

    // Arrow key navigation handler
    this.handleKeyDown = (e) => {
      if (!this.element.classList.contains('active')) return;
      // ... key handling ...
    };

    document.addEventListener('keydown', this.handleKeyDown);
  }

  lockScroll() {
    this.savedScrollY = window.scrollY || window.pageYOffset;
    document.body.style.position = "fixed";
    document.body.style.top = `-${this.savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  unlockScroll() {
    const y = this.savedScrollY || 0;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, y);
    this.savedScrollY = 0;
  }

  openBySlug(id, language) {
    const index = portfolioData.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.currentIndex = index;
      this.language = language;
      const item = portfolioData[index];

      const modalBody = this.element.querySelector('.modal-body');
      const modalContent = this.element.querySelector('.modal-content');

      const wasActive = this.element.classList.contains('active');
      if (wasActive) {
        this.animateContentChange(modalBody, modalContent, item, language);
      } else {
        // Lock scroll BEFORE adding active class
        this.lockScroll();
        const content = this.renderModalContent(item, language);
        modalBody.innerHTML = content;
        this.element.classList.add('active');
        this.attachCarouselListeners();
      }

      this.updateNavigationButtons();
      this.updateLanguageToggle();
    }
  }

  close() {
    // Stop any playing YouTube videos
    const iframe = this.element.querySelector('.youtube-facade iframe');
    if (iframe) {
      iframe.src = '';
    }

    this.element.classList.remove('active');
    this.unlockScroll();
    const { language } = stateManager.getState();
    const newPath = router.buildPath('portfolio', language);
    router.navigate(newPath);
  }

  renderModalContent(item, language) {
    // ... renders carousel or single image ...
    // Returns HTML string with .modal-carousel-container or .modal-image-container
  }

  attachCarouselListeners() {
    // Sets up carousel navigation (prev/next/indicators)
    // Handles slide transitions with animation classes
  }

  mount(parent) {
    parent.appendChild(this.element);
    this.hotkeyModal.mount(document.body);
  }
}
```

### Modal HTML Structure (Generated by renderModalContent)

```html
<div class="portfolio-modal active">
  <div class="modal-content">
    <div class="modal-header">
      <!-- nav buttons, language toggle, close button -->
    </div>
    <div class="modal-body">
      <!-- FOR CAROUSEL: -->
      <div class="modal-carousel-container">
        <div class="modal-carousel">
          <div class="modal-carousel-item active">
            <img src="..." alt="..." />
          </div>
          <div class="modal-carousel-item">
            <img src="..." alt="..." />
          </div>
          <!-- more items -->
        </div>
        <button class="modal-carousel-prev">...</button>
        <button class="modal-carousel-next">...</button>
        <div class="modal-carousel-indicators">
          <button class="modal-carousel-indicator active" data-index="0"></button>
          <button class="modal-carousel-indicator" data-index="1"></button>
        </div>
      </div>

      <!-- OR FOR SINGLE IMAGE: -->
      <div class="modal-image-container">
        <img src="..." alt="..." />
      </div>

      <h2 class="modal-title">...</h2>
      <div class="modal-info">...</div>
      <div class="modal-meta">...</div>
    </div>
  </div>
</div>
```

---

## Recommended Fixes to Try

### Fix 1: Improved Scroll Lock (Replace Current Method)

Replace the inline style scroll lock with a class-based approach:

**Add to global.css or mobile-fixes.css:**
```css
html.modal-open,
html.modal-open body {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
}

/* Override stateExpanding when modal is open */
html.modal-open body.stateExpanding {
  position: fixed !important;
  overflow: hidden !important;
}
```

**Update ModalPortfolio.js:**
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

### Fix 2: Use Visibility Instead of Pointer-Events

**In content.css:**
```css
.portfolio-modal {
  /* ... existing ... */
  visibility: hidden;
  /* Remove: pointer-events: none; */
}

.portfolio-modal.active {
  opacity: 1;
  visibility: visible;
  /* Remove: pointer-events: auto; */
}
```

### Fix 3: Add iOS Scroll Boundary Prevention

**In mobile-fixes.css:**
```css
.modal-body {
  /* ... existing ... */
  /* iOS boundary fix - prevents scroll chaining at edges */
  padding-top: 1px !important;
  /* If you have padding-top: 15px, change to 16px */
}

/* Alternative: Use pseudo-element */
.modal-body::before {
  content: '';
  display: block;
  height: 1px;
  margin-bottom: -1px;
}
```

### Fix 4: Fix min-height on Image Container

**In mobile-fixes.css, update:**
```css
.modal-image-container {
  margin-bottom: 15px !important;
  overflow: visible !important;
  height: auto !important;
  min-height: 0 !important;  /* ADD THIS LINE */
}
```

### Fix 5: Remove scroll-behavior: smooth

**In mobile-fixes.css, remove:**
```css
.modal-body {
  /* ... */
  /* scroll-behavior: smooth;  <-- REMOVE THIS */
}
```

### Fix 6: Use Consistent vh Units

**In mobile-fixes.css, change:**
```css
.modal-carousel-item img {
  /* ... */
  max-height: 60vh !important;  /* Change from 60vh to... */
  /* OR use a calc that's more stable */
  max-height: calc(var(--vh, 1vh) * 60) !important;
}
```

**Add JavaScript to set --vh:**
```javascript
// In main.js
function setVhProperty() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVhProperty();
window.addEventListener('resize', setVhProperty);
```

### Fix 7: Force Carousel Items to Have No Extra Height

**In mobile-fixes.css, add:**
```css
.modal-carousel-item {
  display: none !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
}

.modal-carousel-item.active {
  display: block !important;
  position: relative !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
}
```

### Fix 8: Thoroughly Kill Desktop ::before

**In mobile-fixes.css:**
```css
.modal-carousel-container::before,
.modal-image-container::before {
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
```

---

## Testing Checklist

### Scroll Issue Testing

1. **iPhone Safari (iOS 16+)**
   - [ ] Open portfolio modal
   - [ ] Try scrolling by touching modal body content
   - [ ] Verify page behind does NOT scroll
   - [ ] Scroll to bottom and try to "overscroll" - page should not scroll

2. **Chrome Android**
   - [ ] Same tests as Safari
   - [ ] Check if address bar show/hide affects scrolling

3. **Samsung Internet**
   - [ ] Same tests as above
   - [ ] This browser often has unique issues

4. **Firefox Mobile**
   - [ ] Basic scroll functionality check

### Image Padding Testing

1. **Landscape Images (wider than tall)**
   - [ ] Should fill width, have minimal vertical padding

2. **Portrait Images (taller than wide)**
   - [ ] Should be centered, cap at 60vh height
   - [ ] Should NOT have excessive padding on sides

3. **Square Images**
   - [ ] Should size appropriately without excessive padding

4. **During Carousel Transitions**
   - [ ] Verify no layout shifts
   - [ ] Check that transitioning slides don't add extra height

---

## Summary for LLM

Please analyze the code above and provide:

1. **Root cause analysis** for both issues with specific line references
2. **CSS specificity conflicts** that might be causing the mobile overrides to fail
3. **Browser-specific issues** to watch for
4. **A prioritized list of fixes** starting with the most likely to solve each issue
5. **Any additional diagnostic steps** that should be taken

Focus particularly on:
- The interaction between `body.stateExpanding` and the scroll lock
- Why `min-height` might still be applying despite `!important` overrides
- Touch event handling gaps that could cause scroll issues
- The relationship between `::before` spacer and carousel sizing
