/* =========================================================
   PARTY CRUISERS · main.js
   Animations · Counters · Forms · Gallery · Popup
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PRELOADER ---------- */
  window.addEventListener('load', () => {
    const pre = $('#preloader');
    if (pre) setTimeout(() => pre.classList.add('done'), 700);
  });

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setYear();
    initAOS();
    initNavbar();
    initHeroReveal();
    initCounters();
    initGallery();
    initTestimonials();
    initPopup();
    initFabs();
    initParallax();
    initScrollReveals();
  }

  /* ---------- FOOTER YEAR ---------- */
  function setYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- AOS ---------- */
  function initAOS() {
    if (window.AOS) {
      AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 80, disable: reduceMotion });
    }
  }

  /* ---------- NAVBAR scroll state + active link ---------- */
  function initNavbar() {
    const nav = $('#luxeNav');
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // close mobile menu on link click
    $$('#mainNav .nav-link, #mainNav .nav-cta').forEach(a => {
      a.addEventListener('click', () => {
        const collapse = $('#mainNav');
        if (collapse && collapse.classList.contains('show') && window.bootstrap) {
          bootstrap.Collapse.getOrCreateInstance(collapse).hide();
        }
      });
    });
  }

  /* ---------- HERO TEXT REVEAL (GSAP) ---------- */
  function initHeroReveal() {
    const items = $$('[data-hero]').sort(
      (a, b) => +a.dataset.hero - +b.dataset.hero
    );
    if (!window.gsap || reduceMotion) {
      items.forEach(el => (el.style.opacity = 1));
      return;
    }
    gsap.set(items, { opacity: 0, y: 40 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
      stagger: 0.13, delay: 0.9
    });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  function initCounters() {
    const counters = $$('.counter');
    if (!counters.length) return;

    const run = (el) => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur = 1900;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-IN') + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-IN') + suffix;
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (reduceMotion) {
            e.target.textContent = (+e.target.dataset.target).toLocaleString('en-IN') + (e.target.dataset.suffix || '');
          } else run(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }

  /* ---------- GALLERY filter + lightbox ---------- */
  function initGallery() {
    const filters = $$('.g-filter');
    const items = $$('.m-item');

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        items.forEach(it => {
          const show = cat === 'all' || it.dataset.cat === cat;
          it.classList.toggle('hide', !show);
        });
        if (window.AOS) AOS.refresh();
      });
    });

    // lightbox
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><img alt="Gallery preview" />';
    document.body.appendChild(lb);
    const lbImg = $('img', lb);
    const close = () => lb.classList.remove('open');

    items.forEach(it => {
      it.addEventListener('click', () => {
        const src = $('img', it).src;
        lbImg.src = src;
        lb.classList.add('open');
      });
    });
    $('.lb-close', lb).addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- TESTIMONIAL slider ---------- */
  function initTestimonials() {
    const slides = $$('.testi-slide');
    const dotsWrap = $('.testi-dots');
    if (!slides.length || !dotsWrap) return;
    let idx = 0, timer;

    slides.forEach((_, i) => {
      const b = document.createElement('b');
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = $$('b', dotsWrap);

    function go(n) {
      slides[idx].classList.remove('active');
      dots[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      dots[idx].classList.add('active');
      restart();
    }
    const next = () => go(idx + 1);
    const prev = () => go(idx - 1);

    $('.t-next')?.addEventListener('click', next);
    $('.t-prev')?.addEventListener('click', prev);

    function restart() { clearInterval(timer); timer = setInterval(next, 6500); }
    restart();
  }

  /* ---------- FORM validation + fake submit ---------- */


  function validate(form) {
    let ok = true;
    $$('input[required]', form).forEach(inp => {
      const field = inp.closest('.field');
      const err = $('.err', field);
      let msg = '';
      const v = inp.value.trim();
      if (!v) msg = 'This field is required.';
      else if (inp.type === 'tel' && !/^[+\d][\d\s\-()]{7,15}$/.test(v)) msg = 'Enter a valid phone number.';
      else if (inp.name === 'name' && v.length < 2) msg = 'Please enter your name.';

      if (msg) {
        ok = false;
        field.classList.add('invalid');
        if (err) err.textContent = msg;
      } else {
        field.classList.remove('invalid');
      }
    });
    return ok;
  }

  /* ---------- POPUP · button-triggered + auto (8s OR 50% scroll) ---------- */
  function initPopup() {
    const overlay = $('#popupOverlay');
    if (!overlay) return;
    const titleEl = $('#popupTitle');
    const defaultTitle = titleEl ? titleEl.textContent : '';
    let autoSuppressed = false;
    try { if (localStorage.getItem('pc_popup_dismissed') === '1') autoSuppressed = true; } catch (_) {}

    const show = () => {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      const first = $('input', overlay);
      if (first) setTimeout(() => first.focus(), 300);
    };
    const dismiss = () => {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      autoSuppressed = true;
      if (titleEl) titleEl.textContent = defaultTitle;
      try { localStorage.setItem('pc_popup_dismissed', '1'); } catch (_) {}
    };

    // user-initiated triggers — every [data-popup] element opens the form,
    // regardless of whether the auto-popup was dismissed earlier.
    $$('[data-popup]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const t = btn.getAttribute('data-popup-title');
        if (titleEl) titleEl.textContent = t || defaultTitle;
        show();
      });
    });

    // auto trigger — only if the user hasn't dismissed it before
    if (!autoSuppressed) {
      const auto = () => { if (!autoSuppressed) show(); };
      const timer = setTimeout(auto, 8000);
      const onScroll = () => {
        const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (pct >= 0.5) { clearTimeout(timer); auto(); window.removeEventListener('scroll', onScroll); }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    $('#popupClose')?.addEventListener('click', dismiss);
    overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) dismiss(); });
  }

  /* ---------- FAB / BACK TO TOP ---------- */
  function initFabs() {
    const back = $('#backTop');
    if (!back) return;
    window.addEventListener('scroll', () => {
      back.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- PARALLAX hero (GSAP ScrollTrigger) ---------- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.hero-bg', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // offering image masking reveal
    $$('.offering-visual').forEach(v => {
      gsap.from(v, {
        clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: v, start: 'top 82%' }
      });
    });
  }

  /* ---------- GENERIC SCROLL REVEALS (GSAP for non-AOS bits) ---------- */
  function initScrollReveals() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;

    // expertise-list items have no AOS hook — GSAP owns their reveal
    $$('.expertise-list li').forEach((li, i) => {
      gsap.from(li, {
        opacity: 0, x: 40, duration: 0.8, ease: 'power2.out', delay: i * 0.06,
        scrollTrigger: { trigger: '.expertise-list', start: 'top 78%' }
      });
    });
  }
})();
