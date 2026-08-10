import numpy as np, wave, os

SR = 44100
DUR = 33.0
N = int(SR*DUR)
out = np.zeros((N,2), dtype=np.float64)
W = "awork"
ducks = []   # (time, depth) triggers for music ducking when a music track is present

def load(name):
    with wave.open(os.path.join(W, name+".wav"),'rb') as wf:
        n = wf.getnframes(); ch = wf.getnchannels()
        raw = wf.readframes(n)
    a = np.frombuffer(raw, dtype=np.int16).astype(np.float64)/32768.0
    a = np.column_stack([a,a]) if ch == 1 else a.reshape(-1,2)
    return a

cache = {}
def get(name):
    if name not in cache: cache[name] = load(name)
    return cache[name]

def place(name, t, gain, trim=None, head=0.0, duck=None):
    a = get(name)
    if head: a = a[int(head*SR):]
    if trim is not None: a = a[:int(trim*SR)]
    a = a*gain
    s = int(t*SR); e = s+len(a)
    if s < N:
        if e > N: a = a[:N-s]; e = N
        out[s:e] += a
    if duck is not None: ducks.append((t, duck))

# ==========================================================================
# SOUND DESIGN — sparse & meaningful ("invisible" design):
#   whoosh = movement/transition · ONE soft click on a real click ·
#   pop = monocle · ding/chime = a key reveal + the close · very low key ticks.
#   Redundant UI ticks (paste/search/breadcrumb/bar/illuminate) were removed.
# ==========================================================================

# HOOK — soft shimmer as title/mascot appear
place("sparkle", 0.40, 0.34, duck=0.6)

# PAIN cycle 1 — aphelion (copy -> paste, no typing)
place("click",       4.26, 0.50, duck=0.6)             # the real click on the word (copy)
place("whoosh",      4.60, 0.50, duck=0.55)            # browser covers (movement)
place("click",       5.05, 0.44, duck=0.6)             # soft THUNK: word pasted into the bar
place("whoosh-short",6.70, 0.42, duck=0.6)             # browser slides back

# PAIN cycle 2 — perihelion
place("click",       7.76, 0.52, duck=0.6)             # click (copy)
place("whoosh",      8.00, 0.50, duck=0.55)            # browser covers
place("click",       8.35, 0.46, duck=0.6)             # soft THUNK: paste
place("whoosh-short",9.60, 0.44, duck=0.6)

# BUILD — layers pile up: soft whooshes for the tabs sliding + the browser cover (movement only)
place("whoosh",      10.02, 0.44, duck=0.55)
for i,t in enumerate([10.2,10.72,11.18,11.55]):
    place("whoosh-short", t, 0.26 + i*0.05)            # rising, subtle
# HANDOFF — one soft whoosh under the crossfade to the light
place("whoosh",      12.35, 0.40, duck=0.5)

# TURN — a soft shimmer as the calm line resolves
place("sparkle",     13.60, 0.36, duck=0.6)

# CURIO
place("click",       17.00, 0.50, duck=0.6)            # real click on the word
place("click",       18.20, 0.50, duck=0.6)            # real click on "See more"
place("whoosh",      18.35, 0.50, duck=0.5)            # morph movement
place("impact-bass-2",18.50, 0.34, duck=0.5)           # soft landing swell on the morph
place("pop",         19.50, 0.55, duck=0.55)           # monocle pops on
place("ping",        22.50, 0.42, duck=0.6)            # Gen UI reveal — the one "ding"

# REMATE
place("whoosh-short",25.40, 0.40, duck=0.6)            # strike swipe (movement)
place("chime",       26.05, 0.50, duck=0.55)           # warm confirm on "Curio rewards it."

# LOGO STING
place("chime",       28.05, 0.46, duck=0.6)            # soft closing chime

# END CARD — a soft shimmer as "Open source / Chatbot / Browser extension" resolve
place("sparkle",     30.35, 0.34, duck=0.6)

# ==========================================================================
# MUSIC (pipeline ready — currently NONE). Drop a `music.mp3` in the project and
# the build step decodes it to awork/music.wav; this block then adds it as a LOW
# bed with SIDECHAIN DUCKING (music dips under each SFX, ~1s fade back).
# ==========================================================================
MUS = os.path.join(W, "music.wav")
if os.path.exists(MUS):
    m = get("music")
    if len(m) < N: m = np.vstack([m, np.zeros((N-len(m),2))])
    m = m[:N]
    m = m * (0.20/(np.max(np.abs(m)) or 1.0))          # present-but-under-SFX bed
    env = np.ones(N)
    atk = int(0.06*SR); rel = int(1.0*SR)
    for (tt, depth) in ducks:
        s = int(tt*SR)
        a0 = max(0, s-atk)
        if s > a0: env[a0:s] = np.minimum(env[a0:s], np.linspace(1, depth, s-a0))
        e1 = min(N, s+rel)
        if e1 > s: env[s:e1] = np.minimum(env[s:e1], np.linspace(depth, 1, e1-s))
    m *= env[:, None]
    out += m
    print("music: present -> added as ducked bed")
else:
    print("music: NONE (SFX-only render)")

# ---------- safety soft-limiter, then normalize program to ~ -3 dB peaks ----------
out = 0.95*np.tanh(out/0.95)                 # soft-clip safety (won't act at these levels)
peak0 = np.max(np.abs(out))
if peak0 > 0: out *= (0.71/peak0)            # peak -> -3 dBFS
data = (out*32767).astype(np.int16)
with wave.open("mixed.wav",'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes(data.tobytes())
peak = np.max(np.abs(out)); rms = np.sqrt(np.mean(out**2))
print("peak %.3f (%.1f dBFS)  rms %.4f (%.1f dBFS)" % (peak, 20*np.log10(peak), rms, 20*np.log10(max(rms,1e-9))))
