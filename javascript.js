/* Alimentos del NEA — ventanas, mapa de reparto y menú */

/* Ventanas (dialog) genéricas: abrir con varios botones, cerrar con X / fondo / Esc */
function setupDialog(id, triggerSelector, onOpen) {
  var d = document.getElementById(id);
  if (!d) return null;
  var last = null;
  document.querySelectorAll(triggerSelector).forEach(function (t) {
    t.addEventListener("click", function () {
      last = t;
      // si se abre desde otra ventana (ej. privacidad desde el formulario de proveedores), no cerramos la anterior
      d.showModal();
      if (onOpen) onOpen(d);
    });
  });
  d.querySelectorAll("[data-close-dialog]").forEach(function (b) {
    b.addEventListener("click", function () { d.close(); });
  });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () {
    if (last && document.contains(last)) last.focus({ preventScroll: true });
  });
  return d;
}

/* Mapa de zonas de reparto (Leaflet + OpenStreetMap) */
(function () {
  var mapEl = document.getElementById("delivery-map");
  var fallback = document.getElementById("map-fallback");
  var map = null;

  // Punto de partida y destinos (coordenadas aproximadas, provincia de Santa Fe)
  var ORIGIN = { name: "Reconquista", sub: "Punto de partida", lat: -29.1436, lng: -59.6431, tip: "right" };
  var STOPS = [
    { name: "Avellaneda",   lat: -29.1167, lng: -59.65,   tip: "left" },
    { name: "Villa Ocampo", lat: -28.4833, lng: -59.3667, tip: "right" },
    { name: "Florencia",    lat: -28.0333, lng: -59.2,    tip: "right" },
    { name: "Vera",         lat: -29.4667, lng: -60.2167, tip: "left" },
    { name: "Calchaquí",    lat: -29.8914, lng: -60.2989, tip: "left" },
    { name: "Romang",       lat: -29.5,    lng: -59.77,   tip: "right", chain: true },
    { name: "Alejandra",    lat: -29.75,   lng: -59.85,   tip: "right", chain: true }
  ];
  // Ruta Provincial 1: Reconquista → Romang → Alejandra
  var RUTA1 = [[ORIGIN.lat, ORIGIN.lng], [-29.5, -59.77], [-29.75, -59.85]];

  function pinIcon(isOrigin) {
    var size = isOrigin ? 44 : 32;
    var inner = isOrigin
      ? '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" transform="translate(7 6) scale(.78)"/>'
      : '<circle cx="16" cy="14" r="4.5" fill="#fff"/>';
    var vb = isOrigin ? "0 0 44 44" : "0 0 32 32";
    var shape = isOrigin
      ? '<circle cx="22" cy="22" r="20" fill="#2e3093" stroke="#fff" stroke-width="3"/>'
      : '<path d="M16 30s10-8.6 10-16A10 10 0 006 14c0 7.4 10 16 10 16z" fill="#2e3093" stroke="#fff" stroke-width="2"/>';
    return L.divIcon({
      className: "map-pin",
      html: '<svg width="' + size + '" height="' + size + '" viewBox="' + vb + '" aria-hidden="true">' + shape + inner + "</svg>",
      iconSize: [size, size],
      iconAnchor: isOrigin ? [size / 2, size / 2] : [size / 2, size - 2]
    });
  }

  function initMap() {
    if (map) { map.invalidateSize(); return; }
    if (typeof L === "undefined") {
      mapEl.hidden = true;
      fallback.hidden = false;
      return;
    }
    var line = { color: "#2e3093", weight: 3, opacity: 0.7, dashArray: "8 8" };
    map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var bounds = [[ORIGIN.lat, ORIGIN.lng]];
    STOPS.forEach(function (s) {
      if (!s.chain) L.polyline([[ORIGIN.lat, ORIGIN.lng], [s.lat, s.lng]], line).addTo(map);
      L.marker([s.lat, s.lng], { icon: pinIcon(false), title: s.name, keyboard: false })
        .addTo(map)
        .bindTooltip(s.name, { permanent: true, direction: s.tip, offset: [s.tip === "left" ? -8 : 8, -14], className: "map-label" });
      bounds.push([s.lat, s.lng]);
    });
    L.polyline(RUTA1, line).addTo(map);

    L.marker([ORIGIN.lat, ORIGIN.lng], { icon: pinIcon(true), title: ORIGIN.name, zIndexOffset: 1000, keyboard: false })
      .addTo(map)
      .bindTooltip(ORIGIN.name + " · " + ORIGIN.sub, { permanent: true, direction: ORIGIN.tip, offset: [18, 0], className: "map-label map-label--origin" });

    map.fitBounds(bounds, { padding: [48, 48] });
  }

  var mapDialog = setupDialog("map-dialog", "[data-open-map]", function () { initMap(); });

  // "Consultanos": cerrar la ventana donde esté y bajar a Contacto
  document.querySelectorAll("[data-goto-contact]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var d = link.closest("dialog");
      if (d) d.close();
      var target = document.getElementById("contacto");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

/* Más marcas */
setupDialog("brands-dialog", "[data-open-brands]");

/* Soy proveedor */
setupDialog("supplier-dialog", "[data-open-supplier]", function () {
  var f = document.getElementById("s-empresa");
  if (f) f.focus();
  closeNav();
});

/* Política de privacidad */
setupDialog("privacy-dialog", "[data-open-privacy]");

/* Menú en celulares */
function closeNav() {
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}
(function () {
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
})();

/* Animaciones al scrollear */
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var groups = [
    ".hero__text > *", ".hero__media",
    ".stat", "section .eyebrow", "section .h2",
    ".logo-grid__item", ".brand-card", ".benefit", ".step", ".steps__cta",
    ".about > p", ".pillar", ".faq__item", ".contact__info > *:not(.eyebrow):not(.h2)", ".form"
  ];
  var items = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.closest("dialog") || el.classList.contains("reveal")) return;
      // escalonar hermanos de una misma fila
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(idx, 5) * 90 + "ms");
      el.classList.add("reveal");
      items.push(el);
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  items.forEach(function (el) { io.observe(el); });
})();

