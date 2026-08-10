"""
Curio spot — original score, structured & synced to the edit.
Uplifting electronic: hook (airy) -> pain (rising pulse) -> build/riser (chaos)
-> breakdown (the 'What if... stayed?' breath) -> DROP at 15s (Curio relief, sidechained)
-> payoff resolve -> logo tail. Dynamics on purpose (not flat): section gains + sidechain pump.
Outputs music.wav (44.1k stereo, 30s).
"""
import numpy as np

SR = 44100; DUR = 33.0; N = int(SR*DUR)   # +3s end card (open source · chatbot + extension)
BPM = 128.0; BEAT = 60.0/BPM; BAR = 4*BEAT     # 0.46875s / 1.875s
t = np.arange(N)/SR
L = np.zeros(N); R = np.zeros(N)

def midi(m): return 440.0*2**((m-69)/12.0)
def env_adsr(n, a, d, s, r, sr=SR):
    a,d,r = int(a*sr), int(d*sr), int(r*sr)
    e = np.zeros(n)
    if a>0: e[:a] = np.linspace(0,1,a)
    if d>0: e[a:a+d] = np.linspace(1,s,d)
    e[a+d:n-r] = s
    if r>0: e[n-r:] = np.linspace(s,0,r)
    return e
def saw(freq, n, detune=0.0):
    ph = np.cumsum(np.full(n, freq*(1+detune)/SR))
    return 2*(ph - np.floor(0.5+ph))
def sq(freq, n):
    return np.sign(np.sin(2*np.pi*freq*np.arange(n)/SR))
def onepole_lp(x, cutoff):
    # simple one-pole lowpass, cutoff in Hz (static)
    a = np.exp(-2*np.pi*cutoff/SR); y = np.zeros_like(x); yp=0.0
    for i in range(len(x)):   # vectorized-ish via lfilter would be nicer; keep simple/short buffers
        yp = (1-a)*x[i] + a*yp; y[i]=yp
    return y

def add(sig, start, gainL=1.0, gainR=None, pan=0.0):
    gL = gainL*(1-max(0,pan)); gR = (gainR if gainR is not None else gainL)*(1-max(0,-pan))
    s = int(start*SR); e = min(N, s+len(sig)); n = e-s
    if n<=0: return
    L[s:e] += sig[:n]*gL; R[s:e] += sig[:n]*gR

# ---- instruments -------------------------------------------------------------
def pad(notes, start, dur, gain, cutoff=2200, detune=0.006):
    n = int(dur*SR); mix = np.zeros(n)
    for m in notes:
        f = midi(m)
        mix += saw(f, n, +detune) + saw(f, n, -detune) + 0.6*np.sin(2*np.pi*f*np.arange(n)/SR)
    mix /= (len(notes)*2.2)
    if cutoff: mix = onepole_lp(mix, cutoff)
    e = env_adsr(n, 0.08, 0.1, 0.9, 0.25)
    add(mix*e*gain, start)

def bass(m, start, dur, gain):
    n=int(dur*SR); f=midi(m)
    s = 0.6*saw(f,n)+0.4*sq(f,n); s=onepole_lp(s, 500)
    e = env_adsr(n, 0.005, 0.05, 0.85, 0.06)
    add(s*e*gain, start)

def pluck(m, start, dur, gain, pan=0.0, cutoff=3500):
    n=int(dur*SR); f=midi(m)
    s = saw(f,n,0.004)+saw(f,n,-0.004); s=onepole_lp(s,cutoff)
    e = np.exp(-np.arange(n)/(0.12*SR))
    add(s*e*gain, start, pan=pan)

def lead(m, start, dur, gain, pan=0.0):
    n=int(dur*SR); f=midi(m)
    s = 0.7*np.sin(2*np.pi*f*np.arange(n)/SR)+0.3*saw(f,n,0.003)
    e = env_adsr(n, 0.01, 0.06, 0.8, 0.08)
    add(s*e*gain, start, pan=pan)

