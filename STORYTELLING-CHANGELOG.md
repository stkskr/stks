# Storytelling Angle - Copy Changes (2026-02-26)

Changes to emphasize brand storytelling alongside copywriting. Korean translations below each change for team review.

---

## 1. About Page Subtitle (`src/data/about.json`)

**Before (EN):**
> Writing an impressive message for your local audience is difficult. Even more so for a global one.

**After (EN):**
> Landing your brand story locally takes talent. Landing it globally takes a little more.

**Current Korean:**
> 인상적인 메시지를 쓰는 건 어렵습니다. 영어로는 더더욱

**Suggested Korean (needs proofread):**
> 브랜드 스토리를 현지에서 전달하는 건 실력이 필요합니다. 글로벌하게 전달하려면 조금 더.

---

## 2. FAQ - "What does Sticks & Stones do best?" (`src/data/faq.json`)

**Before (EN):**
> Sticks & Stones specializes in English copywriting for Korean conglomerates and global brands.

**After (EN):**
> Sticks & Stones specializes in English copywriting **and brand storytelling** for Korean conglomerates and global brands.

**Current Korean:**
> 스틱스앤스톤스는 한국 대기업과 글로벌 브랜드를 위한 영어 카피라이팅에 특화되어 있습니다.

**Suggested Korean (needs proofread):**
> 스틱스앤스톤스는 한국 대기업과 글로벌 브랜드를 위한 영어 카피라이팅과 브랜드 스토리텔링에 특화되어 있습니다.

---

## 3. Contact Page Tagline (`src/data/contact.json`)

**Before (EN):**
> Words that stick, boosting brands. A specialized English copywriting agency for global branding and marketing, Sticks & Stones Seoul.

**After (EN):**
> Words that stick, stories that sell. A specialized English copywriting and storytelling agency for global branding and marketing, Sticks & Stones Seoul.

**Current Korean:**
> Words that stick, boosting brands. 글로벌 브랜딩과 마케팅에 특화된 영어 전문 카피라이팅 회사, 스틱스앤스톤스 서울.

**Updated Korean (English slogan updated, rest needs proofread):**
> Words that stick, stories that sell. 글로벌 브랜딩과 마케팅에 특화된 영어 카피라이팅 및 스토리텔링 전문 회사, 스틱스앤스톤스 서울.

---

## 4. Services Quadrant Text (`src/data/quadrants.json`)

**Before (EN):**
> Globally resonant messages people connect with

**After (EN):**
> Globally resonant stories that people connect with

**Current Korean:**
> 강한 울림을 주고 공감 받는 글로벌 메시지

**Suggested Korean (needs proofread):**
> 강한 울림을 주고 공감 받는 글로벌 스토리

---

## Summary of Korean Changes Needed

Once the team approves the suggested Korean above, update these files:

| File | Field | Status |
|------|-------|--------|
| `src/data/about.json` | `subtitle.ko` | Needs Korean update |
| `src/data/faq.json` | FAQ answer `.ko` for "What does S&S do best?" | Needs Korean update |
| `src/data/contact.json` | `tagline.ko` | English slogan updated; Korean description needs update |
| `src/data/quadrants.json` | `services.ko` | Needs Korean update |
