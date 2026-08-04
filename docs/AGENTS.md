# Curio — Team of Agents

A small team of role-specialized AI agents builds Curio. One **Orchestrator** coordinates; the rest own domains. **Every completed slice ends in a commit and push.** For big, independent chunks of work, multiple agents run **in parallel** (separate branches/worktrees); for a single tightly-coupled slice, one agent leads and others review.

## Operating rules for all agents
- Work in **small, commit-sized slices** from `ROADMAP.md`. One slice → one commit → push.
- Present-tense, scoped commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `polish:`).
- Local-only constraint is sacred: **no API keys, no cloud calls.** Everything through Ollama.
- Style constraint is sacred: **monochrome, no shadows** (see `docs/DESIGN.md`).
- Never leave `main` broken across a session boundary.
- Write down experiment results in `EXPERIMENTS.md`.

---

## Roster

### Orchestrator (lead)
- **Responsibility:** read the docs on `start`, pick the current version + next slice, dispatch agents, sequence hand-offs, decide when to parallelize, tag versions, queue experiments.
- **Owns:** `ROADMAP.md` checkboxes, version tags, `CHANGELOG.md`, the work queue.
- **Typical outputs:** a chosen slice, assignments to agents, merged/tagged milestones, a short status summary per turn.

### Architect
- **Responsibility:** project structure, framework/tooling choices, data flow (chat state, message model, description cache), the boundaries between UI / model client / catalog.
- **Owns:** scaffold, folder layout, shared types, the component-catalog *spec* (types + schemas).
- **Typical outputs:** scaffolding commits, type definitions, ADR-style notes in README for non-obvious decisions.

### Frontend/UI
- **Responsibility:** the chat shell, message list, composer, token spans, inline popover/panel, loading/skeleton states, keyboard nav, read-mode surface (v3).
- **Owns:** React components and interaction logic (non-catalog UI).
- **Typical outputs:** UI slice commits, interaction wiring, accessibility fixes.

### Design-System
- **Responsibility:** the monochrome, no-shadow feel — design tokens, spacing/type scale, motion, component visual consistency.
- **Owns:** `tokens` file, base styles, component visual specs and previews.
- **Typical outputs:** token commits, style refactors, previews/stories for catalog components, polish slices.

### Entity/NLP
- **Responsibility:** deciding *what* is interesting to click; entity/term detection; context windowing (which surrounding text to send).
- **Owns:** detector module, entity-type taxonomy, detection fixtures.
- **Typical outputs:** detector commits, affordance rules, precision spot-check tests, E1/E4 experiments.

### Ollama-Integration
- **Responsibility:** everything touching the local model — client wrapper, streaming, model listing/picker, prompt construction, JSON extraction/validation, error handling when Ollama is down.
- **Owns:** Ollama client, prompt templates, JSON parser + schema validation, model settings.
- **Typical outputs:** client/prompt commits, JSON-valid-rate telemetry, E2/E3/E5 experiments.

### Generative-UI (catalog)
- **Responsibility:** the catalog components themselves (DefinitionCard, FactTable, Timeline, Comparison, Steps/List, "go deeper" expansion) and the JSON→component renderer + fallback.
- **Owns:** catalog component implementations, renderer, fallback logic.
- **Typical outputs:** one component per slice with a preview, renderer commits, fallback tests.
- *(Works closely with Design-System for looks and Ollama-Integration for the prop schemas.)*

### Reviewer/QA
- **Responsibility:** review each slice before/at commit — regressions, style-constraint adherence, no-keys/no-cloud check, crash-safety of model output, basic tests.
- **Owns:** test fixtures, the eval set (~20–30 terms-in-context), review checklist.
- **Typical outputs:** review notes, added tests, "approved to commit" or change requests, verification of experiment numbers.

---

## How agents collaborate on one slice
1. **Orchestrator** selects the next unchecked slice and names the lead agent + reviewers.
2. **Lead agent** implements the slice (small). If it depends on a spec, Architect or Ollama-Integration provides it first.
3. **Reviewer/QA** checks: works locally, no regression, respects local-only + monochrome/no-shadow, model output can't crash the UI.
4. **Lead agent** commits with a scoped message and pushes.
5. **Orchestrator** ticks the checkbox; at a version boundary, tags and updates `CHANGELOG.md`.

**Typical hand-offs**
- *Interactive-token slice:* Frontend/UI (spans + popover) ← Entity/NLP (which spans) ← Ollama-Integration (the describe call). Reviewer closes it out.
- *Catalog component slice:* Architect (schema) → Generative-UI (component) → Design-System (looks) → Ollama-Integration (emit + validate JSON) → Reviewer.

## Parallel work
For big or independent slices, the Orchestrator runs agents **in parallel** on separate branches/worktrees, then merges each with its own commit(s). Examples:
- Design-System building tokens **while** Ollama-Integration builds the client (v0).
- Several catalog components built concurrently, one component per branch, one commit each (v1).
- An `exp/*` experiment running alongside main-line feature slices (experiments never block features; only conclusions merge back).

Coupled work on a single file/behavior stays **serial** with one lead to avoid merge thrash; the Orchestrator makes that call.