/* Preguntas frecuentes: apertura y cierre suaves */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !Element.prototype.animate) return;
  var EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

  document.querySelectorAll(".faq__item").forEach(function (d) {
    var s = d.querySelector("summary");
    var body = d.querySelector("p");
    var anim = null, fade = null;

    function run(from, to, opening) {
      if (anim) anim.cancel();
      if (fade) fade.cancel();
      d.style.overflow = "hidden";
      anim = d.animate({ height: [from + "px", to + "px"] }, { duration: 380, easing: EASE });
      fade = body.animate(
        { opacity: opening ? [0, 1] : [1, 0], transform: opening ? ["translateY(-6px)", "none"] : ["none", "translateY(-6px)"] },
        { duration: opening ? 380 : 220, easing: "ease", fill: "none" }
      );
      anim.onfinish = function () {
        if (!opening) d.open = false;
        anim = null; d.style.overflow = "";
      };
      anim.oncancel = function () { d.style.overflow = ""; };
    }

    s.addEventListener("click", function (e) {
      e.preventDefault();
      var border = d.offsetHeight - d.clientHeight;
      var closedH = s.offsetHeight + border;
      if (!d.open || (anim && d.classList.contains("is-closing"))) {
        d.classList.remove("is-closing");
        var startH = d.offsetHeight;
        d.open = true;
        run(startH, d.scrollHeight + border, true);
      } else {
        d.classList.add("is-closing");
        var cur = d.offsetHeight;
        run(cur, closedH, false);
        anim.addEventListener("finish", function () { d.classList.remove("is-closing"); });
      }
    });
  });
})();

