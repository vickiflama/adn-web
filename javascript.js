/* Alimentos del NEA — mapa de zonas de reparto (Leaflet + OpenStreetMap) */
(function () {
  var dialog = document.getElementById("map-dialog");
  if (!dialog) return;

  var openBtn = document.querySelector("[data-open-map]");
  var closeBtn = dialog.querySelector("[data-close-map]");
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
    map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var bounds = [[ORIGIN.lat, ORIGIN.lng]];

    STOPS.forEach(function (s) {
      if (!s.chain) {
        L.polyline([[ORIGIN.lat, ORIGIN.lng], [s.lat, s.lng]], {
          color: "#2e3093", weight: 3, opacity: 0.7, dashArray: "8 8"
        }).addTo(map);
      }
      L.marker([s.lat, s.lng], { icon: pinIcon(false), title: s.name, keyboard: false })
        .addTo(map)
        .bindTooltip(s.name, { permanent: true, direction: s.tip, offset: [s.tip === "left" ? -8 : 8, -14], className: "map-label" });
      bounds.push([s.lat, s.lng]);
    });

    // Ruta Provincial 1: Reconquista → Romang → Alejandra
    L.polyline([[ORIGIN.lat, ORIGIN.lng], [-29.5, -59.77], [-29.75, -59.85]], {
      color: "#2e3093", weight: 3, opacity: 0.7, dashArray: "8 8"
    }).addTo(map);

    L.marker([ORIGIN.lat, ORIGIN.lng], { icon: pinIcon(true), title: ORIGIN.name, zIndexOffset: 1000, keyboard: false })
      .addTo(map)
      .bindTooltip(ORIGIN.name + " · " + ORIGIN.sub, { permanent: true, direction: ORIGIN.tip, offset: [18, 0], className: "map-label map-label--origin" });

    map.fitBounds(bounds, { padding: [48, 48] });
  }

  openBtn.addEventListener("click", function () {
    dialog.showModal();
    initMap();
    closeBtn.focus();
  });
  closeBtn.addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close(); // clic en el fondo oscuro
  });
  dialog.addEventListener("close", function () { openBtn.focus({ preventScroll: true }); });

// Link "Consultanos": cerrar el mapa y bajar a la sección Contacto
var contactLink = dialog.querySelector("[data-goto-contact]");
if (contactLink) {
  contactLink.addEventListener("click", function (e) {
    e.preventDefault();
    dialog.close();
    var target = document.getElementById("contacto");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
})();


/* Bases y condiciones del sorteo */
(function () {
  var d = document.getElementById("terms-dialog");
  if (!d) return;
  var openBtn = document.querySelector("[data-open-terms]");
  var closeBtn = d.querySelector("[data-close-terms]");
  openBtn.addEventListener("click", function () { d.showModal(); closeBtn.focus(); });
  closeBtn.addEventListener("click", function () { d.close(); });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () { openBtn.focus({ preventScroll: true }); });
})();

/* Soy proveedor */
(function () {
  var d = document.getElementById("supplier-dialog");
  if (!d) return;
  var openBtn = document.querySelector("[data-open-supplier]");
  var closeBtn = d.querySelector("[data-close-supplier]");
  openBtn.addEventListener("click", function () {
    d.showModal();
    document.getElementById("s-empresa").focus();
  });
  closeBtn.addEventListener("click", function () { d.close(); });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () { openBtn.focus({ preventScroll: true }); });
})();

/* Política de privacidad */
(function () {
  var d = document.getElementById("privacy-dialog");
  if (!d) return;
  var closeBtn = d.querySelector("[data-close-privacy]");
  var lastTrigger = null;
  document.querySelectorAll("[data-open-privacy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lastTrigger = btn;
      d.showModal();
      closeBtn.focus();
    });
  });
  closeBtn.addEventListener("click", function () { d.close(); });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () {
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
})();