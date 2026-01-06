# FAQ Panel Shrinking Glitch

## Problem
When opening the FAQ tab, the panel initially appears at the correct height, but then slowly and continuously shrinks over time. This creates a jarring visual experience where the content gradually becomes hidden/compressed.

## Current Implementation

### ResizeObserver Setup
**File:** `src/components/BottomTabs.js` (lines 165-213)

```javascript
setupResizeObserver() {
  // Skip on mobile - use fixed viewport heights
  if (window.innerWidth <= 768) return;

  // Create ResizeObserver to automatically update panel heights when content changes
  this.resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const element = entry.target;
      const contentHeight = entry.contentRect.height;

      // Calculate total height: Button (42px) + Content
      const totalHeight = 42 + contentHeight;

      // Determine which panel this observer is watching
      if (element.classList.contains('faq-inner')) {
        const faqPanel = this.container.querySelector('.faq-panel');
        if (faqPanel) {
          faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);
        }
      } else if (element.classList.contains('contact-inner')) {
        const contactPanel = this.container.querySelector('.contact-panel');
        if (contactPanel) {
          contactPanel.style.setProperty('--contact-panel-height', `${totalHeight}px`);
        }
      }
    }
  });

  // Observe both FAQ and Contact inner elements
  const faqInner = this.container.querySelector('.faq-inner');
  const contactInner = this.container.querySelector('.contact-inner');

  if (faqInner) {
    this.resizeObserver.observe(faqInner);
  }
  if (contactInner) {
    this.resizeObserver.observe(contactInner);
  }
}
```

### CSS Height Configuration
**File:** `src/styles/bottomtabs.css` (lines 30-62)

```css
/* Desktop/Tablet Behavior (> 768px) - Dynamic height based on content */
@media (min-width: 769px) {
  /* FAQ Panel */
  .bottom-tab-panel.faq-panel {
    /* Default fallback before JS runs */
    --faq-panel-height: 500px;

    height: var(--faq-panel-height);
    max-height: 85vh;
    /* Formula: Start at - (Total Height - 42px Tab Height) */
    bottom: calc(-1 * (var(--faq-panel-height) - 42px));
    transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bottom-tabs.faq-active .faq-panel {
    bottom: 0;
    z-index: 3;
  }

  /* Contact Panel */
  .bottom-tab-panel.contact-panel {
    --contact-panel-height: 450px;

    height: var(--contact-panel-height);
    max-height: 85vh;
    bottom: calc(-1 * (var(--contact-panel-height) - 42px));
    transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .bottom-tabs.contact-active .contact-panel {
    bottom: 0;
    z-index: 3;
  }
}
```

### Initial Height Update
**File:** `src/components/BottomTabs.js` (lines 118-140)

```javascript
updateFaqPanelHeight() {
  // Skip on mobile - use fixed viewport heights
  if (window.innerWidth <= 768) return;

  const faqPanel = this.container.querySelector('.faq-panel');
  const faqInner = this.container.querySelector('.faq-inner');

  if (!faqPanel || !faqInner) return;

  // Double requestAnimationFrame ensures DOM is fully painted after filtering
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 1. Measure actual content height (the inner wrapper with padding)
      const contentHeight = faqInner.scrollHeight;

      // 2. Calculate total: Button(42px) + Content (already includes padding)
      const totalHeight = 42 + contentHeight;

      // 3. Set CSS variable - triggers smooth CSS transition
      faqPanel.style.setProperty('--faq-panel-height', `${totalHeight}px`);
    });
  });
}
```

This function is called when the FAQ tab content is rendered (line 113).

## Observed Behavior

1. User clicks the FAQ button
2. FAQ panel slides up and appears at the correct height initially
3. **GLITCH**: Panel begins slowly shrinking continuously
4. Content becomes gradually hidden as the panel height decreases
5. The shrinking continues indefinitely until the panel is too small

## Suspected Root Cause

**Possible ResizeObserver Feedback Loop:**
- ResizeObserver watches `.faq-inner` for size changes
- When the observer detects a size change, it sets `--faq-panel-height`
- The CSS `height: var(--faq-panel-height)` and `max-height: 85vh` may be constraining the content
- This constraint causes `.faq-inner` to shrink slightly
- The shrunk size triggers ResizeObserver again
- ResizeObserver updates the height variable to the new (smaller) size
- This creates a feedback loop where each resize makes the panel slightly smaller
- The loop continues indefinitely, causing the continuous shrinking effect

**Potential Conflict:**
The `max-height: 85vh` constraint combined with `height: var(--faq-panel-height)` may be creating a situation where:
1. Content tries to be taller than 85vh
2. CSS clamps it to 85vh
3. This causes scrollHeight to report a smaller value
4. ResizeObserver sees the smaller value and updates the variable
5. Repeat

## Desired Behavior

1. When FAQ tab opens, measure the natural content height once
2. Set the panel height to fit the content (up to max-height: 85vh)
3. Panel should remain at this height and **NOT** continuously resize
4. ResizeObserver should only trigger updates when:
   - User clicks an accordion item (expand/collapse)
   - User switches FAQ categories
   - Language changes (causing text length changes)
5. Automatic shrinking should **NEVER** occur
6. The panel should be stable and not constantly adjusting its height

## Requirements

- ResizeObserver should work correctly without creating feedback loops
- Panel height should stabilize after opening
- No continuous/gradual shrinking
- Height should only change in response to legitimate user interactions
- Smooth transitions maintained for intentional height changes
- Desktop/tablet only (mobile uses fixed heights and is unaffected)

## Technical Notes

Potential solutions might involve:
- Debouncing the ResizeObserver callback
- Checking if the height change is significant before updating the CSS variable
- Using a different measurement approach (e.g., offsetHeight vs contentRect.height)
- Preventing the observer from running during CSS transitions
- Adding a flag to prevent re-entry during height updates
