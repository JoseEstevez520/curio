<div align="center">

<img src="docs/media/curio.png" alt="Curio" width="128" height="128" />

# Curio

**Read. Get curious about a word. Click it and the answer is right there.**

_A reading companion for the curious._

<br />

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)

<br />

<img src="docs/media/hero-light.png" alt="Curio — empty state, light theme" width="49%" />
<img src="docs/media/hero-dark.png" alt="Curio — empty state, dark theme" width="49%" />

</div>

---

## The same old dance

If you've been curious your whole life, you know the dance by heart: **copy, paste, search, come
back. Copy, paste, search, come back.** Every time a word you don't know shows up, you have to
leave what you're reading, go hunt it down somewhere else, and find your way back. That's no life
for the curious.

**Curio** breaks the loop. You read a reply from an LLM (or paste in any article), a word catches
your eye, you **click it** — or **select a whole phrase** — and a **full explanation appears right
there**, in place, in context. No tab-hopping. No losing your thread. The word never leaves the
sentence it lives in — and that matters, because "Mercury" in a chemistry paragraph is not
"Mercury" next to "planet." Curio always reads the surrounding sentence before it explains.

Here's the heart of it: **curiosity is rewarded on the click, never advertised.** The text reads
like plain prose — no field of underlined links shouting "look at me." Nothing is flagged. You
just read. And the moment a word makes you wonder, you hover, it quietly lights up, you click, and
Curio hands you exactly what you were curious about. Curiosity isn't nagged out of you; it's met
the instant it shows up.

The brain behind it is pluggable — it can run locally on **Ollama** or on any **OpenAI-compatible**
endpoint with your own key — but that's a setup detail (see [Quick start](#quick-start)), not the
point. The point is the click.

<div align="center">

<img src="docs/media/click-to-explain.png" alt="Click 'heliocentric' and its description appears inline, in context, with a 'Ver más' link" width="88%" />

<em>Click a word — here, <strong>heliocentric</strong> — and the explanation appears right there, in context.</em>

</div>

## What you can do

- 👆 **Click any word → an explanation, in its context.** Every word is clickable, yet nothing is
  underlined at rest: the page reads as prose, and a word only lights up when your cursor rests on
  it. Curiosity rewarded, never signposted.
- ✍️ **Select a phrase** (2+ words) and Curio explains **the whole selection** as one unit,
  highlighted in a single continuous blue band.
- 💬 **Chat + Read mode.** Have a conversation with an LLM, or switch to **Read** and **paste an
  article** to bring the same "click → explain" magic to any text you like.
- 🔎 **"See more" — a panel the model composes.** The small popover (the _glance_, a single
  sentence) has a **"Ver más"** action that **grows** into a panel — and the panel isn't a
  paragraph, it's **built** for the term out of Curio's components: a heading, the explanation,
  a definition card, a key figure, and — always last — a **callout that says what the term is
  doing in _this_ text**, not in general.
- 🕳️ **The explanation is itself explorable.** Any word inside the panel is clickable too: its own
  bubble opens right there, and "Ver más" **goes one level deeper**, with a back arrow and a
  **breadcrumb trail** of where your curiosity took you. You can drag-select a phrase inside the
  panel as well.
- 💭 **Ask a follow-up without leaving.** There's a composer at the bottom of the panel. Ask
  anything about the term or the text and the answer comes back **as components too** — and its
  words stay clickable, so the thread never dead-ends.
- 🎨 **Plain text or Gen UI.** In **Gen UI** mode the model **picks components from a catalog**
  instead of writing a paragraph — definition card, fact table, timeline, steps, comparison,
  bullet list, quote, code block, key stat, callout, tags, **bar list, line chart and donut** — and
  fills them with **validated data**, falling back to text if anything's off. For something that
  genuinely has to be interactive, it can return a **sandboxed HTML document**. It never
  hand-writes markup into the page.
- 🧠 **A pluggable brain.** Runs on **Ollama** (local) or any **OpenAI-compatible API** with your
  own key (Groq, OpenRouter, LocalAI, your own server…) — swap freely.
- 🌗 **Light and dark themes**, following your system or forced by hand.
- 🫧 **A living mascot.** Curio breathes, follows your cursor with its eyes, travels from center
  stage to the header when the conversation starts, focuses while it thinks, and pops on a
  **monocle** when it inspects a term.
- 🎛️ **A calm aesthetic:** monochrome, Linear-like, **no shadows** — hierarchy from whitespace and
  1px hairlines, with micro-animations that mean something.

![The mascot travels from the hero to the header when the conversation starts](docs/media/mascot-morph.gif)

**"See more" grows into a composed panel** — the model picks the pieces that suit the term and
closes with what it's doing in the text you're reading:

