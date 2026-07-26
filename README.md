<div align="center">

<img src="docs/media/curio.png" alt="Curio" width="128" height="128" />

# Curio

**Read. Get curious about a word. Click it — and the answer is right there.**

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

<!-- GIF for the owner to record: clicking a word inside a reply → the in-context description (the "glance") appears. Save to docs/media/click-to-explain.gif -->
![Click a word and its description appears in context](docs/media/click-to-explain.gif)

> _The GIF above is still to be recorded live (it needs an active brain). The screenshots of the
> empty state and Read mode, though, are real shots of the app running._

## What you can do

- 👆 **Click any word → an explanation, in its context.** Every word is clickable, yet nothing is
  underlined at rest: the page reads as prose, and a word only lights up when your cursor rests on
  it. Curiosity rewarded, never signposted.
- ✍️ **Select a phrase** (2+ words) and Curio explains **the whole selection** as one unit,
  highlighted in a single continuous blue band.
- 💬 **Chat + Read mode.** Have a conversation with an LLM, or switch to **Read** and **paste an
  article** to bring the same "click → explain" magic to any text you like.
- 🔎 **"See more" — a living panel.** The small popover (the _glance_, a single sentence) has a
  **"See more"** action that **grows** into a modal with the deeper explanation. When the model
  **confirms** the word is a real entity, the panel comes alive with a **photo and facts from
  Wikipedia** — the description is always written by the model; the photo only shows up once that
  confirmation vouches for it.
- 🎨 **Plain text or Gen UI.** In **Gen UI** mode, instead of a paragraph the model **picks a
  component from a catalog** (definition card, timeline, comparison table, steps…) and fills it
  with **validated JSON**, falling back to text if anything's off. It never hand-writes markup.
- 🧠 **A pluggable brain.** Runs on **Ollama** (local) or any **OpenAI-compatible API** with your
  own key (Groq, OpenRouter, LocalAI, your own server…) — swap freely.
- 🌗 **Light and dark themes**, following your system or forced by hand.
- 🫧 **A living mascot.** Curio breathes, follows your cursor with its eyes, travels from center
  stage to the header when you start typing, focuses while it thinks, and pops on a **monocle**
  when it inspects a term.
- 🎛️ **A calm aesthetic:** monochrome, Linear-like, **no shadows** — hierarchy from whitespace and
  1px hairlines, with micro-animations that mean something.

<!-- GIF for the owner to record: the logo/mascot morphing from the hero (large, center) to the header (small) as you type the first message. Save to docs/media/mascot-morph.gif -->
![The mascot travels from the hero to the header as you start typing](docs/media/mascot-morph.gif)

<!-- GIF for the owner to record: composing a reply in Gen UI mode (a catalog card/table appears instead of text) and opening the "See more" modal with the Wikipedia photo. Save to docs/media/gen-ui-vermas.gif -->
![Gen UI and the "See more" modal with Wikipedia facts](docs/media/gen-ui-vermas.gif)

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

Plug in **any OpenAI-compatible endpoint**. Do it from **Settings → Brain: Cloud** inside the app,
or via environment variables for development:

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
VITE_GROQ_MODEL=llama-3.3-70b-versatile
VITE_BRAIN=groq                                 # boot into the cloud; without a key, boots on Ollama
```

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

## How it works under the hood

At Curio's core is a **brain seam**: the whole engine talks to an abstract `LlmProvider`, and
underneath sit two interchangeable implementations — **Ollama** (local) and **OpenAI-compatible**
(cloud). The cloud is reached through a **dynamic dev proxy** (`/llm`): the browser sends the real
endpoint URL in a header and the dev server forwards it, so there's **no CORS** and it works the
same for Groq, OpenRouter, LocalAI, or your own server. Switching brains never serves a cached
answer from a different one: the cache key includes the model's identity.

The rest of the pieces:

- **Entities + lazy loading.** Any word (or selection) is clickable, but **nothing is computed
  ahead of time**: the description is generated **on demand** on click or hover, from the word plus
  its context sentence, and streamed into the popover. Curiosity costs nothing until you spend it.
- **Wikipedia as a vouched enrichment.** In "See more," the Wikipedia photo and facts only appear
  once the model **confirms** the entity — open-web reference data, no key required, to give a
  reliable footing; the description is always the model's.
- **A component catalog (Gen UI).** The model's job is **classify + fill**, never author markup: it
  picks a `type` from a fixed catalog and returns `data` as JSON, validated with **Zod** before
  rendering; if anything's off, it **falls back to plain text** and the UI never breaks. The chat's
  Gen UI mode composes Curio's registered components through
  **[OpenUI](https://www.openui.com)** ([`@openuidev/react-lang`](https://github.com/thesysdev/openui))
  — the model assembles vetted pieces, still never raw HTML.
- **Monorepo.** The "click → description" lives in a **portable core** shared across surfaces:

  ```
  packages/core   @curio/core — the engine: brain seam (Ollama / OpenAI-compat), Zod catalog,
                  prompts, two-stage generation, Wikipedia client, tokenizer.
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
elements **transform and travel** into one another (the popover **grows** into the modal, the
mascot **travels** from hero to header) instead of popping in and out. Depth comes from movement,
never from a shadow. The full system lives in [`docs/DESIGN.md`](docs/DESIGN.md).

## Status & roadmap

- ✅ **v0** — plain-text explanation on click, the whole loop running locally via Ollama.
- ✅ **v1** — the chat done right: **"a little → more"** (popover → modal) + **generative UI** with
  a Zod-validated component catalog.
- 🔜 **v2** — **entity detection** and idle **prefetch** so the click feels instant.
- 🔭 **Where it's headed:** **level-3 Gen UI** (the model authoring the interface, leaning on the
  fast cloud brain), **personalized descriptions** for each reader, and a **desktop app** with a
  knowledge vault.

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
