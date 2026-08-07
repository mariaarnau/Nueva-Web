(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 60) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var burger = $(".nav-burger", nav);
    if (burger) {
      burger.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }
    $$(".nav-mobile a", nav).forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("is-open"); });
    });
  }

  /* ---------- Nav dropdown (Servicios) ---------- */
  function initNavDropdown() {
    $$(".nav-item-dropdown").forEach(function (item) {
      var trigger = $(".nav-link-dropdown", item);
      if (!trigger) return;
      trigger.addEventListener("click", function (e) {
        if (!fineHover) return; // on touch, let the link navigate normally
        e.preventDefault();
        var open = item.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
        $$(".nav-item-dropdown.is-open").forEach(function (other) {
          if (other !== item) { other.classList.remove("is-open"); }
        });
      });
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".nav-item-dropdown")) return;
      $$(".nav-item-dropdown.is-open").forEach(function (item) {
        item.classList.remove("is-open");
        var trigger = $(".nav-link-dropdown", item);
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Smooth anchor scroll (native) ---------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 90;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 6000);
  }

  /* ---------- Tilt on cards ---------- */
  function initTilt() {
    if (!fineHover) return;
    $$(".card, .space-card").forEach(function (card) {
      var MAX = 6;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!fineHover) return;
    $$("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magneticStrength || "0.25");
      var inner = document.createElement("span");
      inner.className = "magnetic-inner";
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
      el.classList.add("has-magnetic");
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) - r.width / 2) * strength;
        ty = ((e.clientY - r.top) - r.height / 2) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
        inner.style.transform = "translate3d(" + cx + "px, " + cy + "px, 0)";
        raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    $$("[data-marquee]").forEach(function (track) {
      if (track.dataset.marqueeBound) return;
      track.dataset.marqueeBound = "1";
      var clone = track.cloneNode(true);
      clone.removeAttribute("data-marquee");
      clone.removeAttribute("aria-hidden");
      clone.setAttribute("aria-hidden", "true");
      track.parentNode.appendChild(clone);
      if (!window.gsap) return;
      var distance = track.scrollWidth;
      var speed = parseFloat(track.dataset.marqueeSpeed || "46");
      window.gsap.to([track, clone], {
        x: -distance,
        duration: distance / speed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: window.gsap.utils.unitize(function (x) { return parseFloat(x) % distance; })
        }
      });
    });
  }

  /* ---------- Fade carousel (stacked photos crossfading in place) ---------- */
  function initFadeCarousel() {
    $$(".fade-carousel").forEach(function (car) {
      var imgs = $$("img", car);
      if (imgs.length < 2) return;
      imgs[0].classList.add("is-active");

      var dotsWrap = null, dots = [];
      if (imgs.length > 1) {
        dotsWrap = document.createElement("div");
        dotsWrap.className = "fade-carousel-dots";
        dotsWrap.setAttribute("aria-hidden", "true");
        imgs.forEach(function (_, idx) {
          var d = document.createElement("span");
          if (idx === 0) d.className = "is-active";
          dotsWrap.appendChild(d);
          dots.push(d);
        });
        car.appendChild(dotsWrap);
      }

      if (reduced) return;

      var i = 0, paused = false;
      car.addEventListener("mouseenter", function () { paused = true; });
      car.addEventListener("mouseleave", function () { paused = false; });
      setInterval(function () {
        if (paused) return;
        imgs[i].classList.remove("is-active");
        if (dots[i]) dots[i].classList.remove("is-active");
        i = (i + 1) % imgs.length;
        imgs[i].classList.add("is-active");
        if (dots[i]) dots[i].classList.add("is-active");
      }, parseInt(car.dataset.interval || "4200", 10));
    });
  }

  /* ---------- Count up ---------- */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;
      var container = el.closest(".stat, .stat-cinema");
      var fillEl = container ? container.querySelector(".count-fill, .stat-cinema-fill") : null;
      var obj = { v: 0 };
      var trigger = function () {
        if (window.gsap) {
          window.gsap.to(obj, {
            v: target, duration: 1.8, ease: "power2.out",
            onUpdate: function () {
              el.textContent = obj.v.toFixed(decimals);
              if (fillEl) fillEl.style.width = Math.min(Math.abs(obj.v), 100) + "%";
            }
          });
        } else {
          el.textContent = target.toFixed(decimals);
          if (fillEl) fillEl.style.width = Math.min(Math.abs(target), 100) + "%";
        }
      };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { trigger(); io.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------- Cursor ---------- */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;
    document.documentElement.classList.add("has-cursor");
    var ring = $(".cursor-ring", root);
    var dot = $(".cursor-dot", root);
    var tx = 0, ty = 0, rx = 0, ry = 0, firstMove = false;

    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (dot) dot.style.transform = "translate3d(" + tx + "px, " + ty + "px, 0)";
      if (!firstMove) {
        firstMove = true;
        rx = tx; ry = ty;
        if (ring) ring.style.transform = "translate3d(" + rx + "px, " + ry + "px, 0)";
        root.classList.add("is-ready");
      }
    }, { passive: true });

    function tick() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      if (ring) ring.style.transform = "translate3d(" + rx + "px, " + ry + "px, 0)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    var HOVERABLES = "[data-cursor], .card, .btn, .space-card, a[href]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVERABLES)) root.classList.add("is-interactive");
    });
    document.addEventListener("mouseout", function (e) {
      var related = e.relatedTarget;
      if (e.target.closest && e.target.closest(HOVERABLES) && !(related && related.closest && related.closest(HOVERABLES))) {
        root.classList.remove("is-interactive");
      }
    });
  }

  /* ---------- Scroll progress ---------- */
  function initScrollProgress() {
    var bar = $("[data-scroll-progress]");
    if (!bar) return;
    var raf = null;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + pct + ")";
      raf = null;
    }
    window.addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* ---------- FAQ accordion ---------- */
  function initFaq() {
    $$(".faq-item").forEach(function (item) {
      var q = $(".faq-q", item);
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("is-open");
        $$(".faq-item.is-open").forEach(function (other) { other.classList.remove("is-open"); });
        if (!wasOpen) item.classList.add("is-open");
      });
    });
  }

  /* ---------- Contact form ---------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    var success = $("[data-contact-success]");
    if (!form || !success) return;
    var submitBtn = $("[type=submit]", form);
    var msg = $("[data-contact-success-msg]");

    $$("input, textarea", form).forEach(function (input) {
      var field = input.closest(".field");
      if (!field) return;
      var check = function () { field.classList.toggle("has-value", !!input.value); };
      input.addEventListener("input", check);
      check();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(function () {
        var nameField = form.elements.nombre;
        var firstName = nameField && nameField.value ? nameField.value.trim().split(/\s+/)[0] : "";
        if (msg) {
          msg.textContent = (firstName ? firstName + ", h" : "H") + "emos recibido la solicitud. Nos pondremos en contacto en menos de 24 horas laborables.";
        }
        form.classList.remove("is-sending");
        form.classList.add("is-sent");
        success.setAttribute("aria-hidden", "false");
        success.classList.add("is-visible");
      }, 800 + Math.random() * 500);
    });
  }

  /* ---------- Hero / section parallax ---------- */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var fig = $(".hero-figure");
    if (fig) {
      window.gsap.to(fig, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initNavDropdown, "initNavDropdown");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initMagnetic, "initMagnetic");
    safe(initCursor, "initCursor");
    safe(initScrollProgress, "initScrollProgress");
    safe(initFaq, "initFaq");
    safe(initContactForm, "initContactForm");
    safe(initFadeCarousel, "initFadeCarousel");

    if (window.gsap) {
      if (window.ScrollTrigger) {
        try { window.gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}
      }
      safe(initMarquee, "initMarquee");
      safe(initCountUp, "initCountUp");
      safe(initParallax, "initParallax");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
