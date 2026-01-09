# Safari Scroll Bug - Deep Dive Analysis

## Problem Description
On Safari (both desktop and mobile), scrolling does not work on any of the content pages (about, services, portfolio, clients). Keyboard arrow keys allow scrolling, but trackpad/mouse wheel/touch scrolling does not work.

## Current DOM Structure

```
body (position: fixed, overflow: hidden, 100vh)
  └── #app.container (position: relative, overflow-y: hidden, 100dvh)
       ├── .quadrant × 4 (position: absolute, animated)
       ├── .sub-quadrant × 2 (position: absolute)
       ├── .center-circle (position: absolute)
       └── .content-box (position: absolute, top animates 100% → 50vh)
            └── .content-inner (padding, opacity animation)
                 └── [actual content: text, images, grids, etc.]
```

**CRITICAL DESIGN REQUIREMENT:**
- The quadrants (main and sub) are **NOT sticky or fixed** in the viewport
- They are `position: absolute` within the container
- When scrolling `.content-box`, the quadrants **scroll out of view** naturally
- This is intentional - only `.content-box` should be scrollable, not the entire container

## Current Implementation

### CSS - Container
**File: `src/styles/global.css` (lines 31-43)**

```css
.container {
  position: relative;
  width: 100%;
  height: 100dvh;
  background: var(--color-content-white);
  overflow-x: hidden;
  overflow-y: hidden; /* Always hidden - never scrolls */
  -webkit-overflow-scrolling: touch;
}

/* NO .stateExpanding override for .container */
```

### CSS - Content Box (The Scroll Container)
**File: `src/styles/content.css` (lines 1-22)**

```css
.content-box {
  position: absolute;
  left: 0;
  width: 100%;
  background: var(--color-content-white);
  color: var(--color-text-dark);
  transition: all var(--duration-main) var(--timing-main);
  z-index: var(--z-content);
  top: 100%; /* Starts below viewport */
  overflow-x: hidden;
  overflow-y: hidden;
}

.stateExpanding .content-box {
  position: absolute;
  top: 50vh; /* Animates to 50vh from top */
  left: 0;
  /* THIS is the scroll container */
  height: 50vh; /* Fixed height = bottom 50% of viewport */
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
```

**Mobile:**
```css
@media (max-width: 768px) {
  .stateExpanding .content-box {
    top: 80vh;
    height: 20vh; /* Only 20vh visible on mobile! */
  }
}
```

### CSS - Content Inner (No Height Constraints)
**File: `src/styles/animations.css` (lines 85-94)**

```css
.content-inner {
  padding: 40px 20% 0;
  opacity: 0;
  transition: opacity var(--duration-fade) var(--timing-ease);
  /* NO height or overflow properties */
}

.stateExpanding .content-inner {
  opacity: 1;
  transition-delay: var(--duration-fade-delay);
}
```

## The Problem: Why Safari Can't Scroll

### Issue 1: Nested Absolute Positioning
Safari has known issues with scroll containers that are:
1. `position: absolute` (not in normal flow)
2. Inside a `position: fixed` body
3. With dynamic `height` set via CSS class toggle

### Issue 2: No Explicit Scroll Container Recognition
When you set `overflow-y: scroll` on `.content-box`:
- The element needs explicit dimensions for Safari to calculate scrollable area
- `.content-box` has `height: 50vh` ✅
- BUT `.content-inner` has NO height constraint ❌
- Safari calculates: scrollHeight = max(content height, container height)
- If content fits in 50vh, Safari sees: scrollHeight = 50vh, clientHeight = 50vh
- **No overflow = no scroll events attached**

### Issue 3: GPU Layer Confusion
The `transition: all` on `.content-box` combined with `position: absolute` may cause Safari to:
1. Create a compositing layer for animation
2. Not properly update the scroll layer when animation completes
3. Mouse/touch events don't reach the scroll layer

### Issue 4: Touch Action / Pointer Events
With `body { position: fixed }`:
- Safari may route touch events to the body first
- Body can't scroll (overflow: hidden)
- Touch events don't bubble to `.content-box`
- No `touch-action` property set to override this

