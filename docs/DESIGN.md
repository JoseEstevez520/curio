# Curio — Design System

Curio is a reading surface. You read a message from an LLM in a clean chat UI, then hover or click a word to reveal an inline description (v0) or a small generative-UI component (v1). This document defines the visual language: monochrome-first, typographically driven, calm.

> **Owner UI preferences (read this too):** [`UI-PREFERENCES.md`](UI-PREFERENCES.md) distills what the
> owner actually wants, learned from live feedback. It is the **complement** to this doc: this one is the
> formal system, that one is the living memory of the owner's taste. This document has now been realigned
> with it — the two should read as one voice. If they ever diverge again, treat `UI-PREFERENCES.md` as the
> source of truth and **bring both back into alignment** rather than leaving a contradiction.

---

## 1. Design principles

1. **Text is the interface.** Typography and spacing carry hierarchy. Chrome recedes so reading stays effortless.
2. **Grayscale first, one quiet accent.** Color is a tool for meaning (links, focus, selection), never decoration.
3. **Borders, not boxes.** Structure comes from 1px hairlines and whitespace. Nothing floats.
4. **No shadows. Ever.** Depth is implied by contrast and layering of surfaces, not by blur.
5. **Restraint over richness.** If an element can be removed without losing clarity, remove it.
6. **Two speeds of motion.** Decorative micro-changes (color, hover, state, blink) confirm themselves instantly (~80–120ms). Structural morphs (mascot hero↔header, popover→modal) glide slowly and smoothly (~0.5s), never with a bounce. Spring/overshoot is reserved for small, playful micro-interactions only (see §7).
7. **Generous whitespace.** Air is a feature. Crowding is a bug.
8. **Reading comfort is non-negotiable.** Measure, line-height, and contrast are tuned for long sessions.

---

## 2. Color tokens

Grayscale-led. A single restrained blue accent, used sparingly for interactive affordances and focus. Values are given as raw tokens plus semantic aliases. Ship both themes; default to system preference.

```css
:root {
  /* ===== Light theme (default) ===== */

  /* Surfaces — from base up */
  --color-bg:            #ffffff;  /* app canvas */
  --color-bg-subtle:     #fafafa;  /* assistant message zone, panels */
  --color-bg-muted:      #f4f4f5;  /* hover fills, code blocks */
  --color-bg-inset:      #ededee;  /* pressed / active fills */

  /* Foreground / text levels */
  --color-fg:            #18181b;  /* primary text, headings */
  --color-fg-secondary:  #52525b;  /* body-secondary, labels */
  --color-fg-muted:      #71717a;  /* captions, metadata */
  --color-fg-faint:      #a1a1aa;  /* placeholders, disabled */

  /* Borders — hairlines only */
  --color-border:        #e4e4e7;  /* default 1px hairline */
  --color-border-strong: #d4d4d8;  /* emphasized separation */
  --color-border-focus:  #3b82f6;  /* focus ring color */

  /* Accent — restrained blue */
  --color-accent:        #2563eb;  /* links, interactive words, active */
  --color-accent-hover:  #1d4ed8;
  --color-accent-subtle: #eff4ff;  /* accent-tinted fill (selection, active word bg) */
  --color-accent-fg:     #ffffff;  /* text on accent */

  /* Selection */
  --color-selection:     #dbeafe;

  /* Focus ring (rgba for layered ring) */
  --focus-ring:          rgba(59, 130, 246, 0.45);
}

:root[data-theme="dark"],
@media (prefers-color-scheme: dark) {
  /* ===== Dark theme ===== */

  --color-bg:            #0a0a0a;  /* app canvas */
  --color-bg-subtle:     #111112;  /* assistant message zone, panels */
  --color-bg-muted:      #18181b;  /* hover fills, code blocks */
  --color-bg-inset:      #202023;  /* pressed / active fills */

  --color-fg:            #f4f4f5;  /* primary text */
  --color-fg-secondary:  #a1a1aa;  /* body-secondary */
  --color-fg-muted:      #8b8b93;  /* captions */
  --color-fg-faint:      #5c5c63;  /* placeholders, disabled */

  --color-border:        #26262a;  /* default hairline */
  --color-border-strong: #34343a;  /* emphasized */
  --color-border-focus:  #3b82f6;

  --color-accent:        #60a5fa;  /* slightly lighter for dark bg */
  --color-accent-hover:  #93c5fd;
  --color-accent-subtle: #16233d;  /* accent-tinted fill */
  --color-accent-fg:     #0a0a0a;

  --color-selection:     #1e3a5f;

  --focus-ring:          rgba(96, 165, 250, 0.5);
}
```

