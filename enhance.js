/* =============================================================
   Connecta – enhancement layer JS
   Subtile scroll-reveals via IntersectionObserver (robust også
   for elementer nederst på siden). GSAP brukes kun til easing
   hvis det er tilgjengelig. Defensiv: hvis noe feiler blir alt
   innhold synlig. Respekterer prefers-reduced-motion.
   ============================================================= */
(function () {
  'use strict';

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  docEl.classList.add('enh-js');

  // Sikkerhetsnett: fjern skjult-tilstand hvis init aldri kjører.
  var safety = setTimeout(function () {
    docEl.classList.remove('enh-js');
  }, 3000);

  function collect() {
    var nodes = document.querySelectorAll(
      'section.elementor-top-section, .e-con.e-parent'
    );
    var list = [];
    nodes.forEach(function (n) {
      // hopp over skjulte (f.eks. fjernet testimonial-seksjon)
      if (n.offsetParent === null) return;
      n.classList.add('enh-reveal');
      list.push(n);
    });
    return list;
  }

  function reveal(el) {
    if (el.dataset.enhDone) return;
    el.dataset.enhDone = '1';
    if (window.gsap) {
      window.gsap.to(el, { opacity: 1, y: 0, duration: 0.85, ease: 'expo.out' });
    } else {
      el.classList.add('enh-in');
    }
  }

  function showAll(list) {
    list.forEach(function (el) {
      el.dataset.enhDone = '1';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  function init() {
    clearTimeout(safety);
    var targets = collect();

    if (reduceMotion || !('IntersectionObserver' in window)) {
      showAll(targets);
      docEl.classList.remove('enh-js');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          reveal(e.target);
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });

    // Fail-safe: vis alt som fortsatt er skjult etter 4 s.
    setTimeout(function () {
      targets.forEach(function (el) { if (!el.dataset.enhDone) reveal(el); });
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
