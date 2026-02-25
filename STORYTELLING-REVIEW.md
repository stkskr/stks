# Storytelling Language Integration — Review Document

## Why Consider This?

The term "storytelling" has exploded in branding and marketing:

- LinkedIn job postings with "storyteller" **doubled** in the past year; 50K+ in marketing alone
- Executive mentions of "storytelling" on earnings calls: **147** (2015) → **469** (2025)
- Google, Microsoft, Vanta ($274K salary), USAA are all building dedicated storytelling teams
- Main drivers: decline of traditional media, brands becoming their own publishers, AI-generated content flooding the market — making authentic human narrative more valuable

### The Pushback

There's meaningful criticism of the trend worth noting:

- **Buzzword fatigue**: Some argue it's "as meaningless as 'Be Authentic'" and that copywriters have been doing this since Ogilvy
- **Craft vs. commerce**: A storyteller is a writer, not a brand strategist — the term risks being hollowed out by corporate adoption
- **Hollow operationalization**: When storytelling becomes a KPI-driven department, it loses authenticity
- **What companies actually need**: Meaning-making and coherence, not just a trendy job title

### Why It's Authentic for STKS

STKS is **already doing storytelling work** — brand manifestos, brand stories, executive keynote speeches, TVC scripts — but labeling it purely as "copywriting." The team has genuinely narrative-trained backgrounds:

- Richard Kim: USC Cinema (Film Production MA), Emmy winner
- Brixton Sandhals: English Literature BA, editorial work at NYT
- The FAQ already lists "brand manifestos and stories" as a service

The question isn't whether STKS does storytelling — it's whether the website should *say so*.

### Recommendation

**Strategic integration, not rebranding.** Layer storytelling language into a few high-impact touchpoints where it's authentic. Don't abandon the copywriting identity — augment it.

---

## Proposed Changes

