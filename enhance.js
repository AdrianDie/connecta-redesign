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

/* =============================================================
   Connecta - mobil-meny
   Speilen har ingen fungerende mobilmeny (HFE-nav skjult <=1024px,
   plugin-JS kjorer ikke). Vi bygger en ren skuff fra de eksisterende
   menylenkene og legger den som barn av <body> (unngaar at den
   kollapser inni en header med backdrop-filter/transform).
   ============================================================= */
(function () {
  'use strict';

  function build() {
    if (document.getElementById('enh-mnav-toggle')) return;

    var src = document.querySelector('#menu-1-76e1022, .hfe-nav-menu, #site-navigation, .main-navigation');
    if (!src) return;

    var items = [], seen = {};
    src.querySelectorAll('a[href]').forEach(function (a) {
      var t = (a.textContent || '').replace(/\s+/g, ' ').trim();
      var href = a.getAttribute('href');
      if (!t || !href) return;
      if (a.querySelector('img')) return; // hopp over logo
      var key = href + '|' + t.toLowerCase();
      if (seen[key]) return;
      seen[key] = 1;
      items.push({ t: t, href: href });
    });
    if (!items.length) return;

    var btn = document.createElement('button');
    btn.id = 'enh-mnav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Apne meny');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'enh-mnav');
    btn.innerHTML = '<span></span><span></span><span></span>';

    var overlay = document.createElement('div');
    overlay.id = 'enh-mnav-overlay';

    var panel = document.createElement('nav');
    panel.id = 'enh-mnav';
    panel.setAttribute('aria-label', 'Mobilmeny');
    panel.setAttribute('aria-hidden', 'true');

    var close = document.createElement('button');
    close.id = 'enh-mnav-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Lukk meny');
    close.innerHTML = '×';

    var ul = document.createElement('ul');
    items.forEach(function (it) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.t;
      li.appendChild(a);
      ul.appendChild(li);
    });
    panel.appendChild(close);
    panel.appendChild(ul);

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    function openMenu() {
      document.body.classList.add('enh-mnav-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    }
    function closeMenu() {
      document.body.classList.remove('enh-mnav-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }
    btn.addEventListener('click', function () {
      if (document.body.classList.contains('enh-mnav-open')) closeMenu(); else openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    close.addEventListener('click', closeMenu);
    ul.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
