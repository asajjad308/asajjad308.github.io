# Animation libraries

This portfolio uses unmodified, self-hosted distributions of:

| Library | Version | License | Source |
| --- | --- | --- | --- |
| GSAP (core, ScrollTrigger, SplitText) | 3.13.0 | GreenSock Standard "No Charge" | https://github.com/greensock/GSAP |
| Lenis | 1.3.26 | MIT | https://github.com/darkroomengineering/lenis |
| Embla Carousel | 8.6.0 | MIT | https://github.com/davidjerleke/embla-carousel |
| Three.js | 0.180.0 | MIT | https://github.com/mrdoob/three.js |

Copyright and license texts are retained in `vendor/`.

## A note on the GSAP license

GSAP is source-available rather than OSI open source. Since 3.13 (2025) the core and
every plugin — including SplitText and ScrollTrigger, which used to be paid — are free
to use in commercial projects under the GreenSock Standard "No Charge" license. The one
thing it does not permit is reselling GSAP itself or bundling it into a product whose
customers are charged for GSAP's functionality. Using it on a personal portfolio is
squarely within the license. Full terms: https://gsap.com/community/standard-license/

Lenis, Embla and Three.js are all MIT.

## Motion and accessibility

- Device reduced-motion settings disable the intro, smooth scrolling, scroll animations
  and 3D animation. A visible pause control offers the same, and the choice is remembered.
- Pausing tears the whole GSAP layer down: tweens are reverted, ScrollTriggers killed,
  and split text restored to plain nodes.
- The intro curtain only appears on the first visit of a session, and a timer removes it
  even if a library fails to load.
- The 3D scene pauses when off-screen or when the document is hidden, and recovers from
  WebGL context loss by falling back to the static mark.
- Carousels never autoplay and support touch, mouse, keyboard and explicit controls.
  Without JavaScript, projects and the timeline remain natively scrollable.
- The custom cursor is decorative, pointer-fine only, and never replaces a real one.