## Why Keyboard Works But Mouse/Touch Doesn't

**Keyboard scrolling:**
- Uses `Element.scrollTop` / `scrollBy()` APIs directly
- Works even if scroll event listeners aren't attached
- Can focus elements inside `.content-inner` and scroll to them

**Mouse/trackpad/touch scrolling:**
- Requires browser to attach scroll event listeners to the element
- Safari's heuristic: "Is there scrollable overflow?"
- If Safari calculates wrong scrollHeight, no listeners attached
- Events fall through to non-scrollable parent

## Attempted Fixes (All Failed)

1. ✅ Added `-webkit-overflow-scrolling: touch`
2. ✅ Used `overflow-y: scroll` instead of `auto`
3. ✅ Set explicit `height: 50vh` on scroll container
4. ✅ Added GPU acceleration hints (`transform: translateZ(0)`)
5. ✅ Forced reflows with `void element.offsetHeight`
6. ✅ Toggled overflow via JavaScript
7. ❌ Still not working

## Root Cause Hypothesis

Safari's scroll layer detection is failing due to **one or more** of:

### A. Content-Inner Has No Min-Height
`.content-inner` needs `min-height` greater than parent's `height` to force overflow:

```css
.stateExpanding .content-inner {
  min-height: calc(50vh + 1px); /* Force overflow */
}
```

### B. Absolute Positioning Breaks Safari's Scroll Layer
Safari may not properly handle:
- Absolutely positioned scroll containers
- That animate their `top` position
- Inside fixed-position parents

**Solution:** Use different positioning strategy that maintains animation

### C. Transition on "all" Delays Scroll Recognition
`transition: all` on `.content-box` includes `overflow-y` in transition:
- When class is added, `overflow-y: scroll` is animated
- Safari may wait for transition end before attaching scroll listeners
- Mouse events during animation are lost

**Solution:**
```css
.content-box {
  transition: top var(--duration-main) var(--timing-main);
  /* NOT transition: all */
}
```

### D. Z-Index Stacking Context Issues
`.content-box` is in a different stacking context from where Safari expects scroll containers.

### E. Body Position Fixed Blocks Scroll Events
The `position: fixed` body creates a containing block that interferes with scroll event routing in Safari.

## Proposed Solutions (In Order of Likelihood)

### Solution 1: Force Minimum Content Height ⭐ MOST LIKELY
```css
.stateExpanding .content-inner {
  opacity: 1;
  transition-delay: var(--duration-fade-delay);
  /* Force content to always overflow the 50vh container */
  min-height: calc(50vh + 100px);
}

@media (max-width: 768px) {
  .stateExpanding .content-inner {
    /* Force overflow in 20vh mobile container */
    min-height: calc(20vh + 100px);
  }
}
```

**Why this might work:**
- Guarantees scrollHeight > clientHeight
- Forces Safari to recognize overflow immediately
- No structural changes needed
- Preserves animation

### Solution 2: Remove "all" from Transition
```css
.content-box {
  position: absolute;
  /* ... */
  /* CHANGE THIS: */
  transition: top var(--duration-main) var(--timing-main),
              left var(--duration-main) var(--timing-main),
              opacity var(--duration-main) var(--timing-main);
  /* NOT: transition: all var(--duration-main) var(--timing-main); */
}
```

**Why this might work:**
- `overflow-y` change is instant, not transitioned
- Safari can attach scroll listeners immediately
- Animation still works (only top/left/opacity transition)

### Solution 3: Add Explicit Scroll Layer Hint
```css
.stateExpanding .content-box {
  position: absolute;
  top: 50vh;
  height: 50vh;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  /* Add these: */
  will-change: scroll-position;
  transform: translateZ(0); /* Create own layer */
  isolation: isolate; /* Create stacking context */
}
```

**Why this might work:**
- Forces Safari to create a dedicated scroll layer
- `will-change: scroll-position` hints at scrollability
- Isolation prevents z-index bleed

