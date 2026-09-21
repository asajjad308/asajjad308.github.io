/* MIT libraries are self-hosted. Every enhancement has a native fallback. */
(() => {
  'use strict';
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let manualPaused = false;
  try { manualPaused = localStorage.getItem('portfolio-motion') === 'off'; } catch {}
  let paused = manualPaused || media.matches;
  let lenis = null;
  let embla = null;
  let revealObserver = null;
  const motion = () => !paused;
  const applyPreference = () => {
    paused = manualPaused || media.matches;
    document.documentElement.classList.toggle('motion-off', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Enable animations' : 'Pause animations');
    toggle.innerHTML = paused ? '<span aria-hidden="true">▷</span><span class="motion-label">Motion off</span>' : '<span aria-hidden="true">Ⅱ</span><span class="motion-label">Pause motion</span>';
    if (lenis) { lenis.destroy(); lenis = null; }
    if (!paused && window.Lenis && matchMedia('(pointer:fine)').matches) {
      lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: false, anchors: true, autoRaf: true });
    }
    if (paused) {
      if (window.anime) anime.remove(document.querySelectorAll('.reveal, .hero-line>span, .hero-bottom, .eyebrow'));
      document.querySelectorAll('.reveal, .hero-line>span, .hero-bottom, .eyebrow').forEach(el => { el.style.opacity = ''; el.style.transform = ''; });
    }
    document.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused } }));
    document.documentElement.dataset.motion = paused ? 'off' : 'on';
    if(embla) embla.reInit({duration:paused?0:32});
  };
  toggle.addEventListener('click', () => { manualPaused = !paused; if (media.matches && !manualPaused) { toggle.setAttribute('aria-label','Reduced motion is enabled in your device settings'); return; } try { localStorage.setItem('portfolio-motion', manualPaused ? 'off' : 'on'); } catch {} applyPreference(); });
  media.addEventListener('change', applyPreference);
  applyPreference();
  if (window.anime && motion()) {
    anime.timeline({ easing:'easeOutExpo' })
      .add({ targets:'.hero-line>span', translateY:['105%',0], opacity:[0,1], duration:1250, delay:anime.stagger(120) })
      .add({ targets:'.hero-bottom', translateY:[20,0], opacity:[0,1], duration:850 },650);
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (motion()) anime({ targets:entry.target, translateY:[28,0], opacity:[.2,1], duration:950, easing:'easeOutExpo' });
      });
    }, { threshold:.12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }
  const viewport = document.querySelector('.embla');
  const slides = Array.from(viewport.querySelectorAll('.carousel-slide'));
  const prev = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  const count = document.querySelector('.carousel-count');
  const dotsRoot = document.querySelector('.carousel-dots');
  const dots = slides.map((slide,i) => {
    const b=document.createElement('button'); b.type='button';b.className='carousel-dot';
    b.setAttribute('aria-label','Go to project '+(i+1)+': '+slide.querySelector('h3').textContent);
    b.addEventListener('click',()=>go(i));dotsRoot.append(b);return b;
  });
  let selected = 0;
  function update() {
    selected = embla ? embla.selectedScrollSnap() : Math.round(viewport.scrollLeft / (viewport.clientWidth+24));
    selected=Math.max(0,Math.min(selected,slides.length-1));
    prev.disabled=selected===0;next.disabled=selected===slides.length-1;
    count.textContent=String(selected+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    dots.forEach((b,i)=>b.setAttribute('aria-current',String(i===selected)));
    // Hidden slides cannot trap keyboard focus. Native fallback remains scrollable.
    slides.forEach((slide,i)=>{ if(embla) { slide.inert=i!==selected;slide.setAttribute('aria-hidden',String(i!==selected)); } });
  }
  function go(index) {
    if(embla) embla.scrollTo(index,paused);
    else viewport.scrollTo({left:index*(viewport.clientWidth+24),behavior:paused?'instant':'smooth'});
  }
  if (window.EmblaCarousel) {
    viewport.classList.add('is-ready');
    embla=EmblaCarousel(viewport,{loop:false,align:'start',duration:paused?0:32,watchDrag:(_,event)=>!event.target.closest('a,button,summary,details'),watchFocus:true});
    embla.on('select',update);embla.on('reInit',update);
  } else viewport.addEventListener('scroll',update,{passive:true});
  prev.addEventListener('click',()=>go(selected-1)); next.addEventListener('click',()=>go(selected+1));
  viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(e.key==='ArrowRight'){e.preventDefault();go(Math.min(selected+1,slides.length-1));}if(e.key==='ArrowLeft'){e.preventDefault();go(Math.max(selected-1,0));}});
  update();
  const progress=document.querySelector('.reading-progress');let ticking=false;
  function progressUpdate(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';ticking=false;}
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(progressUpdate);ticking=true;}},{passive:true});progressUpdate();
  const button=document.getElementById('copy-email');
  button.addEventListener('click',async()=>{const status=document.getElementById('copy-status');try{await navigator.clipboard.writeText('asajjad308@gmail.com');status.textContent='Email copied.';button.textContent='Copied ✓';setTimeout(()=>{button.textContent='Copy email ⧉';status.textContent='';},3000);}catch{status.textContent='Please select and copy the email address above.';}});
})();
