# Team Profile Mobile Issues

## CRITICAL: Issue 3 - Tap to Deselect Not Working

### Symptom
Tapping an expanded profile card does NOT close it. The card stays open.

### Current Code State (TeamProfiles.js)
```javascript
const handleTouchEnd = (e) => {
  if (isMobile() && !isTouchMoving) {
    e.preventDefault();
    e.stopPropagation();

    const isCurrentlyActive = card.classList.contains('mobile-active');

    // Close all other profiles first
    const allCards = this.element.querySelectorAll('.team-member');
    allCards.forEach(otherCard => {
      if (otherCard !== card) {
        otherCard.classList.remove('mobile-active');
      }
    });

    // Toggle this card
    if (isCurrentlyActive) {
      // Close this card
      card.classList.remove('mobile-active');
    } else {
      // Open this card and scroll into view
      card.classList.add('mobile-active');
      scrollCardIntoView();
    }
  }
};
```

### Possible Causes

1. **`isTouchMoving` stuck as `true`** - If touchmove fires even on a stationary tap (due to finger micro-movements), `isTouchMoving` becomes true and the handler returns early

2. **Touch event not reaching handler** - Something might be intercepting the touch event before it reaches the card

3. **`isCurrentlyActive` returning wrong value** - The class check might not be working as expected

4. **Event propagation issue** - Child elements inside the card might be capturing the touch

### Debugging Steps

Add these console logs to diagnose:

```javascript
const handleTouchEnd = (e) => {
  console.log('=== TOUCHEND ===');
  console.log('isMobile():', isMobile());
  console.log('isTouchMoving:', isTouchMoving);
  console.log('target:', e.target.tagName, e.target.className);
  console.log('card has mobile-active:', card.classList.contains('mobile-active'));

  if (isMobile() && !isTouchMoving) {
    console.log('>>> PASSED CONDITIONS, toggling...');
    // ... rest of handler
  } else {
    console.log('>>> BLOCKED - isTouchMoving is true or not mobile');
  }
};
```

### Most Likely Cause: Touch Move Threshold Too Sensitive

The 10px threshold for `isTouchMoving` may be too sensitive. Even a slight finger movement during a tap can trigger it:

```javascript
// Current threshold
if (moveDistanceY > 10 || moveDistanceX > 10) {
  isTouchMoving = true;
}
```

### Potential Fixes

**Fix A: Increase touch move threshold**
```javascript
const handleTouchMove = (e) => {
  if (isMobile()) {
    const touchMoveY = e.touches[0].clientY;
    const touchMoveX = e.touches[0].clientX;
    const moveDistanceY = Math.abs(touchMoveY - touchStartY);
    const moveDistanceX = Math.abs(touchMoveX - touchStartX);

    // Increase threshold from 10 to 15-20px
    if (moveDistanceY > 20 || moveDistanceX > 20) {
      isTouchMoving = true;
    }
  }
};
```

**Fix B: Use click event as backup**
Add a click handler that works when touch fails:

```javascript
card.addEventListener('click', (e) => {
  if (isMobile()) {
    e.preventDefault();
    const isCurrentlyActive = card.classList.contains('mobile-active');

    // Close all other profiles
    const allCards = this.element.querySelectorAll('.team-member');
    allCards.forEach(otherCard => {
      if (otherCard !== card) {
        otherCard.classList.remove('mobile-active');
      }
    });

    // Toggle this card
    card.classList.toggle('mobile-active');

    if (!isCurrentlyActive) {
      scrollCardIntoView();
    }
  }
});
```

**Fix C: Reset isTouchMoving on touchstart**
Ensure it's always reset:

```javascript
const handleTouchStart = (e) => {
  if (isMobile()) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    isTouchMoving = false; // Already here, but verify it's working
  }
};
```

**Fix D: Check if expanded content is blocking touch**
The `.profile-reveal` element expands when active. If it has `pointer-events: auto` or covers the card area, taps might be going to it instead of the card root.

Check CSS for:
```css
.profile-reveal {
  pointer-events: none; /* Add this if missing */
}

.team-member.mobile-active .profile-reveal {
  pointer-events: auto; /* Or keep as none to let taps pass through */
}
```

