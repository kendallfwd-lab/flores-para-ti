import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Geometría compartida del girasol. Puede verificarse sin navegador.
export function createFlowerGeometry(){
  // Se colorean los vértices para unir pétalos, semillas, hojas y tallo en un único modelo.
  function painted(geometry,color){
    // Las primitivas tienen índices diferentes; normalizamos antes de fusionarlas.
    if(geometry.index){const original=geometry;geometry=geometry.toNonIndexed();original.dispose();}
    const c = new THREE.Color(color), count=geometry.attributes.position.count, colors=new Float32Array(count*3);
    for(let i=0;i<count;i++){colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3)); return geometry;
  }
  const parts=[];
  function piece(g,color,x,y,z,sx=1,sy=1,sz=1,rz=0){g.scale(sx,sy,sz);g.rotateZ(rz);g.translate(x,y,z);parts.push(painted(g,color));}
  piece(new THREE.CylinderGeometry(.032,.049,2.35,7),'#427b2d',0,1.17,0);
  for(let i=0;i<3;i++){
    const side=i%2===0?-1:1;
    piece(new THREE.SphereGeometry(1,8,5),i===1?'#528b2b':'#659d35',side*.23,.65+i*.42,.04,.34,.13,.075,side*.55);
  }
  for(let ring=0;ring<2;ring++)for(let j=0;j<15;j++){
    const a=(j/15)*Math.PI*2+ring*.2, r=ring===0?.37:.34;
    piece(new THREE.SphereGeometry(1,8,5),ring===0?'#f1b516':'#ffce27',Math.cos(a)*r,2.42+Math.sin(a)*r,ring===0?-.035:.025,.14,.32,.055,a-Math.PI/2);
  }
  piece(new THREE.SphereGeometry(1,20,10),'#5c321b',0,2.42,.075,.255,.255,.115);
  // Disposición en espiral de las semillas del centro del girasol.
  for(let i=0;i<73;i++){
    const a=i*2.39996,r=.228*Math.sqrt(i/73);
    piece(new THREE.IcosahedronGeometry(.019,0),i%3===0?'#9d652c':'#75451d',Math.cos(a)*r,2.42+Math.sin(a)*r,.164+(.022*(1-r/.23)),1,1,.6);
  }
  const flowerGeo=mergeGeometries(parts);parts.forEach(g=>g.dispose());
  flowerGeo.computeBoundingSphere();
  return flowerGeo;
}
