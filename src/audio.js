// Música ambiental sintetizada: no necesita archivos, permisos de micrófono ni conexión.
// Se crea exclusivamente después de que la persona active el botón de sonido.
export function createAudio(){
  let context=null,enabled=false,timer=null,step=0;
  const notes=[261.63,329.63,392,523.25,440,392,329.63,293.66];
  function note(frequency, duration = 2.5, volume = .035) {
    if(!enabled || !context) return;
    if(context.state === 'suspended') {
      context.resume().catch(() => {});
    }
    const osc = context.createOscillator(), gain = context.createGain(), now = context.currentTime;
    osc.type = 'sine'; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain); gain.connect(context.destination);
    osc.start(now); osc.stop(now + duration + 0.05);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
  return {
    async toggle(){
      if(!context){
        const Audio = window.AudioContext || window.webkitAudioContext;
        if(!Audio) return false;
        context = new Audio();
      }
      enabled = !enabled;
      clearInterval(timer);
      if(enabled){
        if(context.state === 'suspended') await context.resume();
        note(notes[0]);
        timer = setInterval(() => { note(notes[step++ % notes.length]); }, 1600);
      } else {
        await context.suspend();
      }
      return enabled;
    },
    chime(){ note(notes[Math.floor(Math.random() * notes.length)] * 2, 1.1, 0.025); },
    async visibility(){
      if(!context) return;
      if(document.hidden) await context.suspend();
      else if(enabled && context.state === 'suspended') await context.resume();
    }
  };
}
