/* Connecta — interaksjon */
(function () {
  "use strict";

  // year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // header scroll state
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 12) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // mobile menu
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  var backdrop = document.createElement("div");
  backdrop.className = "menu-backdrop";
  document.body.appendChild(backdrop);

  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    backdrop.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () {
    setMenu(!menu.classList.contains("open"));
  });
  backdrop.addEventListener("click", function () { setMenu(false); });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  // motion
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined") {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // grouped reveal per parent so siblings stagger nicely
  function revealGroup(container, items) {
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.09,
      scrollTrigger: { trigger: container, start: "top 82%" }
    });
  }

  document.querySelectorAll(
    ".hero, .strip-inner, .section-head, .cards-3, .online-note, .steps, .people, .price-grid, .price-fine, .quotes, .faq-wrap, .cta-inner"
  ).forEach(function (group) {
    var items = group.querySelectorAll(".reveal");
    if (!items.length && group.classList.contains("reveal")) items = [group];
    if (items.length) revealGroup(group, items);
  });

  // any stray reveals not inside the groups above
  gsap.utils.toArray(".reveal").forEach(function (el) {
    if (!el._gsap) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    }
  });

  // gentle parallax on decor shapes
  gsap.utils.toArray(".decor").forEach(function (d) {
    gsap.to(d, {
      yPercent: d.classList.contains("decor-ring") ? -18 : 14,
      ease: "none",
      scrollTrigger: { trigger: d.closest("section"), start: "top bottom", end: "bottom top", scrub: 1 }
    });
  });
})();
