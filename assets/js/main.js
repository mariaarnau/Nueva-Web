(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); }
    catch (err) { console.error("[" + name + "]", err); }
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ---------------- GSAP setup ---------------- */
  function initEngine() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  /* ---------------- Acto 0: obturador + titular ---------------- */
  function initShutter() {
    var portada = document.getElementById("portada");
    if (!portada) return;
    var top = portada.querySelector('[data-bar="top"]');
    var bottom = portada.querySelector('[data-bar="bottom"]');
    var lineas = portada.querySelectorAll(".titular__linea > span");
    var firstImg = portada.querySelector(".trailer__frame.is-active img");

    function open() {
      var tl = gsap.timeline();
      tl.fromTo([top, bottom], { scaleY: 1 }, { scaleY: 0, duration: 1.1, ease: "cubic-bezier(.16,1,.3,1)" }, 0);
      tl.fromTo(lineas,
        { yPercent: 110 },
        { yPercent: 0, duration: 1.0, ease: "power3.out", stagger: 0.09 },
        0.5);
      window.__galianaShutterDone = true;
    }

    if (firstImg && firstImg.decode) {
      firstImg.decode().then(open).catch(open);
    } else {
      open();
    }
  }

  /* ---------------- Acto 1: Ken Burns + crossfade + zona ---------------- */
  function initTrailer() {
    var trailer = document.querySelector("[data-trailer]");
    if (!trailer) return;
    var frames = Array.prototype.slice.call(trailer.querySelectorAll(".trailer__frame"));
    var zonaLabel = document.querySelector("[data-zona-activa]");
    var reduceLoop = false; // el bucle de Ken Burns no se congela salvo esta excepción explícita
    var idx = 0;

    frames.forEach(function (frame) {
      var img = frame.querySelector("img");
      gsap.set(img, { scale: 1.06, xPercent: 0, yPercent: 0 });
    });

    function kenBurns(img) {
      return gsap.fromTo(img,
        { scale: 1.06, xPercent: 0, yPercent: 0 },
        { scale: 1.13, xPercent: -1, yPercent: -1, duration: 22, ease: "sine.inOut" });
    }

    var current = kenBurns(frames[0].querySelector("img"));

    function setZona(name) {
      if (!zonaLabel) return;
      gsap.timeline()
        .to(zonaLabel, { yPercent: -110, duration: 0.35, ease: "power2.in" })
        .add(function () { zonaLabel.textContent = name; })
        .fromTo(zonaLabel, { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: "power2.out" });
    }

    function next() {
      var prevFrame = frames[idx];
      idx = (idx + 1) % frames.length;
      var nextFrame = frames[idx];
      var nextImg = nextFrame.querySelector("img");

      gsap.set(nextImg, { scale: 1.06, xPercent: 0, yPercent: 0 });
      nextFrame.classList.add("is-active");
      gsap.to(prevFrame, { opacity: 0, duration: 1.4, ease: "sine.inOut" });
      gsap.to(nextFrame, { opacity: 1, duration: 1.4, ease: "sine.inOut", onStart: function () {
        prevFrame.classList.remove("is-active");
      }});

      if (current) current.kill();
      current = kenBurns(nextImg);
      setZona(nextFrame.dataset.zone);

      trailer.__timer = setTimeout(next, 5500);
    }

    trailer.__timer = setTimeout(next, 5500);
  }

  /* ---------------- Acto 2: dolly-in de 4 capas (pin único) ---------------- */
  function initDolly() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var portada = document.getElementById("portada");
    if (!portada) return;

    var capaA = portada.querySelector(".capa--a");
    var capaB = portada.querySelector(".capa--b");
    var capaC = portada.querySelector(".capa--c");
    var titular = portada.querySelector(".portada__titular");
    var barTop = portada.querySelector('[data-bar="top"]');
    var barBottom = portada.querySelector('[data-bar="bottom"]');

    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", function () {
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: portada,
          start: "top top",
          end: "+=120vh",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      tl.fromTo(capaA, { yPercent: 0, scale: 1 }, { yPercent: 12, scale: 1.18, ease: "none" }, 0);
      tl.fromTo(capaB, { opacity: 0, scale: 0.92, yPercent: 0 }, { opacity: 0.32, scale: 1.06, yPercent: -8, ease: "none" }, 0);
      tl.fromTo(capaC, { scale: 1, yPercent: 0 }, { scale: 1.35, yPercent: -6, ease: "none" }, 0);
      tl.fromTo(titular, { yPercent: 0, opacity: 1, filter: "blur(0px)" },
        { yPercent: -60, opacity: 0, filter: "blur(8px)", ease: "none" }, 0);
      tl.fromTo([barTop, barBottom], { scaleY: 0 }, { scaleY: 0.06, ease: "none" }, 0);

      return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
    });

    mm.add("(max-width: 1023px)", function () {
      gsap.fromTo(capaB, { opacity: 0 }, {
        opacity: 0.18, ease: "none",
        scrollTrigger: { trigger: portada, start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true }
      });
    });
  }

  /* ---------------- Expansión suave + parallax interno ---------------- */
  function initExpand() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", function () {
      document.querySelectorAll("[data-expand]").forEach(function (el) {
        var img = el.querySelector("img");
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: el, start: "top 85%", end: "top 12%", scrub: 0.6,
            invalidateOnRefresh: true,
            onToggle: function (self) {
              el.style.willChange = self.isActive ? "clip-path" : "auto";
              if (img) img.style.willChange = self.isActive ? "transform" : "auto";
            }
          }
        });
        tl.fromTo(el,
          { clipPath: "inset(14% 20% 14% 20% round 22px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0);
        if (img) {
          tl.fromTo(img, { yPercent: -9, scale: 1.22 }, { yPercent: 9, scale: 1.06, ease: "none" }, 0);
        }
      });
    });

    mm.add("(max-width: 1023px)", function () {
      document.querySelectorAll("[data-expand]").forEach(function (el) {
        var img = el.querySelector("img");
        var tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 25%", scrub: 0.6, invalidateOnRefresh: true }
        });
        tl.fromTo(el,
          { clipPath: "inset(7% 6% 7% 6% round 16px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0);
        if (img) {
          tl.fromTo(img, { yPercent: -5, scale: 1.14 }, { yPercent: 5, scale: 1.04, ease: "none" }, 0);
        }
      });
    });
  }

  /* ---------------- Zonas: hover desktop ---------------- */
  function initZonas() {
    var lista = document.querySelector("[data-zonas-lista]");
    var visor = document.querySelector("[data-zonas-visor]");
    if (!lista || !visor) return;
    if (visor.children.length === 0) return;

    var items = Array.prototype.slice.call(lista.querySelectorAll(".zona-item"));
    var fotos = Array.prototype.slice.call(visor.querySelectorAll(".zona-foto"));

    function activate(name) {
      items.forEach(function (i) { i.classList.toggle("is-active", i.dataset.zonaNombre === name); });
      fotos.forEach(function (f) {
        var on = f.dataset.zonaFoto === name;
        if (on && !f.classList.contains("is-active")) {
          gsap.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        }
        f.classList.toggle("is-active", on);
      });
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () { activate(item.dataset.zonaNombre); });
      item.addEventListener("focus", function () { activate(item.dataset.zonaNombre); });
      item.addEventListener("click", function (e) { e.preventDefault(); activate(item.dataset.zonaNombre); });
    });
  }

  /* ---------------- Zonas: tarjetas móvil (batch reveal) ---------------- */
  function initZonaCards() {
    var cards = document.querySelectorAll(".zona-card");
    if (!cards.length) return;
    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.batch(cards, {
        start: "top 90%",
        onEnter: function (batch) { batch.forEach(function (c) { c.classList.add("is-visible"); }); }
      });
    }
    var fallback = setTimeout(function () {
      cards.forEach(function (c) { c.classList.add("is-visible"); });
    }, 6000);

    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.05 }) : null;
    if (io) cards.forEach(function (c) { io.observe(c); });
  }

  /* ---------------- Plan: recorrido horizontal pineado (desktop) ---------------- */
  function initPlan() {
    if (!window.gsap || !window.ScrollTrigger) return;
    var section = document.querySelector(".plan");
    var track = document.querySelector("[data-plan-track]");
    if (!section || !track) return;

    var mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", function () {
      var distance = function () { return track.scrollWidth - window.innerWidth; };
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: function () { return "+=" + distance(); },
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      tl.fromTo(track, { x: 0 }, { x: function () { return -distance(); }, ease: "none" }, 0);
      return function () { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
    });
  }

  ready(function () {
    safe(initEngine, "initEngine");
    safe(initShutter, "initShutter");
    safe(initTrailer, "initTrailer");
    safe(initDolly, "initDolly");
    safe(initExpand, "initExpand");
    safe(initZonas, "initZonas");
    safe(initZonaCards, "initZonaCards");
    safe(initPlan, "initPlan");
  });
})();