> Note: in real CSS the `@media` block must be written separately from the `[data-theme]` selector — shown together here for readability. Implement as two rules, with `[data-theme="dark"]` allowed to override the media query so users can force a theme.

**Contrast check (WCAG):** `--color-fg` on `--color-bg` is ~16:1 (light) / ~17:1 (dark). `--color-fg-muted` on `--color-bg` stays ≥ 4.5:1 in both themes. Accent text passes AA against its intended surfaces.

---

## 3. Typography

Clean grotesque sans for UI and body. **Inter** is the recommended face (excellent legibility, tight metrics, variable weights), with a system fallback so nothing blocks first paint. A mono face for code.

```css
:root {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", "Cascadia Code",
               Menlo, Consolas, monospace;

  /* Enable Inter's optical niceties */
  font-feature-settings: "cv02", "cv03", "cv04", "ss01";
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

### Type scale (rem, 16px base)

| Token            | Size (rem / px)   | Weight | Line-height | Use                               |
|------------------|-------------------|--------|-------------|-----------------------------------|
| `--text-xs`      | 0.75rem / 12px    | 500    | 1.4         | metadata, captions, badges        |
| `--text-sm`      | 0.875rem / 14px   | 400    | 1.5         | secondary UI text, popover body   |
| `--text-base`    | 1rem / 16px       | 400    | 1.6         | chat message body (primary)       |
| `--text-md`      | 1.125rem / 18px   | 400    | 1.6         | comfortable reading option        |
| `--text-lg`      | 1.375rem / 22px   | 600    | 1.35        | panel titles, card headings       |
| `--text-xl`      | 1.75rem / 28px    | 600    | 1.25        | section headers                   |
| `--text-2xl`     | 2.25rem / 36px    | 700    | 1.2         | empty-state / hero                |

```css
:root {
  --text-xs: 0.75rem;   --text-sm: 0.875rem; --text-base: 1rem;
  --text-md: 1.125rem;  --text-lg: 1.375rem; --text-xl: 1.75rem;
  --text-2xl: 2.25rem;

  --weight-normal: 400; --weight-medium: 500;
  --weight-semibold: 600; --weight-bold: 700;

  --leading-tight: 1.25; --leading-snug: 1.35;
  --leading-normal: 1.5; --leading-relaxed: 1.6;

  --tracking-tight: -0.011em;  /* headings */
  --tracking-normal: 0;
}
```

**Rules**
- Chat body uses `--text-base` at `--leading-relaxed` (1.6). This is the reading zone — protect it.
- Headings use `--tracking-tight` and weight 600–700; body stays 400.
- **Measure:** cap reading columns at `65ch` (`--measure: 65ch`) for message text.
- Never use weight below 400 for body; never use pure black text on pure white — use `--color-fg` (#18181b), which is softer.

---

## 4. Spacing, borders, radius

### Spacing scale (4px base grid)

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px  */
  --space-2: 0.5rem;   /* 8px  */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */
  --space-9: 6rem;     /* 96px */
}
```

Use `--space-5`/`--space-6` between messages, `--space-7`+ around the reading column. Whitespace is the primary separator; borders are the secondary one.

### Borders (hairlines only)

