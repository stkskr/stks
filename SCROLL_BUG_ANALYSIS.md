# Scroll-to-Top Bug Analysis

## Problem Description
When clicking the "Let's Talk" button anywhere on the site, the page automatically scrolls to the top. This happens on both desktop and mobile.

## Expected Behavior
The page should maintain its current scroll position when the "Let's Talk" button is clicked and the Contact tab opens.

## Current Implementation

### 1. CTA Button (Content.js)
**Location:** `/src/components/Content.js` lines 179-180

```javascript
<h2 class="cta-heading">Have a project?</h2>
<button type="button" class="cta-button">Let's talk</button>
```

**Event Handler:** Lines 185-196
```javascript
attachCTAListeners() {
  const ctaButtons = this.element.querySelectorAll('.cta-button');
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Dispatch custom event to open contact tab
      window.dispatchEvent(new CustomEvent('openContactTab'));
    });
  });
}
```

### 2. Bottom Tabs Event Listener (BottomTabs.js)
**Location:** `/src/components/BottomTabs.js` lines 49-67

```javascript
// Listen for custom event to open contact tab from anywhere
window.addEventListener('openContactTab', (e) => {
  // Prevent any default scroll behavior
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  // Save current scroll position
  const scrollY = window.scrollY || window.pageYOffset;

  this.openTab('contact');

  // Restore scroll position using multiple frames to ensure it sticks
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  });
});
```

### 3. The openTab Method (BottomTabs.js)
**Location:** `/src/components/BottomTabs.js` lines 70-90

```javascript
openTab(tab) {
  if (this.activeTab === tab) {
    this.closeTab();
    return;
  }

  // Save scroll position before any DOM changes
  const savedScrollY = window.scrollY || window.pageYOffset;

  this.activeTab = tab;
  this.container.classList.add('active');
  this.container.classList.remove('contact-active', 'faq-active');

  if (tab) {
    this.container.classList.add(`${tab}-active`);
    document.body.classList.add(`${tab}-active`); // Add to body for CSS touch-action
    this.renderContent(tab);
    this.updateArrows();

    // Prevent any scroll changes from DOM updates
    window.scrollTo(0, savedScrollY);

    // Safari-optimized scroll handling
    setTimeout(() => {
      const scrollContainer = this.container.querySelector(`.${tab}-panel .bottom-tabs-content`);
      if (scrollContainer) {
        // Safari bug fix: If at exactly 0, it won't claim the scroll gesture
        // Nudge it to 1px to "wake up" the scroll engine
        if (scrollContainer.scrollTop === 0) {
          scrollContainer.scrollTop = 1;
        }
        // ... (touch handlers follow)
      }
    }, 150);
  }
}
```

## Attempts to Fix (All Failed)

1. **Added `type="button"` to CTA button** - Prevents form submission behavior
2. **Added `e.preventDefault()` and `e.stopPropagation()` in click handler** - Prevents default events
3. **Saved and restored scroll position in custom event listener** - Using double `requestAnimationFrame`
4. **Saved and restored scroll position in `openTab` method** - Immediately after DOM changes
5. **Multiple scroll restoration attempts** - Still scrolls to top

## Possible Causes to Investigate

1. **CSS scroll-behavior property** - Could be `scroll-behavior: smooth` causing issues?
2. **Body class changes** - Adding `${tab}-active` to body might trigger scroll
3. **DOM reflow** - `renderContent(tab)` might be causing layout shift
4. **Focus management** - Something might be getting focused that's at the top
5. **CSS transitions** - Height/position transitions on bottom tabs
6. **Anchor link behavior** - Is there an invisible anchor being triggered?
7. **Browser default behavior** - Some browser-specific scroll restoration?

## Files Involved

1. `/src/components/Content.js` - CTA button rendering and event handling
2. `/src/components/BottomTabs.js` - Tab opening logic
3. `/src/styles/bottomtabs.css` - Bottom tabs styling
4. `/src/styles/mobile-fixes.css` - Mobile-specific overrides
5. `/src/styles/global.css` - Global styles

## CSS That Might Be Relevant

Check for:
- `scroll-behavior` properties
- `position: fixed` on body changes
- Transitions that affect layout
- Focus styles that might scroll into view
- Any `scrollIntoView()` calls in JavaScript

## Questions for Investigation

1. Is `window.scrollTo()` being called from somewhere else in the codebase?
2. Are there any CSS animations/transitions that complete after our scroll restoration?
3. Is there a `scrollIntoView()` being triggered by focus management?
4. Does the browser have native scroll restoration that's interfering?
5. Is the scroll happening during the 150ms setTimeout in the Safari scroll handling?

## Browser Testing Needed

- Test in Chrome (desktop)
- Test in Safari (desktop)
- Test in Chrome (mobile)
- Test in Safari (iOS)
- Check if scroll happens immediately or after a delay
- Check browser console for any errors

## Debug Steps to Try

1. Add console.logs to track when scrolls happen:
```javascript
window.addEventListener('scroll', () => {
  console.log('SCROLL EVENT', window.scrollY, new Error().stack);
});
```

2. Check if there are other event listeners on window:
```javascript
getEventListeners(window) // In Chrome DevTools
```

3. Temporarily disable CSS transitions to see if they're causing it:
```css
* { transition: none !important; }
```

4. Check if removing the setTimeout fixes it (breaks Safari scroll but tests theory)

5. Try using `scroll-behavior: auto` explicitly on body/html
