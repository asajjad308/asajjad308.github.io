import * as THREE from './vendor/three.module.min.js';

/* A breathing particle field wrapped in wireframe structure: visual identity,
   never a prerequisite to reading. Falls back to the static mark on any failure. */

const canvas = document.getElementById('hero-canvas');
const host = document.querySelector('.hero-sculpture');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
} catch { /* Preserve the static fallback on devices without WebGL. */ }

if (renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 100);
  camera.position.z = 6.8;

  const group = new THREE.Group();
  scene.add(group);

  const pixelRatio = Math.min(devicePixelRatio, 1.75);
  renderer.setPixelRatio(pixelRatio);

  /* ---------- particle shell ---------- */

  const COUNT = matchMedia('(max-width: 700px)').matches ? 1100 : 2200;
  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);
  const seeds = new Float32Array(COUNT);

  // Fibonacci sphere: an even shell with no clustering at the poles.
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const radius = 1.72 + (Math.random() - .5) * .12;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    scales[i] = .8 + Math.random() * 1.5;
    seeds[i] = Math.random();
  }

  const cloud = new THREE.BufferGeometry();
  cloud.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  cloud.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  cloud.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uColor: { value: new THREE.Color(0xdcff8f) }
  };

  const points = new THREE.Points(cloud, new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime; uniform float uAmp; uniform float uPixelRatio;
      attribute float aScale; attribute float aSeed;
      varying float vGlow;
      void main() {
        vec3 p = position;
        float t = uTime * 0.34 + aSeed * 6.2831;
        float n = sin(p.x * 1.9 + t) * 0.5
                + cos(p.y * 1.6 - t * 1.15) * 0.35
                + sin(p.z * 2.2 + t * 0.8) * 0.4;
        p += normalize(p) * n * (0.13 + uAmp * 0.22);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aScale * (34.0 / -mv.z) * uPixelRatio;
        gl_Position = projectionMatrix * mv;
        vGlow = 0.3 + 0.7 * smoothstep(-1.1, 1.1, n);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vGlow;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, smoothstep(0.5, 0.06, d) * vGlow * 0.5);
      }
    `
  }));
  group.add(points);

  /* ---------- structure around it ---------- */

  const core = new THREE.IcosahedronGeometry(1.2, 1);
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(core),
    new THREE.LineBasicMaterial({ color: 0xaad56d, transparent: true, opacity: .2 })
  );
  group.add(wire);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.78, 1),
    new THREE.MeshBasicMaterial({ color: 0x5f7d37, wireframe: true, transparent: true, opacity: .3 })
  );
  group.add(inner);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.14, .005, 5, 110),
    new THREE.MeshBasicMaterial({ color: 0xb6e879, transparent: true, opacity: .34 })
  );
  ring.rotation.set(1.05, .3, 0);
  group.add(ring);

  const ring2 = ring.clone();
  ring2.rotation.set(-.65, 1.0, 0);
  group.add(ring2);

  /* ---------- lifecycle ---------- */

  let paused = document.documentElement.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, frame = 0, last = 0, elapsed = 0;
  let targetX = 0, targetY = 0, amp = 0, ampTarget = 0, lastScroll = scrollY;

  function size() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderOnce();
  }

  function renderOnce() { renderer.render(scene, camera); }

  function animate(t) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    const delta = Math.min((t - last) / 1000, .05);
    last = t;
    elapsed += delta;

    amp += (ampTarget - amp) * .06;
    ampTarget *= .92;

    uniforms.uTime.value = elapsed;
    uniforms.uAmp.value = amp;

    group.rotation.y += (targetX - group.rotation.y) * .02;
    group.rotation.x += (targetY - group.rotation.x) * .02;
    points.rotation.y = elapsed * .045;
    wire.rotation.y = elapsed * .08;
    inner.rotation.y = -elapsed * .1;
    inner.rotation.z = elapsed * .04;
    ring.rotation.z = elapsed * .035;
    ring2.rotation.z = -elapsed * .028;

    renderOnce();
    frame = requestAnimationFrame(animate);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!paused && visible && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    } else renderOnce();
  }

  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || paused) return;
    targetX = (e.clientX / innerWidth - .5) * .55;
    targetY = (e.clientY / innerHeight - .5) * .28;
  }, { passive: true });

  // Scroll speed pushes the shell outward, then it settles on its own.
  addEventListener('scroll', () => {
    if (paused) return;
    ampTarget = Math.min(1.6, ampTarget + Math.abs(scrollY - lastScroll) / 260);
    lastScroll = scrollY;
  }, { passive: true });

  document.addEventListener('portfolio:motion', e => { paused = e.detail.paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '50px' }).observe(host);
  new ResizeObserver(size).observe(host);
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    paused = true;
    cancelAnimationFrame(frame);
    host.classList.remove('ready');
  });

  size();
  host.classList.add('ready');
  sync();
}
