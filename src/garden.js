import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { gsap } from 'gsap';
import { createFlowerGeometry } from './flowers.js';

// Un modelo compartido y renderizado por instancias mantiene bajo el número de draw calls.
// Todos los elementos son geometría tridimensional; no hay imágenes ni modelos externos.
export function createGarden(container, { onFlower, reducedMotion }) {
  const mobile = matchMedia('(max-width: 600px)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#99d9f3');
  scene.fog = new THREE.Fog('#c3e8e4', 29, 80);
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 150);
  const cameraState = { x: 0, y: 4.6, z: 12.8 };
  const lookAt = new THREE.Vector3(0, 3.15, -4);
  const temp = new THREE.Object3D();
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let paused = reducedMotion, elapsed = 0, last = performance.now(), raf, destroyed = false;
  let randomSeed = 42;
  const random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; };
  scene.add(new THREE.HemisphereLight('#edfbff', '#4c6734', 2.7));
  const sunlight = new THREE.DirectionalLight('#fff1c0', 3.1);
  sunlight.position.set(-12, 20, 13); scene.add(sunlight);

  // Terreno continuo con colinas suaves en el horizonte.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshStandardMaterial({color:'#76a53b',roughness:1}));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.045; scene.add(ground);
  const hillGeometry = new THREE.SphereGeometry(1, 28, 14);
  ['#98b961','#84b151','#6fa749'].forEach((color, i) => {
    const hill = new THREE.Mesh(hillGeometry, new THREE.MeshStandardMaterial({color,roughness:1}));
    hill.position.set((i-1)*27, -3.8, -38-i*7); hill.scale.set(34, 7.5+i, 15); scene.add(hill);
  });
  // Las nubes están compuestas por volúmenes suaves, iluminados por el mismo sol.
  const cloudParts = [];
  for(let i=0;i<7;i++){
    const g = new THREE.SphereGeometry(1, 12, 8);
    g.scale(1.3+random(),.65+random()*.6,.9); g.translate((i-3)*1.1,random()*.55,random()*.6); cloudParts.push(g);
  }
  const cloudGeo = mergeGeometries(cloudParts); cloudParts.forEach(g=>g.dispose());
  const clouds = [];
  const cloudMat = new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1});
  [[-16,12,-25,1.3],[15,11,-30,1.5],[-8,16,-39,1],[25,15,-47,1.8],[0,11,-55,1.2]].forEach(([x,y,z,s])=>{
    const m = new THREE.Mesh(cloudGeo,cloudMat);m.position.set(x,y,z);m.scale.setScalar(s);scene.add(m);clouds.push(m);
  });

  const flowerGeo=createFlowerGeometry();
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.87});
  const count=mobile?95:150;
  const flowers = new THREE.InstancedMesh(flowerGeo,material,count);
  flowers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  flowers.frustumCulled=false;
  const items=[];
  for(let i=0;i<count;i++){
    let x,z,scale;
    if(i<8){
      const front=[[-3.6,6.8,1.24],[3.8,6.3,1.12],[-1.7,3.7,1.05],[1.3,4.3,.96],[-5,3.4,1.06],[5.8,3,1.07],[0,1.8,.9],[2.8,.4,.97]][i];
      [x,z,scale]=front;
    }else{x=(random()-.5)*38;z=3-random()*37;scale=.64+random()*.51;}
    items.push({x,z,scale,angle:(random()-.5)*.5,phase:random()*Math.PI*2,pulse:1});
  }
  scene.add(flowers);
  // Miles de briznas comparten geometría y material para un pasto ligero.
  const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.055,.5,3),new THREE.MeshStandardMaterial({color:'#709d36',roughness:1}),mobile?1100:2300);
  for(let i=0;i<grass.count;i++){
    temp.position.set((random()-.5)*48,.14,9-random()*55);temp.rotation.set((random()-.5)*.3,random()*6,(random()-.5)*.35);temp.scale.set(1,.45+random(),1);temp.updateMatrix();grass.setMatrixAt(i,temp.matrix);
    grass.setColorAt(i,new THREE.Color().setHSL(.21+random()*.055,.5,.26+random()*.16));
  }scene.add(grass);

  // Mariposas: dos alas tridimensionales, con aleteo y trayectoria propia.
  const butterflies=[];
  for(let i=0;i<7;i++){
    const group=new THREE.Group(),wings=[];
    const wingMat=new THREE.MeshStandardMaterial({color:i%2?'#fff2af':'#ffd275',side:THREE.DoubleSide});
    for(const side of [-1,1]){
      const pivot=new THREE.Group();
      for(let l=0;l<2;l++){
        const wing=new THREE.Mesh(new THREE.SphereGeometry(1,7,4),wingMat);
        wing.scale.set(.19-l*.055,.12-l*.015,.018);wing.position.set(side*(.13-l*.015),l===0?.065:-.055,0);pivot.add(wing);
      }group.add(pivot);wings.push(pivot);
    }
    group.position.set((random()-.5)*18,2+random()*3,1-random()*17);group.userData={base:group.position.clone(),phase:random()*6,wings};scene.add(group);butterflies.push(group);
  }
  // Pequeñas motas flotantes dan profundidad sin utilizar postprocesado costoso.
  const moteArray=new Float32Array(150*3);
  for(let i=0;i<150;i++){moteArray[i*3]=(random()-.5)*32;moteArray[i*3+1]=.5+random()*7;moteArray[i*3+2]=7-random()*30;}
  const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(moteArray,3));
  const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:'#fff7c6',size:.035,transparent:true,opacity:.7}));scene.add(motes);
  // Corazones 3D de vida corta al tocar una flor.
  const heart=new THREE.Shape();heart.moveTo(0,.15);heart.bezierCurveTo(.5,.65,.85,.05,0,-.5);heart.bezierCurveTo(-.85,.05,-.5,.65,0,.15);
  const heartGeo=new THREE.ShapeGeometry(heart,8),heartMat=new THREE.MeshBasicMaterial({color:'#ffe696',side:THREE.DoubleSide});
  const particles=[];
  function burst(index,amount=9){
    if(paused)return;
    const item=items[index];
    for(let i=0;i<amount;i++){
      if(particles.length>100){const first=particles.shift();scene.remove(first.mesh);}
      const mesh=new THREE.Mesh(heartGeo,heartMat);mesh.position.set(item.x,item.scale*2.6,item.z+.4);mesh.scale.setScalar(.07+random()*.12);scene.add(mesh);
      particles.push({mesh,life:0,vx:(random()-.5)*1.5,vy:.6+random(),vz:(random()-.5)*.5});
    }
  }
  function select(index){
    const item=items[index];
    gsap.killTweensOf(item);item.pulse=1;
    if(!paused)gsap.to(item,{pulse:1.13,duration:.3,yoyo:true,repeat:1,ease:'sine.inOut'});
    burst(index);onFlower(index);
  }
  let start=null,dragged=false;
  function down(e){
    start = { x: e.clientX, y: e.clientY, cx: cameraState.x };
    dragged = false;
    try { container.setPointerCapture(e.pointerId); } catch {}
  }
  function move(e){
    if(!start)return;
    const delta = e.clientX - start.x;
    if(Math.hypot(delta, e.clientY - start.y) > 6) dragged = true;
    if(dragged) cameraState.x = THREE.MathUtils.clamp(start.cx - delta * 0.012, -3.5, 3.5);
  }
  function up(e){
    if(start && !dragged){
      const rect = container.getBoundingClientRect();
      pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObject(flowers);
      if(hits.length){
        select(hits[0].instanceId);
      } else {
        // Tolerancia táctil en móviles: si el toque estuvo cerca del centro de una flor frontal, seleccionarla.
        const tempV = new THREE.Vector3();
        let closestIndex = -1, minDist = Infinity;
        for(let i = 0; i < 8; i++){
          const item = items[i];
          tempV.set(item.x, item.scale * 2.2, item.z).project(camera);
          const dist = Math.hypot(pointer.x - tempV.x, pointer.y - tempV.y);
          if(dist < 0.28 && dist < minDist){
            minDist = dist;
            closestIndex = i;
          }
        }
        if(closestIndex !== -1) select(closestIndex);
      }
    }
    start = null;
  }
  const cancel = () => { start = null; };
  container.addEventListener('pointerdown', down);
  container.addEventListener('pointermove', move);
  container.addEventListener('pointerup', up);
  container.addEventListener('pointercancel', cancel);
  function resize(){
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    const isMobileRatio = w / h < 0.75;
    camera.fov = isMobileRatio ? 56 : 48;
    cameraState.z = isMobileRatio ? 13.5 : 12.8;
    lookAt.y = isMobileRatio ? 2.9 : 3.15;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function frame(now){
    if(destroyed)return;
    raf=requestAnimationFrame(frame);
    const dt=Math.min((now-last)/1000,.04);last=now;
    if(document.hidden)return;
    if(!paused)elapsed+=dt;
    camera.position.set(cameraState.x,cameraState.y,cameraState.z);camera.lookAt(lookAt);
    items.forEach((f,i)=>{
      temp.position.set(f.x,0,f.z);temp.rotation.set(.025,f.angle,Math.sin(elapsed*.8+f.phase)*.022);temp.scale.setScalar(f.scale*f.pulse);temp.updateMatrix();flowers.setMatrixAt(i,temp.matrix);
    });flowers.instanceMatrix.needsUpdate=true;
    if(!paused){
      butterflies.forEach((b,i)=>{const {base,phase,wings}=b.userData;b.position.set(base.x+Math.sin(elapsed*.45+phase)*1.9,base.y+Math.sin(elapsed+phase)*.45,base.z+Math.cos(elapsed*.4+phase));b.rotation.y=Math.sin(elapsed*.4+phase)*.8;wings[0].rotation.y=Math.sin(elapsed*11+i)*.9;wings[1].rotation.y=-Math.sin(elapsed*11+i)*.9;});
      clouds.forEach((c,i)=>c.position.x+=dt*.025*(i%2?1:-1));
      motes.rotation.y=Math.sin(elapsed*.06)*.1;
      for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life+=dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.mesh.rotation.y+=dt*.7;p.mesh.scale.multiplyScalar(1-dt*.26);if(p.life>2.3){scene.remove(p.mesh);particles.splice(i,1);}}
    }
    renderer.render(scene,camera);
  }
  frame(performance.now());
  let nextFlower=0;
  return {
    discover(){select(nextFlower++%8);},
    bloom(){
      if(paused){onFlower(-1);return;}
      items.forEach((item,i)=>{gsap.killTweensOf(item);item.pulse=1;gsap.to(item,{pulse:1.16,duration:.65,delay:Math.min(1.3,Math.abs(item.z)*.05),yoyo:true,repeat:1,ease:'sine.inOut'});if(i<8)burst(i,7);});onFlower(-1);
    },
    setPaused(value){paused=value;if(value){items.forEach(item=>{gsap.killTweensOf(item);item.pulse=1;});particles.splice(0).forEach(p=>scene.remove(p.mesh));}},
    // Liberación explícita para poder integrar la escena después en otra aplicación.
    destroy(){destroyed=true;cancelAnimationFrame(raf);observer.disconnect();container.removeEventListener('pointerdown',down);container.removeEventListener('pointermove',move);container.removeEventListener('pointerup',up);container.removeEventListener('pointercancel',cancel);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.add(heartGeo);materials.add(heartMat);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());items.forEach(item=>gsap.killTweensOf(item));renderer.dispose();renderer.domElement.remove();}
  };
}