---

## Issue 1: Shuffling/Jittering When Tapping Profiles

### Symptom
When tapping a profile card on mobile, sometimes the card shuffles up and down slightly instead of cleanly opening/closing.

### Possible Causes

1. **Touch event firing multiple times** - The touchend handler might be firing more than once per tap
2. **Scroll function interfering** - The `scrollCardIntoView()` function runs 450ms after tap, which could cause visual jitter if:
   - The card is being closed (scroll shouldn't run on close)
   - Another card is tapped before the scroll completes
3. **CSS transition conflict** - The scroll happening during the CSS expand/collapse animation (400ms) could fight with the animation
4. **CSS margin/padding animation** - The `.profile-reveal` transitions include margin and padding changes which can cause layout jitter

### CSS Transitions (content.css)
```css
.profile-reveal {
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease;
  /* NOTE: margin and padding transitions were REMOVED to prevent jitter */
  /* But margin-top still changes from 0 to 20px - this happens instantly now */
  padding: 0 20px;
  margin-top: 0;
}

.team-member.mobile-active .profile-reveal {
  max-height: 500px;
  opacity: 1;
  padding: 20px;
  margin-top: 20px;
}
```

The instant margin-top change (0 → 20px) when class is added/removed may cause visual jump.

### Potential Fix: Use padding-top inside content instead
```css
.profile-reveal {
  padding: 0 20px;
  margin-top: 0;
}

.team-member.mobile-active .profile-reveal {
  max-height: 500px;
  opacity: 1;
  padding: 20px;
  /* Remove margin-top, add a spacer element inside instead */
}
```

Or add the margin inside a wrapper that's hidden by overflow:
```css
.profile-reveal {
  margin-top: 0;
  padding-top: 0;
}

.profile-reveal > :first-child {
  margin-top: 20px; /* This margin is inside the overflow:hidden box */
}
```

---

## Issue 2: First Profile Doesn't Trigger Scroll

### Symptom
Tapping the first profile card doesn't scroll, but the second profile does.

### Cause
The scroll logic only triggers if the card bottom exceeds `viewportHeight - bottomPadding`:

```javascript
const overflow = cardRect.bottom - (viewportHeight - bottomPadding);
if (overflow > 0) {
  // scroll
}
```

The first profile, being at the top of the page, likely fits entirely within the viewport after expansion, so `overflow` is <= 0 and no scroll happens.

### Is This a Bug?
This might be **correct behavior** - if the expanded card is fully visible, no scroll is needed.

---

## Current File State

### TeamProfiles.js - Key Functions

**scrollCardIntoView()** (lines 73-92):
- Waits 450ms (CSS transition is 400ms)
- Calculates if card bottom extends past viewport
- Scrolls only if overflow > 0
- Uses `document.scrollingElement.scrollTo()` with smooth behavior

**handleTouchEnd()** (lines 128-153):
- Checks `isMobile()` and `!isTouchMoving`
- Closes all other profiles
- Toggles current card's `mobile-active` class
- Calls `scrollCardIntoView()` only when opening

**Touch move threshold**: 10px in any direction marks as scrolling

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/TeamProfiles.js` | Fix tap-to-close, possibly increase touch threshold |
| `src/styles/content.css` | Consider moving margin-top inside element |

---

## Testing Checklist

After implementing fixes:

- [ ] Tap closed profile - should open
- [ ] Tap open profile - should close (CURRENTLY BROKEN)
- [ ] Tap different profile - should close current, open new one
- [ ] Tap first profile - opens smoothly
- [ ] Tap second profile - first closes, second opens, scrolls to show it
- [ ] Tap same profile twice rapidly - should only toggle once, no jitter
- [ ] Tap profile, then tap another before animation completes - should not jitter
- [ ] Scroll while profile is expanded - should not interfere
- [ ] Tap to close expanded profile - no scroll should happen

---

## Priority

1. **HIGH** - Fix tap-to-close (Issue 3) - core functionality broken
2. **MEDIUM** - Fix jitter (Issue 1) - UX polish
3. **LOW** - First profile scroll (Issue 2) - may be intended behavior
