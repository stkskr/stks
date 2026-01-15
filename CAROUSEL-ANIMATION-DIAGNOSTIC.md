# Carousel Animation Diagnostic

## Problem Statement

1. **Carousel animations not working on mobile** - Images disappear and reappear instantly instead of sliding
2. **Modal too tall on mobile** - Modal should fit content height when content is short, not always fill screen

---

## FIXES APPLIED

### Fix 1: Wrapped desktop animations in media query (content.css lines 848-864)
Added `@media (min-width: 769px)` wrapper so desktop animations don't apply on mobile.

### Fix 2: Changed from `display: none` to `visibility: hidden` (mobile-fixes.css lines 296-354)
Items now use `visibility: hidden; opacity: 0;` instead of `display: none`.
This keeps elements in the DOM so animations can run when classes are added.

### Fix 3: Changed modal height from fixed to auto (mobile-fixes.css line 170)
Changed from `height: calc(100dvh - 40px)` to `height: auto` so modal fits content.

### Fix 4: JS timing fix - keep `.active` during animation (ModalPortfolio.js lines 537-580)
**ROOT CAUSE FIX**: The old code removed `.active` from the exiting slide BEFORE the exit animation.
On mobile, the active slide defines the container height. Removing `.active` first caused:
- Container height collapse
- Exit animation on an invisible/0-height element
- "Instant disappear" effect

**Solution**: Added `.is-animating` class that:
1. Keeps `.active` on BOTH slides during the 450ms animation
2. Makes both slides `position: absolute` overlays during animation
3. Only removes `.active` from old slide AFTER animation completes

### Fix 5: Changed `.modal-body` flex behavior (mobile-fixes.css line 564)
Changed from `flex: 1 1 0` to `flex: 1 1 auto` so body sizes to content instead of filling space.

---

## IF STILL NOT WORKING - Debug Steps

---

## A) Current Animation Setup

### CSS Classes Applied During Transition (ModalPortfolio.js lines 540-567)

```
Timeline:
1. currentItem.classList.remove('active')
2. requestAnimationFrame → currentItem.classList.add('exit-next')
3. nextItem.classList.add('active')
4. requestAnimationFrame → nextItem.classList.add('enter-next')
5. setTimeout(450ms) → remove all animation classes
```

**Expected class states during "next" transition:**
- Exiting item: `.modal-carousel-item.exit-next` (no .active)
- Entering item: `.modal-carousel-item.active.enter-next`

### CSS Rules in mobile-fixes.css (lines 299-349)

```css
/* Exiting slides */
.modal-carousel-item.exit-next {
  animation: mobileSlideOutLeft 0.4s ease-out forwards !important;
}

/* Entering slides */
.modal-carousel-item.active.enter-next {
  animation: mobileSlideInRight 0.4s ease-out forwards !important;
}
```

### Keyframes (lines 352-394)

```css
@keyframes mobileSlideInRight {
  0% { opacity: 0; transform: translateX(100%); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes mobileSlideOutLeft {
  0% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-100%); }
}
```

---

## B) Diagnostic Tests

### Test 1: Verify CSS is being applied

Open DevTools on mobile/responsive view and:

1. Click a carousel arrow
2. Immediately inspect the carousel items
3. Check if `.exit-next` and `.enter-next` classes are present
4. Check computed styles for `animation` property

**Expected:** Should see `mobileSlideOutLeft` / `mobileSlideInRight`
**If seeing:** `slideOutToLeft` / `slideInFromRight` → Desktop CSS is winning

### Test 2: Check for animation property conflicts

In DevTools, inspect `.modal-carousel-item.active.enter-next` and look at:
- Which CSS file's `animation` rule is active
- Is it crossed out by another rule?

### Test 3: Check element visibility during transition

Add temporary debug CSS:
```css
.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev {
  background: red !important;
}

.modal-carousel-item.active.enter-next,
.modal-carousel-item.active.enter-prev {
  background: blue !important;
}
```

If you see red/blue flashes, the classes ARE being applied but animations aren't running.

### Test 4: Check if animations are being triggered

