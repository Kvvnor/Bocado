/* Bocado: funciona sin internet. Cambia VERSION al subir archivos nuevos. */
const VERSION = "bocado-v15";
const FONTS = "bocado-fonts";
const CORE = ["./", "./index.html", "./app.js", "./zxing.min.js", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("openfoodfacts.org")) return; // siempre a la red
  if (url.origin === self.location.origin) {
    // Responde al instante desde el teléfono y actualiza en segundo plano
    e.respondWith(caches.open(VERSION).then(async c => {
      const cached = await c.match(req, { ignoreSearch: true });
      const fresh = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => cached);
      return cached || fresh;
    }));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === "opaque") c.put(req, r.clone());
      return r;
    }));
  }
});