<div align="center">

<img src="docs/media/see-more.png" alt="The 'See more' panel for heliocentric: heading, explanation, a definition card, key evidence and a closing 'En este texto' callout" width="70%" />

</div>

**And the panel is explorable.** Click a word inside it — here **geocéntrico** — and its own bubble
opens in place; "Ver más" walks you one level deeper, leaving a breadcrumb behind:

<div align="center">

<img src="docs/media/modal-inline-popover.png" alt="Inside the panel, the word geocéntrico is lit up with its own popover and a 'Ver más' link" width="49%" />
<img src="docs/media/modal-breadcrumb.png" alt="One level deeper: a new panel for geocéntrico, with a back arrow and the breadcrumb heliocentric › geocéntrico" width="49%" />

</div>

**Or just ask.** The composer at the bottom of the panel answers in components too, without ever
taking you out of the text:

<div align="center">

<img src="docs/media/modal-followup.png" alt="A follow-up question answered inside the panel, composed as components" width="70%" />

</div>

**Gen UI composes real components**, not paragraphs — here the model reaches for stat cards to rank
the eight planets, and for a line chart plus a donut when the answer is a trend and a share:

<div align="center">

<img src="docs/media/gen-ui.png" alt="Gen UI mode: stat cards ranking the eight planets by diameter" width="49%" />
<img src="docs/media/gen-ui-chart.png" alt="Gen UI mode: a line chart of world population growth and a donut of the urban share" width="49%" />

</div>

## Quick start