```css
:root {
  --border-hairline: 1px solid var(--color-border);
  --border-strong:   1px solid var(--color-border-strong);
}
```

- All borders are **1px**. No 2px+, no double borders.
- Prefer a single divider line over enclosing something in a full box.
- On high-DPI, 1px is fine — do not fake sub-pixel hairlines.

### Radius (small and subtle)

```css
:root {
  --radius-xs: 3px;   /* inline chips, badges */
  --radius-sm: 6px;   /* buttons, inputs, popover */
  --radius-md: 8px;   /* cards, click panel */
  --radius-lg: 12px;  /* large containers (rare) */
  --radius-xl: 16px;  /* the popover ⇄ "ver más" modal morph surface; composer pill */
  --radius-full: 999px; /* pills / avatars */
}
```

Keep radii tight. Content **cards** stay at `--radius-md` or below; the larger `--radius-lg`/`--radius-xl`
are reserved for the framing surfaces that morph and the composer pill (a soft shell around
the reading content), never for the content blocks inside them.

---

## 5. No shadows

**There are no `box-shadow` depth effects in Curio.** No drop shadows, no ambient shadows, no glows, no floating cards.

Use instead, in priority order:
1. **Whitespace** — separation by spacing is the default.
2. **1px hairline borders** — `--color-border`, stepped up to `--color-border-strong` when more separation is needed.
3. **Surface layering by tone** — stack `--color-bg` → `--color-bg-subtle` → `--color-bg-muted` to imply front-most vs. behind.
4. **A backdrop scrim** for modal-level overlap only: a flat `rgba(0,0,0,0.35)` (light) / `rgba(0,0,0,0.55)` (dark) fill behind the click panel — a dim, not a shadow.

The single permitted exception is the **focus ring** (§8), which is an outline, not a shadow.

---

## 6. Component specs

All components draw exclusively from the tokens above. None use shadows.

### Chat container
- Centered single column, `max-width: 720px` (≈ `--measure` plus padding), horizontal auto margins.
- Page canvas `--color-bg`; the column has no border of its own — it is defined by whitespace (`--space-7` top/bottom, `--space-5` sides on mobile).
- Sticky, borderless composer at the bottom: an input with `--border-hairline`, `--radius-sm`, `--space-3` padding, background `--color-bg`. A hairline separates the composer zone from the scroll area (`border-top: var(--border-hairline)`).

### Chat message (user vs assistant)
- Messages are **not bubbles**. They are text blocks separated by space, distinguished by alignment and a small label, not by boxes.
- **Assistant:** full reading width, background `--color-bg` (or `--color-bg-subtle` for the whole assistant zone if a subtle band is wanted), text `--color-fg`, `--text-base`, `--leading-relaxed`. This is the interactive reading surface where words become clickable.
- **User:** same column, but tinted to differentiate — a light `--color-bg-muted` inset block with `--radius-md`, `--space-4` padding, text `--color-fg-secondary`. Right-aligned within the column with a `max-width: 80%`.
- Role label: `--text-xs`, `--weight-medium`, `--color-fg-muted`, `--space-2` above the message.

### Clickable word / entity
The core affordance. **Every word is clickable, so the affordance is not advertised at rest** — prose that flagged every word would be a field of links, not something to read. Curiosity is rewarded on interaction, not signposted. This is the shipped behavior in `src/styles/index.css`; there is **no dotted underline at rest**.

