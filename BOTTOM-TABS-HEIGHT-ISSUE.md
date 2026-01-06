# Bottom Tabs Height Issue

## Problem
The FAQ and Contact tabs at the bottom of the page currently use fixed viewport-based heights (`65vh` for Contact, `85vh` for FAQ). This causes unnecessary empty space when the content is smaller than the allocated height, creating a poor user experience on desktop/tablet views.

## Current Implementation

### FAQ Panel
**File:** `src/styles/bottomtabs.css` (lines 35-48)

```css
.bottom-tab-panel.faq-panel {
  /* Use dynamic CSS variable with fallback */
  --faq-panel-height: calc(85vh + 42px);

  /* State 1: Minimized - Position so only 42px button shows */
  bottom: calc(-1 * (var(--faq-panel-height) - 42px));
  height: var(--faq-panel-height);

  max-height: 95vh;
  z-index: 1;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
```

**Current behavior:**
- Fixed at `85vh + 42px` total height
- Has `updateFaqPanelHeight()` JavaScript function (lines 118-144 in `BottomTabs.js`) that attempts to set a CSS variable `--faq-panel-height` dynamically
- This function measures `faqInner.scrollHeight` to calculate actual content height
- However, the implementation doesn't fully work as intended

### Contact Panel
**File:** `src/styles/bottomtabs.css` (lines 22-27)

```css
.bottom-tab-panel.contact-panel {
  bottom: calc(-65vh);
  height: calc(65vh + 42px);
  z-index: 1;
}
```

**Current behavior:**
- Fixed at `65vh + 42px` total height
- No dynamic height adjustment
- Content uses CSS Grid with fixed heights
- Map iframe fills available space regardless of actual need

## Desired Behavior

### Desktop/Tablet View (> 768px)
1. **Dynamic Height Matching Content**
   - FAQ panel should expand/contract to fit the actual content height
   - Contact panel should fit the natural height of contact info + map
   - No unnecessary empty space below content
   - Smooth transitions when FAQ category changes or accordions expand/collapse
   - Maximum height constraint to prevent panel from covering entire screen (e.g., `max-height: 85vh`)

2. **FAQ Panel Specific**
   - Height should adjust when:
     - Switching between FAQ categories (Services, Pricing, Process, Legal, Other)
     - Expanding/collapsing individual FAQ accordion items
     - Changing language (content length may differ)
   - Should measure the actual visible content after filters/accordion changes
   - Smooth CSS transition when height changes

3. **Contact Panel Specific**
   - Should fit contact information and map naturally
   - Map should have reasonable aspect ratio (not stretched or compressed)
   - Height should be just enough to display all content without scrolling (if possible)

### Mobile View (≤ 768px)
**Keep current behavior - no changes needed**
- FAQ panel: `90vh + 42px` (line 442-445)
- Contact panel: `80vh + 42px` (line 437-440)
- Mobile views should remain maximized to fill most of the screen
- Current implementation is good for small screens

## Technical Notes

### Existing Partial Implementation
The FAQ panel already has a `updateFaqPanelHeight()` method in `BottomTabs.js`:
- Called when FAQ tab opens (line 113)
- Called when accordion items expand/collapse (line 256)
- Called when category filters change (line 279)
- Uses `requestAnimationFrame` for proper DOM measurement timing
- Sets CSS variable `--faq-panel-height` dynamically

However, the CSS may not be fully responsive to this variable, or there may be conflicts with the fixed fallback value.

### Constraints
- Must maintain the smooth `400ms cubic-bezier(0.4, 0, 0.2, 1)` transition
- Must work with the existing button offset animation (buttons slide from offset to center)
- Must not break the z-index layering system (when one tab is active, the other is behind)
- Mobile responsive behavior (≤ 768px) must remain unchanged
- Panel positioning logic: `bottom: calc(-1 * (height - 42px))` when minimized, `bottom: 0` when active

## Files Involved
1. **`src/styles/bottomtabs.css`** - Panel height definitions and responsive styles
2. **`src/components/BottomTabs.js`** - Height calculation logic (`updateFaqPanelHeight()` method)
3. Potentially need similar height calculation for Contact panel

## Requirements Summary
- ✅ Desktop/tablet: Panels should auto-fit content height with smooth transitions
- ✅ FAQ panel: Height updates on category change, accordion toggle, language change
- ✅ Contact panel: Natural height based on content + map
- ✅ Mobile (≤ 768px): Keep current fixed viewport-based heights (no changes)
- ✅ Smooth transitions maintained
- ✅ Maximum height constraints to prevent full-screen takeover
- ✅ No unnecessary empty space on desktop/tablet views
