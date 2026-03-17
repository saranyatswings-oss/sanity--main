// Mobile-only testimonial slider initializer adapted from the provided script.
import { gsap } from 'gsap';

export default function initMobileTestimonialSlider() {
  if (typeof document === 'undefined') return () => {};
  if (typeof gsap === 'undefined') {
    console.warn('Wings testimonials (mobile): GSAP not found.');
    return () => {};
  }

  const wrapper = document.querySelector('.homepage-testimonial__cards-wrapper-mobile');
  if (!wrapper) return () => {};

  const pages = Array.from(wrapper.querySelectorAll('.homepage-testimonial__card-single-mobile'));
  if (!pages.length) return () => {};

  const AUTOPLAY_MS = 5000;
  const pageCount = pages.length;
  let current = 0;
  let activeTl = null;
  let animatingTo = -1;
  let autoTimer = null;

  const viewport = document.createElement('div');
  viewport.style.setProperty('position', 'relative', 'important');
  viewport.style.setProperty('overflow', 'hidden', 'important');
  viewport.style.setProperty('width', '100%', 'important');

  pages[0].parentNode.insertBefore(viewport, pages[0]);
  pages.forEach((page) => viewport.appendChild(page));

  function getParts(page) {
    const img = page.querySelector('figure.elementor-image-box-img') || page.querySelector('.elementor-image-box-img') || page.querySelector('.elementor-image-box-wrapper');
    const texts = Array.from(page.querySelectorAll('.elementor-image-box-content, .homepage-testimonial__card-content'));
    return { img, texts };
  }

  function hardShow(page) {
    const { img, texts } = getParts(page);
    if (img) gsap.set(img, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(texts, { opacity: 1 });
    page.style.setProperty('position', 'relative', 'important');
    page.style.setProperty('opacity', '1', 'important');
    page.style.setProperty('pointer-events', 'auto', 'important');
  }

  function hardHide(page, clip) {
    const { img, texts } = getParts(page);
    if (img) gsap.set(img, { clipPath: clip });
    gsap.set(texts, { opacity: 0 });
    page.style.setProperty('position', 'absolute', 'important');
    page.style.setProperty('opacity', '0', 'important');
    page.style.setProperty('pointer-events', 'none', 'important');
  }

  pages.forEach((page, i) => {
    page.style.setProperty('width', '100%', 'important');
    page.style.setProperty('position', 'absolute', 'important');
    page.style.setProperty('left', '0', 'important');
    page.style.setProperty('right', '0', 'important');
    page.style.setProperty('top', '0', 'important');
    page.style.setProperty('opacity', '0', 'important');
    page.style.setProperty('pointer-events', 'none', 'important');
    page.style.setProperty('z-index', '1', 'important');
    page.style.boxSizing = 'border-box';
    if (i === 0) hardShow(page);
    else hardHide(page, 'inset(100% 0% 0% 0%)');
  });

  let maxH = 0;
  pages.forEach((page) => {
    page.style.setProperty('opacity', '1', 'important');
    page.style.setProperty('position', 'relative', 'important');
    maxH = Math.max(maxH, page.offsetHeight);
    page.style.setProperty('opacity', '0', 'important');
    page.style.setProperty('position', 'absolute', 'important');
  });
  if (maxH) {
    viewport.style.setProperty('height', maxH + 'px', 'important');
    pages.forEach((page) => page.style.setProperty('min-height', maxH + 'px', 'important'));
  }

  hardShow(pages[current]);

  pages.forEach((page) => {
    page.classList.remove('homepage-testimonial__cards-initial', 'homepage-testimonial__cards-end');
  });

  function animateTo(nextIndex, direction = 1) {
    nextIndex = ((nextIndex % pageCount) + pageCount) % pageCount;
    if (nextIndex === current) return;

    if (activeTl) {
      activeTl.kill();
      activeTl = null;
      hardHide(pages[current], direction === 1 ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)');
      if (animatingTo >= 0 && animatingTo !== current) {
        hardShow(pages[animatingTo]);
        current = animatingTo;
      }
      animatingTo = -1;
      nextIndex = ((nextIndex % pageCount) + pageCount) % pageCount;
      if (nextIndex === current) return;
    }

    animatingTo = nextIndex;

    const curPage = pages[current];
    const nxtPage = pages[nextIndex];
    const isPrev = direction === -1;
    const exitClip = isPrev ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';
    const enterClipStart = isPrev ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)';

    nxtPage.style.setProperty('position', 'absolute', 'important');
    nxtPage.style.setProperty('left', '0', 'important');
    nxtPage.style.setProperty('right', '0', 'important');
    nxtPage.style.setProperty('top', '0', 'important');
    nxtPage.style.setProperty('opacity', '1', 'important');
    nxtPage.style.setProperty('pointer-events', 'none', 'important');

    const nxtParts = getParts(nxtPage);
    if (nxtParts.img) gsap.set(nxtParts.img, { clipPath: enterClipStart });
    gsap.set(nxtParts.texts, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete() {
        hardHide(curPage, exitClip);
        hardShow(nxtPage);
        current = nextIndex;
        activeTl = null;
        animatingTo = -1;
      },
    });

    activeTl = tl;

    const curParts = getParts(curPage);
    if (curParts.img) tl.to(curParts.img, { clipPath: exitClip, duration: 0.55, ease: 'power2.inOut' });
    tl.to(curParts.texts, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0);

    const enterStart = 0.4;
    if (nxtParts.img) tl.to(nxtParts.img, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.65, ease: 'expo.out' }, enterStart);
    tl.to(nxtParts.texts, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => animateTo(current + 1, 1), AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  const nextBtn = document.querySelector('.homepage-testimonial__button-right a.elementor-icon');
  const prevBtn = document.querySelector('.homepage-testimonial__button-left a.elementor-icon');

  function onNext(e) { e.preventDefault(); const from = animatingTo >= 0 ? animatingTo : current; animateTo(from + 1, 1); startAutoplay(); }
  function onPrev(e) { e.preventDefault(); const from = animatingTo >= 0 ? animatingTo : current; animateTo(from - 1, -1); startAutoplay(); }

  if (nextBtn) nextBtn.addEventListener('click', onNext);
  if (prevBtn) prevBtn.addEventListener('click', onPrev);

  startAutoplay();

  return function cleanup() {
    stopAutoplay();
    if (nextBtn) nextBtn.removeEventListener('click', onNext);
    if (prevBtn) prevBtn.removeEventListener('click', onPrev);
    if (activeTl) { try { activeTl.kill(); } catch (e) {} activeTl = null; }
  };
}