- **Resting state:** completely invisible. The word inherits its color, font, and cursor from the surrounding prose — no underline, no tint, no background, no padding or radius. It reads as plain text. (Padding/radius at rest are deliberately avoided: horizontal padding would split a multi-word text selection into rounded per-word boxes with gaps at the spaces; flush inline boxes let a selected phrase paint as one continuous band.)
- **Hover:** the smallest possible cue — the word tints to `--color-accent` and the cursor becomes a `pointer`. Nothing else. Enough to invite a click once the pointer is over it, without turning reading into scanning.
- **Open (its description popover is showing):** the word turns `--color-accent` and gets a quick one-shot flash (`curio-word-flash`, from `--color-accent-subtle` to transparent) so the click feels acknowledged. When kept persistently marked, the `.entity-open` variant carries a subtle continuous `--color-accent-subtle` fill with `--radius-xs` and a `0 -2px / 0 2px` margin/padding pair (so the text never shifts) plus `box-decoration-break: clone` so the fill stays continuous across line wraps — a clicked word then reads as the same "blue unit" as a selected phrase.
- **Keyboard:** each entity is a `<button>`/`<span role="button" tabindex="0">`; focus shows the focus ring (§8), which is the one cue that IS visible at rest for keyboard users.

```css
/* Invisible at rest: reads as plain prose. */
.entity {
  color: inherit;
  font: inherit;
  text-decoration: none;
  background: transparent;
  border: 0;
  margin: 0;
  padding: 0;
  cursor: inherit;
  transition: color var(--dur-fast) var(--ease-out);
}
/* The one small cue: accent tint + pointer on hover. */
.entity:hover {
  color: var(--color-accent);
  cursor: pointer;
}
/* Persistently marked open word: a continuous accent-subtle pill. */
.entity-open {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
  border-radius: var(--radius-xs);
  margin: 0 -2px;
  padding: 0 2px;
  box-decoration-break: clone;
}
/* Open word: accent text + a one-shot acknowledgement flash. */
.entity[aria-expanded="true"] {
  color: var(--color-accent);
  animation: curio-word-flash var(--dur-base) var(--ease-out);
}
```

### Phrase selection / highlight
When the reader selects a run of text (to ask about a whole phrase, not one word), the selection is painted as a **single soft, rounded, continuous band** — the same "blue unit" language as the open word, scaled up.