Each change below shows the exact current copy and the suggested replacement. All changes are English-only — the Korean copy would remain untouched (스토리텔링 doesn't carry the same market weight in Korean).

---

### 1. Homepage Quadrant — About Section

**File:** `src/data/quadrants.json` → `about.en`

**CURRENT:**
```
Copywriters
translating culture
into brand language.
Sticks and Stones
```

**SUGGESTED:**
```
Storytellers
translating culture
into brand language.
Sticks and Stones
```

**Rationale:** This is the first thing visitors see on the homepage. A single-word swap — "Copywriters" → "Storytellers" — immediately positions STKS in the storytelling space while keeping the rest of the identity intact. High impact, minimal risk.

---

### 2. About Page — Subtitle/Headline

**File:** `src/data/about.json` → `subtitle.en`

**CURRENT:**
```
Writing an impressive message for your local audience is difficult.
Even more so for a global one.
```

**SUGGESTED:**
```
Telling your brand's story to a local audience is hard enough.
Telling it to a global one takes a different kind of writer.
```

**Rationale:** Reframes the value proposition around narrative rather than just "writing a message." Also subtly positions STKS as that "different kind of writer" — elevating the brand beyond commodity copywriting.

**Alternative (if the current version is preferred):** Keep as-is. The other changes may be sufficient without touching this headline.

---

### 3. FAQ — "What does Sticks & Stones do best?"

**File:** `src/data/faq.json` → services category, question 6

**CURRENT:**
```
Sticks & Stones specializes in English copywriting for Korean
conglomerates and global brands. Our work spans brand naming and
slogans, brand manifestos and stories, executive keynotes and
speeches, TVC and video ad scripts, tone of voice guides, OOH and
print advertising, and social media content across all touchpoints.
```

**SUGGESTED:**
```
Sticks & Stones specializes in English copywriting and brand
storytelling for Korean conglomerates and global brands. Our work
spans brand naming and slogans, brand manifestos and stories,
executive keynotes and speeches, TVC and video ad scripts, tone of
voice guides, OOH and print advertising, and social media content
across all touchpoints.
```

**Rationale:** Adds "and brand storytelling" after "copywriting." Minimal, accurate, and captures the keyword for anyone searching for storytelling services. The rest of the answer remains unchanged.

---

### 4. FAQ — "Why should we choose Sticks & Stones?"

**File:** `src/data/faq.json` → other category, last question

**CURRENT:**
```
Sticks & Stones specializes in global-standard English copywriting,
not simple translation. All copywriters are native English-speaking
global professionals, with extensive experience delivering naming,
slogan, and brand story projects for Korean conglomerates and
global brands.
```

**SUGGESTED:**
```
Sticks & Stones specializes in global-standard English copywriting
and brand storytelling, not simple translation. All copywriters are
native English-speaking global professionals, with extensive
experience delivering naming, slogan, and brand story projects for
Korean conglomerates and global brands.
```

**Rationale:** Same pattern — inserts "and brand storytelling" into the positioning statement. This is the persuasive "why us" answer, so it's a natural place for the term.

---

### 5. Contact Page — Tagline

**File:** `src/data/contact.json` → `tagline.en`

**CURRENT:**
```
Words that stick, boosting brands.
A specialized English copywriting agency for global branding and
marketing, Sticks & Stones Seoul.
```

**SUGGESTED:**
```
Words that stick, stories that sell.
A specialized English copywriting and storytelling agency for global
branding and marketing, Sticks & Stones Seoul.
```

**Rationale:** "Words that stick, stories that sell" creates a parallel structure that's memorable and introduces the storytelling angle at the contact/conversion point. The second line adds "and storytelling" naturally alongside "copywriting."

---

### 6. Homepage Quadrant — Services Section (Optional)

**File:** `src/data/quadrants.json` → `services.en`

**CURRENT:**
```
Globally resonant
messages people
connect with
```

**SUGGESTED:**
```
Stories and messages
that resonate
globally
```

**Rationale:** This is more of a lateral move than a clear improvement. The current version already works well. Consider this optional — only if you want storytelling language on more than one quadrant.

---

## What NOT to Change

| Copy | Reason |
|------|--------|
| **"Words that stick, boosting brands"** (primary tagline) | This IS the brand. Strong as-is. |
| **Portfolio quadrant** (Edison quote) | Perfect, timeless, no storytelling angle needed |
| **Client testimonials** | These are clients' own words — don't modify |
| **Copywriting vs. translation FAQ** | Foundational positioning distinction. Adding "storytelling" here would muddy the clarity |
| **Korean copy across all files** | The storytelling trend is primarily English-market driven |
| **Team role titles** | Personal/sensitive — only change if explicitly desired |

---

## Sources

- [WSJ: Companies Are Desperately Seeking 'Storytellers'](https://www.wsj.com/articles/companies-are-desperately-seeking-storytellers-7b79f54e)
- [The Guardian: How the world's oldest job became the hottest new corporate job title](https://www.theguardian.com/media/2025/dec/17/storytellers-how-the-worlds-oldest-job-became-the-hottest-new-corporate-job-title)
- [Acquia: Brand Storytelling](https://www.acquia.com/glossary/brand-storytelling)
- [Axonovo: Storytelling vs Copywriting](https://axonovo.com/en/news/storytelling-vs-copywriting-two-skills-that-seem-similar-but-serve-very-different-purposes/)
- [LinkedIn: Danielle Costello on Storytellers vs Brand Strategists](https://www.linkedin.com/posts/dmcostello_a-storyteller-is-a-writer-not-a-brand-strategist-activity-7406427432339152896-8fV_/)
- [MarTech: Companies Aren't Looking for Storytellers — They're Looking for Meaning](https://martech.org/companies-arent-looking-for-storytellers-theyre-looking-for-meaning/)
- [Encore360: The Storyteller Gold Rush](https://encore360.com/the-storyteller-gold-rush-why-every-company-is-suddenly-hiring-like-a-media-brand/)
- [YPulse: Corporate America's new hottest job title](https://www.ypulse.com/newsfeed/2025/12/22/corporate-americas-new-hottest-job-title-is-also-one-of-the-oldest-storyteller-2/)
