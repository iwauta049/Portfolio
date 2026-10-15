// ===== Footer year =====
(function () {
  var el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

// ===== Nav highlight while scrolling the home page =====
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[data-section]"));
  var sections = links
    .map(function (a) { return document.getElementById(a.dataset.section); })
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) {
        if (a.dataset.section === entry.target.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(function (s) { observer.observe(s); });
})();

// ===== Scroll reveal =====
(function () {
  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(function (el) { observer.observe(el); });
})();

// ===== Image carousels (project detail page) =====
(function () {
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".slide"));
    var prev = carousel.querySelector(".prev");
    var next = carousel.querySelector(".next");
    var caption = carousel.querySelector(".caption");
    var index = 0;
    carousel.classList.add("js");

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("active", n === index); });
      if (caption) caption.textContent = slides[index].dataset.caption || "";
    }

    if (slides.length < 2) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
    }
    if (prev) prev.addEventListener("click", function () { show(index - 1); });
    if (next) next.addEventListener("click", function () { show(index + 1); });

    carousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    show(0);
  });
})();

// ===== Click a gallery picture to view it full screen =====
(function () {
  var images = document.querySelectorAll(".carousel .slide img");
  if (!images.length || typeof HTMLDialogElement === "undefined") return;

  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Enlarged picture");
  dialog.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close picture">&times;</button>' +
    '<img alt="">' +
    '<p class="lightbox-caption"></p>';
  document.body.appendChild(dialog);

  var big = dialog.querySelector("img");
  var caption = dialog.querySelector(".lightbox-caption");

  function open(img) {
    var slide = img.closest(".slide");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    caption.textContent = slide ? slide.dataset.caption || "" : "";
    dialog.showModal();
  }

  images.forEach(function (img) {
    img.classList.add("zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Enlarge picture" + (img.alt ? ": " + img.alt : ""));
    img.addEventListener("click", function () { open(img); });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(img);
      }
    });
  });

  dialog.querySelector(".lightbox-close").addEventListener("click", function () { dialog.close(); });
  // Clicking the dark area around the picture closes it (Esc works too)
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", function () { big.removeAttribute("src"); });
})();

// ===== Contact form (opens the visitor's email app; no backend needed) =====
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var TO_EMAIL = "you@example.com"; // TODO: replace with your email

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements["name"].value.trim();
    var email = form.elements["email"].value.trim();
    var subject = form.elements["subject"].value.trim();
    var messge = form.elements["messge"].value.trim();

    status.classList.remove("error");

    if (!name || !email || !messge) {
      status.textContent = "Please fill in your name, email and message.";
      status.classList.add("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "Please enter a valid email address.";
      status.classList.add("error");
      return;
    }

    var mailSubject = encodeURIComponent(subject || "Portfolio message from " + name);
    var body = encodeURIComponent(messge + "\n\n— " + name + " (" + email + ")");
    window.location.href = "mailto:" + TO_EMAIL + "?subject=" + mailSubject + "&body=" + body;
    status.textContent = "Opening your email app…";
  });
})();
