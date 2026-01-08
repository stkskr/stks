# FAQ Scrollbar Flicker During Height Animations

## Problem Description

When toggling FAQ questions open/closed in the Bottom Tab FAQ panel, a scrollbar briefly flickers during the height transition animation. This causes an awkward visual glitch where the FAQ content shifts width as the scrollbar appears and disappears.

### Why This Happens

1. **FAQ accordion expands** (250ms transition) - Question answer slides open
2. **Content becomes taller** - The FAQ measure container now has more content
3. **Scrollbar appears** - Because the panel height hasn't caught up yet, content overflows and scrollbar appears
4. **Panel height updates** (300ms delay + 400ms transition) - Height animates to accommodate new content
5. **Scrollbar disappears** - Once height is sufficient, scrollbar is no longer needed

**The scrollbar appearance during step 3-4 causes the width shift.**

### When We DO Want Scrollbars

The FAQ panel has a `max-height: 85vh` limit. If users open many questions simultaneously, the content can exceed this limit and a scrollbar is legitimately needed. We must preserve this functionality.

### When We DON'T Want Scrollbars

In 90% of cases, when users open/close a single question, the panel height adjustment is sufficient to accommodate the content without scrolling. The scrollbar should NOT appear during these transitions.

## Current Implementation

### Animation Timing

**FAQ Accordion Animation** (src/styles/bottomtabs.css:519-521)
```css
.faq-answer {
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.6, 1),
              padding 0.25s cubic-bezier(0.4, 0, 0.6, 1),
              border-color 0.2s ease;
}
```

**Panel Height Update Timing** (src/components/BottomTabs.js:411-419)
```javascript
// Update panel height after accordion animation completes (250ms transition + buffer)
setTimeout(() => {
  this.updateFaqPanelHeight();
  // Restore stable class after panel height animation completes (400ms)
  setTimeout(() => {
    if (faqMeasure) {
      faqMeasure.classList.add('stable');
    }
  }, 450);
}, 300);
```

**Panel Height Transition** (src/styles/bottomtabs.css:40)
```css
.bottom-tab-panel.faq-panel {
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Total timeline:**
- 0ms: Accordion starts expanding (250ms duration)
- 300ms: `updateFaqPanelHeight()` called, panel height starts animating (400ms duration)
- 700ms: Panel height animation completes
- 750ms: `.stable` class restored

### Overflow/Scrollbar Configuration

**FAQ Inner Container** (src/styles/bottomtabs.css:68-73)
```css
.faq-inner,
.contact-inner {
  overflow-y: auto;
  height: auto;
  min-height: min-content;
}
```

**FAQ Measure Container** (src/styles/bottomtabs.css:76-84)
```css
.faq-measure-container {
  overflow: hidden;
  transition: none;
}

.faq-measure-container.stable {
  overflow: visible;
}
```

**Panel Structure:**
```
.bottom-tab-panel.faq-panel (height animates via CSS variable)
  └── .bottom-tabs-content
      └── .faq-inner (overflow-y: auto - THIS is where scrollbar appears)
          └── .faq-measure-container (overflow: hidden, toggles .stable)
              └── .faq-content (actual FAQ items)
```

### Panel Height Calculation

**updateFaqPanelHeight()** (src/components/BottomTabs.js:126-148)
```javascript
updateFaqPanelHeight() {
  // Skip on mobile - use fixed viewport heights
  if (window.innerWidth <= 768) return;

  const faqPanel = this.container.querySelector('.faq-panel');
  const faqMeasureContainer = this.container.querySelector('.faq-measure-container');

  if (!faqPanel || !faqMeasureContainer) return;

  // Double requestAnimationFrame ensures DOM is fully painted after filtering
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 1. Measure actual content height from the measure container
      const contentHeight = faqMeasureContainer.scrollHeight;

      // 2. Calculate total: Button(42px) + Content + Bottom Buffer(30px)
      const totalHeight = 42 + contentHeight + 70;

      // 3. Set CSS variable - triggers smooth CSS transition
      faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);
    });
  });
}
```

**Max Height Constraint** (src/styles/bottomtabs.css:37)
```css
.bottom-tab-panel.faq-panel {
  height: var(--faq-panel-height);
  max-height: 85vh;  /* CRITICAL: Panel cannot exceed this */
}
```

## The Core Issue

The scrollbar appears on `.faq-inner` (which has `overflow-y: auto`) because during the 300ms-700ms window:
1. The accordion content has expanded (making `.faq-measure-container` taller)
2. The `.faq-panel` height hasn't caught up yet
3. `.faq-inner` has a constrained height (bounded by its parent `.faq-panel`)
4. Content overflows → scrollbar appears on `.faq-inner`

## Failed Attempts

### Attempt 1: Hide scrollbar with delay transition
```css
.faq-inner {
  overflow-y: hidden;
}
.bottom-tabs.faq-active .faq-inner {
  overflow-y: auto;
  transition: overflow-y 0s 400ms;
}
```
**Why it failed:** Only hides scrollbar when panel is opening, not during accordion animations

### Attempt 2: Toggle `.animating` class on `.faq-inner`
**Why it failed:** Doesn't account for the gap between accordion end (250ms) and panel height update (400ms)

### Attempt 3: `overflow: hidden` on `.faq-measure-container`
**Why it failed:** The scrollbar is on `.faq-inner`, not the measure container. The measure container's overflow doesn't affect whether `.faq-inner` scrolls.

## Required Solution

We need to temporarily hide the scrollbar on `.faq-inner` during the height transition, but ONLY when the final height will be sufficient to avoid scrolling.

**Constraints:**
1. Must preserve scrollbar when content exceeds `max-height: 85vh`
2. Must hide scrollbar during transitions when content fits within final height
3. Must work across the full animation sequence (accordion + panel height)
4. Should not interfere with ResizeObserver height updates

**Suggested Approach:**
Calculate whether scrolling will be needed BEFORE the animation, then conditionally apply `overflow: hidden` to `.faq-inner` during the transition only if we know the scrollbar won't be needed at the end.

## Code References

- FAQ accordion animation: `src/styles/bottomtabs.css:519-521`
- FAQ panel height transition: `src/styles/bottomtabs.css:40`
- FAQ panel max-height: `src/styles/bottomtabs.css:37`
- FAQ inner overflow: `src/styles/bottomtabs.css:68-73`
- Accordion toggle handler: `src/components/BottomTabs.js:391-420`
- Height update function: `src/components/BottomTabs.js:126-148`
- ResizeObserver setup: `src/components/BottomTabs.js:173-239`
