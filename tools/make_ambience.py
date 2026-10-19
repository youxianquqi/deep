import numpy as np, wave, math
sr=44100
dur=96.0
n=int(sr*dur)
t=np.arange(n,dtype=np.float64)/sr
L=np.zeros(n,dtype=np.float64)
R=np.zeros(n,dtype=np.float64)
# chord roots/midi
chords=[
 [50,54,57,61,64], # D3 F#3 A3 C#4 E4
 [47,50,54,57,61], # B2 D3 F#3 A3 C#4
 [43,47,50,54,59], # G2 B2 D3 F#3 B3
 [45,49,52,56,61], # A2 C#3 E3 F#3 C#4
]
bar=8.0
def hz(m): return 440.0*2**((m-69)/12)
for b in range(12):
    ch=chords[b%4]
    start=b*bar
    seg_t=t[(t>=start)&(t<start+bar+1.2)]-start
    env=np.zeros_like(seg_t)
    a=1.8; r=2.5
    env[seg_t<a]=seg_t[seg_t<a]/a
    env[(seg_t>=a)&(seg_t<bar)]=1
    rel=seg_t>=bar
    env[rel]=np.maximum(0,1-(seg_t[rel]-bar)/r)
    env=np.clip(env,0,1)
    pad=np.zeros_like(seg_t)
    for j,m in enumerate(ch):
        f=hz(m)
        vib=1+0.0018*np.sin(2*np.pi*(0.08+j*0.013)*seg_t+j)
        wave_=(np.sin(2*np.pi*f*vib*seg_t+j*0.7)
               +0.32*np.sin(2*np.pi*f*2*vib*seg_t+j*1.3)
               +0.13*np.sin(2*np.pi*f*3*vib*seg_t+j*2.1))
        pad += wave_*(0.8 if j<3 else 0.55)
    pad*=env*0.052
    # place with stereo slightly different phase
    lo=int(start*sr); hi=lo+len(pad)
    if hi>n: hi=n; pad=pad[:hi-lo]; env=env[:hi-lo]
    pan=np.linspace(-0.6,0.6,len(ch))
    # equal-power style simple
    padL=pad*(0.8-0.25*np.mean(pan))
    padR=pad*(0.8+0.25*np.mean(pan))
    L[lo:hi]+=padL
    R[lo:hi]+=padR
    # low drone root every bar
    root=hz(ch[0]-12)
    dr=np.sin(2*np.pi*root*seg_t)*(0.6+0.4*np.sin(2*np.pi*0.04*seg_t))
    dr*=env*0.045
    L[lo:hi]+=dr; R[lo:hi]+=dr
# plucks, sparse arpeggio
rng=np.random.default_rng(19)
times=np.arange(2.0,dur-2.0,3.1)
for k,st in enumerate(times):
    ch=chords[int(st//bar)%4]
    m=ch[(k*2)%len(ch)]+12
    f=hz(m)
    length=4.5
    lo=int(st*sr); hi=min(n,lo+int(length*sr))
    tt=np.arange(hi-lo)/sr
    env=np.exp(-tt*1.55)*(1-np.exp(-tt*45))
    tone=(np.sin(2*np.pi*f*tt)+0.45*np.sin(2*np.pi*f*2*tt+0.4)+0.18*np.sin(2*np.pi*f*3*tt+0.9))
    tone*=env*0.06
    pan=0.5+0.35*math.sin(k*1.7)
    L[lo:hi]+=tone*(1-pan); R[lo:hi]+=tone*pan
# multi-tap reverb
for delay,gain in [(0.11,0.22),(0.23,0.16),(0.37,0.11),(0.53,0.075),(0.79,0.05)]:
    d=int(delay*sr)
    L[d:]+=L[:-d]*gain
    R[d:]+=R[:-d]*gain
# gentle lowpass one-pole
def lp(x):
    y=np.empty_like(x); a=0.18; y[0]=x[0]
    for i in range(1,len(x)): y[i]=y[i-1]+a*(x[i]-y[i-1])
    return y
L=lp(L); R=lp(R)
# fade edges 2s
fade=np.ones(n); f=int(2.0*sr); fade[:f]=np.linspace(0,1,f)**2; fade[-f:]=np.linspace(1,0,f)**2
L*=fade; R*=fade
peak=max(np.max(np.abs(L)),np.max(np.abs(R)),1e-9)
L*=(0.52/peak); R*=(0.52/peak)
stereo=np.stack([L,R],axis=1)
out=(np.clip(stereo,-1,1)*32767).astype('<i2')
with wave.open('assets/ambience.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(out.tobytes())
print('wav',n/sr,'s peak',round(float(peak),3))