/* Envío de formularios (Web3Forms) */
(function () {
  var ENDPOINT = "https://api.web3forms.com/submit";
  var WA = "https://wa.me/5493482707222";

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    var status = form.querySelector(".form__status");
    var btn = form.querySelector('button[type="submit"]');
    var label = btn.textContent;
    var isSupplier = form.getAttribute("data-form") === "proveedor";

    function showError(html) {
      form.classList.remove("is-sent");
      status.hidden = false;
      status.className = "form__status is-error";
      status.innerHTML = html;
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function showSuccess() {
      form.classList.add("is-sent");
      status.hidden = false;
      status.className = "form__status is-ok";
      status.innerHTML =
        '<span class="form__check" aria-hidden="true">' +
        '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
        "<strong>¡Mensaje enviado!</strong>" +
        "<span>" + (isSupplier
          ? "Recibimos tu propuesta. El área comercial se pone en contacto con vos."
          : "Recibimos tus datos. Un asesor se comunica con vos en nuestro horario de atención.") + "</span>" +
        '<span class="form__sent-actions">' +
        (isSupplier ? '<button class="btn btn--primary btn--sm" type="button" data-sent-close>Cerrar</button>' : "") +
        '<button class="btn btn--ghost btn--sm" type="button" data-sent-reset>Enviar otro mensaje</button></span>';
      status.querySelector("[data-sent-reset]").addEventListener("click", function () {
        form.classList.remove("is-sent");
        status.hidden = true;
        var first = form.querySelector("input:not([type=checkbox]), textarea");
        if (first) first.focus();
      });
      var closeBtn = status.querySelector("[data-sent-close]");
      if (closeBtn) closeBtn.addEventListener("click", function () {
        var d = form.closest("dialog");
        if (d) d.close();
      });
      // llevar el cartel al centro de la pantalla (y arriba de todo dentro de la ventana)
      var dlg = form.closest("dialog");
      if (dlg) dlg.scrollTop = 0;
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var key = form.getAttribute("data-access-key");
      if (!key || key.indexOf("PEGAR_") === 0) {
        showError('Este formulario todavía no está conectado. Escribinos por <a href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a>.');
        return;
      }
      var data = new FormData(form);
      data.append("access_key", key);
      data.append("subject", form.getAttribute("data-subject") || "Mensaje desde la web de ADN");
      data.append("from_name", "Web ADN");

      btn.disabled = true; btn.textContent = "Enviando…"; status.hidden = true;

      fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.success) throw new Error(j.message || "error");
          form.reset();
          showSuccess();
        })
        .catch(function () {
          showError('No pudimos enviar el formulario. Probá de nuevo o escribinos por <a href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a>.');
        })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();

/* Instagram: el widget se carga recién cuando la sección se acerca a la pantalla */
(function () {
  var section = document.getElementById("instagram");
  var tpl = document.getElementById("ig-embed");
  var feed = section && section.querySelector(".ig-feed");
  if (!section || !tpl || !feed || !tpl.content || !tpl.content.children.length) return;

  function load() {
    var frag = tpl.content.cloneNode(true);
    // los <script> dentro de un template no se ejecutan: los recreamos
    frag.querySelectorAll("script").forEach(function (old) {
      var s = document.createElement("script");
      Array.prototype.forEach.call(old.attributes, function (a) { s.setAttribute(a.name, a.value); });
      s.text = old.text;
      old.replaceWith(s);
    });
    feed.appendChild(frag);
    hideWidgetTitle();
  }

  // El widget trae un título en inglés ("Latest Updates") y un botón "Follow":
  // los ocultamos (ya tenemos nuestro propio botón de Instagram arriba).
  function hideWidgetTitle() {
    var titleRe = /^\s*latest updates\s*$/i;
    var rowRe = /^\s*(latest updates)?\s*(follow)?\s*$/i;
    function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
    function sweepRoot(root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        if (!titleRe.test(node.nodeValue)) continue;
        var el = node.parentElement;
        if (!el) continue;
        // subimos mientras el contenedor tenga solo el título y/o el botón Follow
        while (el.parentElement && el.parentElement !== feed &&
               el.parentElement.getRootNode() === el.getRootNode() &&
               rowRe.test(clean(el.parentElement.textContent))) {
          el = el.parentElement;
        }
        el.style.setProperty("display", "none", "important");
      }
    }
    function sweep() {
      sweepRoot(feed);
      feed.querySelectorAll("*").forEach(function (el) {
        if (el.shadowRoot) sweepRoot(el.shadowRoot);
      });
    }
    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; sweep(); });
    }
    sweep();
    if ("MutationObserver" in window) {
      new MutationObserver(schedule).observe(feed, { childList: true, subtree: true, characterData: true });
    }
  }

  if (!("IntersectionObserver" in window)) { load(); return; }
  var io = new IntersectionObserver(function (entries) {
    if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
  }, { rootMargin: "300px 0px" });
  io.observe(section);
})();

/* Clip del hero: solo si el visitante no pidió menos movimiento */
(() => {
  const loop = document.getElementById("hero-loop");
  if (!loop) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { loop.removeAttribute("loop"); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? loop.play().catch(() => {}) : loop.pause(); }));
  io.observe(loop);
})();

/* Video institucional: se descarga recién al tocar play */
(() => {
  const box = document.querySelector("[data-video]");
  if (!box) return;
  const video = box.querySelector("video");
  const btn = box.querySelector(".video-play");
  btn.addEventListener("click", () => {
    box.classList.add("is-playing");
    video.controls = true;
    video.play().catch(() => { video.controls = true; });
    video.focus({ preventScroll: true });
  });
  video.addEventListener("ended", () => {
    box.classList.remove("is-playing");
    video.controls = false;
    video.currentTime = 0;
    video.load();
  });
})();