- **One band, one layer.** The band is a **continuous** rounded rectangle per wrapped line, never a row of per-word pills and never with gaps at the spaces. There is exactly **one** highlight on screen: the native browser selection is cleared on mouse-up (`removeAllRanges` in `MarkdownMessage`) so a double band (native + ours) never shows.
- **Brand color, with presence.** The band uses `--color-selection`, which is derived from the Curio brand blue (`--color-curio`) via `color-mix` — **~32% in light, ~38% in dark**. Translucent enough to read the prose through, saturated enough to have character (a pale wash "barely shows" — rejected). Because it comes from the brand color, the selection always matches the logo.
- **Padded and rounded.** The band extends a few px past the raw text box (`PAD_X: 4`, `PAD_Y: 2`) and uses `--radius-sm` corners — like a wider version of the open-word pill.
- **Drawn with real elements.** `::selection` and `::highlight()` support **neither padding nor border-radius**, so the band can't be a native pseudo. Instead `PhraseHighlight` measures the range's client rects, **merges them per line** (one rect per line, so it's continuous rather than one box per word), and renders a translucent rounded `<span>` for each in a body portal — re-measuring on scroll/resize so the band tracks the text.
- **Snap to whole words.** A selection that lands mid-word is expanded to capture the whole word before the band is drawn.
- **Soft fade-in.** Each rect fades in once on mount (`curio-phrase-in`, opacity 0→1 at `--dur-fast`/`--ease-out`) so the band — and the snap-to-word adjustment — appears smoothly instead of popping. Scroll/resize restyle the same element without replaying the fade.

```css
.curio-phrase-rect {
  position: fixed;
  background: var(--color-selection);   /* brand-blue mix, ~32% light / 38% dark */
  border-radius: var(--radius-sm);      /* real element → radius is possible */
  animation: curio-phrase-in var(--dur-fast) var(--ease-out);
}
@keyframes curio-phrase-in { from { opacity: 0; } to { opacity: 1; } }
```

### Hover popover (small, quick)
- Purpose: a one-line-to-one-paragraph gloss. Fast in, fast out.
- Surface `--color-bg`, `--border-hairline`, `--radius-sm`, `--space-3` padding, `max-width: 320px`.
- Text `--text-sm`, `--color-fg-secondary`; optional `--text-xs` `--color-fg-muted` label on top.
- Positioned above/below the word (flip on collision). **No arrow/tail** by default — a hairline box is enough. If a tail is desired, draw it with borders, never a shadow.
- Appears after ~120ms hover intent; dismisses on mouse-out. Motion per §7 (fade + 2px rise).
- Not focusable/interactive — for anything clickable inside, use the click panel.

### "Ver más" modal (larger — the full description)
The "poquito → más" second level: the small popover (the *vistazo*) has a **"Ver más"** action that
**grows** into this modal, the home of the full description and, in v1, the generative-UI component.
(This supersedes the earlier docked side-panel sketch; the shipped surface is a centered modal that
**morphs** from the popover — a decision reconciled here, as with `UI-PREFERENCES.md`.)

- Purpose: the complete description or, in v1, a generative-UI component.
- **Placement:** a **centered card** over a **flat scrim** — a dim (`--color-scrim`), never a shadow
  (§5). `max-width: 560px`, `max-height: min(80vh, 640px)`, `--color-bg`, `--border-hairline`,
  `--radius-xl` corners. The card does not float on a shadow; the scrim + hairline + the morph carry it.
- **Morph, not pop (§9).** The card shares a Framer `layoutId` with the popover surface, so opening
  **grows** the small card into the modal and closing **shrinks** it back — register-2 glide
  (`MASCOT_MORPH`-style curve, ~0.44s, no bounce). The OBJECT morphs; the text content fades in on top
  (never scaled between sizes). The scrim fades independently so the morph stays clean.
- Header: entity title `--text-lg`, `--weight-semibold`; a borderless close button (× icon,
  `--color-fg-muted`, hover `--color-fg`). Divider below: `border-bottom: var(--border-hairline)`.
- Body: `--space-5` padding, `--text-base`/`--text-sm` content, scrolls independently. A generative
  component renders here as a clean block (no box inside the box).
- Dismiss: click the scrim or press Escape → shrinks back to the popover. Focus moves into the modal
  on open, is trapped while open, and returns to the triggering word on close (§8). Honors
  `prefers-reduced-motion` (the morph is skipped, the card simply appears/disappears).

### Generative-UI component cards (v1)
All cards live inside the click panel (or inline in-message as blocks). Shared card recipe: background `--color-bg` on `--color-bg-subtle` panel (tone layering = separation), `--border-hairline`, `--radius-md`, `--space-4` padding, `--space-4` gap between stacked cards. A card title is `--text-xs` `--weight-semibold` uppercase-ish label in `--color-fg-muted` with `letter-spacing: 0.03em`. **No shadows, no colored headers.**

- **definition-card** — Title (`--text-lg` `--weight-semibold`) + optional pronunciation/part-of-speech in `--color-fg-muted`, then definition body `--text-sm`. Senses separated by hairline dividers, not boxes. Restatement/example quote indented with a `border-left: var(--border-strong)` and `--color-fg-secondary` italic-optional text.

- **timeline** — Vertical rail: a 1px `--color-border-strong` left line; each event a node (a 6px `--color-fg` dot or a `--radius-full` ring). Date in `--text-xs` `--color-fg-muted`, event title `--text-sm` `--weight-medium`, description `--text-sm` `--color-fg-secondary`. Rows separated by `--space-4` whitespace only.

- **map** — Monochrome/grayscale tiles only (desaturated base map or a flat `--color-bg-muted` placeholder with a hairline frame). Markers are `--color-accent` dots (the one place accent geolocates). Caption below in `--text-xs` `--color-fg-muted`. Framed with `--border-hairline`, `--radius-sm`; no floating pin shadows.

- **person-card** — Left: circular avatar (`--radius-full`, `--border-hairline`; grayscale image or monogram on `--color-bg-muted`). Right: name `--text-md` `--weight-semibold`, role/dates `--text-xs` `--color-fg-muted`, one-line bio `--text-sm` `--color-fg-secondary`. Single hairline separates it from following content.

- **concept-diagram** — Nodes are hairline-bordered pills/boxes (`--radius-sm`, `--color-bg`, `--text-sm`); edges are 1px `--color-border-strong` lines with small arrowheads in `--color-fg-muted`. Active/root node gets `--color-accent-subtle` fill + `--color-accent` border. Flat, schematic, no gradients or shadows.

- **comparison-table** — Borderless grid: no outer box; rows separated by `border-bottom: var(--border-hairline)`. Header row `--text-xs` `--weight-semibold` `--color-fg-muted`, cells `--text-sm` `--color-fg`. First column (labels) `--weight-medium`. Zebra striping via `--color-bg-subtle` on alternate rows is allowed but optional — prefer whitespace + hairlines. Align numerics right, tabular figures (`font-variant-numeric: tabular-nums`).

- **chart** — Monochrome by default: data in grayscale ink (`--color-fg`, `--color-fg-secondary`, `--color-fg-muted`), gridlines 1px `--color-border`, axis labels `--text-xs` `--color-fg-muted`. **Accent used for a single highlighted series/value only.** No fills with gradients, no drop shadows on bars/points. Frame with hairline or none; let axes define bounds. (When building charts, follow the `dataviz` skill for encoding/legends.)

- **code-snippet** — `--font-mono`, `--text-sm`, background `--color-bg-muted`, `--border-hairline`, `--radius-sm`, `--space-3` padding. Restrained syntax highlighting: keep it near-monochrome — comments `--color-fg-muted`, strings/keywords in muted tones, at most the accent for one token type. Optional header bar with language label (`--text-xs` `--color-fg-muted`) and a borderless copy button separated by a hairline.

---

## 7. Motion

Motion confirms an action and gives Curio a sense of being physical; it never entertains for its own sake. There are **three registers**, and the rule for which curve to use follows from which register you're in. (This section and §9 are one system — §9 describes the "everything flows to one place" feel; this section is the concrete rules and tokens.)

```css
:root {
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);   /* default, decelerate */
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
  --dur-instant:  80ms;   /* micro state (color, bg) */
  --dur-fast:     120ms;  /* hover popover, entity states */
  --dur-base:     180ms;  /* panel/card enter */
  --dur-slow:     240ms;  /* bottom sheet, larger travel */
}
/* Structural morph (shared-element, Framer Motion) — a slow, decelerating glide,
   no bounce. Lives in src/app/motion.ts as MASCOT_MORPH. */
/* { duration: 0.5s, ease: cubic-bezier(0.32, 0.72, 0, 1) } */
```

### The three registers

1. **Decorative / micro state — instant and fast (~80–120ms).** Color, hover, opened/closed state, the streaming caret blink. Use `--dur-instant`–`--dur-fast` with `--ease-out`. No travel, no easing drama; it just snaps to the new state.
2. **Structural morph — smooth and decelerated (~0.5s), no bounce.** The big shared-element transitions: mascot hero↔header, popover→modal. Use a slow decelerating curve, `cubic-bezier(0.32, 0.72, 0, 1)`, driven by Framer Motion `layoutId` (see `MASCOT_MORPH`). This is a glide, **never** an overshoot or a whip — the owner rejected the "aggressive" morph. Slow enough to be legible, smooth enough to feel like one object moving.
3. **Playful micro-interaction — spring / overshoot, but small.** Only the tiny, delightful reactions may spring: the blob's click **squish** (`curio-squish`, ~450ms elastic squash-and-settle) and the monocle **pop** (`transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)`). Spring/overshoot is confined to these small gestures — **never** to the structural morph.

**Rules**
- Hover popover: fade `--dur-fast` + translateY 2px, `--ease-out`.
- Click panel: fade + slide 8–12px (from the docking edge), `--dur-base`, `--ease-out`. Exit slightly faster (`--dur-fast`).
- Entity hover: color transition at `--dur-fast`, `--ease-out`.
- Structural morphs use `MASCOT_MORPH` (register 2). Spring curves (register 3) are allowed **only** on the squish and monocle — nowhere near the morph.
- Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Accessibility

- **Contrast:** primary text ≥ 15:1; `--color-fg-secondary`/`--color-fg-muted` maintained ≥ 4.5:1 on their intended backgrounds; `--color-fg-faint` is for non-essential/disabled only (may fall below AA — never use for content). Accent text/links meet AA on their surfaces.
- **Interactivity is intentionally not advertised at rest** (every word is clickable — see §6). The affordance is discovered on hover, where the `pointer` cursor (a shape cue, not color) accompanies the accent tint, so it never depends on color alone. For keyboard users the focus ring is the visible cue at rest. This is a deliberate product choice — a reading surface, not a field of links — so the usual "underline every link at rest" guidance is relaxed here.
- **Focus states:** every interactive element (entity, buttons, panel controls, composer) shows a visible ring. Use `outline`, not shadow:

```css
:where(button, a, [role="button"], input, textarea, .entity):focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}
```

- **Keyboard:** entities are reachable by Tab and activate on Enter/Space. Hover popover content must also be reachable via the click panel (hover-only content is never the sole path). Escape closes popover/panel. Focus moves into the click panel on open and returns to the triggering entity on close (focus trap while a modal bottom-sheet is open).
- **ARIA:** entities use `aria-expanded` and `aria-controls` pointing at their panel; the popover uses `role="tooltip"`; the click panel uses `role="dialog"` (or `complementary` when docked, non-modal) with `aria-labelledby` on its title.
- **Hit targets:** interactive controls ≥ 24×24px (composer/panel buttons ≥ 40px on touch). Inline entities keep prose flow but get `padding: 0 2px` to enlarge the target slightly.
- **Selection:** text remains selectable; `::selection` uses `--color-selection` so reading and copying are unhindered.
- **Motion:** honor `prefers-reduced-motion` (§7). **Theme:** honor `prefers-color-scheme`, allow manual override via `data-theme`.

---

## 9. Movimiento y sensación (feel) — "todo fluye a un lugar"

Curio debe sentirse como una **app nativa**, no como una web que carga pantallas: los
elementos **se transforman unos en otros** y **viajan** hacia un sitio, en vez de aparecer y
desaparecer. La profundidad la da el **movimiento y la transformación** (elementos compartidos que
se desplazan y cambian de tamaño), nunca sombras (§5 sigue vigente: **sin sombras, sin cristal
esmerilado, sin gradientes de color** — solo monocromo y filetes).

Librería: **Framer Motion** (ya integrada). `layoutId` implementa transiciones de elemento
compartido (FLIP) de forma declarativa. La **View Transitions API NO se usa** aquí: es para cambios
de página, y Curio anima **estado dentro de React**, no navegación.

### Principios

1. **Morph, no aparecer.** Cuando algo se convierte en otra cosa (mascota del hero ⇄ cabecera,
   popover → modal "ver más"), **se transforma y viaja** con `layoutId`. Nada de "boom": crece y se
   desplaza al sitio destino, con la curva lenta y decelerada del §7 (registro 2), **sin rebote**.
2. **Un punto focal.** En cada pantalla hay **un lugar** al que las cosas convergen (la mascota en
   el inicio; el sitio de la descripción al leer). El movimiento refuerza ese foco.
3. **Objeto sí, texto no.** Se morfea el **objeto** (el blob/logo), no el texto. Escalar el wordmark
   entre dos tamaños se ve borroso, así que el nombre **no** se morfea: **entra con un fundido** suave
   (y con un pequeño retardo) mientras el objeto viaja.
4. **Fundido limpio, no blur.** Entradas/salidas con **opacidad** limpia, no con `filter: blur()`.
   El fade sobrio encaja con la estética plana; el blur solo se usaría si el dueño lo pide
   explícitamente. (Esto corrige la antigua regla "blur, no fade".)
5. **Curva según el registro (ver §7).** El **morph estructural** va suave y decelerado
   (`cubic-bezier(0.32, 0.72, 0, 1)`, ~0.5s), **sin overshoot**. El **spring/elástico** se reserva
   para las **micro-interacciones juguetonas** (squish al clic, pop del monóculo). Nunca `linear`.
6. **Timing dual.** Lo **decorativo** (color, estado, iconos) cambia al instante (~80–120ms). Lo
   **estructural** (posición, tamaño, layout, radio) va lento y fluido (~0.5s). No se mezclan.
7. **Feedback físico sutil.** Micro-interacciones pequeñas y bien hechas (el squish del blob al
   pulsar, el pop del monóculo), nunca exageradas.

### Qué NO hacer (además de los anti-patrones de §5 y §7)

- Nada de **sombras/elevación**, **glows**, **cristal esmerilado** ni **gradientes** (aunque las
  apps de referencia los usen — Curio es plano y monocromo).
- Nada de `animate-pulse`/`animate-bounce` en bucle infinito, ni delays largos (>300ms), ni
  animaciones decorativas en la carga inicial.
- Respetar **siempre** `prefers-reduced-motion`: sin morph ni springs, transiciones casi
  instantáneas (la mascota se queda quieta; el monóculo aparece sin spring ni escaneo).

### Mascota (Curio)

Curio tiene mascota: un **blob 3D** (PNG sin ojos, `curio-body.png`) con los **ojos dibujados en
CSS** por encima, para que puedan parpadear y seguir el cursor por su cuenta. Es un elemento de marca
vivo, no un icono estático. Componente: `src/branding/CurioLogo.tsx`; solo animan `transform`/`opacity`
(todo va por el compositor).

**Estados** (todos detrás de flags del componente y respetando `prefers-reduced-motion`):

- **Idle (`alive` + `track`):** respira despacio (`curio-breathe`, `scale(1.05)` / `-6px`, amplitud
  deliberadamente perceptible), parpadea de vez en cuando (cadencia aleatoria 2–5s) y las pupilas
  **siguen el cursor** con un desplazamiento pequeño.
- **Morph hero→cabecera:** al escribir el primer mensaje, el blob **viaja** del hero a la cabecera
  como elemento compartido (`layoutId` + `MASCOT_MORPH`, ver §7 registro 2). Suave, sin rebote.
- **Thinking (`thinking`):** un balanceo lateral suave (`curio-wobble`) mientras el asistente genera;
  los ojos quedan intactos.
- **Squish (clic):** al pulsar el blob, un **squash-and-settle** elástico de una pasada
  (`curio-squish`, ~450ms) — micro-interacción juguetona (§7 registro 3).
- **Inspecting (`inspecting`):** al abrir una descripción, se pone el **monóculo** (aro dorado que
  entra con un pop de spring), el cuerpo se **mece** (`curio-sway`) y las pupilas **escanean**
  (`curio-scan`).

**Tamaños:** hero **112px** (foco visual del estado vacío, con `alive`+`track`), cabecera **30px**
(con `thinking`/`inspecting`). No se muestran logo **y** nombre dos veces a la vez (una sola marca;
el resto llega por morph — ver `UI-PREFERENCES.md §6`).

El **repertorio ampliado** de estados (dormido, eureka, error…) queda documentado en `docs/logo/`
para el futuro: por ahora, pocos estados bien hechos y la estética sobria manda.

> Nota de procedencia: los principios de movimiento se destilaron de un sistema de otro proyecto
> (SkillNet); se tomó **solo el concepto de feel**, adaptándolo a la estética plana y monocroma de
> Curio (se descartaron sombras, cristal y color de aquel sistema).
