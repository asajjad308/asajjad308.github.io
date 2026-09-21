import * as THREE from './vendor/three.module.min.js';
// A restrained geometric field: visual identity, never a prerequisite to reading.
const canvas=document.getElementById('hero-canvas');
const host=document.querySelector('.hero-sculpture');
let renderer;
try { renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'}); } catch { /* Preserve the static fallback on devices without WebGL. */ }
if(renderer){
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(37,1,.1,100);camera.position.z=6.8;
 const group=new THREE.Group();scene.add(group);
 const geometry=new THREE.IcosahedronGeometry(1.65,2);
 const wire=new THREE.LineSegments(new THREE.WireframeGeometry(geometry),new THREE.LineBasicMaterial({color:0xaad56d,transparent:true,opacity:.26}));group.add(wire);
 const dots=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xe1ff91,size:.036,transparent:true,opacity:.9}));group.add(dots);
 const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(1.02,1),new THREE.MeshBasicMaterial({color:0x536d31,wireframe:true,transparent:true,opacity:.33}));group.add(inner);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.03,.006,5,100),new THREE.MeshBasicMaterial({color:0xb6e879,transparent:true,opacity:.35}));ring.rotation.x=1.05;ring.rotation.y=.3;group.add(ring);
 const ring2=ring.clone();ring2.rotation.x=-.65;ring2.rotation.y=1.0;group.add(ring2);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 let paused=document.documentElement.dataset.motion==='off'||matchMedia('(prefers-reduced-motion: reduce)').matches;
 let visible=true,frame=0,last=0,elapsed=0,targetX=0,targetY=0;
 function size(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderOnce();}
 function renderOnce(){renderer.render(scene,camera);}
 function animate(t){frame=0;if(paused||!visible||document.hidden)return;const delta=Math.min((t-last)/1000,.05);last=t;elapsed+=delta;group.rotation.y+=(targetX-group.rotation.y)*.018;group.rotation.x+=(targetY-group.rotation.x)*.018;wire.rotation.y=elapsed*.08;dots.rotation.y=wire.rotation.y;inner.rotation.y=-elapsed*.10;inner.rotation.z=elapsed*.04;ring.rotation.z=elapsed*.035;renderOnce();frame=requestAnimationFrame(animate);}
 function sync(){cancelAnimationFrame(frame);frame=0;if(!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(animate);}else renderOnce();}
 addEventListener('pointermove',e=>{if(e.pointerType==='touch'||paused)return;targetX=(e.clientX/innerWidth-.5)*.4;targetY=(e.clientY/innerHeight-.5)*.2;},{passive:true});
 document.addEventListener('portfolio:motion',e=>{paused=e.detail.paused;sync();});
 document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'50px'}).observe(host);
 new ResizeObserver(size).observe(host);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();paused=true;cancelAnimationFrame(frame);host.classList.remove('ready');});
 size();host.classList.add('ready');sync();
}
