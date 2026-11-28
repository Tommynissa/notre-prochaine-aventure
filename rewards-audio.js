// Soft bell arpeggios, generated locally without downloading audio assets.
const RewardAudio = {
  context: null,
  voices: new Set(),
  unlock() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      this.context ||= new Audio();
      if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    } catch {}
  },
  click(fitted=false) {
    if(!BGM.enabled)return;this.unlock();const ctx=this.context;if(!ctx)return;
    const oscillator=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime;
    oscillator.type='sine';oscillator.frequency.setValueAtTime(fitted?1100:650,t);oscillator.frequency.exponentialRampToValueAtTime(fitted?750:320,t+.07);
    gain.gain.setValueAtTime(.055,t);gain.gain.exponentialRampToValueAtTime(.001,t+.09);
    oscillator.connect(gain);gain.connect(ctx.destination);this.voices.add(oscillator);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();this.voices.delete(oscillator)};oscillator.start(t);oscillator.stop(t+.1);
  },
  cue(kind) {
    if(!BGM.enabled||document.hidden)return;
    this.unlock();const ctx=this.context;if(!ctx)return;
    const sequences={lost:[[0,440],[.17,349.23],[.35,293.66]],level:[[0,740],[.1,988],[.24,1480]],arrival:[[0,880],[.09,1320]],flight:[[0,420]]};
    for(const [delay,freq] of sequences[kind]||[]){
      const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay+.01;
      o.type='sine';o.frequency.setValueAtTime(freq,t);
      const duration=kind==='flight'?.65:.4;
      if(kind==='flight')o.frequency.exponentialRampToValueAtTime(1100,t+duration);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(kind==='flight'?.025:.055,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+duration);
      o.connect(g);g.connect(ctx.destination);this.voices.add(o);
      o.onended=()=>{o.disconnect();g.disconnect();this.voices.delete(o)};o.start(t);o.stop(t+duration+.02);
    }
  },
  stop() {
    for (const voice of this.voices) {
      try { voice.stop(); } catch {}
    }
    this.voices.clear();
  },
  play(finale = false) {
    this.stop();
    if (!BGM.enabled || document.hidden) return;
    this.unlock();
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running') return;
    const notes = finale
      ? [[0,523.25],[.16,659.25],[.32,783.99],[.5,1046.5],[.85,783.99],[1.05,1046.5],[1.25,1318.51],[1.25,1046.5],[1.25,1567.98]]
      : [[0,659.25],[.13,783.99],[.26,1046.5],[.43,1318.51],[.43,1046.5]];
    const start = ctx.currentTime + .02;
    for (const [delay, frequency] of notes) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = start + delay;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(.085, time + .012);
      gain.gain.exponentialRampToValueAtTime(.001, time + .85);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      this.voices.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        this.voices.delete(oscillator);
      };
      oscillator.start(time);
      oscillator.stop(time + .9);
    }
  }
};
document.addEventListener('pointerdown', () => RewardAudio.unlock(), {passive:true});
document.addEventListener('keydown', () => RewardAudio.unlock());
document.addEventListener('visibilitychange', () => { if (document.hidden) RewardAudio.stop(); });