### Solution 4: Touch-Action on Body
```css
body {
  margin: 0;
  background: var(--color-content-white);
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  /* Add this: */
  touch-action: none; /* Don't handle touches on body */
}

.stateExpanding .content-box {
  /* ... existing styles ... */
  touch-action: pan-y; /* DO handle vertical scroll touches */
}
```

**Why this might work:**
- Prevents body from stealing touch events
- Explicitly routes pan gestures to content-box

### Solution 5: Wrapper Div with Relative Positioning
Add a wrapper between container and content-box:

**HTML Structure Change:**
```
.container
  └── .content-box-wrapper (position: relative, height: 100dvh)
       └── .content-box (position: absolute)
```

**CSS:**
```css
.content-box-wrapper {
  position: relative;
  width: 100%;
  height: 100dvh;
  pointer-events: none;
}

.stateExpanding .content-box {
  pointer-events: auto;
  /* ... existing styles ... */
}
```

**Why this might work:**
- Scroll container is inside relative parent (not fixed)
- Better containment for Safari's layout engine
- Pointer-events prevents wrapper from interfering

### Solution 6: Use Translate Instead of Top
Replace `top` animation with `transform: translateY()`:

```css
.content-box {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(100vh); /* Start position */
  transition: transform var(--duration-main) var(--timing-main);
  /* ... */
}

.stateExpanding .content-box {
  transform: translateY(50vh); /* End position */
  height: 50vh;
  overflow-y: scroll;
  /* ... */
}
```

**Why this might work:**
- Transform is GPU-accelerated
- Doesn't trigger layout recalc
- May play better with Safari's scroll layer detection
- top stays constant (easier for Safari to understand)

## Testing Strategy

Test solutions in order (1→6). For each:

1. **Desktop Safari:**
   - Navigate to /about
   - Try trackpad scroll immediately
   - Try mouse wheel
   - Check browser console for errors
   - Inspect element and verify computed styles

2. **iOS Safari (Simulator or Device):**
   - Navigate to /about
   - Try touch scroll
   - Check if momentum scrolling works
   - Test on actual iPhone if possible

3. **Validation:**
   - All 4 sections (about, services, portfolio, clients)
   - Both languages (KO, EN)
   - Different screen sizes
   - After window resize

## Critical Files to Modify

- `/src/styles/content.css` (lines 1-22, 87-90) - content-box scroll container
- `/src/styles/animations.css` (lines 85-94) - content-inner min-height
- `/src/styles/global.css` (lines 18-43) - body and container
- `/src/components/Content.js` (lines 13-17) - if DOM structure changes needed

## Implementation Status

### ✅ IMPLEMENTED (Test These First)

**Solution 1 + Solution 2 Combined:**

1. **Removed `transition: all` from `.content-box`** ([content.css:8-10](src/styles/content.css#L8-L10))
   ```css
   transition: top var(--duration-main) var(--timing-main),
               left var(--duration-main) var(--timing-main),
               opacity var(--duration-main) var(--timing-main);
   ```
   - Now `overflow-y` change is instant, not transitioned
   - Safari can attach scroll listeners immediately

2. **Added `min-height` to `.content-inner`** ([animations.css:95](src/styles/animations.css#L95))
   ```css
   .stateExpanding .content-inner {
     min-height: calc(50vh + 100px); /* Desktop */
   }

   @media (max-width: 768px) {
     .stateExpanding .content-inner {
       min-height: calc(20vh + 100px); /* Mobile */
     }
   }
   ```
   - Guarantees scrollHeight > clientHeight
   - Forces Safari to recognize overflow

### Testing Instructions

1. **Test on actual Safari** (not Chrome DevTools Safari mode)
2. Navigate to `/about` or any content section
3. Try:
   - Trackpad/mouse wheel scroll (desktop)
   - Touch scroll with momentum (mobile)
4. Verify quadrants scroll out of view (not sticky)

If these don't work, proceed to Solutions 3-6 below.

## Next Steps If Still Broken

1. Try Solution 3 (GPU layer hints with `will-change`)
2. Try Solution 4 (touch-action properties)
3. Try Solution 6 (transform: translateY instead of top)
4. Check Safari Web Inspector for compositor layer issues
5. Use Safari's "Show Compositing Borders" debug feature