**Requirements:** **Node 18+**. For the local brain, **[Ollama](https://ollama.com)** running on
your machine (optional if you'll use the cloud).

```bash
git clone https://github.com/JoseEstevez520/curio.git
cd curio
npm install
npm run dev            # http://localhost:5173
```

### Option A — Local with Ollama (no keys, the default)

Start Ollama and pull a small model; the app boots straight into **Local**:

```bash
ollama serve                 # daemon at http://localhost:11434
ollama pull llama3.2:3b      # or qwen2.5:3b-instruct; on lean machines, qwen2.5:1.5b
```

The frontend talks to Ollama through the Vite dev server's **`/ollama`** proxy: **no CORS, no
touching `OLLAMA_ORIGINS`.** Once the model is pulled, it works offline.

### Option B — Cloud with your own key (fast)

Plug in **any OpenAI-compatible endpoint**. The brain is **configuration, not a header control** —
set it in `.env.local` and the app boots into it:

> 💡 **For the snappiest experience, point it at a fast endpoint — [Groq](https://groq.com) is the
> recommendation** (its inference is _quick_, so descriptions land almost instantly and it makes
> **Gen UI** genuinely pleasant). Other fast OpenAI-compatible options (OpenRouter, Together, your
> own server…) work just as well. Local Ollama stays great for private, offline use — just a touch
> slower.

```bash
cp apps/web/.env.example apps/web/.env.local   # .env.local is gitignored
```

```ini
# Any OpenAI-compatible API (Groq recommended for its speed)
VITE_CLOUD_BASE_URL=https://api.groq.com/openai/v1
VITE_GROQ_API_KEY=your_key_here
VITE_GROQ_MODEL=openai/gpt-oss-20b              # Groq's lineup changes — see console.groq.com/docs/models
VITE_BRAIN=groq                                 # boot into the cloud; without a key, boots on Ollama
```

**Hitting a rate limit needn't stop you.** `VITE_GROQ_API_KEY` accepts **several keys,
comma-separated**, and Curio **rotates to the next one** on a `429`, retrying the same request —
handy on free tiers with a daily allowance. Only when every key is limited does it surface the
error.

> **Your keys are yours.** They live only in your browser (localStorage) or your `.env.local`,
> which is **never** committed. There are no keys in the repo. Note: `VITE_*` variables are inlined
> into the bundle at build time, so treat them as dev-only and **never** ship a production build
> with a real key baked in.

### Other scripts

| Script              | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run build`     | Production build (`tsc` + Vite)       |
| `npm run preview`   | Serve the production build            |
| `npm run test`      | Tests with Vitest (`test:watch` too)  |
| `npm run lint`      | ESLint (`lint:fix` to autofix)        |
| `npm run typecheck` | TypeScript type checking              |
| `npm run build:ext` | Build the browser extension           |

Two extra surfaces live behind URL flags, handy while working on the catalog:
**`/?gallery`** renders every component at once, **`/?openui`** is a bare composition playground.

## How it works under the hood

At Curio's core is a **brain seam**: the whole engine talks to an abstract `LlmProvider`, and
underneath sit two interchangeable implementations — **Ollama** (local) and **OpenAI-compatible**
(cloud). The cloud is reached through a **dynamic dev proxy** (`/llm`): the browser sends the real
endpoint URL in a header and the dev server forwards it, so there's **no CORS** and it works the
same for Groq, OpenRouter, LocalAI, or your own server. Switching brains never serves a cached
answer from a different one: the cache key includes the model's identity.

The rest of the pieces:

- **Entities + lazy loading.** Any word (or selection) is clickable, but **nothing is computed
  ahead of time**: the one-sentence glance is generated **on demand** when you click, from the word
  plus its context sentence. The deeper panel starts generating the moment the glance opens, so
  "Ver más" usually has it ready. Curiosity costs nothing until you spend it.
- **A component catalog (Gen UI).** The model's job is **classify + fill**, never author markup: it
  picks pieces from a fixed catalog and returns their data, validated with **Zod** before
  rendering; if anything's off, it **falls back to plain text** and the UI never breaks. Curio's
  components are composed through
  **[OpenUI](https://www.openui.com)** ([`@openuidev/react-lang`](https://github.com/thesysdev/openui))
  — the model assembles vetted pieces, still never raw HTML. Every piece emits clickable word
  spans, which is why a generated panel is as explorable as a paragraph.
- **Follow-ups stay in the format.** A follow-up answer must come back as components too; if the
  brain replies in prose, Curio retries once with the format contract and, as a last resort, wraps
  the prose in a component itself — so the answer always renders, and its words stay clickable.
- **Monorepo.** The "click → description" lives in a **portable core** shared across surfaces:

  ```
  packages/core   @curio/core — the engine: brain seam (Ollama / OpenAI-compat), Zod catalog,
                  prompts, two-stage generation, tokenizer.
  apps/web        The web app (chat + Read mode). Consumes @curio/core.
  apps/extension  Browser extension (MV3): click → description on any page.
  ```

Full detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Read mode

Flip the toggle to **Read**, paste an article, and the same "click → explain" engine works on any
text you throw at it. Turn on **Gen UI** to read it in a friendlier shape.

<div align="center">

<img src="docs/media/read-light.png" alt="Read mode — paste a text and click through it (light theme)" width="49%" />
<img src="docs/media/read-dark.png" alt="Read mode — dark theme" width="49%" />

</div>

## Design & philosophy

Curio is **monochrome, Linear-like, shadow-free**: hierarchy comes from **whitespace** and **1px
hairlines**, not floating boxes. Motion follows one idea — **"everything flows to one place"**:
elements **transform and travel** into one another (the popover **grows** into the panel, the
mascot **travels** from hero to header) instead of popping in and out. Depth comes from movement,
never from a shadow. The full system lives in [`docs/DESIGN.md`](docs/DESIGN.md).

## Status & roadmap

- ✅ **v0** — plain-text explanation on click, the whole loop running locally via Ollama.
- ✅ **v1** — the chat done right: **"a little → more"** (popover → panel) + **generative UI** with
  a validated component catalog.
- ✅ **Explorable explanations** — the panel is a surface of its own: click deeper, breadcrumb back,
  ask follow-ups in place, all still composed.
- 🔜 **Next** — **entity detection** and idle **prefetch** beyond the current one, so the very first
  click feels instant.
- 🔭 **Where it's headed:** **level-3 Gen UI** — the model authoring the interface, not just filling
  it; the sandboxed HTML piece is the first step in, and a fast cloud brain is what makes it
  viable. Then **personalized descriptions** for each reader, and a **desktop app** with a
  knowledge vault.

One note on where things stand: the panel is **entirely model-composed** today. The
Wikipedia client (photo + facts + link) still ships in `@curio/core`, but nothing in the UI calls
it — the composed panel replaced it. Re-wiring it as a vouched enrichment inside the panel is on
the table.

Detail and slices in [`docs/ROADMAP.md`](docs/ROADMAP.md). More context:
[`IDEA.md`](IDEA.md) · [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) ·
[`docs/DESIGN.md`](docs/DESIGN.md) · [`docs/niveles-generativos.md`](docs/niveles-generativos.md) ·
[`CHANGELOG.md`](CHANGELOG.md) · [`EXPERIMENTS.md`](EXPERIMENTS.md).

## Contributing

Work happens in **small slices** (one slice = one commit with a clear message) and `main` always
stays demoable. Before a PR: `npm run lint && npm run typecheck && npm run test`. If you touch the
styling, respect what's **sacred** (monochrome, no shadows, local by default) — see `docs/DESIGN.md`
and `CLAUDE.md`.

## License

Not settled yet (**MIT** is on the table for an open POC — the owner's call). Until a `LICENSE`
file lands, all rights reserved by default.