def kick(start, gain=1.0):
    n=int(0.28*SR); tt=np.arange(n)/SR
    fsw = 120*np.exp(-tt/0.03)+48
    ph = np.cumsum(2*np.pi*fsw/SR)
    s = np.sin(ph)*np.exp(-tt/0.13)
    s += 0.5*np.sin(2*np.pi*55*tt)*np.exp(-tt/0.03)   # click
    add(s*gain, start)

def hat(start, gain=0.25, dur=0.04):
    n=int(dur*SR); s=(np.random.default_rng(int(start*1000)).standard_normal(n))
    s=onepole_lp(s,16000)-onepole_lp(s,7000)          # crude highpass
    e=np.exp(-np.arange(n)/(0.012*SR)); add(s*e*gain,start)

def clap(start, gain=0.5):
    n=int(0.18*SR); s=np.random.default_rng(int(start*777)).standard_normal(n)
    s=onepole_lp(s,4000)-onepole_lp(s,1500); e=np.exp(-np.arange(n)/(0.05*SR))
    add(s*e*gain,start,pan=0.05)

def riser(start, dur, gain=0.5):
    # SMOOTH tonal swell — no harsh white-noise "tzzz". A soft low tone rising gently
    # in pitch + a sub, so tension builds without a grating high sweep.
    n=int(dur*SR); tt=np.arange(n)/SR
    ramp=(tt/dur)**1.7
    swp=np.sin(2*np.pi*np.cumsum(110+170*(tt/dur))/SR)*ramp     # gentle rising tone (110->280 Hz)
    sub=np.sin(2*np.pi*55*tt)*ramp*0.5
    add((swp*0.5+sub)*gain, start)

# ---- sidechain pump (ducks pads/bass/pluck on kicks) -------------------------
def pump_env(kick_times, depth=0.3, rel=0.34):
    e = np.ones(N)
    for kt in kick_times:
        s=int(kt*SR); r=int(rel*SR); e1=min(N,s+r)
        if e1>s: e[s:e1]=np.minimum(e[s:e1], np.linspace(depth,1,e1-s))
    return e

# =============================================================================
# ARRANGEMENT  (C major uplift: C  G  Am  F)
CHORDS = [[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]]   # C G Am F voicings
BASSN  = [36,43,45,41]                                               # roots
LEADN  = [72,76,79,76, 74,71,72,67]                                  # simple bright motif (drop)

# Save the actual score to separate stems so we can pump only the melodic parts.
Lk=np.zeros(N); Rk=np.zeros(N)   # (unused split kept simple: everything in L/R, pump applied to full melodic pre-sum)

# ---- collect kick times ----
kick_times=[]

# HOOK 0–3.75 : airy pad shimmer + a couple of soft plucks (very low energy)
pad(CHORDS[0], 0.0, 3.75, gain=0.16, cutoff=1600)
pluck(72,0.9,0.6,0.10,pan=-0.3); pluck(76,1.8,0.6,0.09,pan=0.3); pluck(79,2.7,0.6,0.08,pan=-0.2)

# PAIN 3.75–11.25 : soft pulse builds tension (kick from 4.5, minor tilt on Am)
pain_start=4.5
b=pain_start
while b < 11.25:
    g = 0.5 + 0.4*((b-pain_start)/(11.25-pain_start))   # kick grows
    kick(b, gain=0.5*g); kick_times.append(b)
    hat(b+BEAT*0.5, 0.16*g)
    b += BEAT
# a low Am-ish drone pad through pain (tension)
pad([57,60,64], 3.75, 7.5, gain=0.11, cutoff=1200)
bass(45, 3.75, 7.5, 0.10)

# BUILD 11.25–13.0 : riser + faster hats + snare roll (chaos peak ~10-12.7 in video)
riser(11.0, 4.0, gain=0.34)          # smooth tonal swell peaking into the drop at 15
b=11.25
while b<13.0:
    hat(b,0.20); b+=BEAT*0.5
