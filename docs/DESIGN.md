# Curio — Design System

Curio is a reading surface. You read a message from an LLM in a clean chat UI, then hover or click a word to reveal an inline description (v0) or a small generative-UI component (v1). This document defines the visual language: monochrome-first, typographically driven, calm.

---

## 1. Design principles

1. **Text is the interface.** Typography and spacing carry hierarchy. Chrome recedes so reading stays effortless.
2. **Grayscale first, one quiet accent.** Color is a tool for meaning (links, focus, selection), never decoration.
3. **Borders, not boxes.** Structure comes from 1px hairlines and whitespace. Nothing floats.
4. **No shadows. Ever.** Depth is implied by contrast and layering of surfaces, not by blur.
5. **Restraint over richness.** If an element can be removed without losing clarity, remove it.
6. **Fast and quiet motion.** Interactions confirm themselves in under 200ms with soft easing. Nothing bounces, nothing slides far.
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
  --radius-full: 999px; /* pills / avatars */
}
```

Keep radii tight. Nothing rounder than `--radius-md` for content surfaces.

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
The core affordance. It must feel invitingly interactive without turning prose into a field of links.

- **Resting state:** the word carries a **1px dotted underline** in `--color-border-strong`, offset from the baseline (`text-underline-offset: 3px`), text color unchanged (`--color-fg`). Subtle enough to disappear into reading flow, present enough to signal "there's more here."
- **Hover:** underline becomes solid `--color-accent`, text shifts to `--color-accent`, cursor `pointer`. Optional very light `--color-accent-subtle` background with `--radius-xs` and `-2px/2px` inline padding. Triggers the hover popover (§ below).
- **Active / opened (click):** persistent `--color-accent-subtle` background, `--radius-xs`, solid `--color-accent` underline — marks the word whose panel is currently open.
- **Keyboard:** each entity is a `<button>`/`<span role="button" tabindex="0">`; focus shows the focus ring (§8).

```css
.entity {
  color: var(--color-fg);
  text-decoration: underline dotted var(--color-border-strong);
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: color 120ms ease, background-color 120ms ease,
              text-decoration-color 120ms ease;
}
.entity:hover {
  color: var(--color-accent);
  text-decoration: underline solid var(--color-accent);
  background: var(--color-accent-subtle);
}
.entity[aria-expanded="true"] {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
  text-decoration: underline solid var(--color-accent);
}
```

### Hover popover (small, quick)
- Purpose: a one-line-to-one-paragraph gloss. Fast in, fast out.
- Surface `--color-bg`, `--border-hairline`, `--radius-sm`, `--space-3` padding, `max-width: 320px`.
- Text `--text-sm`, `--color-fg-secondary`; optional `--text-xs` `--color-fg-muted` label on top.
- Positioned above/below the word (flip on collision). **No arrow/tail** by default — a hairline box is enough. If a tail is desired, draw it with borders, never a shadow.
- Appears after ~120ms hover intent; dismisses on mouse-out. Motion per §7 (fade + 2px rise).
- Not focusable/interactive — for anything clickable inside, use the click panel.

### Click panel (larger — the full description)
- Purpose: the complete description or, in v1, a generative-UI component.
- **Placement:** right-hand side panel on wide screens (`width: 380–420px`, full height, `border-left: var(--border-hairline)`, background `--color-bg-subtle`); **bottom sheet** on narrow screens (`border-top: var(--border-hairline)`, `--radius-lg` top corners). It does not float over the text as a shadowed card — it docks.
- Header: entity title `--text-lg`, `--weight-semibold`; a `--text-xs` `--color-fg-muted` kicker (type/source); a borderless close button (× icon, `--color-fg-muted`, hover `--color-fg`).
- Body: `--space-5` padding, `--text-base`/`--text-sm` content, scrolls independently.
- Divider between header and body: `border-bottom: var(--border-hairline)`.
- Enter/exit: slide 8–12px + fade, per §7. Optional flat scrim behind on mobile only.

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

Subtle, fast, purposeful. Motion confirms an action; it never entertains.

```css
:root {
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);   /* default, decelerate */
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
  --dur-instant:  80ms;   /* micro state (color, bg) */
  --dur-fast:     120ms;  /* hover popover, entity states */
  --dur-base:     180ms;  /* panel/card enter */
  --dur-slow:     240ms;  /* bottom sheet, larger travel */
}
```

**Rules**
- Hover popover: fade `--dur-fast` + translateY 2px, `--ease-out`.
- Click panel: fade + slide 8–12px (from the docking edge), `--dur-base`, `--ease-out`. Exit slightly faster (`--dur-fast`).
- Entity hover: color/background transitions at `--dur-instant`–`--dur-fast`.
- **No** bounce, spring overshoot, scale-pop, or motion over ~12px of travel.
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
- **Do not rely on the dotted underline alone** to signal interactivity for color-blind users — the underline (a shape) plus cursor plus hover color together carry the affordance; the underline is present at rest so color is not the only cue.
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

Curio debe sentirse como una **app nativa de iOS**, no como una web que carga pantallas: los
elementos **se transforman unos en otros** y **viajan** hacia un sitio, en vez de aparecer y
desaparecer. La profundidad la da el **movimiento + desenfoque**, nunca sombras (§5 sigue vigente:
**sin sombras, sin cristal esmerilado, sin gradientes de color** — solo monocromo y filetes).

Librería: **Framer Motion** (ya integrada). `layoutId` implementa transiciones de elemento
compartido (FLIP) de forma declarativa.

### Principios

1. **Morph, no aparecer.** Cuando algo se convierte en otra cosa (mascota del hero ⇄ cabecera,
   palabra → descripción, popover → modal "ver más"), **se transforma y viaja** con `layoutId`.
   Nada de "boom": crece y se desplaza al sitio destino.
2. **Un punto focal.** En cada pantalla hay **un lugar** al que las cosas convergen (la mascota en
   el inicio; el sitio de la descripción al leer). El movimiento refuerza ese foco.
3. **Blur, no fade.** Entradas/salidas con **`filter: blur()` + opacidad** (blur ~8–16px al entrar),
   no solo opacidad. Da profundidad de campo.
4. **Overshoot / spring, no `ease-in-out`.** Curvas que sobrepasan un pelín y vuelven, o springs de
   Framer Motion. Nunca `linear` ni `ease-in-out`.
5. **Timing dual.** Lo **decorativo** (color, estado, iconos) cambia al instante (~125ms). Lo
   **estructural** (posición, tamaño, layout, radio) va lento y fluido (~400–700ms). No se mezclan.
6. **Feedback físico sutil.** Botones que crecen un poco al hover y se "aplastan" al pulsar (spring).
   Micro-interacciones casi imperceptibles, nunca exageradas.

### Qué NO hacer (además de los anti-patrones de §5 y §7)

- Nada de **sombras/elevación**, **glows**, **cristal esmerilado** ni **gradientes** (aunque las
  apps de referencia los usen — Curio es plano y monocromo).
- Nada de `animate-pulse`/`animate-bounce` en bucle infinito, ni delays largos (>300ms), ni
  animaciones decorativas en la carga inicial.
- Respetar **siempre** `prefers-reduced-motion`: sin blur/morph, transiciones casi instantáneas.

> Nota de procedencia: los principios de movimiento se destilaron de un sistema de otro proyecto
> (SkillNet); se tomó **solo el concepto de feel**, adaptándolo a la estética plana y monocroma de
> Curio (se descartaron sombras, cristal y color de aquel sistema).
