/* =====================================================================
   project.js: behaviour for individual project pages.
     1. twinkling night sky
     2. footer year
     3. fade-in as sections scroll into view
     4. image carousels (buttons, arrow keys, swipe) + click-to-enlarge
   No libraries needed.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Twinkling sky ---------- */
  var sky = document.querySelector('.sky');
  if (sky) {
    var count = window.innerWidth < 600 ? 40 : 80;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var star = document.createElement('span');
      var size = (Math.random() * 2 + 1).toFixed(1);
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      star.style.top = (Math.random() * 100).toFixed(2) + '%';
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.animationDelay = '-' + (Math.random() * 6).toFixed(2) + 's';
      star.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + 's';
      frag.appendChild(star);
    }
    sky.appendChild(frag);
  }

  /* ---------- 2. Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 3. Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  }

  /* ---------- 4. Carousels + lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox && lightbox.querySelector('img');
  var lbCaption = lightbox && lightbox.querySelector('.lb-caption');

  function openLightbox(slide) {
    if (!lightbox || typeof lightbox.showModal !== 'function') return;
    var img = slide.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = slide.getAttribute('data-caption') || '';
    lightbox.showModal();
  }

  if (lightbox) {
    // click on the dark backdrop closes it (the close button works without JS)
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
  }

  function initCarousel(root) {
    var viewport = root.querySelector('.viewport');
    var track = root.querySelector('.track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
    var prev = root.querySelector('.prev');
    var next = root.querySelector('.next');
    var caption = root.querySelector('.caption');
    var counter = root.querySelector('.count');
    var index = 0;
    var swiped = false;

    function show(i, byUser) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      slides.forEach(function (slide, k) {
        if (k === index) {
          slide.removeAttribute('inert');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.setAttribute('inert', '');
          slide.setAttribute('aria-hidden', 'true');
        }
      });
      // only announce caption changes after the visitor has actually used the carousel
      if (byUser) caption.setAttribute('aria-live', 'polite');
      caption.textContent = slides[index].getAttribute('data-caption') || '';
      counter.textContent = (index + 1) + ' / ' + slides.length;
    }

    if (slides.length < 2) {
      prev.hidden = true;
      next.hidden = true;
    }

    prev.addEventListener('click', function () { show(index - 1, true); });
    next.addEventListener('click', function () { show(index + 1, true); });

    // arrow keys while focus is anywhere inside this carousel
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, true); }
    });

    // swipe on touch screens
    var startX = null;
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
      swiped = false;
    });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        swiped = true;
        show(index + (dx < 0 ? 1 : -1), true);
      }
    });
    viewport.addEventListener('pointercancel', function () { startX = null; });

    slides.forEach(function (slide) {
      var button = slide.querySelector('.zoom');
      var img = slide.querySelector('img');

      button.addEventListener('click', function () {
        if (swiped) { swiped = false; return; } // a swipe isn't a click
        openLightbox(slide);
      });

      // friendly note if an image path is wrong or the file isn't there yet
      function markMissing() {
        slide.classList.add('is-missing');
        var file = (img.getAttribute('src') || '').split('/').pop();
        slide.setAttribute('data-missing', 'Image not found yet: ' + file);
      }
      img.addEventListener('error', markMissing);
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markMissing();
    });

    show(0, false);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), initCarousel);

  // Images after the first slide are lazy so the page opens fast;
  // once everything else has loaded, fetch them so slides don't pop in.
  window.addEventListener('load', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.slide img[loading="lazy"]'), function (img) {
      img.loading = 'eager';
    });
  });
})();