for i in range(8):                    # accelerating snare roll (softer)
    clap(12.2 + i*(0.11 - i*0.006), 0.15+0.012*i)

# BREAKDOWN 13.0–15.0 : beat drops out, held bright pad + riser tail (the 'stayed?' breath)
pad(CHORDS[0],13.0,2.0,gain=0.18,cutoff=2600)
# reverse-swell into the drop
sw=np.linspace(0,1,int(2.0*SR))**2; noise=np.random.default_rng(3).standard_normal(int(2.0*SR))
add(onepole_lp(noise,1800)*sw*0.08, 13.0)   # soft, heavily low-passed (no harsh hiss)

# DROP 15.0–25.0 : Curio relief — full uplifting groove, sidechained, chords C G Am F
drop_start=15.0
bar_i=0; b=drop_start
while b < 25.0:
    ch = CHORDS[bar_i % 4]; bn = BASSN[bar_i % 4]
    pad(ch, b, BAR, gain=0.26, cutoff=3000)
    bass(bn, b, BAR, 0.22)
    # four-on-floor + offbeat hats + 8th arp
    for k in range(4):
        kt=b+k*BEAT; kick(kt, gain=0.95); kick_times.append(kt); hat(kt+BEAT*0.5,0.24)
    for k in range(8):
        pluck(ch[k%len(ch)]+ (12 if k%2 else 0), b+k*BEAT*0.5, 0.24, 0.16, pan=(-0.25 if k%2 else 0.25))
    bar_i+=1; b+=BAR
# lead motif over the drop (from the morph reveal ~18.4 onward)
lm_start=18.375
for i,nn in enumerate(LEADN):
    lead(nn, lm_start+i*BEAT, BEAT*0.9, 0.16, pan=0.0)
LEADN2=[79,83,86,83,81,79,76,72]
for i,nn in enumerate(LEADN2):
    lead(nn, 22.0+i*BEAT, BEAT*0.9, 0.15)

# PAYOFF 25–28 : quick filter-down break then a confident final chord stab on ~26 ("Curio rewards it.")
pad(CHORDS[0],26.0,2.2,gain=0.30,cutoff=3400)   # big bright Cmaj resolve
bass(36,26.0,2.2,0.22); kick(26.0,1.0); kick_times.append(26.0)
lead(84,26.0,1.4,0.18)

# LOGO 28–30 : soft resolving pad tail
pad([60,64,67,71],28.0,2.0,gain=0.18,cutoff=2400)

# END CARD 30–33 : held C-major resolve, gentle fade out (open source · chatbot + extension)
pad([60,64,67,72],30.0,3.0,gain=0.15,cutoff=2200)
lead(72,30.0,1.2,0.10)

# =============================================================================
# apply sidechain pump to the WHOLE melodic mix (kick itself is transient, tolerable)
env = pump_env(sorted(set(kick_times)), depth=0.32, rel=0.34)
L*=env; R*=env

# master: gentle stereo, soft limit, normalize to -3 dBFS peak (bed will be lowered by mix.py anyway)
mix = np.stack([L,R],axis=1)
mix = np.tanh(mix*1.1)
pk = np.max(np.abs(mix)) or 1.0
mix *= (0.71/pk)
import wave
data=(mix*32767).astype(np.int16)
with wave.open("music.wav",'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(data.tobytes())
# quick energy report per section
def rms_db(a,b):
    seg=mix[int(a*SR):int(b*SR)]; r=np.sqrt(np.mean(seg**2)) if len(seg) else 0
    return 20*np.log10(max(r,1e-9))
for lbl,a,bb in [("hook",0,3.75),("pain",3.75,11.25),("build",11.25,13),("break",13,15),
                 ("DROP",15,25),("payoff",25,28),("logo",28,30),("endcard",30,33)]:
    print(f"{lbl:7s} {a:5.1f}-{bb:4.1f}  {rms_db(a,bb):6.1f} dB")
print("peak", round(float(np.max(np.abs(mix))),3))
