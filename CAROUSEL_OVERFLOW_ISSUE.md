# Carousel Overflow Issue on Mobile

## Problem Description

The testimonials/quotes carousel on mobile view (Clients page) is showing a portion of the next slide peeking through on the right edge. Approximately 5-10 pixels of the next card are visible, creating a visual glitch where users can see content that should be hidden.

## Expected Behavior

The carousel should display exactly one full slide at a time with no overflow. The `overflow: hidden` on the container should completely hide any adjacent slides, showing only the current active slide.

## Current Behavior

A thin vertical strip of the next slide is visible on the right edge of the carousel container. This suggests the slide width is slightly less than 100% of the container width, causing the positioning to be off by a few pixels.

## Technical Details

### Carousel Structure
```
.quote-carousel-container (100% width, overflow: hidden)
  └── .carousel-track (flex container, translateX positioning)
      └── .quote-slide (should be 100% width)
          ├── .quote-box-dark
          └── .author-box-light
```

### CSS Applied (mobile-fixes.css)

**Container:**
```css
.quote-carousel-container {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}
```

**Track:**
```css
.carousel-track {
  width: 100% !important;
  display: flex !important;
  margin: 0 !important;
  padding: 0 !important;
  gap: 0 !important;
}
```

**Slides:**
```css
.quote-slide {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}
```

**Content Boxes:**
```css
.quote-box-dark,
.author-box-light {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.author-box-light {
  border-left: 1px solid #eee !important;
}
```

## Potential Root Causes

### 1. JavaScript Width Calculation
The carousel uses JavaScript to calculate slide width:
```javascript
// QuoteCarousel.js line 68-70
updateSlideWidth() {
  this.slideWidth = Math.round(this.element.offsetWidth);
}
```

**Issue:** `offsetWidth` includes padding and borders if `box-sizing: content-box`. Even with `Math.round()`, subpixel rendering issues may cause misalignment.

### 2. Box-Sizing Inheritance
The `.author-box-light` has a `border: 1px solid #eee` which may not be properly accounted for in the width calculation if box-sizing isn't consistently applied throughout the DOM tree.

### 3. Flexbox Subpixel Rounding
When the browser calculates flex item widths, it may round to the nearest pixel. With a container that's an odd pixel width (e.g., 375px on iPhone SE), the slides might not perfectly fill the space.

### 4. Transform Precision
The carousel uses `translate3d()` with pixel values:
```javascript
this.track.style.transform = `translate3d(-${this.currentIndex * this.slideWidth}px, 0, 0)`;
```

Accumulated rounding errors from `this.slideWidth * currentIndex` could cause the positioning to drift slightly.

### 5. Conflicting CSS Rules
Despite `!important` flags, there may be more specific selectors or inline styles being applied that override the width constraints.

## Debugging Steps Attempted

1. ✅ Set container to `width: 100%; overflow: hidden`
2. ✅ Forced all margin/padding/gap to 0
3. ✅ Applied `box-sizing: border-box` to all carousel elements
4. ✅ Set explicit `width: 100%` on slides and content boxes
5. ✅ Removed any potential borders from slides
6. ❌ Issue persists - next slide still visible

## Possible Solutions

### Option 1: Force Slide Width in JavaScript
Instead of using `element.offsetWidth`, calculate the width differently:
```javascript
updateSlideWidth() {
  // Use clientWidth instead (excludes borders)
  this.slideWidth = this.element.clientWidth;

  // Or use getBoundingClientRect for subpixel precision
  this.slideWidth = this.element.getBoundingClientRect().width;
}
```

### Option 2: Add Negative Margin to Track
Compensate for the overflow by pulling the track slightly left:
```css
.carousel-track {
  margin-left: -1px !important;
}
```

### Option 3: Use Viewport Width for Slides
Instead of percentage, use viewport width directly:
```css
.quote-slide {
  width: 100vw !important;
  min-width: 100vw !important;
}

.quote-carousel-container {
  width: 100vw !important;
  margin-left: calc(-50vw + 50%) !important;
}
```

### Option 4: Increase Container Overflow Clip
Add a slight clip to ensure no content bleeds:
```css
.quote-carousel-container {
  clip-path: inset(0 1px 0 0) !important;
}
```

### Option 5: Fix at Component Level
Modify `QuoteCarousel.js` to force exact pixel positioning:
```javascript
render() {
  // Force integer pixel width
  const containerWidth = Math.floor(this.element.offsetWidth);
  this.slideWidth = containerWidth;

  // Set explicit width on slides
  const slides = this.track.querySelectorAll('.quote-slide');
  slides.forEach(slide => {
    slide.style.width = `${containerWidth}px`;
    slide.style.minWidth = `${containerWidth}px`;
  });

  this.currentIndex = this.slideCount;
  this.track.style.transform = `translate3d(-${this.currentIndex * containerWidth}px, 0, 0)`;
}
```

## Files Involved

- `/src/components/QuoteCarousel.js` - JavaScript carousel logic
- `/src/styles/content.css` - Base carousel styles (lines 1169-1327)
- `/src/styles/mobile-fixes.css` - Mobile overrides (lines 117-163)

## Browser/Device Details

- **Device**: iPhone (mobile view)
- **Viewport**: 375px width (iPhone SE) or similar
- **Issue Visibility**: ~5-10px of next slide visible on right edge

## Priority

**Medium-High** - Visual glitch affects user experience but doesn't break functionality.

## Status

🔴 **Unresolved** - Multiple CSS fixes attempted without success. May require JavaScript-level solution.