Add to ModalPortfolio.js temporarily after line 558:
```javascript
console.log('Entering item classes:', nextItem.classList.toString());
console.log('Computed animation:', getComputedStyle(nextItem).animation);
```

---

## C) Potential Issues

### Issue 1: Desktop CSS in content.css has no media query

**File:** content.css lines 847-861
```css
.modal-carousel-item.enter-next {
  animation: slideInFromRight 0.4s ease-out forwards;
}
```

This applies at ALL screen sizes. Even with `!important` in mobile-fixes.css, if the desktop rule loads AFTER mobile-fixes.css, it could win.

**Fix:** Wrap desktop animations in media query:
```css
@media (min-width: 769px) {
  .modal-carousel-item.enter-next {
    animation: slideInFromRight 0.4s ease-out forwards;
  }
  /* etc */
}
```

### Issue 2: `display: none` prevents animation

The base rule `.modal-carousel-item { display: none !important; }` might prevent the exiting item from animating.

When `active` is removed, the item matches `.modal-carousel-item` which has `display: none`.
Then `.exit-next` is added in the next frame, but the element was already hidden.

**Fix:** Ensure exit classes set `display: block` (they do, but check order/specificity)

### Issue 3: Animation may need `visibility` instead of `display`

Since `display: none` removes the element from layout instantly, it can't animate.

**Potential fix:**
```css
.modal-carousel-item {
  display: block !important;
  visibility: hidden !important;
  position: absolute !important;
  /* or */
  opacity: 0 !important;
}

.modal-carousel-item.active,
.modal-carousel-item.exit-next,
.modal-carousel-item.exit-prev {
  visibility: visible !important;
  /* or */
  opacity: 1 !important; /* let animation control this */
}
```

### Issue 4: Parent `overflow: hidden` clipping

Both `.modal-carousel-container` and `.modal-carousel` have `overflow: hidden`.
The `translateX(100%)` animation starts the element outside the visible area.

**This should be fine** - the element slides IN from outside, which is correct behavior.

---

## D) Modal Height Issue

### Current Problem
Modal always fills screen height even when content is short.

### Current CSS (mobile-fixes.css lines 168-185)
```css
.modal-content {
  height: calc(100dvh - 40px) !important;
  max-height: calc(100dvh - 40px) !important;
}
```

### Fix Needed
```css
.modal-content {
  /* Remove fixed height, use max-height only */
  height: auto !important;
  max-height: calc(100dvh - 40px) !important;
  /* Keep min-height for very short content */
  min-height: 200px !important;
}
```

But this may break the flexbox scroll container setup. Need to test.

### Alternative: Keep flex but allow shrinking
```css
.modal-content {
  height: fit-content !important;
  max-height: calc(100dvh - 40px) !important;
}

.modal-body {
  flex: 0 1 auto !important; /* Don't grow, can shrink, auto basis */
  max-height: calc(100dvh - 150px) !important; /* Leave room for header */
}
```

---

## E) Recommended Fix Order

1. **First:** Add media query wrapper to desktop animations in content.css
2. **Second:** Change `.modal-carousel-item` from `display: none` to `visibility: hidden` approach
3. **Third:** Test carousel animations
4. **Fourth:** Adjust modal height CSS for content-fitting

---

## F) Files to Modify

| File | Lines | Change |
|------|-------|--------|
| content.css | 847-905 | Wrap in `@media (min-width: 769px)` |
| mobile-fixes.css | 276-282 | Change display:none to visibility:hidden approach |
| mobile-fixes.css | 168-185 | Adjust height from fixed to auto/fit-content |

---

## G) Quick Debug Script

Paste in browser console when modal is open:

```javascript
// Monitor carousel class changes
const carousel = document.querySelector('.modal-carousel');
if (carousel) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        console.log('Class changed:', m.target.className);
        console.log('Computed animation:', getComputedStyle(m.target).animation);
      }
    });
  });

  carousel.querySelectorAll('.modal-carousel-item').forEach(item => {
    observer.observe(item, { attributes: true });
  });

  console.log('Observer attached to carousel items');
}
```

Then click the carousel arrows and watch the console.
