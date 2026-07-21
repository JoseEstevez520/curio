# Curio — Roadmap

## What Curio is
A clean, monochrome, Linear-inspired chat UI. You read an LLM message, click or hover a word/phrase, and get an inline explanation. Everything runs **locally** (Ollama + small models, no API keys). v0 shows plain text; later versions render a **generative UI component** instead of text. Audience: curious people and researchers. Angle: curiosity.

## How we work (the method)
- **Small slices.** Every unit of work is small enough to become **one commit** with a clear, present-tense message (e.g. `feat: add hover target detection to message renderer`). If a slice feels big, split it.
- **Many commits, on GitHub.** Push often. The commit history *is* the progress log. Prefer 5 small commits over 1 large one.
- **Versions are milestones.** v0 → v1 → v2 → v3. Each version is a coherent, demoable state of the product. When a version is done, it gets a **git tag** (`v0.0`, `v1.0`, …).
- **Experiments run in parallel to the main line.** Claude autonomously tries approaches on **short-lived branches**, compares them, writes down results, and merges the winner back.
- **Definition of done for a slice:** code works locally, no obvious regressions, committed, pushed.

## Branch & version strategy
- `main` = always demoable. Never leave it broken across a session boundary.
- **Feature slices** commit directly to `main` (small, safe) or to a short `feat/<slice>` branch for anything multi-commit, merged back the same session.
- **Experiments** live on `exp/<name>` branches. They may break things freely. Only conclusions + the chosen approach merge back into `main`.
- **Tags per version:** tag `main` at each milestone: `git tag -a v0.0 -m "v0: plain-text descriptions on click"`. This lets the owner check out any version.
- **Results log:** keep `EXPERIMENTS.md` at repo root. Every experiment appends a dated entry: hypothesis, setup, numbers, verdict.
- **Changelog:** keep `CHANGELOG.md` updated per version tag.

---

## v0 — Plain-text description on click
**Goal:** the core loop works end to end with plain text. Click a word in an assistant message → an inline panel/popover shows a short description generated locally.

**Scope**
- Chat UI shell (message list, input, send).
- Talk to a local Ollama model for chat responses.
- Make assistant text interactive: clickable tokens.
- On click, ask the model for a short description of that term *in context* and render it inline as plain text.
- Monochrome, no-shadow, Linear-inspired base styling.

**Slices (each = one commit)**
- [x] `chore: scaffold app (framework, TypeScript, linting, prettier)`
- [x] `chore: add README with local-run + Ollama prerequisites`
- [x] `feat: static chat layout (message list + composer), monochrome tokens`
- [x] `feat: design tokens file (color scale, spacing, type scale, radii — no shadows)`
- [x] `feat: Ollama client wrapper (list models, chat completion, streaming)`
- [ ] `feat: send message → stream assistant reply into the message list`
- [ ] `feat: model picker sourced from locally installed Ollama models`
- [ ] `feat: tokenize assistant message into hoverable/clickable spans`
- [ ] `feat: click a span → open inline description popover (loading state)`
- [ ] `feat: build the "describe term in context" prompt and call Ollama`
- [ ] `feat: render plain-text description in the popover, with close/dismiss`
- [ ] `feat: cache descriptions per (term, message) to avoid recompute`
- [ ] `fix: handle Ollama-not-running / model-missing with a friendly banner`
- [ ] `docs: quickstart GIF/screenshot in README`
- [ ] `chore: tag v0.0`

**Success criteria**
- With Ollama running and one small model pulled, the owner can chat, click any word in a reply, and get a relevant plain-text description within a couple of seconds.
- No API keys anywhere. Works offline.
- UI reads as clean and monochrome; no shadows.

---

## v1 — Generative UI (component catalog)
**Goal:** replace the plain-text description with a **generative UI component** chosen/filled by the model — e.g. a definition card, a mini timeline, a key-value fact table, a pronunciation/etymology block, a comparison, a small list.

**Scope**
- A fixed **component catalog** the model can pick from (typed, safe, no arbitrary code execution).
- Model returns **structured JSON** (component type + props); the app renders the matching React component.
- Graceful fallback to plain text when JSON is invalid.

**Slices (each = one commit)**
- [ ] `feat: define component catalog spec (types + prop schemas, e.g. Zod)`
- [ ] `feat: DefinitionCard component + story/preview`
- [ ] `feat: FactTable component + preview`
- [ ] `feat: Timeline component + preview`
- [ ] `feat: Comparison component + preview`
- [ ] `feat: Steps/List component + preview`
- [ ] `feat: prompt that asks model to emit {component, props} JSON from the catalog`
- [ ] `feat: JSON parser + schema validation with typed errors`
- [ ] `feat: renderer that maps validated JSON → component`
- [ ] `feat: fallback to plain-text description on invalid/failed JSON`
- [ ] `feat: streaming skeleton state per component while generating`
- [ ] `test: schema-validation unit tests (valid, invalid, partial)`
- [ ] `feat: telemetry counter for JSON-valid-rate (local, in-app dev panel)`
- [ ] `chore: tag v1.0`

**Success criteria**
- Clicking a term yields a rendered component (not raw text) the large majority of the time, with reliable fallback otherwise.
- Adding a new catalog component is a small, isolated slice.
- Invalid model output never crashes the UI.

---

## v2 — Richer entity detection + better small-model prompting
**Goal:** the app is smart about *what* is interesting to click, and prompts squeeze more quality/consistency out of small models.

