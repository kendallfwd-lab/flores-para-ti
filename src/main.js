import { gsap } from 'gsap';
import { createIcons, Flower2, Pause, Play, VolumeX, Volume2, Sun, Hand, Heart, Sparkles, Mail, X, ArrowUpRight } from 'lucide';
import { createGarden } from './garden.js';
import { createAudio } from './audio.js';
import { dedication } from './config.js';

const $=selector=>document.querySelector(selector);
const icons={Flower2,Pause,Play,VolumeX,Volume2,Sun,Hand,Heart,Sparkles,Mail,X,ArrowUpRight};
const refreshIcons=()=>createIcons({icons});
refreshIcons();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reducedMotion, messageIndex=0, hideMessage, garden;
const audio=createAudio();
function showMessage(index){
  clearTimeout(hideMessage);
  $('#message-text').textContent=index===-1?'Todas estas flores tienen algo en común: son para ti.':dedication.messages[messageIndex++%dedication.messages.length];
  gsap.killTweensOf('#message');
  gsap.to('#hint',{autoAlpha:0,duration:.2});
  gsap.fromTo('#message',{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:reducedMotion?0:.45,ease:'power2.out'});
  audio.chime();
  hideMessage=setTimeout(()=>{gsap.to('#message',{autoAlpha:0,y:-8,duration:.4});gsap.to('#hint',{autoAlpha:1,duration:.4,delay:.4});},4600);
}
// El texto se inserta con textContent para que una dedicatoria personalizada no inyecte HTML.
for(const paragraph of dedication.letter){const p=document.createElement('p');p.textContent=paragraph;$('#letter-copy').append(p);}
$('#letter-signature').textContent=dedication.signature;
const dialog=$('#letter-dialog');
$('#letter').addEventListener('click',()=>{dialog.showModal();if(!reducedMotion)gsap.fromTo(dialog,{opacity:0,y:20},{opacity:1,y:0,duration:.35});});
$('.close-dialog').addEventListener('click',()=>dialog.close());
$('.letter-return').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
$('#sound').addEventListener('click',async()=>{
  const button=$('#sound');button.disabled=true;
  try{const active=await audio.toggle();button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',active?'Desactivar sonido':'Activar sonido');button.innerHTML=`<i data-lucide="${active?'volume-2':'volume-x'}"></i>`;refreshIcons();}catch{showMessage(-1);}finally{button.disabled=false;}
});
function updateMotion(){const b=$('#motion');b.setAttribute('aria-pressed',String(paused));b.setAttribute('aria-label',paused?'Reanudar movimiento':'Pausar movimiento');b.innerHTML=`<i data-lucide="${paused?'play':'pause'}"></i>`;refreshIcons();}
updateMotion();
$('#motion').addEventListener('click',()=>{paused=!paused;garden?.setPaused(paused);updateMotion();});
$('#discover').addEventListener('click',()=>garden?garden.discover():showMessage(0));
$('#bloom').addEventListener('click',()=>{
  garden?garden.bloom():showMessage(-1);
  const b=$('#bloom');b.disabled=true;setTimeout(()=>b.disabled=false,2400);
});
$('.brand').addEventListener('click',event=>{event.preventDefault();showMessage(0);});
document.addEventListener('visibilitychange',()=>audio.visibility().catch(()=>{}));
// Primero se muestra la bienvenida; el indicador se completa cuando el primer frame está listo.
async function start(){
  gsap.to('#progress',{width:'35%',duration:.4});
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  try{garden=createGarden($('#garden'),{onFlower:showMessage,reducedMotion});}
  catch(error){
    console.warn('El jardín 3D no pudo iniciarse.',error);
    $('#garden').replaceChildren();$('#app').classList.add('is-fallback');
    const notice=document.createElement('p');notice.className='fallback-notice';notice.textContent='Este dispositivo no pudo abrir el jardín 3D. Aun así, tienes flores, mensajes y una cartita esperándote en los botones de abajo.';$('#garden').append(notice);
  }
  gsap.to('#progress',{width:'100%',duration:.7,onComplete(){
    gsap.to('#loading',{autoAlpha:0,duration:reducedMotion?.05:.8,delay:.35,onComplete:()=>$('#loading').remove()});
    if(!reducedMotion)gsap.from('.intro > *',{y:18,opacity:0,stagger:.1,duration:1,delay:.8});
  }});
}
start();
