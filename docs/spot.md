# Curio — Launch spot

The promo/spot for Curio. Motion-design piece in Curio's own visual language
(monochrome + blue, Inter, no shadows, "everything flows to one place"),
Apple/SaaS-clean, ~33s, built with **HyperFrames**.

## Deliverable

- **Final video:** [`media/curio-spot.mp4`](media/curio-spot.mp4) — 1280×720, 30 fps, 33.0s, H.264 + AAC (music + SFX).
  - _(A 1080p re-render is a one-liner in the source project if needed — see below.)_
- **Source project:** [`spot/`](spot/) — the HyperFrames composition + the audio pipeline + the locked brand kit.

## Concept

Inverts the proverb **"Curiosity killed the cat."** → **"Curio rewards it."**
The mascot is a blue cat, so the wordplay is literal.

**Beats (~33s):**
1. **Hook** — "Curiosity killed the cat." + the cat (alive: breathes, blinks, ears alert).
2. **The pain (the old way)** — a chatbot reply with words you don't know (*aphelion*, *retrograde*); you **copy → paste into a browser → search → come back**, and it repeats: tabs pile up, each a **different** word (aphelion, retrograde, perihelion, ecliptic, precession, apsis), the search bar changes with each — the friction of looking up term after term.
3. **The turn** — clean cross-dissolve to light: **"What if every word were a link?"** (ties to the launch thesis below).
4. **Curio (the relief)** — the same reply; a word lights up → click → a popover **morphs** into the composed "See more" panel (definition, `16th c.` stat, Heliocentric vs Geocentric), the cat inspects with its **monocle**; then a nested word → breadcrumb `heliocentric › geocentric`, a Gen-UI chart flash. The answer appears **in place** — the chat stays dimmed behind the panel ("you never left").
5. **Payoff** — "Curiosity ~~killed the cat~~ → **Curio rewards it.**"
6. **End card** — cat + **Curio** · **Open source** · **Chatbot** · **Browser extension**.

## Audio

- **Music:** original, **composed in Python** (`spot/compose.py`, numpy synthesis) — a structured uplifting-electronic track **synced to the edit** (airy hook → rising pain → build → breakdown → **drop at 15s when Curio appears** → resolve → soft end-card tail), with sidechain pump. **No copyright, no attribution** (it's ours).
- **SFX:** from the HyperFrames `/media-use` library (whoosh, click, paste thunk, monocle pop, ping, chime). Mixed **under** the music via `spot/mix.py` with **sidechain ducking** (music dips ~5–6 dB under each SFX).
- Full credits in [`spot/ATTRIBUTION.txt`](spot/ATTRIBUTION.txt).

## Rebuild / re-render

The source in `spot/` is a HyperFrames project. From `spot/`:

```bash
npm install
# drop/keep music.mp3 in the project; mix.py auto-adds it as a ducked bed
npx hyperframes render        # or `npx hyperframes render --height 1080` for 1080p
```

- `index.html` — the composition (timing via `data-*`, seek-safe).
- `compose.py` — regenerates `music.wav` (edit + `python compose.py`).
- `mix.py` — mixes SFX + ducked music → `mixed.wav` (muxed into the render).
- `brandkit/` — the **locked** real identity: `tokens.css` (real color/type tokens), `curio-body.png` (real mascot), Inter woff2. Everything visual is built from these — no invented logos/fonts (the mascot's eyes/monocle CSS + the "See more" panel are reconstructed 1:1 from the app; see `fidelity.html`).

## Launch post (pending)

Angle to pair with the video: **the web promised everything would be a link (hypertext); it broke that from the start — Curio makes every word a link again.** The spot's turn line ("What if every word were a link?") sets it up; the post carries the full thesis. Copy not written yet.