**Scope**
- Detect entities/terms worth describing (proper nouns, jargon, dates, places) and visually hint them.
- Improve prompts: context windowing (surrounding sentence), few-shot examples, output constraints, component-selection hints.
- Latency/quality tuning of small models.

**Slices (each = one commit)**
- [ ] `feat: entity/term detector pass over assistant messages`
- [ ] `feat: subtle affordance (underline dots) on detected terms`
- [ ] `feat: pass surrounding-sentence context into the describe prompt`
- [ ] `feat: few-shot examples in the component-selection prompt`
- [ ] `feat: per-entity-type prompt hints (person → bio card, date → timeline, etc.)`
- [ ] `feat: prompt output constraints (max props, enum'd component set) to raise JSON-valid-rate`
- [ ] `feat: debounce + prefetch descriptions for detected entities on idle`
- [ ] `feat: settings for temperature / model per task`
- [ ] `test: entity-detector fixtures (precision spot-checks)`
- [ ] `docs: update EXPERIMENTS.md with detection + model findings`
- [ ] `chore: tag v2.0`

**Success criteria**
- Detected terms visibly match what a curious reader would want to click.
- Measurable improvement in JSON-valid-rate and/or latency vs. v1 (numbers in `EXPERIMENTS.md`).
- Descriptions are more accurate thanks to context.

---

## v3+ — Beyond chat, and polish
**Goal:** extend the Curio interaction beyond the chat message and make it feel finished.

**Scope**
- Apply the click-to-explain interaction to other surfaces (pasted text / read-mode document, selection instead of single word, follow-up "tell me more" that expands a component).
- History/persistence of explored terms ("curiosity trail").
- Visual polish, empty states, keyboard nav, accessibility.

**Slices (each = one commit)**
- [ ] `feat: read-mode surface — paste text and click-to-explain it`
- [ ] `feat: multi-word selection → describe the phrase`
- [ ] `feat: "go deeper" action expands a component into a richer one`
- [ ] `feat: curiosity trail (session history of explored terms)`
- [ ] `feat: keyboard navigation between detected terms`
- [ ] `feat: accessibility pass (roles, focus management, contrast)`
- [ ] `feat: empty/first-run onboarding state`
- [ ] `feat: export a term's component/description`
- [ ] `polish: motion + micro-interactions consistent with Linear feel`
- [ ] `chore: tag v3.0`

**Success criteria**
- The core interaction works outside the chat.
- App feels polished and coherent; keyboard + screen-reader usable.

---

## Experiments track (Claude runs these autonomously)
Each experiment: branch `exp/<name>`, a written **hypothesis**, an **evaluation method**, and a **results entry appended to `EXPERIMENTS.md`** (date, setup, numbers, verdict, what merges back). Keep a small fixed **eval set** of ~20–30 real terms-in-context so runs are comparable.

**E1 — Entity-detection approach**
- *Hypothesis:* a lightweight local approach (model-based tagging) picks better click targets than naive heuristics (capitalization/regex).
- *Evaluate:* on the eval set, compare precision/recall of "would a curious reader click this?" (hand-labeled). Also note latency.
- *Merge back:* the approach with best precision at acceptable latency.

**E2 — Small Ollama model bake-off (latency vs quality)**
- *Hypothesis:* a specific small model gives the best quality-per-latency for descriptions.
- *Evaluate:* run the same eval set across candidate models (e.g. small general + small instruct variants). Record tokens/sec, time-to-first-token, and a 1–5 human quality score. Table in `EXPERIMENTS.md`.
- *Merge back:* pick the default model; document runner-up as fallback.

**E3 — Generative-UI reliability**
- *Hypothesis:* constrained prompting (enumerated components, strict schema, few-shot) raises JSON-valid-rate meaningfully.
- *Evaluate:* JSON-valid-rate and schema-pass-rate across the eval set, prompt variant A vs B vs C. Track fallback frequency.
- *Merge back:* the prompt/constraint scheme with highest valid-rate.

**E4 — Context window size**
- *Hypothesis:* passing the surrounding sentence (vs whole message vs just the word) improves description accuracy without hurting latency much.
- *Evaluate:* human quality score + latency across the three context strategies.
- *Merge back:* the best trade-off.

**E5 — Component selection quality**
- *Hypothesis:* the model picks the *right* component type (date→timeline, person→card) more often with per-type hints.
- *Evaluate:* agreement between model-chosen component and a human-chosen "ideal" component on the eval set.
- *Merge back:* the hinting scheme that maximizes agreement.

**E6 — Prefetch/caching strategy**
- *Hypothesis:* idle-time prefetch of detected entities makes clicks feel instant without noticeable resource cost.
- *Evaluate:* perceived latency on click (cache-hit rate) vs extra compute.
- *Merge back:* if net positive.

Rule: an experiment isn't done until its result is written in `EXPERIMENTS.md`, even if the verdict is "no improvement — not merged."

---

## The "start" flow
When the owner opens a fresh chat and types **start** (see `START.md`):
1. The **Orchestrator** reads `ROADMAP.md` + `AGENTS.md`, finds the current version and the first unchecked slice.
2. It confirms the target slice, then dispatches the right agent(s).
3. Each finished slice ends in a commit + push; the checklist box is ticked.
4. At a version boundary, tag and update `CHANGELOG.md`. Between slices, the Orchestrator may launch a queued experiment.
